import { uniqueId } from 'lodash';
import type { MenuItem } from './adminSidebaritems';

const OperadorSidebarContent: MenuItem[] = [
  {
    heading: 'Caja y Facturación',
    children: [
      {
        name: 'Caja',
        icon: 'solar:calculator-linear',
        id: uniqueId(),
        children: [
          { id: uniqueId(), name: 'Historial', icon: 'solar:list-check-linear', url: '/operador/caja-facturacion' },
          { id: uniqueId(), name: 'Registrar venta', icon: 'solar:cart-plus-linear', url: '/operador/caja-facturacion/venta' },
          { id: uniqueId(), name: 'Registrar gasto', icon: 'solar:arrow-down-linear', url: '/operador/caja-facturacion/gasto' },
        ],
      },
      {
        name: 'Cuentas por Cobrar',
        icon: 'solar:hand-money-linear',
        id: uniqueId(),
        url: '/operador/por-cobrar',
      },
      {
        name: 'Cuentas por Pagar',
        icon: 'solar:wallet-money-linear',
        id: uniqueId(),
        url: '/operador/por-pagar',
      },
    ],
  },
  {
    heading: 'Inventario',
    children: [
      {
        name: 'Inventario',
        icon: 'solar:box-linear',
        id: uniqueId(),
        children: [
          { id: uniqueId(), name: 'Productos y stock', icon: 'solar:box-linear', url: '/operador/inventario' },
          { id: uniqueId(), name: 'Movimientos', icon: 'solar:transfer-horizontal-linear', url: '/operador/inventario/movimientos' },
          { id: uniqueId(), name: 'Alertas', icon: 'solar:danger-triangle-linear', url: '/operador/inventario/alertas' },
        ],
      },
    ],
  },
  {
    heading: 'Cuenta',
    children: [
      {
        name: 'Mi Perfil',
        icon: 'solar:user-circle-linear',
        id: uniqueId(),
        url: '/operador/user-profile',
      },
    ],
  },
];

export default OperadorSidebarContent;
