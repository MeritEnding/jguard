import { createBrowserRouter } from 'react-router-dom';
import Home from './Home';
import Board from './Board';
import Chatbot from './Chatbot';
import Guide from './Guide';
import News from './News';
import MyPage from './MyPage'


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
    }

]);
export default router;