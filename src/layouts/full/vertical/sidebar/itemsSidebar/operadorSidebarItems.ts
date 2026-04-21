import { uniqueId } from 'lodash';
import type { MenuItem } from './adminSidebaritems';

const OperadorSidebarContent: MenuItem[] = [
  {
    heading: 'Académico',
    children: [
      {
        id: uniqueId(),
        name: 'Mis Materias',
        icon: 'solar:book-2-linear',
        url: '/student/subjects',
      },
      {
        id: uniqueId(),
        name: 'Horario',
        icon: 'solar:calendar-linear',
        url: '/student/schedule',
      },
      {
        id: uniqueId(),
        name: 'Calificaciones',
        icon: 'solar:chart-square-linear',
        url: '/student/grades',
      },
    ],
  },
  {
    heading: 'Gestión',
    children: [
      {
        id: uniqueId(),
        name: 'Repositorio Documental',
        icon: 'solar:folder-linear',
        url: '/student/documents',
      },
      {
        id: uniqueId(),
        name: 'Pagos y Facturas',
        icon: 'solar:wallet-linear',
        url: '/student/payments',
      },
      {
        id: uniqueId(),
        name: 'Notificaciones',
        icon: 'solar:dialog-2-linear',
        url: '/student/notifications',
      },
    ],
  },
  {
    heading: 'Cuenta',
    children: [
      {
        id: uniqueId(),
        name: 'Mi Perfil',
        icon: 'solar:user-circle-linear',
        url: '/student/profile',
      },
    ],
  },
];

export default OperadorSidebarContent;
