import { useState, useEffect } from 'react';
import { FaHistory, FaSearch, FaFilter } from 'react-icons/fa';
import { auditService, AuditLog } from '../services/api';
import toast from 'react-hot-toast';

const AuditLogs = () => {
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterAction, setFilterAction] = useState('All');

    useEffect(() => {
        loadLogs();
    }, []);

    const loadLogs = async () => {
        try {
            const data = await auditService.getAll(200);
            setLogs(data);
        } catch (error: any) {
            toast.error('Failed to load audit logs');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const filteredLogs = logs.filter(log => {
        const matchesSearch = log.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
            log.entityType.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter = filterAction === 'All' || log.action === filterAction;
        return matchesSearch && matchesFilter;
    });

    const uniqueActions = Array.from(new Set(logs.map(log => log.action)));

        const getActionBadgeColor = (action: string) => {
        switch (action) {
            case 'Login': return 'bg-blue-50 text-blue-700 border border-blue-200';
            case 'Create': return 'bg-green-50 text-green-700 border border-green-200';
            case 'Update': return 'bg-yellow-50 text-yellow-700 border border-yellow-200';
            case 'Delete': return 'bg-red-50 text-red-700 border border-red-200';
            default: return 'bg-slate-50 text-slate-700 border border-slate-200';
        }
    };

    return (
        <div className="p-6 space-y-6">
            <div className="bg-white rounded-xl shadow-md border border-slate-200 p-5 md:p-7">
                <h1 className="text-2xl font-extrabold text-slate-800 flex items-center gap-2 mb-1">
                    <FaHistory className="text-primary-500" />
                    Audit Logs
                </h1>
                <p className="text-slate-500 text-sm font-medium">System activity and user actions</p>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl shadow-md border border-slate-200 p-4">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                        <div className="relative">
                            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search by user, action, or entity..."
                                className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white text-slate-800 outline-none transition-shadow"
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="w-full md:w-48">
                        <div className="relative">
                            <FaFilter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <select
                                className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white text-slate-800 outline-none transition-shadow appearance-none cursor-pointer"
                                value={filterAction}
                                onChange={e => setFilterAction(e.target.value)}
                            >
                                <option value="All">All Actions</option>
                                {uniqueActions.map(action => (
                                    <option key={action} value={action}>{action}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {/* Audit Logs Table */}
            <div className="bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden">
                {loading ? (
                    <div className="p-12 text-center">
                        <div className="inline-block w-8 h-8 border-4 border-slate-200 border-t-primary-500 rounded-full animate-spin"></div>
                        <p className="mt-4 text-slate-500 font-medium">Loading audit logs...</p>
                    </div>
                ) : filteredLogs.length === 0 ? (
                    <div className="p-12 text-center">
                        <FaHistory className="mx-auto text-6xl text-slate-200 mb-4" />
                        <p className="text-slate-500 font-medium">No audit logs found</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-200">
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Timestamp</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">User</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Action</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Entity</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Details</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">IP Address</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredLogs.map(log => (
                                    <tr key={log.id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="px-6 py-4 text-sm font-medium text-slate-500 whitespace-nowrap">
                                            {new Date(log.timestamp).toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 text-sm font-bold text-slate-800">
                                            {log.userName}
                                        </td>
                                        <td className="px-6 py-4 text-sm">
                                            <span className={`inline-block px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider shadow-sm ${getActionBadgeColor(log.action)}`}>
                                                {log.action}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-600 font-semibold">
                                            {log.entityType}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-500 max-w-sm xl:max-w-md truncate" title={log.newValues || log.oldValues || '-'}>
                                            {log.newValues || log.oldValues || '-'}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-400 font-mono">
                                            {log.ipAddress}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Summary */}
            {!loading && filteredLogs.length > 0 && (
                <div className="flex justify-between items-center text-sm">
                    <p className="text-slate-500 font-medium">
                        Showing <span className="font-bold text-slate-800">{filteredLogs.length}</span> of <span className="font-bold text-slate-800">{logs.length}</span> total logs
                    </p>
                </div>
            )}
        </div>
    );
};

export default AuditLogs;
