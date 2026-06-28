import React from 'react';
import { Notification } from '../../services/api';
import { formatDistanceToNow } from 'date-fns';
import { FaInfoCircle, FaCheckCircle, FaExclamationTriangle, FaTimesCircle } from 'react-icons/fa';

interface NotificationItemProps {
    notification: Notification;
    onRead: (id: string) => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({ notification, onRead }) => {
    const getIcon = (type: string) => {
        switch (type) {
            case 'Success': return <FaCheckCircle className="text-green-500" />;
            case 'Warning': return <FaExclamationTriangle className="text-yellow-500" />;
            case 'Error': return <FaTimesCircle className="text-red-500" />;
            default: return <FaInfoCircle className="text-blue-500" />;
        }
    };

    return (
        <div
            className={`p-4 border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer ${!notification.isRead ? 'bg-blue-50 dark:bg-slate-800' : ''}`}
            onClick={() => !notification.isRead && onRead(notification.id)}
        >
            <div className="flex gap-3">
                <div className="mt-1 flex-shrink-0">
                    {getIcon(notification.type)}
                </div>
                <div className="flex-1">
                    <h4 className={`text-sm font-medium ${!notification.isRead ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-400'}`}>
                        {notification.title}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        {notification.message}
                    </p>
                    <span className="text-xs text-slate-400 dark:text-slate-500 mt-2 block">
                        {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                    </span>
                </div>
                {!notification.isRead && (
                    <div className="flex-shrink-0">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default NotificationItem;
