import { createBrowserRouter } from 'react-router-dom';
import Home from './Home';
import Board from './Board';
import Chatbot from './Chatbot';
import Guide from './Guide';
import News from './News';
import MyPage from './MyPage';
import Board_detail from './Board_detail';
import Board_create from './Board_create';
import Signup_form from './Signup_form';
import Login from './Login';
import Board_update from './Board_update';
import Search from './Search';

const router = createBrowserRouter([
    {
        id: 0,
        path: '/',
        element: <Home />,
    },
    {
        id: 1,
        path: '/chatbot',
        element: <Chatbot/>,
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
        id: 5,
        path: '/mypage',
        element: <MyPage/>
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
        path: '/user/signup',
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
        id:11,
        path: '/search',
        element: <Search/>
    }


]);
export default router;