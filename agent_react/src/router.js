import { createBrowserRouter } from 'react-router-dom';
import Home from './Home';
import Board from './Board';
import Chatbot from './Chatbot';
import Guide from './Guide';
import News from './News';

import Board_detail from './Board_detail';
import Board_create from './Board_create';
import Signup_form from './Signup_form';
import Login from './Login';
import Board_update from './Board_update';
import FraudCaseLookup from './FraudCaseLookup';
import FraudStates from "./FraudStates";
import Risk_Analysis from "./Risk_Analysis";
import Chungbuk_news from './Chungbuk_news';
import Property_check from './Property_check';
import Acident_check from './Acident_check';
import Police_check from './Police_check';
import JeonsePreventionGame from './JeonsePreventionGame';
import ContractInspectorGame from './ContractInspectorGame';
import Cb from './Cb';

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
    },
    {
        id:15,
        path: '/property_check',
        element: <Property_check/>
    },
    {
        id:16,
        path: '/acident_check',
        element: <Acident_check/>
    },
    {
        id:17,
        path: '/police_check',
        element: <Police_check/>
    },
    {
        id:18,
        path: '/jprevention_game',
        element: <JeonsePreventionGame/>
    },
    {
        id:19,
        path:'/contract_inspectorgame',
        element: <ContractInspectorGame/>
    },
    {
        id:20,
        path: '/cb',
        element: <Cb/>
    }


]);
export default router;