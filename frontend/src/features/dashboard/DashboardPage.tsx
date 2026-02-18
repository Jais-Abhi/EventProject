import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';

export default function DashboardPage() {
    const { user } = useAuth();

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-900">Welcome back, {user?.firstName}!</h1>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                    <CardHeader>
                        <CardTitle>Upcoming Events</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-gray-500">No events scheduled.</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Active Contests</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-gray-500">No active contests.</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>My Stats</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-gray-500">View your performance.</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
