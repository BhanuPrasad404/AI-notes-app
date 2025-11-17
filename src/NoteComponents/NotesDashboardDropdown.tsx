// NoteComponents/NotesDashboardDropdown.tsx
'use client';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/auth';
import { createPortal } from 'react-dom';
import { api } from '@/lib/api';

interface NotesDashboardDropdownProps {
    currentUser: {
        id: string;
        name: string;
        email: string;
        avatarUrl?: string;
        createdAt?: string;
    } | null;
    setShowProfileSettings: (show: boolean) => void;
}

export default function NotesDashboardDropdown({ currentUser, setShowProfileSettings }: NotesDashboardDropdownProps) {
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const router = useRouter();

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = () => {
        auth.removeToken();
        router.push('/login');
        setShowLogoutConfirm(false);
    };

    const handleDeleteAccount = async () => {
        const token = auth.getToken();
        if (!token) return;
        console.log('Account deletion requested for:', currentUser?.id);
        await api.deleteAccount(token);
        setShowDeleteConfirm(false);
        // You might want to logout after account deletion
        auth.removeToken();
        router.push('/login');
    };

    const navigationItems = [
        {
            label: "Tasks",
            icon: (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
            ),
            onClick: () => {
                router.push('/tasks');
                setShowDropdown(false);
            }
        },
        {
            label: "All Notes",
            icon: (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
            ),
            onClick: () => {
                router.push('/notes');
                setShowDropdown(false);
            }
        },
        {
            label: "Dashboard",
            icon: (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
            ),
            onClick: () => {
                router.push('/dashboard');
                setShowDropdown(false);
            }
        }
    ];

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Dropdown Trigger - Notes Dashboard Style */}
            <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center gap-3 w-full p-2 rounded-xl bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700 hover:border-blue-500/30 dark:hover:border-cyan-500/30 transition-all duration-300 group"
            >
                {/* User Avatar with your URL */}
                <div className="w-8 h-8 rounded-full flex items-center justify-center overflow-hidden border-2 border-gray-300 dark:border-gray-600 group-hover:border-blue-500 dark:group-hover:border-cyan-400 transition-colors">
                    {currentUser?.avatarUrl ? (
                        <img
                            src={currentUser?.avatarUrl}
                            alt={currentUser.name || 'User'}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-br from-blue-500 to-cyan-500 dark:from-cyan-500 dark:to-blue-500 flex items-center justify-center text-white font-medium ">
                            {currentUser?.name?.charAt(0)?.toUpperCase() || 'U'}
                        </div>
                    )}
                </div>

                {/* User Info */}
                <div className="flex-1 text-left">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                        {currentUser?.name || 'User Name'}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                        {currentUser?.email || 'user@example.com'}
                    </p>
                </div>
            </button>

            {/* Dropdown Menu - Opens at TOP */}
            {showDropdown && (
                <div className="absolute bottom-full left-0 right-0 mb-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl z-50 animate-in fade-in duration-200">

                    {/* User Info Section */}
                    <div className="p-4 border-b border-gray-200 dark:border-gray-800">
                        <div className="flex items-center gap-2">
                            <div className="w-12 h-12 rounded-full flex items-center justify-center overflow-hidden border-2 border-blue-500 dark:border-cyan-500">
                                {currentUser?.avatarUrl ? (
                                    <img
                                        src={currentUser.avatarUrl}
                                        alt={currentUser.name || 'User'}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-blue-500 to-cyan-500 dark:from-cyan-500 dark:to-blue-500 flex items-center justify-center text-white font-bold text-lg">
                                        {currentUser?.name?.charAt(0)?.toUpperCase() || 'U'}
                                    </div>
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                                    {currentUser?.name || 'User Name'}
                                </p>
                                <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                                    {currentUser?.email || 'user@example.com'}
                                </p>
                                {currentUser?.createdAt && (
                                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                                        Member since {new Date(currentUser.createdAt).getFullYear()}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Quick Navigation */}
                    <div className="p-2">
                        {navigationItems.map((item, index) => (
                            <button
                                key={index}
                                onClick={item.onClick}
                                className="flex items-center gap-3 w-full px-3 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-cyan-500/10 hover:text-blue-600 dark:hover:text-cyan-400 rounded-lg transition-all duration-200 group"
                            >
                                <span className="text-blue-500 dark:text-cyan-400 group-hover:scale-110 transition-transform">
                                    {item.icon}
                                </span>
                                <span>{item.label}</span>
                            </button>
                        ))}
                    </div>

                    {/* Divider */}
                    <div className="border-t border-gray-200 dark:border-gray-800 mx-2"></div>

                    {/* Settings & Actions */}
                    <div className="p-2">
                        <button
                            onClick={() => {
                                setShowProfileSettings(true);
                                setShowDropdown(false);
                            }}
                            className="flex items-center gap-3 w-full px-3 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <span>Profile & Settings</span>
                        </button>

                        {/* Delete Account Button */}
                        <button
                            onClick={() => {
                                setShowDeleteConfirm(true);
                                setShowDropdown(false);
                            }}
                            className="flex items-center gap-3 w-full px-3 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors mt-1"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            <span>Delete Account</span>
                        </button>

                        <button
                            onClick={() => setShowLogoutConfirm(true)}
                            className="flex items-center gap-3 w-full px-3 py-2.5 text-sm text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-500/10 rounded-lg transition-colors mt-1"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                            <span>Logout</span>
                        </button>
                    </div>
                </div>
            )}

            {/* Logout Confirmation Modal */}
            {showLogoutConfirm && createPortal(
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[99999] p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-md">
                        <div className="flex items-center space-x-3 mb-4">
                            <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/20 rounded-full flex items-center justify-center">
                                <svg className="w-5 h-5 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Confirm Logout</h3>
                        </div>

                        <p className="text-gray-600 dark:text-gray-300 mb-6">
                            Are you sure you want to logout? You'll need to sign in again to access your account.
                        </p>

                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={() => setShowLogoutConfirm(false)}
                                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleLogout}
                                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium"
                            >
                                Yes, Logout
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}

            {/* Delete Account Confirmation Modal */}
            {showDeleteConfirm && createPortal(
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[99999] p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-md">
                        <div className="flex items-center space-x-3 mb-4">
                            <div className="w-10 h-10 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
                                <svg className="w-5 h-5 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Delete Account</h3>
                        </div>

                        <div className="space-y-3 mb-6">
                            <p className="text-gray-600 dark:text-gray-300">
                                Are you sure you want to delete your account? This action cannot be undone.
                            </p>
                            <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-lg p-3">
                                <p className="text-sm text-red-700 dark:text-red-300 font-medium">
                                    ⚠️ Warning: This will permanently delete:
                                </p>
                                <ul className="text-sm text-red-600 dark:text-red-400 mt-1 space-y-1">
                                    <li>• All your notes and data</li>
                                    <li>• Your profile information</li>
                                    <li>• Account access permanently</li>
                                </ul>
                            </div>
                        </div>

                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={() => setShowDeleteConfirm(false)}
                                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeleteAccount}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                            >
                                Yes, Delete Account
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
}