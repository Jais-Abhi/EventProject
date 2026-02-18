import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Sun, LogOut, LayoutDashboard, PlusCircle, Code2, User, ClipboardList } from 'lucide-react';

export default function DashboardLayout() {
    const { logout, isAdmin } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const navLinks = [
        { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
        ...(isAdmin ? [{ name: 'Create', href: '/admin', icon: PlusCircle }] : []),
        { name: 'Quiz Studio', href: '/events', icon: ClipboardList },
        { name: 'Contest Studio', href: '/contests', icon: Code2 },
        { name: 'Profile', href: '/profile', icon: User },
    ];

    const isActive = (href: string) => location.pathname === href || location.pathname.startsWith(href + '/');

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col">
            {/* Top Navbar */}
            <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    {/* Logo */}
                    <Link to="/dashboard" className="text-2xl font-bold text-blue-600 tracking-tight">
                        EventHub
                    </Link>

                    {/* Nav Links + Actions */}
                    <div className="flex items-center gap-6">
                        {navLinks.map(link => (
                            <Link
                                key={link.name}
                                to={link.href}
                                className={`text-sm font-medium transition-colors ${isActive(link.href)
                                    ? 'text-blue-600'
                                    : 'text-gray-600 hover:text-gray-900'
                                    }`}
                            >
                                {link.name}
                            </Link>
                        ))}

                        {/* Theme toggle icon */}
                        <button className="text-gray-500 hover:text-gray-700 transition-colors">
                            <Sun className="h-5 w-5" />
                        </button>

                        {/* Logout */}
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-1.5 bg-red-500 hover:bg-red-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors shadow-sm"
                        >
                            <LogOut className="h-4 w-4" />
                            Logout
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
