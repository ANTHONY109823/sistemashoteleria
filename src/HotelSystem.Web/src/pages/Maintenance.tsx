import { useState, useEffect } from 'react';
import { FaDatabase, FaHistory, FaExclamationTriangle, FaDownload, FaSyncAlt } from 'react-icons/fa';
import { maintenanceService, BackupFile } from '../services/api';
import { showSuccessToast, showErrorToast } from '../utils/toast';

const Maintenance = () => {
    const [backups, setBackups] = useState<BackupFile[]>([]);
    const [loading, setLoading] = useState(false);
    const [loadingAction, setLoadingAction] = useState<string | null>(null);

    // Modal state for reset confirmation
    const [isResetModalOpen, setIsResetModalOpen] = useState(false);
    const [resetConfirmText, setResetConfirmText] = useState('');

    const fetchBackups = async () => {
        setLoading(true);
        try {
            const data = await maintenanceService.getBackups();
            setBackups(data);
        } catch (error) {
            showErrorToast('Error fetching backups');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBackups();
    }, []);

    const handleCreateBackup = async () => {
        setLoadingAction('backup');
        try {
            await maintenanceService.createBackup();
            showSuccessToast('Copia de seguridad generada correctamente.');
            await fetchBackups();
        } catch (error: any) {
            showErrorToast(error.response?.data || 'Error al crear la copia de seguridad.');
        } finally {
            setLoadingAction(null);
        }
    };

    const handleRestore = async (fileName: string) => {
        if (!window.confirm(`¿Estás seguro de que quieres restaurar la copia de seguridad "${fileName}"? Esto sobrescribirá la base de datos actual y cerrarás sesión automáticamente.`)) return;

        setLoadingAction(`restore_${fileName}`);
        try {
            await maintenanceService.restoreBackup(fileName);
            showSuccessToast('Base de datos restaurada correctamente. Redirigiendo al login...');
            setTimeout(() => {
                window.location.href = '/login';
            }, 2000);
        } catch (error: any) {
            showErrorToast(error.response?.data || 'Error al restaurar la copia de seguridad.');
            setLoadingAction(null);
        }
    };

    const handleReset = async () => {
        if (resetConfirmText !== 'RESET') {
            showErrorToast('Por favor escribe RESET para confirmar');
            return;
        }

        setLoadingAction('reset');
        
        try {
            await maintenanceService.resetSystem();
            setIsResetModalOpen(false);
            showSuccessToast('El sistema ha sido restablecido a cero exitosamente.');
            setTimeout(() => {
                window.location.href = '/';
            }, 2000);
        } catch (error: any) {
            showErrorToast(error.response?.data || 'Fallo al restablecer el sistema.');
        } finally {
            setLoadingAction(null);
            setResetConfirmText('');
        }
    };

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="bg-white rounded-xl shadow-md border border-slate-200 p-5 md:p-7">
                <h1 className="text-2xl font-extrabold text-slate-800 flex items-center gap-3 mb-1">
                    <FaDatabase className="text-primary-500" />
                    Mantenimiento del Sistema
                </h1>
                <p className="text-slate-500 text-sm font-medium">
                    Gestiona las copias de seguridad de la base de datos y restablece el sistema.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Backups List */}
                <div className="lg:col-span-2 bg-white rounded-xl shadow-md border border-slate-200 flex flex-col">
                    <div className="p-6 border-b border-slate-100 flex justify-between items-center flex-wrap gap-4">
                        <div>
                            <h2 className="text-lg font-bold text-slate-700 flex items-center gap-2">
                                <FaHistory className="text-primary-500" />
                                Copias de Seguridad (Backups)
                            </h2>
                            <p className="text-sm text-slate-500 mt-1">
                                Restaura el sistema a un punto anterior.
                            </p>
                        </div>
                        <button
                            onClick={handleCreateBackup}
                            disabled={loadingAction === 'backup'}
                            className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg font-semibold text-sm shadow-sm transition-all flex items-center gap-2 disabled:opacity-50"
                        >
                            {loadingAction === 'backup' ? (
                                <FaSyncAlt className="animate-spin" />
                            ) : (
                                <FaDownload />
                            )}
                            Generar Backup
                        </button>
                    </div>

                    <div className="flex-1 p-0 overflow-x-auto min-h-[300px]">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500">
                                    <th className="p-4 font-semibold">Archivo</th>
                                    <th className="p-4 font-semibold">Fecha de Creación</th>
                                    <th className="p-4 font-semibold">Tamaño (MB)</th>
                                    <th className="p-4 font-semibold text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {loading ? (
                                    <tr>
                                        <td colSpan={4} className="p-8 text-center text-slate-500">
                                            Cargando backups...
                                        </td>
                                    </tr>
                                ) : backups.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="p-8 text-center text-slate-500 font-medium">
                                            No hay copias de seguridad disponibles.
                                        </td>
                                    </tr>
                                ) : (
                                    backups.map((b) => (
                                        <tr key={b.fileName} className="hover:bg-slate-50 transition-colors">
                                            <td className="p-4 font-medium text-slate-700 truncate max-w-[200px]" title={b.fileName}>
                                                {b.fileName}
                                            </td>
                                            <td className="p-4 text-sm text-slate-600">
                                                {new Date(b.createdAt).toLocaleString()}
                                            </td>
                                            <td className="p-4 text-sm text-slate-600">
                                                {b.sizeMB} MB
                                            </td>
                                            <td className="p-4 text-right">
                                                <button
                                                    onClick={() => handleRestore(b.fileName)}
                                                    disabled={loadingAction !== null}
                                                    className="px-3 py-1.5 bg-amber-100 text-amber-700 hover:bg-amber-200 rounded text-sm font-semibold transition-colors disabled:opacity-50 flex items-center gap-2 ml-auto"
                                                >
                                                    {loadingAction === `restore_${b.fileName}` ? (
                                                        <FaSyncAlt className="animate-spin" />
                                                    ) : (
                                                        <FaHistory />
                                                    )}
                                                    Restaurar
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Reset System */}
                <div className="bg-white rounded-xl shadow-md border border-red-200 flex flex-col items-center p-6 text-center">
                    <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center text-3xl mb-4">
                        <FaExclamationTriangle />
                    </div>
                    <h2 className="text-xl font-bold text-slate-800 mb-2">Restablecimiento a Cero</h2>
                    <p className="text-sm text-slate-600 mb-6 leading-relaxed">
                        Esta acción <strong>eliminará todos los datos operativos</strong> (Reservas, Huéspedes, Habitaciones, Invoices, etc.) 
                        dejando el sistema limpio para una <strong>Nueva Empresa</strong>. Los administradores y configuración general se mantendrán.
                    </p>
                    
                    <button
                        onClick={() => setIsResetModalOpen(true)}
                        disabled={loadingAction !== null}
                        className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-3 rounded-xl shadow-lg shadow-red-500/30 transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Restablecer Sistema
                    </button>
                </div>
            </div>

            {/* Reset Confirmation Modal */}
            {isResetModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-red-100">
                        <div className="flex items-center gap-3 text-red-600 mb-4">
                            <FaExclamationTriangle className="text-2xl" />
                            <h3 className="text-xl font-bold">¡Peligro! Acción Irreversible</h3>
                        </div>
                        
                        <p className="text-slate-600 text-sm mb-4 leading-relaxed">
                            Estás a punto de borrar todos los datos operativos de la base de datos de manera definitiva. 
                            <strong> Se recomienda generar un backup primero.</strong>
                        </p>

                        <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 mb-6">
                            <label className="block text-xs font-bold text-slate-700 uppercase mb-2 text-left">
                                Escribe "RESET" para confirmar
                            </label>
                            <input 
                                type="text"
                                value={resetConfirmText}
                                onChange={(e) => setResetConfirmText(e.target.value)}
                                placeholder="RESET"
                                className="w-full px-3 py-2 border border-slate-300 rounded focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none text-center font-mono font-bold tracking-widest uppercase"
                            />
                        </div>

                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={() => {
                                    setIsResetModalOpen(false);
                                    setResetConfirmText('');
                                }}
                                className="px-4 py-2 rounded-lg font-bold text-slate-600 hover:bg-slate-100 transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleReset}
                                disabled={resetConfirmText !== 'RESET' || loadingAction === 'reset'}
                                className="px-4 py-2 rounded-lg font-bold bg-red-600 hover:bg-red-700 text-white shadow-md disabled:opacity-50 transition-colors flex items-center gap-2"
                            >
                                {loadingAction === 'reset' && <FaSyncAlt className="animate-spin" />}
                                Confirmar y Borrar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Maintenance;
