import { createBrowserRouter } from 'react-router-dom';

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

const router = createBrowserRouter([
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
]);

export default router;
