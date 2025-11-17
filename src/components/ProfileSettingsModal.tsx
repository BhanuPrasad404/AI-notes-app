// components/ProfileSettingsModal.tsx
'use client';
import { useState, useEffect, useCallback, useMemo, memo } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/auth';
import { api } from '@/lib/api';
import { useTheme } from 'next-themes';
import { createPortal } from 'react-dom';

interface ProfileSettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentUser: {
        id: string;
        name: string;
        email: string;
        avatarUrl?: string;
        createdAt?: string;
    } | null;
}

// Memoized tab button to prevent unnecessary re-renders
const TabButton = memo(({
    activeTab,
    tab,
    onClick,
    children
}: {
    activeTab: string;
    tab: string;
    onClick: () => void;
    children: React.ReactNode;
}) => (
    <button
        onClick={onClick}
        className={`w-full text-left px-3 py-2 rounded-lg transition-all text-sm sm:text-base ${activeTab === tab
            ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
            : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
            }`}
    >
        {children}
    </button>
));

TabButton.displayName = 'TabButton';

// Memoized input field component
const EditableField = memo(({
    label,
    value,
    isEditing,
    onEdit,
    onSave,
    onCancel,
    onChange,
    type = "text",
    disabled = false
}: {
    label: string;
    value: string;
    isEditing: boolean;
    onEdit: () => void;
    onSave: () => void;
    onCancel: () => void;
    onChange: (value: string) => void;
    type?: string;
    disabled?: boolean;
}) => (
    <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
        <div className="flex flex-col sm:flex-row gap-2">
            <input
                type={type}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                disabled={!isEditing || disabled}
                className="flex-1 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white disabled:opacity-50 text-sm sm:text-base"
            />
            {isEditing ? (
                <div className="flex gap-2">
                    <button
                        onClick={onSave}
                        className="px-3 sm:px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors text-sm sm:text-base flex-1"
                    >
                        Save
                    </button>
                    <button
                        onClick={onCancel}
                        className="px-3 sm:px-4 py-2 bg-gray-300 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-600 transition-colors text-sm sm:text-base flex-1"
                    >
                        Cancel
                    </button>
                </div>
            ) : (
                <button
                    onClick={onEdit}
                    className="px-3 sm:px-4 py-2 bg-gray-300 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-600 transition-colors text-sm sm:text-base sm:w-auto w-full"
                    disabled={disabled}
                >
                    Edit
                </button>
            )}
        </div>
    </div>
));

EditableField.displayName = 'EditableField';

function ProfileSettingsModal({ isOpen, onClose, currentUser }: ProfileSettingsModalProps) {
    const [activeTab, setActiveTab] = useState<'profile' | 'appearance' | 'account'>('profile');
    const [name, setName] = useState(currentUser?.name || '');
    const [email, setEmail] = useState(currentUser?.email || '');
    const [isEditingName, setIsEditingName] = useState(false);
    const [isEditingEmail, setIsEditingEmail] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [showMobileMenu, setShowMobileMenu] = useState(false);
    const [mounted, setMounted] = useState(false);
    const router = useRouter();

    const { theme, setTheme } = useTheme();
    const toggleTheme = () => {
        console.log('Current theme:', theme);
        setTheme(theme === 'dark' ? 'light' : 'dark');
        console.log('New theme should be:', theme === 'dark' ? 'light' : 'dark');
    }
    const isDarkMode = theme === 'dark';

    // Prevent hydration mismatch
    useEffect(() => {
        setMounted(true);
    }, []);

    // Memoized user data to prevent unnecessary recalculations
    const userData = useMemo(() => ({
        name: currentUser?.name || '',
        email: currentUser?.email || '',
        createdAt: currentUser?.createdAt
    }), [currentUser?.name, currentUser?.email, currentUser?.createdAt]);

    // Reset form when modal opens - useCallback to maintain reference
    useEffect(() => {
        if (isOpen && currentUser) {
            setName(userData.name);
            setEmail(userData.email);
            setShowMobileMenu(false);
        }
    }, [isOpen, currentUser, userData.name, userData.email]);

    // Memoized tab configuration
    const tabs = useMemo(() => [
        { id: 'profile', label: 'Profile' },
        { id: 'appearance', label: 'Appearance' },
        { id: 'account', label: 'Account' }
    ], []);

    // Optimized handlers with useCallback
    const handleSaveName = useCallback(async () => {
        try {
            const token = auth.getToken();
            if (!token) return;

            await api.updateName(token, name);
            setIsEditingName(false);
        } catch (error) {
            alert('Failed to update name');
        }
    }, [name]);

    const handleSaveEmail = useCallback(async () => {
        try {
            const token = auth.getToken();
            if (!token) return;

            await api.updateEmail(token, email);
            setIsEditingEmail(false);
        } catch (error) {
            alert('Failed to update email');
        }
    }, [email]);

    const handleDeleteAccount = useCallback(async () => {
        try {
            const token = auth.getToken();
            if (!token) return;

            await api.deleteAccount(token);
            auth.removeToken();
            router.push('/login');
        } catch (error) {
            alert('Failed to delete account');
        }
    }, [router]);

    const handleChangePassword = useCallback(() => {
        router.push('/change-password');
    }, [router]);

    const handleTabClick = useCallback((tab: 'profile' | 'appearance' | 'account') => {
        setActiveTab(tab);
        setShowMobileMenu(false);
    }, []);

    const handleCancelName = useCallback(() => {
        setIsEditingName(false);
        setName(userData.name);
    }, [userData.name]);

    const handleCancelEmail = useCallback(() => {
        setIsEditingEmail(false);
        setEmail(userData.email);
    }, [userData.email]);

    // Memoized modal content to prevent unnecessary re-renders
    const modalContent = useMemo(() => {
        switch (activeTab) {
            case 'profile':
                return (
                    <div className="space-y-6">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Personal Information</h3>
                            <EditableField
                                label="Name"
                                value={name}
                                isEditing={isEditingName}
                                onEdit={() => setIsEditingName(true)}
                                onSave={handleSaveName}
                                onCancel={handleCancelName}
                                onChange={setName}
                            />
                            <div className="mt-4">
                                <EditableField
                                    label="Email"
                                    value={email}
                                    isEditing={isEditingEmail}
                                    onEdit={() => setIsEditingEmail(true)}
                                    onSave={handleSaveEmail}
                                    onCancel={handleCancelEmail}
                                    onChange={setEmail}
                                    type="email"
                                />
                            </div>
                        </div>
                        {userData.createdAt && (
                            <div className="pt-4 border-t border-gray-300 dark:border-gray-800">
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Member since {new Date(userData.createdAt).toLocaleDateString()}
                                </p>
                            </div>
                        )}
                    </div>
                );

            case 'appearance':
                return (
                    <div className="space-y-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Appearance</h3>
                        <div className="flex items-center justify-between p-4 bg-gray-100 dark:bg-gray-800/50 rounded-lg border border-gray-300 dark:border-gray-700">
                            <div>
                                <p className="text-gray-900 dark:text-white font-medium">Dark Mode</p>
                                <p className="text-gray-600 dark:text-gray-400 text-sm">Switch between dark and light theme</p>
                            </div>
                            <button
                                onClick={toggleTheme}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isDarkMode ? 'bg-cyan-500' : 'bg-gray-400'
                                    }`}
                            >
                                <span
                                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isDarkMode ? 'translate-x-6' : 'translate-x-1'
                                        }`}
                                />
                            </button>
                        </div>
                        <div className="p-3 bg-cyan-500/10 rounded-lg border border-cyan-500/30">
                            <p className="text-cyan-600 dark:text-cyan-300 text-sm text-center">
                                Current theme: <span className="font-medium">{theme?.toUpperCase() || 'SYSTEM'}</span>
                            </p>
                        </div>
                    </div>
                );

            case 'account':
                return (
                    <div className="space-y-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Account</h3>
                        <div className="p-4 bg-gray-100 dark:bg-gray-800/50 rounded-lg border border-gray-300 dark:border-gray-700">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div>
                                    <p className="text-gray-900 dark:text-white font-medium">Password</p>
                                    <p className="text-gray-600 dark:text-gray-400 text-sm">Change your account password</p>
                                </div>
                                <button
                                    onClick={handleChangePassword}
                                    className="px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors text-sm sm:text-base w-full sm:w-auto"
                                >
                                    Change Password
                                </button>
                            </div>
                        </div>
                        <div className="p-4 bg-red-500/10 rounded-lg border border-red-500/30">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div>
                                    <p className="text-red-600 dark:text-red-400 font-medium">Delete Account</p>
                                    <p className="text-red-500 dark:text-red-300 text-sm">
                                        Permanently delete your account and all data
                                    </p>
                                </div>
                                <button
                                    onClick={() => setShowDeleteConfirm(true)}
                                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm sm:text-base w-full sm:w-auto"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                );

            default:
                return null;
        }
    }, [
        activeTab,
        name,
        email,
        isEditingName,
        isEditingEmail,
        isDarkMode,
        theme,
        userData.createdAt,
        handleSaveName,
        handleSaveEmail,
        handleChangePassword,
        handleCancelName,
        handleCancelEmail,
        toggleTheme
    ]);

    // Don't render anything until mounted
    if (!mounted) {
        return null;
    }

    // Don't render if not open
    if (!isOpen) {
        return null;
    }

    // Main modal content
    const modal = (
        <>
            {/* Main Modal */}
            <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100] p-2 sm:p-4">
                <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-2xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden border border-gray-300 dark:border-gray-700 mx-2 sm:mx-0">

                    {/* Header */}
                    <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-300 dark:border-gray-800">
                        <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">Profile & Settings</h2>
                        <div className="flex items-center gap-2">
                            {/* Mobile menu button */}
                            <button
                                onClick={() => setShowMobileMenu(!showMobileMenu)}
                                className="sm:hidden text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white transition-colors p-2"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                        d={showMobileMenu ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
                                </svg>
                            </button>
                            <button
                                onClick={onClose}
                                className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white transition-colors p-2"
                            >
                                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row h-[500px]">
                        {/* Sidebar Navigation - Hidden on mobile when not active */}
                        <div className={`${showMobileMenu ? 'block' : 'hidden'
                            } sm:block w-full sm:w-48 bg-gray-100 dark:bg-gray-800/50 border-b sm:border-b-0 sm:border-r border-gray-300 dark:border-gray-700 p-4`}>
                            <nav className="space-y-2">
                                {tabs.map((tab) => (
                                    <TabButton
                                        key={tab.id}
                                        activeTab={activeTab}
                                        tab={tab.id}
                                        onClick={() => handleTabClick(tab.id as any)}
                                    >
                                        {tab.label}
                                    </TabButton>
                                ))}
                            </nav>
                        </div>

                        {/* Content Area */}
                        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
                            {modalContent}
                        </div>
                    </div>
                </div>
            </div>

            {/* Delete Account Confirmation Modal */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[110] p-4">
                    <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 w-full max-w-md border border-red-500/30 mx-4">
                        <h3 className="text-xl font-bold text-red-600 dark:text-red-400 mb-2">Delete Account</h3>
                        <p className="text-gray-700 dark:text-gray-300 mb-4 text-sm sm:text-base">
                            This will permanently delete your account and all your data.
                            This action cannot be undone.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3 justify-end">
                            <button
                                onClick={() => setShowDeleteConfirm(false)}
                                className="px-4 py-2 bg-gray-300 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-600 transition-colors text-sm sm:text-base flex-1 sm:flex-none"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeleteAccount}
                                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm sm:text-base flex-1 sm:flex-none"
                            >
                                Yes, Delete Account
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );

    // Use portal to render outside the component hierarchy
    return createPortal(modal, document.body);
}

export default memo(ProfileSettingsModal);