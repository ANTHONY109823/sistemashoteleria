import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import NProgress from 'nprogress';
import 'nprogress/nprogress.css';

// Configure nprogress
NProgress.configure({
    showSpinner: false,
    trickleSpeed: 200,
    minimum: 0.1,
    easing: 'ease',
    speed: 300
});

const LoadingBar = () => {
    const location = useLocation();

    useEffect(() => {
        NProgress.start();
        const timer = setTimeout(() => {
            NProgress.done();
        }, 200);

        return () => {
            clearTimeout(timer);
            NProgress.done();
        };
    }, [location.pathname]);

    return null;
};

export default LoadingBar;
