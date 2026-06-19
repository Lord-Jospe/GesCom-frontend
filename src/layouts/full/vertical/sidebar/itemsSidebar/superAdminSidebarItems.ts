import { uniqueId } from 'lodash';
import type { MenuItem } from './adminSidebaritems';

const SidebarContent: MenuItem[] = [
  {
    heading: 'Super Admin',
    children: [
      {
        name: 'Dashboard',
        icon: 'solar:chart-2-linear',
        id: uniqueId(),
        url: '/super-admin',
      },
      {
        name: 'Empresas',
        icon: 'solar:buildings-2-linear',
        id: uniqueId(),
        url: '/super-admin/empresas',
      },
    ],
  },
  {
    heading: 'Acceso',
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
