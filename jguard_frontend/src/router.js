import { createBrowserRouter } from 'react-router-dom';
import Home from './Home';

const router = createBrowserRouter([
    {
        id: 0,
        path: '/',
        element: <Home />,
    }

]);
export default router;
