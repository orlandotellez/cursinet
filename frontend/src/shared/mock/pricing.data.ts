import type { PricingPlan } from '@/src/shared/types';

export const pricingPlans: PricingPlan[] = [
  { name: 'Gratuito', description: 'Accedé a cursos seleccionados sin costo', price: 0, period: '', features: ['Cursos gratuitos seleccionados', 'Certificados de finalización', 'Comunidad de estudiantes'], highlighted: false, cta: 'Comenzar gratis' },
  { name: 'Pro', description: 'Todo el catálogo, un solo precio', price: 10, period: '/mes', features: ['Todos los cursos del catálogo', 'Certificados profesionales'], highlighted: true, cta: 'Suscribirme' },
];
