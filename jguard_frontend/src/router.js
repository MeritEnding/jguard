import { createBrowserRouter } from 'react-router-dom';
import Home from './Home';

import Signup_form from './Signup_form';

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
    }

]);
export default router;
