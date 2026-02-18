import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, Code2, Users, FileText, BarChart3, ClipboardList } from 'lucide-react';

export default function AdminDashboard() {
    const links = [
        { name: 'Manage Events', href: '/admin/events', icon: Trophy, color: 'text-blue-600 bg-blue-100' },
        { name: 'Manage Contests', href: '/admin/contests', icon: Code2, color: 'text-indigo-600 bg-indigo-100' },
        { name: 'Manage Problems', href: '/admin/problems', icon: FileText, color: 'text-yellow-600 bg-yellow-100' },
        { name: 'Manage Users', href: '/admin/users', icon: Users, color: 'text-green-600 bg-green-100' },
        { name: 'Event Analytics', href: '/admin/analytics', icon: BarChart3, color: 'text-purple-600 bg-purple-100' },
        { name: 'All Submissions', href: '/admin/submissions', icon: ClipboardList, color: 'text-orange-600 bg-orange-100' },
    ];

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {links.map((link) => (
                    <Link key={link.name} to={link.href}>
                        <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    {link.name}
                                </CardTitle>
                                <div className={`p-2 rounded-full ${link.color}`}>
                                    <link.icon className="h-4 w-4" />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">Access Panel</div>
                            </CardContent>
                        </Card>
                    </Link>
                ))}
            </div>
        </div>
    );
}
