import { uniqueId } from 'lodash';
import type { MenuItem } from './adminSidebaritems';

const SidebarContent: MenuItem[] = [
  {
    heading: 'Gestión Global',
    children: [
      {
        name: 'Empresas',
        icon: 'solar:buildings-2-linear',
        id: uniqueId(),
        url: '/super-admin',
      },
    ],
  },
  {
    heading: 'Administración',
    children: [
      {
        name: 'Panel Admin',
        icon: 'solar:shield-user-linear',
        id: uniqueId(),
        url: '/admin',
      },
    ],
  },
];

export default SidebarContent;
