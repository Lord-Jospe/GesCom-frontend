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
        url: '/admin/mi-empresa',
      },
      {
        name: 'Empleados',
        icon: 'solar:users-group-rounded-linear',
        id: uniqueId(),
        children: [
          { id: uniqueId(), name: 'Lista de empleados', icon: 'solar:users-group-rounded-linear', url: '/admin/empleados' },
          { id: uniqueId(), name: 'Gestión de nómina', icon: 'solar:card-transfer-linear', url: '/admin/nomina' },
        ],
      },
      {
        name: 'Clientes',
        icon: 'solar:user-broken',
        id: uniqueId(),
        url: '/admin/clientes',
      },
      {
        name: 'Proveedores',
        icon: 'solar:shop-2-linear',
        id: uniqueId(),
        url: '/admin/proveedores',
      },
    ],
  },
  {
    heading: 'Facturación y Cobranza',
    children: [
      {
        name: 'Caja y Facturación',
        icon: 'solar:calculator-linear',
        id: uniqueId(),
        children: [
          { id: uniqueId(), name: 'Historial', icon: 'solar:list-check-linear', url: '/admin/caja-facturacion' },
          { id: uniqueId(), name: 'Registrar venta', icon: 'solar:cart-plus-linear', url: '/admin/caja-facturacion/venta' },
          { id: uniqueId(), name: 'Registrar gasto', icon: 'solar:arrow-down-linear', url: '/admin/caja-facturacion/gasto' },
        ],
      },
      {
        name: 'Cuentas por Cobrar',
        icon: 'solar:hand-money-linear',
        id: uniqueId(),
        url: '/admin/por-cobrar',
      },
      {
        name: 'Cuentas por Pagar',
        icon: 'solar:wallet-money-linear',
        id: uniqueId(),
        url: '/admin/por-pagar',
      },
    ],
  },
  {
    heading: 'Inventario',
    children: [
      {
        name: 'Productos y stock',
        icon: 'solar:box-linear',
        id: uniqueId(),
        url: '/admin/inventario',
      },
      {
        name: 'Movimientos',
        icon: 'solar:transfer-horizontal-linear',
        id: uniqueId(), 
        url: '/admin/inventario/movimientos'
      },
      {
        name: 'Alertas',
        icon: 'solar:danger-triangle-linear', 
        id: uniqueId(),
        url: '/admin/inventario/alertas' 
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
        children: [
          { id: uniqueId(), name: 'Libro diario', icon: 'solar:book-2-linear', url: '/admin/libro-diario' },
          { id: uniqueId(), name: 'Libro mayor', icon: 'solar:book-bookmark-linear', url: '/admin/libro-mayor' },
          { id: uniqueId(), name: 'Plan de cuentas', icon: 'solar:documents-linear', url: '/admin/plan-cuentas' },
        ],
      },
      {
        name: 'Reportes Financieros',
        icon: 'solar:chart-2-bold',
        id: uniqueId(),
        children: [
          { id: uniqueId(), name: 'Estado de resultados', icon: 'solar:graph-up-linear', url: '/admin/estado-resultados' },
          { id: uniqueId(), name: 'Balance general', icon: 'solar:align-vertical-spacing-linear', url: '/admin/balance-general' },
          { id: uniqueId(), name: 'Cierre de período', icon: 'solar:lock-keyhole-linear', url: '/admin/cierre-periodo' },
        ],
      },
      {
        name: 'Gestión Documental',
        icon: 'solar:folder-with-files-linear',
        id: uniqueId(),
        url: '/admin/gestion-documental',
      },
    ],
  },
  {
    heading: 'Configuración y Seguridad',
    children: [
      {
        name: 'Gestión de Usuarios',
        icon: 'solar:user-block-bold-duotone',
        id: uniqueId(),
        url: '/admin/gestion-usuarios',
      },
      {
        name: 'Ajustes del Sistema',
        icon: 'solar:settings-linear',
        id: uniqueId(),
        url: '/admin/ajustes-sistema',
      },
    ],
  },
];

export default SidebarContent;
