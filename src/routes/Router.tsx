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


const RoleRedirect = Loadable(lazy(() => import('../routes/RoleRedirect')));


/* ***Layouts**** */
const AdminLayout = Loadable(lazy(() => import('../layouts/full/AdminLayout')));
const BlankLayout = Loadable(lazy(() => import('../layouts/blank/BlankLayout')));

// authentication

const Login = Loadable(lazy(() => import('../views/authentication/auth2/Login')));
const Register = Loadable(lazy(() => import('../views/authentication/auth2/Register')));
const Maintainance = Loadable(lazy(() => import('../views/authentication/Maintainance')));

// Dashboards
const Admindash = Loadable(lazy(() => import('../views/dashboards/admin')));

//pages
const UserProfile = Loadable(lazy(() => import('../views/pages/user-profile/UserProfile')));

// Facturación y cobranza
const CajaFacturacionPage = Loadable(lazy(() => import('../views/pages/admin/facturacion/CajaFacturacionPage')));
const GestionPagosPage = Loadable(lazy(() => import('../views/pages/admin/facturacion/GestionPagosPage')));
const HistorialTransaccionesPage = Loadable(lazy(() => import('../views/pages/admin/facturacion/HistorialTransaccionesPage')));
const DescuentosBecasPage = Loadable(lazy(() => import('../views/pages/admin/facturacion/DescuentosBecasPage')));
const AlertasNotificacionesPage = Loadable(lazy(() => import('../views/pages/admin/facturacion/AlertasNotificacionesPage')));

// Módulo Contable
const AsientosContablesPage = Loadable(lazy(() => import('../views/pages/admin/contable/AsientosContablesPage')));
const GestionEgresosPage = Loadable(lazy(() => import('../views/pages/admin/contable/GestionEgresosPage')));
const ReportesFinancierosPage = Loadable(lazy(() => import('../views/pages/admin/contable/ReportesFinancierosPage')));
const CentroExportacionPage = Loadable(lazy(() => import('../views/pages/admin/contable/CentroExportacionPage')));

/* ****Apps***** */
const Form = Loadable(lazy(() => import('../views/utilities/form/Form')));

const Error = Loadable(lazy(() => import('../views/authentication/Error')));

// // icons
const SolarIcon = Loadable(lazy(() => import('../views/icons/SolarIcon')));

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
      { path: 'Empleados', element: <EmpleadoPage /> },
      { path: 'user-profile', element: <UserProfile /> },
      // Facturación y cobranza
      { path: 'caja-facturacion', element: <CajaFacturacionPage /> },
      { path: 'gestion-pagos', element: <GestionPagosPage /> },
      { path: 'historial-transacciones', element: <HistorialTransaccionesPage /> },
      { path: 'descuentos-becas', element: <DescuentosBecasPage /> },
      { path: 'alertas', element: <AlertasNotificacionesPage /> },
      // Módulo Contable
      { path: 'asientos-contables', element: <AsientosContablesPage /> },
      { path: 'gestion-egresos', element: <GestionEgresosPage /> },
      { path: 'reportes-financieros', element: <ReportesFinancierosPage /> },
      { path: 'centro-exportacion', element: <CentroExportacionPage /> },
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
      {index: true, element: <Contadordash /> },
      {path: 'user-profile', element: <UserProfile /> },
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
      {index: true, element: <Operadordash /> },
      { path: 'user-profile', element: <UserProfile /> },
    ]
  },
];

const router = createBrowserRouter(Router);

export default router;
