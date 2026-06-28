import toast from 'react-hot-toast';
import { FaCheckCircle, FaExclamationCircle, FaInfoCircle, FaTimesCircle } from 'react-icons/fa';

// Custom toast configurations with modern styles and icons

export const showSuccessToast = (message: string) => {
    toast.success(message, {
        duration: 4000,
        position: 'top-right',
        style: {
            background: '#10b981',
            color: '#fff',
            padding: '16px',
            borderRadius: '12px',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
            fontWeight: '500',
        },
        icon: <FaCheckCircle size={20} />,
    });
};

export const showErrorToast = (message: string) => {
    toast.error(message, {
        duration: 5000,
        position: 'top-right',
        style: {
            background: '#ef4444',
            color: '#fff',
            padding: '16px',
            borderRadius: '12px',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
            fontWeight: '500',
        },
        icon: <FaTimesCircle size={20} />,
    });
};

export const showInfoToast = (message: string) => {
    toast(message, {
        duration: 4000,
        position: 'top-right',
        style: {
            background: '#3b82f6',
            color: '#fff',
            padding: '16px',
            borderRadius: '12px',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
            fontWeight: '500',
        },
        icon: <FaInfoCircle size={20} />,
    });
};

export const showWarningToast = (message: string) => {
    toast(message, {
        duration: 4500,
        position: 'top-right',
        style: {
            background: '#f59e0b',
            color: '#fff',
            padding: '16px',
            borderRadius: '12px',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
            fontWeight: '500',
        },
        icon: <FaExclamationCircle size={20} />,
    });
};

export const showLoadingToast = (message: string) => {
    return toast.loading(message, {
        position: 'top-right',
        style: {
            background: '#64748b',
            color: '#fff',
            padding: '16px',
            borderRadius: '12px',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
            fontWeight: '500',
        },
    });
};
