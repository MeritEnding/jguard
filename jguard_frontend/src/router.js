import { createBrowserRouter } from 'react-router-dom';
import Home from './Home';
import Board from './Board';
import News from './News';

import Board_detail from './Board_detail';
import Board_create from './Board_create';
import Signup_form from './Signup_form';
import Login from './Login';
import Board_update from './Board_update';
import Chungbuk_news from './Chungbuk_news';
import Guide from './Guide';

const router = createBrowserRouter([
    {
        id: 0,
        path: '/',
        element: <Home />,
    },
    {
        id: 2,
        path: '/guide',
        element: <Guide/>,
    },
    {
        id: 3,
        path: '/board',
        element: <Board/>
    },
    {
        id: 4,
        path: '/news',
        element: <News/>,
    },
    {
        id: 6,
        path: '/board/detail/:id',
        element: <Board_detail/>,
    },
    {
        id:7,
        path: '/board/question/create',
        element: <Board_create/>
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
    },
    {
        id:10,
        path: '/question/modify/:id',
        element: <Board_update/>
    },
    {
        id:14,
        path: '/chungbuk_news',
        element: <Chungbuk_news/>
    }

]);
export default router;
