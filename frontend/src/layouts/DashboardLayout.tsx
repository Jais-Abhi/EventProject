import { Link, Outlet, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { Sun, Moon, LayoutDashboard, PlusCircle, Code2, User, ClipboardList } from 'lucide-react';

export default function DashboardLayout() {
    const { isAdmin } = useAuth();
    const { toggleTheme, isDark } = useTheme();
    const location = useLocation();

    const navLinks = [
        { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
        ...(isAdmin ? [{ name: 'Admin', href: '/admin', icon: PlusCircle }] : []),
        { name: 'Quiz Studio', href: '/events', icon: ClipboardList },
        { name: 'Contest Studio', href: '/contests', icon: Code2 },
        { name: 'Profile', href: '/profile', icon: User },
    ];

    const isActive = (href: string) => location.pathname === href || location.pathname.startsWith(href + '/');

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex flex-col transition-colors">
            {/* Top Navbar */}
            <nav className="bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 sticky top-0 z-50 transition-colors">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    {/* Logo */}
                    <Link to="/dashboard" className="text-2xl font-bold text-blue-600 dark:text-blue-400 tracking-tight transition-colors">
                        EventHub
                    </Link>

                    {/* Nav Links + Actions */}
                    <div className="flex items-center gap-6">
                        {navLinks.map(link => (
                            <Link
                                key={link.name}
                                to={link.href}
                                className={`text-sm font-medium transition-colors ${isActive(link.href)
                                    ? 'text-blue-600 dark:text-blue-400'
                                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100'
                                    }`}
                            >
                                {link.name}
                            </Link>
                        ))}

                        {/* Theme toggle icon */}
                        <button
                            onClick={toggleTheme}
                            className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                            aria-label="Toggle theme"
                        >
                            {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                        </button>
                    </div>
                </div>
            </nav>

            {/* Page Content */}
            <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8">
                <Outlet />
            </main>
        </div>
    );
}
