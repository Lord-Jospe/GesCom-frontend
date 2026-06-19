import { uniqueId } from 'lodash';
import type { MenuItem } from './adminSidebaritems';

const ContadorSidebarContent: MenuItem[] = [
  {
    heading: 'Facturación y Cobranza',
    children: [
      {
        name: 'Caja y Facturación',
        icon: 'solar:calculator-linear',
        id: uniqueId(),
        children: [
          { id: uniqueId(), name: 'Historial', icon: 'solar:list-check-linear', url: '/contador/caja-facturacion' },
          { id: uniqueId(), name: 'Registrar venta', icon: 'solar:cart-plus-linear', url: '/contador/caja-facturacion/venta' },
          { id: uniqueId(), name: 'Registrar gasto', icon: 'solar:arrow-down-linear', url: '/contador/caja-facturacion/gasto' },
        ],
      },
      {
        name: 'Cuentas por Cobrar',
        icon: 'solar:hand-money-linear',
        id: uniqueId(),
        url: '/contador/por-cobrar',
      },
      {
        name: 'Cuentas por Pagar',
        icon: 'solar:wallet-money-linear',
        id: uniqueId(),
        url: '/contador/por-pagar',
      },
    ],
  },
  {
    heading: 'Inventario',
    children: [
        { 
          id: uniqueId(), 
          name: 'Productos y stock', 
          icon: 'solar:box-linear', 
          url: '/contador/inventario' 
        },
        { 
          id: uniqueId(), 
          name: 'Movimientos', 
          icon: 'solar:transfer-horizontal-linear', 
          url: '/contador/inventario/movimientos' },
        { 
          id: uniqueId(), 
          name: 'Alertas', 
          icon: 'solar:danger-triangle-linear', 
          url: '/contador/inventario/alertas' 
        },
    ],
  },
  {
    heading: 'Nómina',
    children: [
    
          { id: uniqueId(), name: 'Calcular nómina', icon: 'solar:calculator-linear', url: '/contador/nomina' },
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
          { id: uniqueId(), name: 'Plan de cuentas', icon: 'solar:documents-linear', url: '/contador/plan-cuentas' },
          { id: uniqueId(), name: 'Libro diario', icon: 'solar:book-2-linear', url: '/contador/libro-diario' },
          { id: uniqueId(), name: 'Libro mayor', icon: 'solar:book-bookmark-linear', url: '/contador/libro-mayor' },
        ],
      },
      {
        name: 'Reportes Financieros',
        icon: 'solar:chart-2-bold',
        id: uniqueId(),
        children: [
          { id: uniqueId(), name: 'Estado de resultados', icon: 'solar:graph-up-linear', url: '/contador/estado-resultados' },
          { id: uniqueId(), name: 'Balance general', icon: 'solar:align-vertical-spacing-linear', url: '/contador/balance-general' },
          { id: uniqueId(), name: 'Conciliación bancaria', icon: 'solar:card-transfer-linear', url: '/contador/conciliacion-bancaria' },
        ],
      },
      {
        name: 'Gestión Documental',
        icon: 'solar:folder-with-files-linear',
        id: uniqueId(),
        url: '/contador/gestion-documental',
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
        url: '/contador/user-profile',
      },
    ],
  },
];

export default ContadorSidebarContent;
