import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { lazy, Suspense } from 'react';
import { queryClient } from './lib/queryClient';
import Layout from './components/layout/Layout';
import PrivateRoute from './components/layout/PrivateRoute';
import PageTransition from './components/common/PageTransition';
import LoadingBar from './components/common/LoadingBar';
import GlobalSearch from './components/common/GlobalSearch';
import SkeletonTable from './components/common/SkeletonTable';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from './contexts/ThemeContext';
import { NotificationProvider } from './context/NotificationContext';

// Lazy load page components for code splitting
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Rooms = lazy(() => import('./pages/Rooms'));
const Reservations = lazy(() => import('./pages/Reservations'));
const FrontDesk = lazy(() => import('./pages/FrontDesk'));
const RoomTypes = lazy(() => import('./pages/RoomTypes'));
const Guests = lazy(() => import('./pages/Guests'));
const Housekeeping = lazy(() => import('./pages/Housekeeping'));
const Settings = lazy(() => import('./pages/Settings'));
const Users = lazy(() => import('./pages/Users'));
const Profile = lazy(() => import('./pages/Profile'));
const AuditLogs = lazy(() => import('./pages/AuditLogs'));
const Reports = lazy(() => import('./pages/Reports'));
const Invoices = lazy(() => import('./pages/Invoices'));
const Maintenance = lazy(() => import('./pages/Maintenance'));
const Login = lazy(() => import('./pages/Login'));

// Loading fallback component
const PageLoader = () => (
    <div className="p-6">
        <SkeletonTable rows={8} />
    </div>
);

// Wrapper component to use useLocation hook
function AnimatedRoutes() {
    const location = useLocation();

    return (
        <>
            <LoadingBar />
            <AnimatePresence mode="wait">
                <Routes location={location} key={location.pathname}>
                    <Route path="/login" element={
                        <PageTransition>
                            <Suspense fallback={<PageLoader />}>
                                <Login />
                            </Suspense>
                        </PageTransition>
                    } />

                    <Route element={<PrivateRoute />}>
                        <Route path="/" element={<Layout />}>
                            <Route index element={
                                <PageTransition>
                                    <Suspense fallback={<PageLoader />}>
                                        <Dashboard />
                                    </Suspense>
                                </PageTransition>
                            } />
                            <Route path="rooms" element={
                                <PageTransition>
                                    <Suspense fallback={<PageLoader />}>
                                        <Rooms />
                                    </Suspense>
                                </PageTransition>
                            } />
                            <Route path="reservations" element={
                                <PageTransition>
                                    <Suspense fallback={<PageLoader />}>
                                        <Reservations />
                                    </Suspense>
                                </PageTransition>
                            } />
                            <Route path="front-desk" element={
                                <PageTransition>
                                    <Suspense fallback={<PageLoader />}>
                                        <FrontDesk />
                                    </Suspense>
                                </PageTransition>
                            } />
                            <Route path="room-types" element={
                                <PageTransition>
                                    <Suspense fallback={<PageLoader />}>
                                        <RoomTypes />
                                    </Suspense>
                                </PageTransition>
                            } />
                            <Route path="guests" element={
                                <PageTransition>
                                    <Suspense fallback={<PageLoader />}>
                                        <Guests />
                                    </Suspense>
                                </PageTransition>
                            } />
                            <Route path="housekeeping" element={
                                <PageTransition>
                                    <Suspense fallback={<PageLoader />}>
                                        <Housekeeping />
                                    </Suspense>
                                </PageTransition>
                            } />
                            <Route path="profile" element={
                                <PageTransition>
                                    <Suspense fallback={<PageLoader />}>
                                        <Profile />
                                    </Suspense>
                                </PageTransition>
                            } />
                            <Route path="invoices" element={
                                <PageTransition>
                                    <Suspense fallback={<PageLoader />}>
                                        <Invoices />
                                    </Suspense>
                                </PageTransition>
                            } />
                            <Route path="reports" element={
                                <PageTransition>
                                    <Suspense fallback={<PageLoader />}>
                                        <Reports />
                                    </Suspense>
                                </PageTransition>
                            } />

                            {/* Admin Only Routes */}
                            <Route element={<PrivateRoute roles={['Admin']} />}>
                                <Route path="settings" element={
                                    <PageTransition>
                                        <Suspense fallback={<PageLoader />}>
                                            <Settings />
                                        </Suspense>
                                    </PageTransition>
                                } />
                                <Route path="users" element={
                                    <PageTransition>
                                        <Suspense fallback={<PageLoader />}>
                                            <Users />
                                        </Suspense>
                                    </PageTransition>
                                } />
                                <Route path="audit-logs" element={
                                    <PageTransition>
                                        <Suspense fallback={<PageLoader />}>
                                            <AuditLogs />
                                        </Suspense>
                                    </PageTransition>
                                } />
                                <Route path="maintenance" element={
                                    <PageTransition>
                                        <Suspense fallback={<PageLoader />}>
                                            <Maintenance />
                                        </Suspense>
                                    </PageTransition>
                                } />
                            </Route>
                        </Route>
                    </Route>

                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </AnimatePresence>
        </>
    );
}

function App() {
    return (
        <ThemeProvider>
            <QueryClientProvider client={queryClient}>
                <NotificationProvider>
                    <BrowserRouter>
                        <Toaster position="top-right" />
                        <GlobalSearch />
                        <AnimatedRoutes />
                    </BrowserRouter>
                </NotificationProvider>
                {/* React Query Devtools - only visible in development */}
                <ReactQueryDevtools initialIsOpen={false} />
            </QueryClientProvider>
        </ThemeProvider>
    );
}

export default App;
