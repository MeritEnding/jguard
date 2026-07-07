import { createBrowserRouter } from 'react-router-dom';

import Layout from './components/Layout';
import Home from './pages/Home';
import Chatbot from './pages/Chatbot';
import Guide from './pages/Guide';
import Board from './pages/Board';
import BoardDetail from './pages/BoardDetail';
import BoardCreate from './pages/BoardCreate';
import BoardUpdate from './pages/BoardUpdate';
import News from './pages/News';
import ChungbukNews from './pages/ChungbukNews';
import SignupForm from './pages/SignupForm';
import Login from './pages/Login';
import FraudCaseLookup from './pages/FraudCaseLookup';
import FraudStates from './pages/FraudStates';
import RiskAnalysis from './pages/RiskAnalysis';
import RiskMap from './pages/RiskMap';
import RiskCheck from './pages/RiskCheck';
import Games from './pages/Games';
import PreventionGame from './pages/PreventionGame';
import InspectorGame from './pages/InspectorGame';

const router = createBrowserRouter([
    {
        element: <Layout />,
        children: [
            { path: '/', element: <Home /> },
            { path: '/chatbot', element: <Chatbot /> },
            { path: '/guide', element: <Guide /> },
            { path: '/board', element: <Board /> },
            { path: '/board/detail/:id', element: <BoardDetail /> },
            { path: '/board/question/create', element: <BoardCreate /> },
            { path: '/question/modify/:id', element: <BoardUpdate /> },
            { path: '/news', element: <News /> },
            { path: '/chungbuk_news', element: <ChungbukNews /> },
            { path: '/signup', element: <SignupForm /> },
            { path: '/user/login', element: <Login /> },
            { path: '/FraudCaseLookup', element: <FraudCaseLookup /> },
            { path: '/FraudStates', element: <FraudStates /> },
            { path: '/risk_analysis', element: <RiskAnalysis /> },
            { path: '/risk_map', element: <RiskMap /> },
            { path: '/risk_check', element: <RiskCheck /> },
            { path: '/games', element: <Games /> },
            { path: '/games/prevention', element: <PreventionGame /> },
            { path: '/games/inspector', element: <InspectorGame /> },
        ],
    },
]);

export default router;
