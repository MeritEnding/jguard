import { createBrowserRouter } from 'react-router-dom';
import Home from './pages/Home';
import Board from './pages/Board';
import News from './pages/News';

import Board_detail from './pages/Board_detail';
import Board_create from './pages/Board_create';
import Signup_form from './pages/Signup_form';
import Login from './pages/Login';
import Board_update from './pages/Board_update';
import Chungbuk_news from './pages/Chungbuk_news';
import Guide from './pages/Guide';
import FraudCaseLookup from './pages/FraudCaseLookup';
import FraudStates from "./pages/FraudStates";
import Risk_Analysis from "./pages/Risk_Analysis";
import Chatbot from './pages/Chatbot';

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
        id:11,
        path: '/FraudCaseLookup',
        element: <FraudCaseLookup/>
    },
    {
        id:12,
        path: '/FraudStates',
        element: <FraudStates/>
    },
    {
        id:13,
        path: '/risk_analysis',
        element: <Risk_Analysis/>
    },
    {
        id:14,
        path: '/chungbuk_news',
        element: <Chungbuk_news/>
    }

]);
export default router;
