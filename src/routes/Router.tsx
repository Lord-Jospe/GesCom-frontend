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

/* ****Apps***** */
const Form = Loadable(lazy(() => import('../views/utilities/form/Form')));
const Table = Loadable(lazy(() => import('../views/utilities/table/Table')));

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
      { path: 'Empleados', element: <EmpleadoPage /> }
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
    ]
  },
];

const router = createBrowserRouter(Router);

export default router;
