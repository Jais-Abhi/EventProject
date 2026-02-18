import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import AuthLayout from '@/layouts/AuthLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';

const loginSchema = z.object({
    userId: z.string().min(1, 'User ID is required'),
    password: z.string().min(1, 'Password is required'),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);

    const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({
        resolver: zodResolver(loginSchema),
    });

    const onSubmit = async (data: LoginForm) => {
        setIsLoading(true);
        try {
            await login(data);
            navigate('/dashboard');
        } catch (error) {
            // Error handled by AuthContext/Interceptor (toast)
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AuthLayout title="Sign in to your account" subtitle="Access your events and contests">
            <Card>
                <CardContent className="pt-6">
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        <Input
                            id="userId"
                            label="User ID / Username"
                            placeholder="Enter your ID"
                            {...register('userId')}
                            error={errors.userId?.message}
                        />

                        <Input
                            id="password"
                            type="password"
                            label="Password"
                            placeholder="Enter your password"
                            {...register('password')}
                            error={errors.password?.message}
                        />

                        <Button type="submit" className="w-full" isLoading={isLoading}>
                            Sign In
                        </Button>
                    </form>

                    <div className="mt-4 text-center text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Don't have an account? </span>
                        <Link to="/register" className="font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300">
                            Register here
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </AuthLayout>
    );
}
