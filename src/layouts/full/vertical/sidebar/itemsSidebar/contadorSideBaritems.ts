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
          { id: uniqueId(), name: 'Registrar venta', icon: 'solar:cart-plus-linear', url: '/contador/caja-facturacion' },
          { id: uniqueId(), name: 'Registrar gasto', icon: 'solar:arrow-down-linear', url: '/contador/caja-facturacion' },
          { id: uniqueId(), name: 'Historial', icon: 'solar:list-check-linear', url: '/contador/caja-facturacion' },
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
        name: 'Inventario',
        icon: 'solar:box-linear',
        id: uniqueId(),
        children: [
          { id: uniqueId(), name: 'Productos y stock', icon: 'solar:box-linear', url: '/contador/inventario' },
          { id: uniqueId(), name: 'Movimientos', icon: 'solar:transfer-horizontal-linear', url: '/contador/inventario/movimientos' },
          { id: uniqueId(), name: 'Alertas', icon: 'solar:danger-triangle-linear', url: '/contador/inventario/alertas' },
        ],
      },
    ],
  },
  {
    heading: 'Nómina',
    children: [
      {
        name: 'Nómina',
        icon: 'solar:card-transfer-linear',
        id: uniqueId(),
        children: [
          { id: uniqueId(), name: 'Calcular nómina', icon: 'solar:calculator-linear', url: '/contador/nomina' },
          { id: uniqueId(), name: 'Historial', icon: 'solar:list-check-linear', url: '/contador/nomina' },
        ],
      },
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
          { id: uniqueId(), name: 'Plan de cuentas', icon: 'solar:documents-linear', url: '/contador/asientos-contables' },
          { id: uniqueId(), name: 'Libro diario', icon: 'solar:book-open-linear', url: '/contador/asientos-contables' },
          { id: uniqueId(), name: 'Libro mayor', icon: 'solar:book-bookmark-linear', url: '/contador/asientos-contables' },
        ],
      },
      {
        name: 'Reportes Financieros',
        icon: 'solar:chart-2-bold',
        id: uniqueId(),
        children: [
          { id: uniqueId(), name: 'Estado de resultados', icon: 'solar:graph-up-linear', url: '/contador/reportes-financieros' },
          { id: uniqueId(), name: 'Balance general', icon: 'solar:align-vertical-spacing-linear', url: '/contador/reportes-financieros' },
          { id: uniqueId(), name: 'Conciliación bancaria', icon: 'solar:bank-linear', url: '/contador/reportes-financieros' },
        ],
      },
      {
        name: 'Gestión Documental',
        icon: 'solar:folder-with-files-linear',
        id: uniqueId(),
        children: [
          { id: uniqueId(), name: 'Bóveda de documentos', icon: 'solar:folder-open-linear', url: '/contador/gestion-documental' },
          { id: uniqueId(), name: 'Exportar facturas', icon: 'solar:export-linear', url: '/contador/gestion-documental' },
          { id: uniqueId(), name: 'Revisar facturas', icon: 'solar:document-search-linear', url: '/contador/gestion-documental' },
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
        url: '/contador/user-profile',
      },
    ],
  },
];

export default ContadorSidebarContent;
