import { createBrowserRouter } from 'react-router-dom';
import Home from './Home';

import Signup_form from './Signup_form';
import Login from './Login';

const router = createBrowserRouter([
    {
        id: 0,
        path: '/',
        element: <Home />,
    },
    {
        id:8,
        path: '/signup',
        element: <Signup_form/>
    },
    {
        id:9,
        path: '/user/login',
        element: <Login/>
    }

]);
export default router;
