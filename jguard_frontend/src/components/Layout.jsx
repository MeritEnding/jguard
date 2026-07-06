import React, { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';

// 모든 페이지에 공통으로 적용되는 레이아웃 (헤더 + 본문 + 푸터)
const Layout = () => {
    const { pathname } = useLocation();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [pathname]);

    return (
        <>
            <Header />
            <main className="app-main">
                <Outlet />
            </main>
            <Footer />
        </>
    );
};

export default Layout;
