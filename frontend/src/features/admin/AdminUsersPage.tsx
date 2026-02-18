import { useEffect, useState } from 'react';
import { api } from '@/lib/axios';
import { type User } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Trash } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminUsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const response = await api.get('/user/getAll');
            setUsers(response.data);
        } catch (error) {
            toast.error('Failed to load users');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this user?')) return;
        try {
            await api.delete(`/user/delete/${id}`);
            toast.success('User deleted');
            fetchUsers();
        } catch (error) {
            toast.error('Failed to delete user');
        }
    };

    if (isLoading) return <div>Loading...</div>;

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">Manage Users</h1>
            <div className="grid gap-4">
                {users.map(user => (
                    <Card key={user.id}>
                        <CardContent className="flex items-center justify-between p-4">
                            <div>
                                <h3 className="font-bold">{user.username} ({user.firstName} {user.lastName})</h3>
                                <p className="text-sm text-gray-500">
                                    {user.email} - {user.role}
                                </p>
                                <p className="text-xs text-gray-400">
                                    {user.course} - {user.branch}
                                </p>
                            </div>
                            <Button size="sm" variant="danger" onClick={() => handleDelete(user.id)}><Trash className="h-4 w-4" /></Button>
                        </CardContent>
                    </Card>
                ))}
                {users.length === 0 && <p>No users found.</p>}
            </div>
        </div>
    );
}
