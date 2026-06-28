import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userService, User } from '../services/api';
import { FaUserPlus, FaSearch, FaEdit, FaTrash, FaUserShield } from 'react-icons/fa';
import { showSuccessToast, showErrorToast } from '../utils/toast';
import ConfirmDialog from '../components/common/ConfirmDialog';

const Users = () => {
    const { t } = useTranslation();
    const queryClient = useQueryClient();
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [formData, setFormData] = useState<{ firstName: string; lastName: string; email: string; password: string; role?: string }>({ firstName: '', lastName: '', email: '', password: '', role: 'Staff' });
    const [confirmAction, setConfirmAction] = useState<{ type: 'delete' | 'toggle', id: string, name: string } | null>(null);

    // Queries
    const { data: users = [], isLoading } = useQuery({
        queryKey: ['users'],
        queryFn: userService.getAll,
    });

    // Mutations
    const createMutation = useMutation({
        mutationFn: userService.create,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
            showSuccessToast(t('users.createSuccess') || 'User created successfully');
            closeModal();
        },
        onError: () => showErrorToast(t('common.error') || 'Failed to create user')
    });

    const updateMutation = useMutation({
        mutationFn: (data: any) => userService.update(editingUser!.id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
            showSuccessToast(t('users.updateSuccess') || 'User updated successfully');
            closeModal();
        },
        onError: () => showErrorToast(t('common.error') || 'Failed to update user')
    });

    const deleteMutation = useMutation({
        mutationFn: userService.delete,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
            showSuccessToast(t('users.deleteSuccess') || 'User deleted successfully');
            setConfirmAction(null);
        },
        onError: () => showErrorToast(t('common.error') || 'Failed to delete user')
    });

    const toggleStatusMutation = useMutation({
        mutationFn: userService.toggleStatus,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
            showSuccessToast(t('common.success') || 'User status updated');
            setConfirmAction(null);
        },
        onError: () => showErrorToast(t('common.error') || 'Failed to update status')
    });

    // Filtering
    const filteredUsers = useMemo(() => {
        return users.filter(user =>
            user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [users, searchTerm]);

    // Handlers
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingUser) {
            updateMutation.mutate({ firstName: formData.firstName, lastName: formData.lastName, email: formData.email, role: formData.role });
        } else {
            createMutation.mutate(formData);
        }
    };

    const openModal = (user?: User) => {
        if (user) {
            setEditingUser(user);
            setFormData({ firstName: user.firstName, lastName: user.lastName, email: user.email, password: '', role: user.role || 'Staff' });
        } else {
            setEditingUser(null);
            setFormData({ firstName: '', lastName: '', email: '', password: '', role: 'Staff' });
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingUser(null);
        setFormData({ firstName: '', lastName: '', email: '', password: '', role: 'Staff' });
    };

    const getRoleLabel = (role: string) => {
        const key = `users.roles.${role.toLowerCase()}`;
        return t(key) !== key ? t(key) : role;
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-2">
                        <FaUserShield className="text-primary-600" />
                        {t('users.title')}
                    </h1>
                    <p className="text-slate-500 mt-1">{t('users.subtitle')}</p>
                </div>
                <button
                    onClick={() => openModal()}
                    className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-lg shadow-primary-600/30"
                >
                    <FaUserPlus />
                    <span>{t('users.addUser')}</span>
                </button>
            </div>

            {/* Search */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4">
                <FaSearch className="text-slate-400" />
                <input
                    type="text"
                    placeholder={t('users.searchPlaceholder') || 'Search users...'}
                    className="flex-1 bg-transparent outline-none text-slate-600 placeholder-slate-400"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {isLoading ? (
                    Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 animate-pulse h-48"></div>
                    ))
                ) : filteredUsers.length > 0 ? (
                    filteredUsers.map(user => (
                        <div key={user.id} className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow group relative overflow-hidden">
                            <div className={`absolute top-0 left-0 w-1 h-full ${user.isActive ? 'bg-green-500' : 'bg-red-500'}`}></div>

                            <div className="flex justify-between items-start mb-4 pl-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center text-xl font-bold">
                                        {user.firstName[0]}{user.lastName[0]}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-800">{user.firstName} {user.lastName}</h3>
                                        <div className="flex items-center gap-2">
                                            <p className="text-sm text-slate-500">{user.email}</p>
                                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${user.role === 'Admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                                                {getRoleLabel(user.role || 'Staff')}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => openModal(user)}
                                        className="p-2 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                                        title={t('common.edit') || 'Edit'}
                                    >
                                        <FaEdit />
                                    </button>
                                    <button
                                        onClick={() => setConfirmAction({ type: 'delete', id: user.id, name: `${user.firstName} ${user.lastName}` })}
                                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                        title={t('common.delete') || 'Delete'}
                                    >
                                        <FaTrash />
                                    </button>
                                </div>
                            </div>

                            <div className="pl-3 mt-4 pt-4 border-t border-slate-50 flex justify-between items-center">
                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${user.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                    <span className={`w-1.5 h-1.5 rounded-full ${user.isActive ? 'bg-green-500' : 'bg-red-500'}`}></span>
                                    {user.isActive ? t('common.active') || 'Active' : t('common.inactive') || 'Inactive'}
                                </span>
                                <button
                                    onClick={() => setConfirmAction({ type: 'toggle', id: user.id, name: `${user.firstName} ${user.lastName}` })}
                                    className={`text-sm font-medium ${user.isActive ? 'text-red-500 hover:text-red-700' : 'text-green-500 hover:text-green-700'}`}
                                >
                                    {user.isActive ? t('users.deactivate') : t('users.activate')}
                                </button>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="col-span-full py-12 text-center text-slate-500">
                        {t('users.noUsersFound')}
                    </div>
                )}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-slate-800">
                                {editingUser ? t('users.editUser') : t('users.addUser')}
                            </h2>
                            <button onClick={closeModal} className="text-slate-400 hover:text-slate-600 text-2xl">
                                &times;
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">{t('users.fields.firstName')}</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                        value={formData.firstName}
                                        onChange={e => setFormData({ ...formData, firstName: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">{t('users.fields.lastName')}</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                        value={formData.lastName}
                                        onChange={e => setFormData({ ...formData, lastName: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">{t('users.fields.email')}</label>
                                <input
                                    type="email"
                                    required
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                    value={formData.email}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">{t('users.fields.role')}</label>
                                <select
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                    value={formData.role || 'Staff'}
                                    onChange={e => setFormData({ ...formData, role: e.target.value })}
                                >
                                    <option value="Staff">{t('users.roles.staff')}</option>
                                    <option value="Admin">{t('users.roles.admin')}</option>
                                </select>
                            </div>

                            {!editingUser && (
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">{t('users.fields.password')}</label>
                                    <input
                                        type="password"
                                        required
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                        value={formData.password}
                                        onChange={e => setFormData({ ...formData, password: e.target.value })}
                                        minLength={6}
                                    />
                                </div>
                            )}

                            <div className="flex justify-end gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition-colors"
                                >
                                    {t('common.cancel')}
                                </button>
                                <button
                                    type="submit"
                                    disabled={createMutation.isPending || updateMutation.isPending}
                                    className="px-4 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors disabled:opacity-50"
                                >
                                    {createMutation.isPending || updateMutation.isPending ? t('common.saving') : editingUser ? t('common.saveChanges') : t('users.addUser')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Confirmation Dialog */}
            <ConfirmDialog
                isOpen={!!confirmAction}
                onClose={() => setConfirmAction(null)}
                onConfirm={() => {
                    if (confirmAction?.type === 'delete') deleteMutation.mutate(confirmAction.id);
                    else if (confirmAction?.type === 'toggle') toggleStatusMutation.mutate(confirmAction.id);
                }}
                title={confirmAction?.type === 'delete' ? t('users.confirm.deleteTitle') : t('users.confirm.statusTitle')}
                message={confirmAction?.type === 'delete'
                    ? t('users.confirm.deleteMessage', { name: confirmAction?.name })
                    : t('users.confirm.statusMessage', { name: confirmAction?.name })}
                confirmText={confirmAction?.type === 'delete' ? t('common.delete') : t('common.confirm')}
                cancelText={t('common.cancel')}
                type={confirmAction?.type === 'delete' ? 'warning' : 'info'}
            />
        </div>
    );
};

export default Users;
