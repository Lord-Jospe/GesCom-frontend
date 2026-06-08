// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { Children, lazy } from 'react';
import { Navigate, createBrowserRouter } from 'react-router';
import Loadable from '../layouts/full/shared/loadable/Loadable';
import PublicRoute from '../components/shared/PublicRoute';

import PrivateRoute from '../components/shared/PrivateRoute';
import Contadordash from '../views/dashboards/contador';
import Operadordash from '../views/dashboards/operador';
import OperadorLayout from '../layouts/full/OperadorLayout';
import ContadorLayout from '../layouts/full/ContadorLayout';
import HomePage from 'src/views/pages/HomePage';
import EmpleadoPage from 'src/views/pages/admin/empleados/EmpleadosPage';


//const RoleRedirect = Loadable(lazy(() => import('../routes/RoleRedirect')));


/* ***Layouts**** */
const AdminLayout = Loadable(lazy(() => import('../layouts/full/AdminLayout')));
const BlankLayout = Loadable(lazy(() => import('../layouts/blank/BlankLayout')));

// authentication

const Login = Loadable(lazy(() => import('../views/authentication/auth2/Login')));
const Register = Loadable(lazy(() => import('../views/authentication/auth2/Register')));
const Maintainance = Loadable(lazy(() => import('../views/authentication/Maintainance')));
const ForgotPassword = Loadable(lazy(() => import('../views/authentication/auth2/ForgotPassword')));
const ResetPassword = Loadable(lazy(() => import('../views/authentication/auth2/ResetPassword')));

// Dashboards
const Admindash = Loadable(lazy(() => import('../views/dashboards/admin')));

//pages
const UserProfile = Loadable(lazy(() => import('../views/pages/user-profile/UserProfile')));

// Organización
const MiEmpresaPage = Loadable(lazy(() => import('../views/pages/admin/organizacion/MiEmpresaPage')));
const ClientesPage = Loadable(lazy(() => import('../views/pages/admin/organizacion/ClientesPage')));
const ProveedoresPage = Loadable(lazy(() => import('../views/pages/admin/organizacion/ProveedoresPage')));

// Facturación y cobranza
const HistorialTransaccionesPage = Loadable(lazy(() => import('../views/pages/admin/facturacion/HistorialTransaccionesPage')));
const RegistrarVentaPage = Loadable(lazy(() => import('../views/pages/admin/facturacion/RegistrarVentaPage')));
const RegistrarGastoPage = Loadable(lazy(() => import('../views/pages/admin/facturacion/RegistrarGastoPage')));
const PorCobrarPage = Loadable(lazy(() => import('../views/pages/admin/facturacion/PorCobrarPage')));
const PorPagarPage = Loadable(lazy(() => import('../views/pages/admin/facturacion/PorPagarPage')));

// Inventario
const InventarioPage = Loadable(lazy(() => import('../views/pages/admin/inventario/InventarioPage')));
const MovimientosInventarioPage = Loadable(lazy(() => import('../views/pages/admin/inventario/MovimientosInventarioPage')));
const AlertasInventarioPage = Loadable(lazy(() => import('../views/pages/admin/inventario/AlertasInventarioPage')));

// Módulo Contable
const AsientosContablesPage = Loadable(lazy(() => import('../views/pages/admin/contable/AsientosContablesPage')));
const ReportesFinancierosPage = Loadable(lazy(() => import('../views/pages/admin/contable/ReportesFinancierosPage')));
const GestionDocumentalPage = Loadable(lazy(() => import('../views/pages/admin/contable/GestionDocumentalPage')));

// Nómina
const NominaPage = Loadable(lazy(() => import('../views/pages/admin/organizacion/NominaPage')));
const PlanesPage = Loadable(lazy(() => import('../views/pages/admin/organizacion/PlanesPage')));

// Configuración
const GestionUsuariosPage = Loadable(lazy(() => import('../views/pages/admin/configuracion/GestionUsuariosPage')));
const AjustesSistemaPage = Loadable(lazy(() => import('../views/pages/admin/configuracion/AjustesSistemaPage')));

/* ****Apps***** */
//const Form = Loadable(lazy(() => import('../views/utilities/form/Form')));

const Error = Loadable(lazy(() => import('../views/authentication/Error')));

// // icons
//const SolarIcon = Loadable(lazy(() => import('../views/icons/SolarIcon')));

//const SamplePage = lazy(() => import('../views/sample-page/SamplePage'));

const Router = [
  // Redirigir la ruta raíz a login
  {
    path: '/',
    element: <HomePage />,
  },

  // Blank Layout for Authentication
  {
    path: '/',
    element: <BlankLayout />,
    children: [
      { path: 'login', element: (
                                <PublicRoute>
                                  <Login />
                                </PublicRoute>
                              )},
      { path: 'register', element: <Register /> },
      { path: 'forgot-password', element: <ForgotPassword /> },
      { path: 'reset-password', element: <ResetPassword /> },
      { path: 'maintenance', element: <Maintainance /> },
      { path: '404', element: <Error /> },
      { path: '*', element: <Navigate to="/404" /> },
    ],
  },
  
  /*ADMIN*/
  {
    path: '/admin',
    element:  (
      <PrivateRoute allowedRoles={['ADMIN']}>
        <AdminLayout />
      </PrivateRoute>
    ),
    children: [
      { index: true, element: <Admindash /> },
      { path: 'user-profile', element: <UserProfile /> },
      // Organización
      { path: 'mi-empresa', element: <MiEmpresaPage /> },
      { path: 'planes', element: <PlanesPage /> },
      { path: 'Empleados', element: <EmpleadoPage /> },
      { path: 'nomina', element: <NominaPage /> },
      { path: 'clientes', element: <ClientesPage /> },
      { path: 'proveedores', element: <ProveedoresPage /> },
      // Facturación y cobranza
      { path: 'caja-facturacion', element: <HistorialTransaccionesPage /> },
      { path: 'caja-facturacion/venta', element: <RegistrarVentaPage /> },
      { path: 'caja-facturacion/gasto', element: <RegistrarGastoPage /> },
      { path: 'por-cobrar', element: <PorCobrarPage /> },
      { path: 'por-pagar', element: <PorPagarPage /> },
      // Inventario
      { path: 'inventario', element: <InventarioPage /> },
      { path: 'inventario/movimientos', element: <MovimientosInventarioPage /> },
      { path: 'inventario/alertas', element: <AlertasInventarioPage /> },
      // Módulo Contable
      { path: 'asientos-contables', element: <AsientosContablesPage /> },
      { path: 'reportes-financieros', element: <ReportesFinancierosPage /> },
      { path: 'gestion-documental', element: <GestionDocumentalPage /> },
      // Configuración
      { path: 'gestion-usuarios', element: <GestionUsuariosPage /> },
      { path: 'ajustes-sistema', element: <AjustesSistemaPage /> },
    ]
  },
  /*Contador*/
  {
    path: '/contador',
    element: (
      <PrivateRoute allowedRoles={['CONTADOR']}>
        <ContadorLayout />
      </PrivateRoute>
    ),
    children: [
      { index: true, element: <Contadordash /> },
      { path: 'user-profile', element: <UserProfile /> },
      // Facturación y cobranza
      { path: 'caja-facturacion', element: <HistorialTransaccionesPage /> },
      { path: 'caja-facturacion/venta', element: <RegistrarVentaPage /> },
      { path: 'caja-facturacion/gasto', element: <RegistrarGastoPage /> },
      { path: 'por-cobrar', element: <PorCobrarPage /> },
      { path: 'por-pagar', element: <PorPagarPage /> },
      // Nómina
      { path: 'nomina', element: <NominaPage /> },
      // Inventario
      { path: 'inventario', element: <InventarioPage /> },
      { path: 'inventario/movimientos', element: <MovimientosInventarioPage /> },
      { path: 'inventario/alertas', element: <AlertasInventarioPage /> },
      // Nómina
      { path: 'nomina', element: <NominaPage /> },
      // Módulo Contable
      { path: 'asientos-contables', element: <AsientosContablesPage /> },
      { path: 'reportes-financieros', element: <ReportesFinancierosPage /> },
      { path: 'gestion-documental', element: <GestionDocumentalPage /> },
    ]
  },

  /*Operador*/
    {
    path: '/operador',
    element: (
      <PrivateRoute allowedRoles={['OPERADOR']}>
        <OperadorLayout />
      </PrivateRoute>
    ),
    children: [
      { index: true, element: <Operadordash /> },
      { path: 'user-profile', element: <UserProfile /> },
      // Caja y Facturación
      { path: 'caja-facturacion', element: <HistorialTransaccionesPage /> },
      { path: 'caja-facturacion/venta', element: <RegistrarVentaPage /> },
      { path: 'caja-facturacion/gasto', element: <RegistrarGastoPage /> },
      { path: 'por-cobrar', element: <PorCobrarPage /> },
      { path: 'por-pagar', element: <PorPagarPage /> },
      // Inventario
      { path: 'inventario', element: <InventarioPage /> },
      { path: 'inventario/movimientos', element: <MovimientosInventarioPage /> },
      { path: 'inventario/alertas', element: <AlertasInventarioPage /> },
    ]
  },
];

const router = createBrowserRouter(Router);

export default router;
