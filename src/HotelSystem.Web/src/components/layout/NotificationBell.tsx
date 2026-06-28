import { Fragment } from 'react';
import { Popover, Transition } from '@headlessui/react';
import { FaBell, FaCheckDouble } from 'react-icons/fa';
import { useNotifications } from '../../context/NotificationContext';
import NotificationItem from '../notifications/NotificationItem';
import { useTranslation } from 'react-i18next';

const NotificationBell = () => {
    const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
    const { t } = useTranslation();

    return (
        <Popover className="relative">
            {({ open }) => (
                <>
                    <Popover.Button className={`relative p-2 rounded-full transition-colors outline-none ${open ? 'bg-slate-100 text-blue-600 dark:bg-slate-700 dark:text-blue-400' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}`}>
                        <FaBell className="text-xl" />
                        {unreadCount > 0 && (
                            <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 transform translate-x-1/4 -translate-y-1/4 bg-red-600 rounded-full ring-2 ring-white dark:ring-slate-800">
                                {unreadCount > 9 ? '9+' : unreadCount}
                            </span>
                        )}
                    </Popover.Button>
                    <Transition
                        as={Fragment}
                        enter="transition ease-out duration-200"
                        enterFrom="opacity-0 translate-y-1"
                        enterTo="opacity-100 translate-y-0"
                        leave="transition ease-in duration-150"
                        leaveFrom="opacity-100 translate-y-0"
                        leaveTo="opacity-0 translate-y-1"
                    >
                        <Popover.Panel className="absolute right-0 z-50 mt-2 w-80 sm:w-96 origin-top-right bg-white dark:bg-slate-800 rounded-xl shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                            <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
                                <h3 className="font-semibold text-slate-800 dark:text-white">
                                    {t('notifications.title', 'Notifications')}
                                </h3>
                                {unreadCount > 0 && (
                                    <button
                                        onClick={() => markAllAsRead()}
                                        className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 flex items-center gap-1"
                                    >
                                        <FaCheckDouble />
                                        {t('notifications.markAllRead', 'Mark all read')}
                                    </button>
                                )}
                            </div>
                            <div className="max-h-[400px] overflow-y-auto">
                                {notifications.length > 0 ? (
                                    notifications.map(notification => (
                                        <NotificationItem
                                            key={notification.id}
                                            notification={notification}
                                            onRead={markAsRead}
                                        />
                                    ))
                                ) : (
                                    <div className="p-8 text-center text-slate-500 dark:text-slate-400">
                                        <p>{t('notifications.empty', 'No notifications')}</p>
                                    </div>
                                )}
                            </div>
                        </Popover.Panel>
                    </Transition>
                </>
            )}
        </Popover>
    );
};

export default NotificationBell;
