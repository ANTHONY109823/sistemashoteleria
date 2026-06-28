import React, { useState, useEffect } from 'react';
import { housekeepingService, HousekeepingTask } from '../services/api';
import { FaBroom, FaCheck, FaExclamationTriangle, FaFilePdf, FaBed, FaTools, FaCheckCircle, FaUser, FaClock, FaCalendarAlt } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import { generateHousekeepingReportPDF } from '../utils/pdfExports';
import SkeletonTable from '../components/common/SkeletonTable';
import { showErrorToast, showSuccessToast } from '../utils/toast';

const StatCard = ({
    icon: Icon,
    value,
    label,
    color
}: {
    icon: any;
    value: number;
    label: string;
    color: 'red' | 'yellow' | 'gray' | 'green' | 'blue';
}) => {
    const barColors = {
        red:    'bg-red-500',
        yellow: 'bg-yellow-400',
        gray:   'bg-slate-400',
        green:  'bg-primary-500',
        blue:   'bg-blue-500',
    };
    const iconColors = {
        red:    'text-red-500',
        yellow: 'text-yellow-500',
        gray:   'text-slate-400',
        green:  'text-primary-500',
        blue:   'text-blue-500',
    };

    return (
        <div className="bg-white rounded-xl shadow-md border border-slate-200 p-5 flex items-center gap-4 hover:shadow-lg transition-shadow">
            <div className={`w-1.5 h-12 rounded-full ${barColors[color]} flex-shrink-0`} />
            <div className={`w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center flex-shrink-0`}>
                <Icon className={`text-lg ${iconColors[color]}`} />
            </div>
            <div>
                <p className="text-3xl font-extrabold text-slate-800">{value}</p>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{label}</p>
            </div>
        </div>
    );
};

const TaskCard = ({
    task,
    onComplete
}: {
    task: HousekeepingTask;
    onComplete: (id: string) => void;
}) => {
    const { t } = useTranslation();

    const getTypeColor = () => {
        switch (task.taskType) {
            case 'Cleaning':    return 'bg-yellow-400';
            case 'Maintenance': return 'bg-slate-500';
            case 'Inspection':  return 'bg-blue-500';
            default:            return 'bg-slate-400';
        }
    };

    return (
        <div className="group bg-white rounded-xl shadow-md border border-slate-200 hover:border-primary-200 hover:shadow-lg transition-all duration-200 overflow-hidden flex flex-col">
            <div className={`h-1 w-full ${getTypeColor()}`} />
            <div className="p-5 flex flex-col flex-grow">
                <div className="flex justify-between items-start mb-4">
                    <div className={`w-14 h-14 rounded-xl ${getTypeColor()} flex flex-col items-center justify-center text-white shadow-sm flex-shrink-0`}>
                        <span className="text-[9px] uppercase font-bold opacity-90">Room</span>
                        <span className="text-lg font-extrabold leading-tight">{task.roomNumber}</span>
                    </div>
                    <div className="flex flex-col gap-1.5 items-end">
                        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider border ${getPriorityColor()}`}>
                            {task.priority}
                        </span>
                        <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-[10px] font-bold uppercase tracking-wider border border-slate-200">
                            {task.taskType}
                        </span>
                    </div>
                </div>

                <div className="mb-4 flex-grow space-y-1.5">
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                        <FaUser className="text-slate-400 text-xs" />
                        <span className="font-semibold text-sm">{task.assignedToUserName || 'Unassigned'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-500">
                        <FaCalendarAlt className="text-slate-400 text-xs" />
                        <span className="font-medium text-xs">{new Date(task.scheduledFor).toLocaleDateString()}</span>
                        <FaClock className="text-slate-400 text-xs ml-1" />
                        <span className="font-medium text-xs">{new Date(task.scheduledFor).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    {task.notes && (
                        <div className="mt-2 p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-500 italic">
                            "{task.notes}"
                        </div>
                    )}
                </div>

                <div className="pt-3 border-t border-slate-100 mt-auto">
                    {task.status !== 'Completed' ? (
                        <button
                            onClick={() => onComplete(task.id)}
                            className="w-full px-4 py-2.5 bg-primary-500 hover:bg-primary-600 text-white rounded-lg shadow-sm transition-all font-bold text-sm flex items-center justify-center gap-2"
                        >
                            <FaCheck />
                            Mark Completed
                        </button>
                    ) : (
                        <div className="w-full px-4 py-2.5 bg-green-50 text-green-600 rounded-lg border border-green-200 font-bold text-sm flex items-center justify-center gap-2">
                            <FaCheckCircle /> Completed
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const Housekeeping = () => {
    const { t } = useTranslation();
    const [tasks, setTasks] = useState<HousekeepingTask[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTasks();
    }, []);

    const fetchTasks = async () => {
        try {
            setLoading(true);
            const data = await housekeepingService.getAll();
            setTasks(data);
        } catch (error) {
            console.error('Failed to load tasks', error);
            showErrorToast("Failed to load housekeeping tasks");
        } finally {
            setLoading(false);
        }
    };

    const handleCompleteTask = async (taskId: string) => {
        try {
            await housekeepingService.updateStatus(taskId, 'Completed');
            showSuccessToast('Task marked as completed!');
            fetchTasks();
        } catch (error) {
            console.error('Failed to complete task', error);
            showErrorToast('Could not complete task at this time.');
        }
    };

    const pendingTasks = tasks.filter(t => t.status === 'Pending' || t.status === 'InProgress');
    const completedTasks = tasks.filter(t => t.status === 'Completed');
    
    // Stats
    const stats = {
        cleaning: tasks.filter(t => t.taskType === 'Cleaning' && t.status !== 'Completed').length,
        maintenance: tasks.filter(t => t.taskType === 'Maintenance' && t.status !== 'Completed').length,
        inspection: tasks.filter(t => t.taskType === 'Inspection' && t.status !== 'Completed').length,
        completedToday: completedTasks.length
    };

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="bg-white rounded-xl shadow-md border border-slate-200 p-5 md:p-7">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary-50 border border-primary-200 flex items-center justify-center">
                        <FaBroom className="text-primary-500 text-lg" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-extrabold text-slate-800">Housekeeping</h1>
                        <p className="text-slate-500 text-sm font-medium">Manage and track room servicing</p>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="bg-white rounded-xl shadow-md border border-slate-200 p-10 flex justify-center">
                    <SkeletonTable rows={4} />
                </div>
            ) : (
                <>
                    {/* Stats */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <StatCard icon={FaBroom}       value={stats.cleaning}       label="Cleaning Required"    color="yellow" />
                        <StatCard icon={FaTools}       value={stats.maintenance}    label="Maintenance Needed"  color="red"    />
                        <StatCard icon={FaCheckCircle} value={stats.inspection}     label="For Inspection"      color="blue"   />
                        <StatCard icon={FaCheck}       value={stats.completedToday} label="Completed"           color="green"  />
                    </div>

                    {pendingTasks.length === 0 ? (
                        <div className="bg-white rounded-xl shadow-md border border-slate-200 p-14 text-center">
                            <div className="w-20 h-20 mx-auto bg-primary-50 border-2 border-primary-200 rounded-full flex items-center justify-center mb-4">
                                <FaCheckCircle className="text-4xl text-primary-500" />
                            </div>
                            <h3 className="text-xl font-extrabold text-slate-700 mb-2">All Caught Up!</h3>
                            <p className="text-slate-400 text-sm">There are no pending housekeeping tasks at this moment.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="flex items-center gap-2">
                                <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                                <h2 className="text-base font-extrabold text-slate-700">
                                    Pending Tasks
                                </h2>
                                <span className="ml-auto text-xs font-bold bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-lg border border-yellow-200">
                                    {pendingTasks.length}
                                </span>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                {pendingTasks.map((task, index) => (
                                    <div key={task.id} style={{ animationDelay: `${index * 40}ms` }} className="animate-slide-up">
                                        <TaskCard task={task} onComplete={handleCompleteTask} />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default Housekeeping;
