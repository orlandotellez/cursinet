export interface LessonContent {
  videoUrl?: string;
  body?: string;
  code?: string;
  codeLanguage?: string;
  quiz?: {
    questions: {
      id: string;
      text: string;
      options: string[];
      correctIndex: number;
    }[];
  };
  resource?: {
    type: string;
    size: string;
    preview?: string;
  };
}

export const lessonContentMap: Record<string, LessonContent> = {
  /* ── Course 1: Arquitectura Hexagonal ── */
  'les-1': {
    videoUrl: '#',
    body: '## Introducción a la Arquitectura Hexagonal\n\nLa Arquitectura Hexagonal, también conocida como **Puertos y Adaptadores**, es un patrón arquitectónico que busca aislar la lógica de negocio de las preocupaciones externas como bases de datos, APIs o interfaces de usuario.\n\n### ¿Por qué es importante?\n\n- **Mantenibilidad**: Cambiá la infraestructura sin tocar el dominio\n- **Testeabilidad**: Probá la lógica de negocio sin depender de servicios externos\n- **Flexibilidad**: Adaptate a nuevas tecnologías sin reescribir todo\n\n### Conceptos clave\n\nEl hexágono representa el dominio de la aplicación. Cada lado del hexágono es un **puerto** (interfaz) que define cómo el mundo exterior se comunica con nuestro sistema.',
  },
  'les-2': {
    body: '## Configuración del Entorno\n\nVamos a configurar el proyecto desde cero usando TypeScript y Node.js.\n\n### Requisitos\n\n- Node.js 20+ instalado\n- pnpm o npm\n- Un editor de código (VS Code recomendado)\n\n### Inicialización\n\n```bash\nmkdir mi-proyecto-hexagonal\ncd mi-proyecto-hexagonal\npnpm init\npnpm add typescript -D\npnpm tsc --init\n```\n\n### Estructura de carpetas\n\n```\nsrc/\n├── domain/       # Entidades, value objects, interfaces\n├── application/  # Casos de uso\n└── infrastructure/ # Implementaciones concretas\n```',
  },
  'les-4': {
    videoUrl: '#',
    body: '## Conceptos Clave de DDD\n\nEn esta clase vamos a ver los conceptos fundamentales del Domain-Driven Design que se complementan con la arquitectura hexagonal.',
  },
  'les-5': {
    body: '## Patrones de Arquitectura\n\nLos patrones más comunes que vas a encontrar trabajando con arquitectura hexagonal:\n\n### Repository Pattern\n\nEl patrón Repository abstrae el almacenamiento de datos. Tu dominio nunca debería saber si estás usando PostgreSQL, MongoDB o archivos JSON.\n\n```typescript\ninterface UserRepository {\n  findById(id: UserId): Promise<User | null>;\n  save(user: User): Promise<void>;\n  delete(id: UserId): Promise<void>;\n}\n```\n\n### Service Layer\n\nLos servicios de aplicación orquestan los casos de uso sin contener lógica de negocio.',
    code: `interface UserRepository {
  findById(id: UserId): Promise<User | null>;
  save(user: User): Promise<void>;
  delete(id: UserId): Promise<void>;
}

class CreateUserUseCase {
  constructor(private repo: UserRepository) {}

  async execute(data: CreateUserDTO): Promise<User> {
    const user = User.create(data);
    await this.repo.save(user);
    return user;
  }
}`,
    codeLanguage: 'typescript',
  },
  'les-6': {
    code: `// Ejercicio: Implementá un repositorio en memoria
// Completá la clase InMemoryUserRepository

interface User {
  id: string;
  name: string;
  email: string;
}

interface UserRepository {
  findById(id: string): Promise<User | null>;
  save(user: User): Promise<void>;
  findAll(): Promise<User[]>;
}

// TODO: implementá InMemoryUserRepository
class InMemoryUserRepository _____ UserRepository {
  private users: User[] = [];

  async findById(id: string): Promise<User | null> {
    // Tu código acá
  }

  async save(user: User): Promise<void> {
    // Tu código acá
  }

  async findAll(): Promise<User[]> {
    // Tu código acá
  }
}`,
    codeLanguage: 'typescript',
  },
  'les-7': {
    quiz: {
      questions: [
        {
          id: 'q1',
          text: '¿Cuál es el objetivo principal de la Arquitectura Hexagonal?',
          options: [
            'Mejorar el rendimiento de la aplicación',
            'Aislar la lógica de negocio de la infraestructura',
            'Reducir el uso de memoria',
            'Facilitar el deploy en producción',
          ],
          correctIndex: 1,
        },
        {
          id: 'q2',
          text: 'En el patrón Repository, ¿qué responsabilidad tiene?',
          options: [
            'Manejar las rutas HTTP',
            'Abstract el almacenamiento de datos',
            'Renderizar las vistas',
            'Autenticar usuarios',
          ],
          correctIndex: 1,
        },
        {
          id: 'q3',
          text: '¿Qué es un "puerto" en Arquitectura Hexagonal?',
          options: [
            'Una conexión de red',
            'Una interfaz que define comunicación con el dominio',
            'Un tipo de base de datos',
            'Un middleware de Express',
          ],
          correctIndex: 1,
        },
      ],
    },
  },
  'les-8': {
    videoUrl: '#',
    body: '## Caso de Uso Real: Sistema de Pagos\n\nVamos a ver cómo aplicar arquitectura hexagonal en un sistema de pagos real con múltiples proveedores.',
  },

  /* ── Course 2: React 19 ── */
  'les-3': {
    body: '## Primeros pasos con React\n\nReact es una biblioteca para construir interfaces de usuario. Se basa en componentes, que son piezas reutilizables de UI.\n\n### Tu primer componente\n\n```tsx\nfunction Saludo({ nombre }: { nombre: string }) {\n  return <h1>Hola, {nombre}! 👋</h1>;\n}\n```\n\n### JSX\n\nJSX es una extensión de sintaxis que combina HTML y JavaScript. Cada componente devuelve JSX.',
  },
  'les-9': {
    body: '## Optimización de Rendimiento en React\n\nTécnicas avanzadas para mantener tu app rápida:\n\n- **useMemo**: Memorizá cálculos costosos\n- **useCallback**: Evitá re-renders innecesarios\n- **React.memo**: Componentes puros\n- **Code Splitting**: Cargá código bajo demanda',
  },
  'les-10': {
    code: `// Proyecto Final: Task Manager App
// Construí una app completa de gestión de tareas

import { useState } from 'react';

type Task = {
  id: string;
  title: string;
  completed: boolean;
};

export function TaskApp() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [input, setInput] = useState('');

  // TODO: implementá las funciones
  // addTask - agregar nueva tarea
  // toggleTask - marcar como completada
  // deleteTask - eliminar tarea

  return (
    <div>
      <h1>Task Manager</h1>
      {/* Tu código acá */}
    </div>
  );
}`,
    codeLanguage: 'tsx',
  },
};

export function getLessonContent(lessonId: string): LessonContent | undefined {
  return lessonContentMap[lessonId];
}
