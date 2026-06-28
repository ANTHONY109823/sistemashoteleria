import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

const Layout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    const closeSidebar = () => {
        setIsSidebarOpen(false);
    };

    return (
        <div className="bg-[#e2e8f0] min-h-screen font-sans flex text-slate-800">
            <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />

            <div className="flex-1 flex flex-col lg:ml-64 min-h-screen w-full relative">
                <Navbar onMenuClick={toggleSidebar} />

                {/* Overlay for mobile */}
                {isSidebarOpen && (
                    <div
                        className="fixed inset-0 bg-black/50 z-30 lg:hidden"
                        onClick={closeSidebar}
                    />
                )}

                {/* Main content */}
                <main className="flex-1 p-4 sm:p-6 lg:p-8 w-full block">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default Layout;
