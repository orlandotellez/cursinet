# Guía completa del Sistema de Pagos (PayPal)

## Índice

- [Arquitectura del sistema de pagos](#arquitectura-del-sistema-de-pagos)
- [Modelo de datos](#modelo-de-datos)
- [Flujo de pago completo](#flujo-de-pago-completo)
- [Arquitectura hexagonal (ports & adapters)](#arquitectura-hexagonal-ports--adapters)
- [Componentes del sistema](#componentes-del-sistema)
  - [IPaymentProvider — Puerto](#ipaymentprovider--puerto)
  - [PayPalPaymentProvider — Adaptador en vivo](#paypalpaymentprovider--adaptador-en-vivo)
  - [MockPaymentProvider — Adaptador de pruebas](#mockpaymentprovider--adaptador-de-pruebas)
  - [PayPalAuthenticationHandler — OAuth2 automático](#paypalauthenticationhandler--oauth2-automático)
  - [PayPalWebhookSignatureValidator — Verificación de webhooks](#paypalwebhooksignaturevalidator--verificación-de-webhooks)
- [Servicio de pagos (PaymentService)](#servicio-de-pagos-paymentservice)
- [Webhooks](#webhooks)
- [Dependency Injection (Program.cs)](#dependency-injection-programcs)
- [Configuración](#configuración)
- [Frontend: integración con PayPal JS SDK](#frontend-integración-con-paypal-js-sdk)
- [Tests](#tests)
- [Flujo de trabajo para agregar un nuevo método de pago](#flujo-de-trabajo-para-agregar-un-nuevo-método-de-pago)
- [Resolución de problemas comunes](#resolución-de-problemas-comunes)
- [Buenas prácticas](#buenas-prácticas)
- [Referencia rápida](#referencia-rápida)

---

## Arquitectura del sistema de pagos

El sistema de pagos de Cursinet está diseñado con **arquitectura hexagonal (ports & adapters)**. Esto significa que la lógica de negocio en `Application` no sabe nada de PayPal — habla con una interfaz (`IPaymentProvider`) y la implementación concreta se inyecta desde afuera.

```
┌─────────────────────────────────────────────────────────────┐
│  API (Controllers)                                         │
│  PaymentsController  PayPalWebhookController                │
│  Validators (FluentValidation)                              │
├─────────────────────────────────────────────────────────────┤
│  APPLICATION (Service)                                      │
│  IPaymentService  ◄── PaymentService                        │
│  IPaymentProvider (port)  ◄─── Puerto hexagonal             │
│  IPayPalWebhookSignatureValidator (port)                    │
│  IPayPalWebhookEventRepository (port)                       │
│  IPaymentRepository (port)                                  │
│  DTOs: PaymentResponse, PaymentProviderContracts            │
│  Mapping: MappingPayment                                    │
├─────────────────────────────────────────────────────────────┤
│  DOMAIN                                                     │
│  Payment, PayPalWebhookEvent, PaymentStatus                 │
├─────────────────────────────────────────────────────────────┤
│  INFRASTRUCTURE                                             │
│  Adapters:                                                  │
│    PayPalPaymentProvider (impl IPaymentProvider)            │
│    PayPalAuthenticationHandler (DelegatingHandler, OAuth2)  │
│    PayPalWebhookSignatureValidator                          │
│    MockPaymentProvider (impl IPaymentProvider)              │
│  Persistence:                                               │
│    PaymentRepository, PayPalWebhookEventRepository         │
│    PaymentConfiguration, PayPalWebhookEventConfiguration   │
│    ApplicationDbContext                                     │
└─────────────────────────────────────────────────────────────┘
```

**Regla de oro:** El `PaymentService` usa `IPaymentProvider` sin saber si detrás hay PayPal, Stripe o un mock. El switch se hace en `Program.cs` vía configuración.

---

## Modelo de datos

### Payment

```csharp
public class Payment
{
    public Guid Id { get; set; }                    // PK, gen_random_uuid()
    public Guid UserId { get; set; }                // Comprador
    public User User { get; set; } = null!;

    public Guid? CourseId { get; set; }             // Curso comprado (nullable)
    public Course? Course { get; set; }

    public string? PayPalOrderId { get; set; }      // ID de Order en PayPal (Orders v2)
    public string? PayPalCaptureId { get; set; }    // ID de Capture tras PAYMENT.CAPTURE.COMPLETED

    public decimal Amount { get; set; }
    public string Currency { get; set; } = "USD";
    public PaymentStatus Status { get; set; }       // Pending | Completed | Failed | Refunded
    public string? Type { get; set; }               // "course_purchase", etc.

    public DateTime? PaidAt { get; set; }
    public DateTime? RefundedAt { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
```

**Tabla:** `Payments`
**Columnas en snake_case:** `paypal_order_id`, `paypal_capture_id`, `user_id`, etc.

### PayPalWebhookEvent (Outbox para idempotencia)

```csharp
public class PayPalWebhookEvent
{
    public Guid Id { get; set; }                    // PK
    public string EventId { get; set; } = "";       // UNIQUE INDEX — base del dedup
    public string EventType { get; set; } = "";     // "PAYMENT.CAPTURE.COMPLETED"
    public string ResourceType { get; set; } = "";
    public string ResourceId { get; set; } = "";
    public DateTime ReceivedAt { get; set; }
    public DateTime? ProcessedAt { get; set; }      // null = candidato a replay
    public string? Notes { get; set; }
    public string Payload { get; set; } = "";       // Raw JSON del webhook
}
```

**Tabla:** `PayPalWebhookEvents`
**Índice único:** `ux_paypal_webhook_events_event_id` sobre `event_id`

### PaymentStatus (enum)

```csharp
public enum PaymentStatus
{
    Pending,    // Pago iniciado, pendiente de confirmación
    Completed,  // Pago confirmado y completado
    Failed,     // Pago rechazado o fallido
    Refunded    // Pago reembolsado
}
```

Se guarda como `int` en la DB (`.HasConversion<int>()`).

---

## Flujo de pago completo

```
Frontend                          Backend                              PayPal
   |                                 |                                    |
   | 1. POST /payments/create -----> |                                    |
   |                                 |-- IPaymentProvider.CreateOrder() ->|  POST /v2/checkout/orders
   |                                 |<-- ProviderOrderResult ------------|
   |<-- CreatePaymentResponse -------| (PayPalOrderId + ApprovalUrl)      |
   |    { payPalOrderId, approvalUrl}|                                    |
   |                                 |                                    |
   | 2. Frontend abre popup PayPal   |                                    |
   |    con payPalOrderId            |                                    |
   |    (PayPal JS SDK)              |                                    |
   |                                 |                                    |
   | 3. User aprueba en PayPal ----> |----------------------------------->|  Buyer apruega
   |                                 |                                    |
   | 4. POST /payments/confirm ----> |                                    |
   |                                 |-- IPaymentProvider.CaptureOrder() ->|  POST .../capture
   |                                 |<-- ProviderCaptureResult ----------|
   |                                 | payment.Status = Completed         |
   |                                 | Enrollment created                 |
   |<-- PaymentResponse -------------|                                    |
   |                                 |                                    |
   |              (O VÍA WEBHOOK ASYNC — flujo alternativo)              |
   |                                 |                                    |
   |                                 |<--- PayPal webhook POST -----------|  PAYMENT.CAPTURE.COMPLETED
   |                                 |-- PayPalWebhookSignatureValidator  |
   |                                 |-- Insert PayPalWebhookEvent (dedup)|
   |                                 |-- HandleCaptureCompletedAsync      |
   |                                 |-- MarkProcessedAsync               |
```

### Paso a paso

1. **Crear pago:** El frontend llama a `POST /api/v1/payments/create` con el `CourseId`. El backend valida que el curso exista, esté publicado, que no sea gratuito, y que el usuario no esté ya inscripto. Luego llama a PayPal para crear una Order y devuelve el `PayPalOrderId` + `ApprovalUrl`.

2. **Aprobación del usuario:** El frontend usa el `PayPalOrderId` para lanzar el flujo de PayPal (popup con JS SDK o redirect). El usuario aprueba el pago en la interfaz de PayPal.

3. **Confirmar pago:** El frontend llama a `POST /api/v1/payments/confirm` con el `PaymentId` y opcionalmente el `PayPalOrderId`. El backend captura la orden en PayPal, marca el `Payment` como `Completed`, setea `PaidAt` y `PayPalCaptureId`, y crea el `Enrollment` automáticamente.

4. **(Alternativo) Webhook async:** PayPal envía un webhook `PAYMENT.CAPTURE.COMPLETED` al backend. El webhook se verifica, se registra con idempotencia, y si es la primera vez que se ve, procesa la captura igual que el paso 3. Esto cubre casos donde el usuario cierra el browser antes de llegar al `confirm`.

---

## Arquitectura hexagonal (ports & adapters)

### ¿Por qué?

- **Desacoplamiento total:** El `PaymentService` no sabe si está llamando a PayPal o a un mock. La dependencia es la interfaz `IPaymentProvider`, no una implementación concreta.
- **Testeabilidad:** En unit tests, injectás un `MockPaymentProvider` o un `NSubstitute` de `IPaymentProvider`. No necesitas conexión a PayPal.
- **Swap fácil:** Para cambiar de proveedor (ej: Stripe), creás `StripePaymentProvider : IPaymentProvider`, lo registrás en DI y cambiás la config. El `PaymentService` no se toca.
- **Aislamiento de fallas:** PayPal puede caerse, pero el sistema sigue funcionando (el error se propaga como `PaymentProviderRejected`).

### Contratos (Puertos)

Todos viven en `Application/Common/Interfaces/`:

| Interfaz | Propósito |
|----------|-----------|
| `IPaymentProvider` | Contrato del gateway de pagos (PayPal, Stripe, mock) |
| `IPaymentService` | Servicio de aplicación que orquesta la lógica de pagos |
| `IPaymentRepository` | Persistencia de pagos |
| `IPayPalWebhookSignatureValidator` | Verificación de firmas de webhooks PayPal |
| `IPayPalWebhookEventRepository` | Persistencia de eventos de webhook (idempotencia) |

### Implementaciones (Adaptadores)

Todas viven en `Infrastructure/Adapters/`:

| Adaptador | Puerto que implementa | Propósito |
|-----------|----------------------|-----------|
| `PayPalPaymentProvider` | `IPaymentProvider` | Llamadas reales a PayPal REST API |
| `MockPaymentProvider` | `IPaymentProvider` | Simulación local para desarrollo y tests |
| `PayPalWebhookSignatureValidator` | `IPayPalWebhookSignatureValidator` | Verificación HMAC de webhooks |

---

## Componentes del sistema

### IPaymentProvider — Puerto

```csharp
public interface IPaymentProvider
{
    string ProviderName { get; }

    // Pagos únicos (Orders v2)
    Task<ProviderOrderResult> CreateOrderAsync(
        ProviderOrderRequest request,
        CancellationToken ct = default);

    Task<ProviderCaptureResult> CaptureOrderAsync(
        string providerOrderId,
        CancellationToken ct = default);

    // Suscripciones (Billing)
    Task<ProviderSubscriptionResult> CreateSubscriptionAsync(
        ProviderSubscriptionRequest request,
        CancellationToken ct = default);

    Task<bool> CancelSubscriptionAsync(
        string providerSubscriptionId,
        CancellationToken ct = default);

    // Reembolsos
    Task<ProviderRefundResult> RefundAsync(
        string providerCaptureId,
        decimal? amount,
        string reason,
        CancellationToken ct = default);
}
```

**Principio:** Cualquier gateway de pagos se puede enchufar implementando estos 5 métodos.

### PayPalPaymentProvider — Adaptador en vivo

`Infrastructure/Adapters/PayPal/PayPalPaymentProvider.cs`

Usa un `HttpClient` tipado que tiene el `PayPalAuthenticationHandler` en su pipeline (el handler inyecta el token OAuth2 automáticamente).

| Método | Endpoint PayPal | Descripción |
|--------|----------------|-------------|
| `CreateOrderAsync` | `POST /v2/checkout/orders` | Crea orden con `intent=CAPTURE`, `payee.preferred=PAY_NOW`, sin shipping. Extrae el link `approval` del `HATEOAS` links. |
| `CaptureOrderAsync` | `POST /v2/checkout/orders/{id}/capture` | Captura orden aprobada. **Importantísimo:** envía `{}` como body (PayPal lo exige, si no da 415). Valida que el capture status NO sea `DECLINED/DENIED/FAILED/EXPIRED/CANCELLED` — si lo es, lanza `PaymentProviderRejected(402)`. |
| `CreateSubscriptionAsync` | `POST /v1/billing/subscriptions` | Crea suscripción usando `plan_id` desde `PayPalOptions.PlanIds`. |
| `CancelSubscriptionAsync` | `POST /v1/billing/subscriptions/{id}/cancel` | PayPal devuelve 204. |
| `RefundAsync` | `POST /v2/payments/captures/{id}/refund` | Full o partial refund según si `amount` es null o no. |

**Manejo de errores:**
- Status 4xx → lanza `AppExceptions.PaymentProviderRejected(message, statusCode)` (se propaga al cliente como el status code original)
- Status 5xx → lanza `AppExceptions.InternalError("PayPal provider error: {statusCode}")`
- Intenta extraer el mensaje de error del `details` array de la respuesta de PayPal

### MockPaymentProvider — Adaptador de pruebas

`Infrastructure/Adapters/Payments/MockPaymentProvider.cs`

- `ProviderName = "mock"`
- `CreateOrderAsync`: genera un ID determinístico: `MOCK-{userId}-{courseId}-{currency}-{amount}-{random}`, devuelve status `CREATED` sin `ApprovalUrl`
- `CaptureOrderAsync`: devuelve el mismo ID como capture, status `COMPLETED`, sin contacto externo
- **Ideal para:** desarrollo local sin conexión a PayPal, tests de integración, demos

### PayPalAuthenticationHandler — OAuth2 automático

`Infrastructure/Adapters/PayPal/PayPalAuthenticationHandler.cs`

Es un `DelegatingHandler` que se enchufa en el `HttpClient` tipado. Se encarga de:

1. **Obtener token** vía `POST /v1/oauth2/token` con `grant_type=client_credentials`
2. **Cachear** el token en `IMemoryCache` con TTL = `expires_in` - 300 segundos (skew de seguridad)
3. **Double-checked locking** con `SemaphoreSlim` para evitar estampida de refrescos concurrentes
4. **Retry en 401:** si la request da 401, invalida el cache, refresca el token y reenvía la request exactamente una vez (útil cuando el token expira entre que lo cacheamos y lo usamos)
5. **Buffering del body:** clona el `HttpRequestMessage` antes de enviar (porque los streams de body solo se leen una vez)

**No requiere configuración manual de tokens.** Solo registrás el handler en DI y el `HttpClient` tipado lo usa automáticamente.

### PayPalWebhookSignatureValidator — Verificación de webhooks

`Infrastructure/Adapters/PayPal/PayPalWebhookSignatureValidator.cs`

Verifica que un webhook entrante realmente vino de PayPal. Usa la API de verificación de PayPal:

```csharp
POST /v1/notifications/verify-webhook-signature
```

Headers que PayPal envía en el webhook y que debemos verificar:

| Header | Propósito |
|--------|-----------|
| `PAYPAL-AUTH-ALGO` | Algoritmo de firma (ej: `SHA256withRSA`) |
| `PAYPAL-CERT-URL` | URL del certificado público de PayPal |
| `PAYPAL-TRANSMISSION-ID` | ID único de transmisión |
| `PAYPAL-TRANSMISSION-SIG` | Firma de la transmisión |
| `PAYPAL-TRANSMISSION-TIME` | Timestamp ISO 8601 |

**Protección SSRF:** Solo acepta `cert_url` de hosts autorizados:
- `api.paypal.com`
- `api-m.paypal.com`
- `api.sandbox.paypal.com`
- `api-m.sandbox.paypal.com`

**Si `WebhookId` no está configurado:** loguea un warning y retorna `false` (no bloquea el desarrollo).

---

## Servicio de pagos (PaymentService)

`Application/Features/Payments/PaymentService.cs`

### Dependencias

```csharp
public PaymentService(
    IPaymentRepository paymentRepository,       // Persistencia de pagos
    ICourseRepository courseRepository,         // Validación de cursos
    IEnrollmentRepository enrollmentRepository, // Creación de enrollments
    IPaymentProvider paymentProvider)           // Gateway (PayPal o Mock)
```

### CreatePaymentAsync

```csharp
Task<CreatePaymentResponse> CreatePaymentAsync(
    Guid userId,
    CreatePaymentRequest request,
    CancellationToken cancellationToken = default);
```

**Flujo interno:**
1. Valida que el curso exista y esté publicado (`ICourseRepository`)
2. Valida que el curso NO sea gratuito (los gratuitos se inscriben directo)
3. Verifica que no haya enrollment duplicado (`IEnrollmentRepository`)
4. Crea la orden en el proveedor (`IPaymentProvider.CreateOrderAsync`)
5. Persiste el `Payment` con `Status = Pending` y `PayPalOrderId`
6. Retorna `CreatePaymentResponse` con `PayPalOrderId` + `ApprovalUrl`

### ConfirmPaymentAsync

```csharp
Task<PaymentResponse> ConfirmPaymentAsync(
    Guid userId,
    ConfirmPaymentRequest request,
    CancellationToken cancellationToken = default);
```

**Flujo interno:**
1. Busca el `Payment` por ID y verifica que pertenezca al usuario (`Guard.AgainstNotOwner`)
2. Verifica que el pago esté en estado `Pending`
3. Si tiene `PayPalOrderId` → llama a `IPaymentProvider.CaptureOrderAsync()` (captura real)
4. Si NO tiene (modo dev/mock en tests) → crea un resultado sintético
5. Marca `Status = Completed`, setea `PaidAt` y `PayPalCaptureId`
6. Actualiza el pago en DB
7. Crea el `Enrollment` atómicamente (si ya existe por webhook, no falla)
8. Retorna `PaymentResponse` con todos los datos

### Métodos de consulta

```csharp
Task<List<PaymentResponse>> GetMyPaymentsAsync(Guid userId);     // Historial del usuario
Task<PaymentResponse?> GetPaymentAsync(Guid userId, Guid paymentId); // Detalle con ownership check
```

---

## Webhooks

### PayPalWebhookController

`Api/Controllers/PayPalWebhookController.cs`

```
POST /api/v1/webhooks/paypal   [AllowAnonymous]
```

PayPal envía webhooks a esta URL cuando ocurren eventos async (captura completada, reembolso, etc.). El controller:

1. **Lee el raw body** con `Request.EnableBuffering()`
2. **Verifica la firma** vía `IPayPalWebhookSignatureValidator.VerifyAsync()` con los 5 headers de PayPal
3. **Si la firma es inválida:** loguea warning, retorna `Ok()` (PayPal necesita 2xx para dejar de reintentar)
4. **Parsea el JSON** y extrae `event_id`, `event_type`, `resource.resource_type`, `resource.id`
5. **Inserta `PayPalWebhookEvent`** con el `event_id` único (la UNIQUE constraint atrapa duplicados)
6. **Dispatch** según `event_type`:

| Evento | Acción |
|--------|--------|
| `PAYMENT.CAPTURE.COMPLETED` | Busca payment por `resource.id` (capture ID), marca Completed + PaidAt, crea Enrollment |
| `PAYMENT.CAPTURE.REFUNDED` | Busca payment por capture ID, marca Refunded + RefundedAt |
| `PAYMENT.CAPTURE.DENIED` | Busca payment, marca Failed |
| Otros | Log ignora el evento |

7. **Marca como procesado** vía `IPayPalWebhookEventRepository.MarkProcessedAsync()`

### Idempotencia (dedup)

El mismo webhook puede llegar múltiples veces (PayPal reintenta si no recibe 2xx rápido). El sistema maneja esto con:

1. **UNIQUE INDEX** en `PayPalWebhookEvents.event_id`
2. Si el insert falla por `DbUpdateException` con código `23505` (Postgres unique violation) o mensaje que contenga "duplicate key" / "unique constraint", se captura la excepción y se retorna `Ok()` sin reprocesar

```csharp
try
{
    await _webhookEventRepository.InsertAsync(webhookEvent, ct);
}
catch (DbUpdateException ex) when (
    ex.InnerException is PostgresException pg &&
    pg.SqlState == "23505")
{
    // Duplicado — ya lo procesamos, OK sin reprocesar
}
```

---

## Dependency Injection (Program.cs)

### Registro completo

```csharp
// ==============================
// SERVICIOS DE APLICACIÓN
// ==============================
builder.Services.AddScoped<IPaymentService, PaymentService>();

// ==============================
// REPOSITORIOS
// ==============================
builder.Services.AddScoped<IPaymentRepository, PaymentRepository>();
builder.Services.AddScoped<IPayPalWebhookEventRepository, PayPalWebhookEventRepository>();

// ==============================
// PAYPAL ADAPTER
// ==============================
builder.Services.AddMemoryCache();
builder.Services.AddTransient<PayPalAuthenticationHandler>();
builder.Services.Configure<PayPalOptions>(
    builder.Configuration.GetSection("PayPal"));

// Signature validator — HTTP client separado para webhooks
builder.Services.AddHttpClient<PayPalWebhookSignatureValidator>()
    .AddHttpMessageHandler<PayPalAuthenticationHandler>()
    .ConfigureHttpClient((sp, c) =>
    {
        var options = sp.GetRequiredService<IOptions<PayPalOptions>>();
        c.BaseAddress = new Uri(options.Value.BaseUrl);
        c.Timeout = TimeSpan.FromSeconds(15);
    });

builder.Services.AddScoped<IPayPalWebhookSignatureValidator>(sp =>
    sp.GetRequiredService<PayPalWebhookSignatureValidator>());

// Payment Provider — switchea según config
var paypalEnabled = builder.Configuration.GetSection("PayPal")
    .GetValue<bool>("Enabled");

if (paypalEnabled)
{
    builder.Services.AddHttpClient<PayPalPaymentProvider>()
        .AddHttpMessageHandler<PayPalAuthenticationHandler>()
        .ConfigureHttpClient((sp, c) =>
        {
            var options = sp.GetRequiredService<IOptions<PayPalOptions>>();
            c.BaseAddress = new Uri(options.Value.BaseUrl);
            c.Timeout = TimeSpan.FromSeconds(30);
        });

    builder.Services.AddScoped<IPaymentProvider>(sp =>
        sp.GetRequiredService<PayPalPaymentProvider>());
}
else
{
    builder.Services.AddScoped<IPaymentProvider, MockPaymentProvider>();
}

// ==============================
// VALIDADORES
// ==============================
builder.Services.AddScoped<IValidator<CreatePaymentRequest>, CreatePaymentRequestValidator>();
builder.Services.AddScoped<IValidator<ConfirmPaymentRequest>, ConfirmPaymentRequestValidator>();
```

### ¿Por qué `AddScoped<IPaymentProvider>(sp => sp.GetRequiredService<...>())`?

Porque el `HttpClient` tipado de `PayPalPaymentProvider` tiene el `PayPalAuthenticationHandler` en su pipeline. Si usáramos `AddScoped<IPaymentProvider, PayPalPaymentProvider>()`, el `HttpClient` que recibe no tendría el handler configurado y las requests no tendrían autenticación.

La fábrica manual (`sp => sp.GetRequiredService<T>()`) le indica al DI que use la instancia que ya fue construida con su `HttpClient` tipado. Esto es necesario porque `AddHttpClient<T>` registra `T` como **transient** en el DI interno de los clientes HTTP.

### Switcheo PayPal/Mock

```json
{
  "PayPal": {
    "Enabled": true,          // false → usa MockPaymentProvider
    "ClientId": "...",
    "ClientSecret": "..."
  }
}
```

- `PayPal:Enabled = true` → se usa `PayPalPaymentProvider` real
- `PayPal:Enabled = false` (o ausente) → se usa `MockPaymentProvider` (sin conexión externa)

---

## Configuración

### appsettings.json

```json
{
  "PayPal": {
    "Enabled": true,
    "BaseUrl": "https://api-m.sandbox.paypal.com",
    "ClientId": "TU_CLIENT_ID",
    "ClientSecret": "TU_CLIENT_SECRET",
    "WebhookId": "TU_WEBHOOK_ID",
    "IsSandbox": true,
    "PlanIds": {
      "monthly": "P-XXXXXXXXXXXXXXXX",
      "yearly": "P-YYYYYYYYYYYYYYYY"
    }
  }
}
```

| Propiedad | Descripción | Default |
|-----------|-------------|---------|
| `Enabled` | Activa PayPal real vs Mock | `false` |
| `BaseUrl` | API base URL | `https://api-m.sandbox.paypal.com` |
| `ClientId` | REST App Client ID (de https://developer.paypal.com) | `""` |
| `ClientSecret` | REST App Secret | `""` |
| `WebhookId` | Webhook ID del dashboard de PayPal | `""` |
| `IsSandbox` | Conveniencia para switchear a producción | `true` |
| `PlanIds` | Mapa de plan → plan_id de PayPal Billing | `{}` |

> **⚠️ Producción:** Cambiar `BaseUrl` a `https://api-m.paypal.com`, `IsSandbox` a `false`, y usar credenciales de producción.

### PayPalOptions

```csharp
public class PayPalOptions
{
    public const string SectionName = "PayPal";
    public string BaseUrl { get; set; } = "https://api-m.sandbox.paypal.com";
    public string ClientId { get; set; } = "";
    public string ClientSecret { get; set; } = "";
    public string WebhookId { get; set; } = "";
    public bool IsSandbox { get; set; } = true;
    public Dictionary<string, string> PlanIds { get; set; } = new(StringComparer.OrdinalIgnoreCase);
}
```

Se bindea automáticamente desde `appsettings.json` via `builder.Services.Configure<PayPalOptions>(...)`.

---

## Frontend: integración con PayPal JS SDK

### Flujo recomendado (popup)

```javascript
// 1. Obtener PayPalOrderId del backend
const { payPalOrderId, approvalUrl } = await fetch('/api/v1/payments/create', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ courseId }),
});

// 2. Renderizar botón PayPal con el Order ID
paypal.Buttons({
  createOrder: () => payPalOrderId,
  onApprove: async (data) => {
    // 3. Confirmar en el backend
    const result = await fetch('/api/v1/payments/confirm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ paymentId, payPalOrderId }),
    });
    // Redirigir al dashboard / curso
  },
  onCancel: () => {
    // Usuario canceló — redirigir al carrito
  },
}).render('#paypal-button-container');
```

### Flujo alternativo (redirect)

```javascript
// Si el popup no es viable (mobile webview, etc):
window.location.href = approvalUrl;
// PayPal redirige a returnUrl después de la aprobación
```

### ¿Qué pasa si el usuario cierra el popup antes de confirmar?

PayPal sigue procesando la captura. Cuando PayPal completa la captura, envía el webhook `PAYMENT.CAPTURE.COMPLETED` al `PayPalWebhookController`, que procesa el pago y crea el enrollment automáticamente. No se pierde nada.

---

## Tests

### Estructura

```
Tests/Api.Tests/
├── Controllers/
│   ├── PaymentsControllerTests.cs          ← 8 tests
│   └── PayPalWebhookControllerTests.cs     ← 6 tests
└── PayPal/
    ├── PayPalAuthenticationHandlerTests.cs
    ├── PayPalPaymentProviderTests.cs
    └── PayPalWebhookSignatureValidatorTests.cs
```

### PaymentsControllerTests

Usa `ControllerTestBase` con helpers `SetUserAuth()` y `SetAnonymous()`. Mockea `IPaymentService` con NSubstitute.

| Test | Verifica |
|------|----------|
| `CreatePayment_Authorized_ReturnsOkWithResponse` | 200 OK con `CreatePaymentResponse` |
| `CreatePayment_Anonymous_ReturnsUnauthorized` | 401 sin auth |
| `ConfirmPayment_Authorized_ReturnsOkWithResponse` | 200 OK con `PaymentResponse` |
| `ConfirmPayment_Anonymous_ReturnsUnauthorized` | 401 sin auth |
| `GetMyPayments_Authorized_ReturnsOkWithPayments` | 200 OK con lista |
| `GetMyPayments_Anonymous_ReturnsUnauthorized` | 401 sin auth |
| `GetPayment_ValidId_ReturnsOk` | 200 OK con payment matching |
| `GetPayment_NotFound_ReturnsNotFound` | 404 para ID inexistente |

### PayPalWebhookControllerTests

Usa `DefaultHttpContext` real con `MemoryStream` para simular requests HTTP. No mockea el `HttpContext` — construye uno real.

| Test | Verifica |
|------|----------|
| `Receive_InvalidSignature_AcksButSkipsDispatch` | Firma inválida → `Ok()`, no llama a `InsertAsync` |
| `Receive_ValidSignatureDuplicateEventId_AcksAndSkipsSecondDispatch` | UNIQUE violation → `Ok()`, no reprocesa |
| `Receive_CaptureCompleted_MarksPaymentCompletedAndCreatesEnrollment` | Status=Completed, PaidAt, PayPalCaptureId, Enrollment creado |
| `Receive_CaptureRefundEvent_MarksPaymentRefunded_WithRefundedAt` | Status=Refunded, RefundedAt seteado |
| `Receive_CaptureDenied_MarksPaymentFailed` | Status=Failed |
| `Receive_UnsupportedEventType_AcksAndMarksProcessed` | Evento desconocido → `Ok()` + `MarkProcessedAsync` con nota |

### PayPal unit tests

Prueban el adaptador PayPal con mocking de `HttpMessageHandler` (vía `HttpClient` con un handler que devuelve respuestas predefinidas) o con NSubstitute.

---

## Flujo de trabajo para agregar un nuevo método de pago

Si querés agregar **MercadoPago**, **Stripe**, o cualquier otro gateway:

```
1. Crear el adaptador
   └── Infrastructure/Adapters/MercadoPago/MercadoPagoPaymentProvider.cs
       → implementa IPaymentProvider

2. Configurar opciones
   └── Infrastructure/Adapters/MercadoPago/MercadoPagoOptions.cs

3. (Opcional) Handler de autenticación si el gateway lo requiere
   └── MercadoPagoAuthenticationHandler.cs (DelegatingHandler)

4. Registrar en Program.cs
   └── builder.Services.AddScoped<IPaymentProvider, MercadoPagoPaymentProvider>();
       (o switchear por config como PayPal)

5. Agregar campos al Payment entity si el nuevo gateway necesita IDs distintos
   └── Payment.MercadoPagoPaymentId, Payment.MercadoPagoPreferenceId, etc.
```

**El `PaymentService` no se toca.** Ese es el punto de la arquitectura hexagonal.

---

## Resolución de problemas comunes

### "415 Unsupported Media Type" al capturar

```
PayPal responded with 415 when capturing an order.
```

**Causa:** PayPal exige que el body del `POST .../capture` sea `{}` (objeto vacío), no vacío ni null. Si el `HttpContent` es null o no tiene `Content-Type: application/json`, PayPal responde 415.

**Solución:** Enviar explícitamente `{}`:
```csharp
var response = await _http.PostAsync(
    $"v2/checkout/orders/{providerOrderId}/capture",
    new StringContent("{}", Encoding.UTF8, "application/json"),
    ct);
```

### "Some services are not able to be constructed"

```
Unable to resolve service for type 'IPaymentProvider'...
```

**Causa 1:** No se registró `IPaymentProvider` en DI (falta en `Program.cs`).

**Causa 2:** `PayPal:Enabled` es `true` pero falta `PayPalAuthenticationHandler` registrado o falta `IMemoryCache`.

**Solución:**
```csharp
// ✅ Verificar que esté registrado
builder.Services.AddMemoryCache();
builder.Services.AddTransient<PayPalAuthenticationHandler>();
```

### Webhook llega pero no se procesa (siempre 401)

```
[WRN] PayPal webhook signature verification failed ...
```

**Causa 1:** `PayPal:WebhookId` no está configurado o está mal.

**Causa 2:** El webhook se configuró en otro entorno (sandbox vs producción).

**Solución:**
```bash
# Verificar que el WebhookId en appsettings.json coincida con el del dashboard de PayPal
# https://developer.paypal.com/dashboard/applications → Webhooks
```

### "PAYPAL-CERT-URL host not authorized"

```
SSRF guard blocked cert_url host: https://evil.com/cert
```

**Causa:** El `PAYPAL-CERT-URL` header apunta a un host que no está en la whitelist de PayPal.

**Solución:** Si PayPal cambió sus hosts, actualizar la whitelist en `PayPalWebhookSignatureValidator`:
```csharp
private static readonly HashSet<string> AllowedCertHosts = new()
{
    "api.paypal.com",
    "api-m.paypal.com",
    "api.sandbox.paypal.com",
    "api-m.sandbox.paypal.com",
};
```

### "PayPal capture response did not include a capture id"

```
PayPal capture response did not include a capture id.
```

**Causa:** La respuesta de captura de PayPal no contiene un `purchase_units[0].payments.captures[0].id`. Esto puede pasar si la orden no fue aprobada antes de capturar.

**Solución:** Verificar que el frontend espere a que el usuario apruebe en PayPal antes de llamar a `confirm`. El flujo correcto es: `createOrder` → usuario aprueba → `onApprove` → `confirm`.

### "Course is free — enroll directly"

```
Course is free — enroll directly
```

**Causa:** Se llamó a `CreatePaymentAsync` para un curso gratuito.

**Solución:** Los cursos gratuitos se inscriben directo sin pasar por pagos. El frontend debe llamar al endpoint de inscripción directa, no al de pagos.

### Duplicado de enrollment por webhook + confirm simultáneo

Cuando el usuario confirma (POST /confirm) y PayPal envía el webhook casi al mismo tiempo, ambos pueden intentar crear el enrollment.

**Solución:** El `ConfirmPaymentAsync` usa `GetByCourseAndUserAsync` para verificar antes de crear, y si ya existe, no falla:

```csharp
if (!alreadyEnrolled)
    await _enrollmentRepository.CreateAsync(enrollment, ct);
```

---

## Buenas prácticas

1. **Nunca guardes credenciales de PayPal en código.** Usá `appsettings.Development.json` para desarrollo y variables de entorno o secrets manager para producción.

2. **Siempre verificá el status del capture.** PayPal puede devolver un `capture_id` incluso si el funding instrument fue declinado. El `PayPalPaymentProvider` rechaza status `DECLINED/DENIED/FAILED/EXPIRED/CANCELLED`.

3. **El webhook es la fuente de verdad.** El `confirm` del frontend es una optimización (experiencia de usuario instantánea), pero el webhook es el que garantiza que el pago se procese incluso si el usuario cierra el browser.

4. **Idempotencia obligatoria en webhooks.** PayPal reintenta webhooks hasta 3 veces si no recibe 2xx rápido. Sin dedup, procesarías el mismo pago múltiples veces.

5. **Snake_case en JSON de PayPal.** La API de PayPal usa snake_case, C# usa PascalCase. Los POCOs internos del adaptador usan `[JsonPropertyName("snake_case")]`.

6. **No exponer el `ClientSecret` al frontend.** El frontend solo recibe `PayPalOrderId`. El `ClientSecret` vive exclusivamente en el backend.

7. **Timeout adecuado.** PayPal puede ser lento en sandbox. El `PayPalPaymentProvider` tiene timeout de 30s, el validador de webhooks 15s.

8. **Validar ownership del usuario.** Todos los endpoints de pagos verifican que el payment pertenezca al usuario autenticado antes de operar.

9. **Mock para desarrollo.** Dejá `PayPal:Enabled = false` para desarrollo local. El `MockPaymentProvider` permite probar todo el flujo sin conexión a PayPal.

10. **Nunca edites migraciones a mano.** Si cambiás el modelo de Payment o PayPalWebhookEvent, creá una nueva migración.

---

## Referencia rápida

### Endpoints

| Método | Ruta | Auth | Propósito |
|--------|------|------|-----------|
| `POST` | `/api/v1/payments/create` | `PaymentCreate` | Iniciar pago |
| `POST` | `/api/v1/payments/confirm` | `PaymentCreate` | Confirmar pago + crear enrollment |
| `GET` | `/api/v1/payments/mine` | `PaymentRead` | Historial del usuario |
| `GET` | `/api/v1/payments/{id}` | `PaymentRead` | Detalle de pago |
| `POST` | `/api/v1/webhooks/paypal` | `[AllowAnonymous]` | Webhook PayPal |

### Flujo de desarrollo

```
1. Configurar PayPal:Enabled = false para desarrollo local
2. Crear payment → devuelve payment sintético
3. Confirmar → procesa con MockPaymentProvider
4. Verificar que el enrollment se creó
5. Para probar PayPal real:
   a. Crear app en https://developer.paypal.com/dashboard/
   b. Copiar Client ID + Secret a appsettings.json
   c. Configurar Webhook URL en el dashboard (ngrok para local)
   d. Poner PayPal:Enabled = true
```

### DTOs principales

```csharp
// Request
CreatePaymentRequest { CourseId, ReturnUrl?, CancelUrl? }
ConfirmPaymentRequest { PaymentId, PayPalOrderId? }

// Response
CreatePaymentResponse { PaymentId, Amount, Currency, Status, PayPalOrderId, ApprovalUrl? }
PaymentResponse { Id, UserId, CourseId?, CourseTitle?, Amount, Currency, Status, Type, PaidAt?, RefundedAt?, CreatedAt, PayPalOrderId?, PayPalCaptureId? }
```

### Archivos clave

| Archivo | Ruta |
|---------|------|
| Entidad Payment | `Domain/Entities/Payment.cs` |
| Entidad PayPalWebhookEvent | `Domain/Entities/PayPalWebhookEvent.cs` |
| Enum PaymentStatus | `Domain/Enums/PaymentStatus.cs` |
| Puerto IPaymentProvider | `Application/Common/Interfaces/IPaymentProvider.cs` |
| DTOs de pago | `Application/Common/Models/PaymentResponse.cs` |
| Contratos del proveedor | `Application/Common/Models/PaymentProviderContracts.cs` |
| Mapping | `Application/Common/Mapping/MappingPayment.cs` |
| Servicio | `Application/Features/Payments/PaymentService.cs` |
| Adaptador PayPal | `Infrastructure/Adapters/PayPal/PayPalPaymentProvider.cs` |
| Auth handler OAuth2 | `Infrastructure/Adapters/PayPal/PayPalAuthenticationHandler.cs` |
| Validador webhook | `Infrastructure/Adapters/PayPal/PayPalWebhookSignatureValidator.cs` |
| Mock | `Infrastructure/Adapters/Payments/MockPaymentProvider.cs` |
| Opciones | `Infrastructure/Adapters/PayPal/PayPalOptions.cs` |
| Config EF Payment | `Infrastructure/Persistence/Configurations/PaymentConfiguration.cs` |
| Config EF Webhook | `Infrastructure/Persistence/Configurations/PayPalWebhookEventConfiguration.cs` |
| Repositorio Payment | `Infrastructure/Persistence/Repositories/PaymentRepository.cs` |
| Repositorio Webhook | `Infrastructure/Persistence/Repositories/PayPalWebhookEventRepository.cs` |
| Controller Pagos | `Api/Controllers/PaymentsController.cs` |
| Controller Webhook | `Api/Controllers/PayPalWebhookController.cs` |
| Validators | `Api/Validators/CreatePaymentRequestValidator.cs` |
| Tests Pagos | `Tests/Api.Tests/Controllers/PaymentsControllerTests.cs` |
| Tests Webhook | `Tests/Api.Tests/Controllers/PayPalWebhookControllerTests.cs` |
| Tests PayPal | `Tests/Api.Tests/PayPal/*` |
