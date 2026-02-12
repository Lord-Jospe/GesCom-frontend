// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { Children, lazy } from 'react';
import { Navigate, createBrowserRouter } from 'react-router';
import Loadable from '../layouts/full/shared/loadable/Loadable';
import PublicRoute from '../components/shared/PublicRoute';

import PrivateRoute from '../components/shared/PrivateRoute';

const RoleRedirect = Loadable(lazy(() => import('../routes/RoleRedirect')));


/* ***Layouts**** */
const AdminLayout = Loadable(lazy(() => import('../layouts/full/AdminLayout')));
const BlankLayout = Loadable(lazy(() => import('../layouts/blank/BlankLayout')));
const StudentLayout = Loadable(lazy(() => import('../layouts/full/StudentLayout')));

// authentication

const Login2 = Loadable(lazy(() => import('../views/authentication/auth2/Login')));
const Register2 = Loadable(lazy(() => import('../views/authentication/auth2/Register')));
const Maintainance = Loadable(lazy(() => import('../views/authentication/Maintainance')));

// Dashboards
const Admindash = Loadable(lazy(() => import('../views/dashboards/admin')));
const Studentdash = Loadable(lazy(() => import('../views/dashboards/student')));

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
    element: <RoleRedirect />,
  },

  // Blank Layout for Authentication
  {
    path: '/',
    element: <BlankLayout />,
    children: [
      { path: 'login', element: (
                                <PublicRoute>
                                  <Login2 />
                                </PublicRoute>
                              )},
      { path: 'register', element: <Register2 /> },
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
    ]
  },
  /*Student routes*/
  {
    path: '/student',
    element: (
      <PrivateRoute allowedRoles={['ESTUDIANTE']}>
        <StudentLayout />
      </PrivateRoute>
    ),
    children: [
      {index: true, element: <Studentdash /> },
    ]
  },

  /*Docente*/
    {
    path: '/teacher',
    element: (
      <PrivateRoute allowedRoles={['DOCENTE']}>
        <TeacherLayaout />
      </PrivateRoute>
    ),
    children: [
      {index: true, element: <Teacherdash /> },
    ]
  },
];

const router = createBrowserRouter(Router);

export default router;
