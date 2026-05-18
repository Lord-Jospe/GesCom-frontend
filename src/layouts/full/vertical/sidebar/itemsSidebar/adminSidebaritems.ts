export interface ChildItem {
  id?: number | string;
  name?: string;
  icon?: string;
  children?: ChildItem[];
  item?: unknown;
  url?: string;
  color?: string;
  disabled?: boolean;
  subtitle?: string;
  badge?: boolean;
  badgeType?: string;
  isPro?: boolean;
}

export interface MenuItem {
  heading?: string;
  name?: string;
  icon?: string;
  id?: number;
  to?: string;
  items?: MenuItem[];
  children?: ChildItem[];
  url?: string;
  disabled?: boolean;
  subtitle?: string;
  badgeType?: string;
  badge?: boolean;
  isPro?: boolean;
}

import { uniqueId } from 'lodash';

const SidebarContent: MenuItem[] = [
  {
    heading: 'Organización',
    children: [
      {
        name: 'Mi empresa',
        icon: 'solar:buildings-2-linear',
        id: uniqueId(),
        url: '/utilities/table',
      },
      {
        name: 'Empleados',
        icon: 'solar:users-group-rounded-linear',
        id: uniqueId(),
        url: '/admin/empleados',
      },
      {
        name: 'Subscripcion',
        icon: 'solar:chat-round-money-linear',
        id: uniqueId(),
        //url: '/utilities/activities',
      },
      {
        id: uniqueId(),
        name: 'Clientes',
        icon: 'solar:user-broken',
        //url: '/user-profile',
                children: [
          {
            id: uniqueId(),
            name: 'Lista de Estudiantes',
            //url: '/students/list',
          },
          {
            id: uniqueId(),
            name: 'Repositorio documental',

            //url: '/students/documents',
          },
        ],
      },
      {
        name: 'Proveedores',
        icon: 'solar:shop-2-linear',
        id: uniqueId(),
        url: '/utilities/form',
      },
      {
        name: 'Bancos',
        icon: 'mdi-light:bank',
        id: uniqueId(),
        url: '/utilities/form',
      },
    ],
  },
  {
    heading: 'Facturación y cobranza',
    children: [
      {
        name: 'Caja y Facturación',
        icon: 'solar:calculator-linear',
        id: uniqueId(),
        //url: '/utilities/credit-card',
      },
      {
        name: 'Gestión de pagos',
        icon: 'solar:wallet-linear',
        id: uniqueId(),
        //url: '/utilities/wallet',
      },
      {
        name: 'Historial de transacciones',
        icon: 'solar:checklist-bold',
        id: uniqueId(),
        //url: '/utilities/transactions',
      },
      {
        name: 'Descuentos y becas',
        icon: 'solar:dollar-linear',
        id: uniqueId(),
        //url: '/utilities/discounts',
      },
      {
        name: 'Alertas y notificaciones',
        icon: 'solar:dialog-2-linear',
        id: uniqueId(),
        //url: '/utilities/notifications',
      }
    ],
  },
  {
    heading: 'Módulo Contable',
    children: [
      {
        name: 'Asientos Contables',
        icon: 'solar:book-2-broken',
        id: uniqueId(),
        //url: '/utilities/calculator',
      },
      {
        name: 'Gestión de Egresos',
        icon: 'solar:calculator-minimalistic-linear',
        id: uniqueId(),
        //url: '/utilities/reports',
      },
      {
        name: 'Reportes Financieros',
        icon: 'solar:chart-2-bold',
        id: uniqueId(),
        //url: '/utilities/charts',
      },
      {
        name: 'Centro de Exportación',
        icon: 'solar:download-linear',
        id: uniqueId(),
        //url: '/utilities/charts',
      }
    ],
  },
  {
    heading: 'Configuración y Seguridad',
    children: [
      {
        id: uniqueId(),
        name: 'Gestión de Usuarios',
        icon: 'solar:user-block-bold-duotone',
        //url: '/settings/users',
      },
            {
        id: uniqueId(),
        name: 'Seguridad y Auditoría',
        icon: 'solar:shield-check-linear',
        url: '/',
      },
      {
        id: uniqueId(),
        name: 'Ajustes del sistema',
        icon: 'solar:settings-linear',
        //url: '/settings/system',  
      }
    ],
  },
];

export default SidebarContent;
