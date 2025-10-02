// frontend/src/components/Layout/Layout.js
import React from 'react';
import Header from '../Common/Header';
import Footer from '../Common/Footer';

const Layout = ({ children }) => {
    return (
        <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1">
                {children}
            </main>
            <Footer />
        </div>
    );
};

export default Layout;