# Testing

Estrategia de testing.

## Current Status

**No test projects exist yet.** The backend has no unit, integration, or E2E tests.

The test infrastructure should be added following this strategy:

## Proposed Structure

```
tests/
├── Cursinet.UnitTests/
│   ├── Domain/            # entity business logic
│   └── Application/       # services (mocked deps)
├── Cursinet.IntegrationTests/
│   ├── Api/               # full API with test DB
│   │   ├── AuthTests.cs
│   │   └── CoursesTests.cs
│   └── TestFixtures/      # WebApplicationFactory
```

## Proposed Tools

- **xUnit** — test framework (.NET standard)
- **Testcontainers** — PostgreSQL container for integration tests
- **Moq / NSubstitute** — mocking in unit tests
- **FluentAssertions** — readable assertions

## Proposed Goals

- Unit tests: 80%+ coverage on Domain/Application
- Integration: critical flows (register, login, create course)
- E2E: full auth flow with real DB + cookies
