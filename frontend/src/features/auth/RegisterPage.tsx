import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '@/lib/axios';
import AuthLayout from '@/layouts/AuthLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';

const registerSchema = z.object({
    username: z.string().min(3, 'Username must be at least 3 characters'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    email: z.string().email('Invalid email address'),
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    fatherName: z.string().min(1, 'Father name is required'),
    course: z.string().min(1, 'Course is required'),
    branch: z.string().min(1, 'Branch is required'),
});

type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterPage() {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);

    const { register, handleSubmit, formState: { errors } } = useForm<RegisterForm>({
        resolver: zodResolver(registerSchema),
    });

    const onSubmit = async (data: RegisterForm) => {
        setIsLoading(true);
        try {
            await api.post('/user/insert', data);
            toast.success('Account created successfully! Please login.');
            navigate('/login');
        } catch (error) {
            // Error handled by interceptor
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AuthLayout title="Create an account" subtitle="Join to participate in events">
            <Card>
                <CardContent className="pt-6">
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <Input label="First Name" id="firstName" {...register('firstName')} error={errors.firstName?.message} />
                            <Input label="Last Name" id="lastName" {...register('lastName')} error={errors.lastName?.message} />
                        </div>

                        <Input label="Father's Name" id="fatherName" {...register('fatherName')} error={errors.fatherName?.message} />

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <Input label="Course" id="course" {...register('course')} error={errors.course?.message} />
                            <Input label="Branch" id="branch" {...register('branch')} error={errors.branch?.message} />
                        </div>

                        <Input label="Email" type="email" id="email" {...register('email')} error={errors.email?.message} />
                        <Input label="Username" id="username" {...register('username')} error={errors.username?.message} />
                        <Input label="Password" type="password" id="password" {...register('password')} error={errors.password?.message} />

                        <Button type="submit" className="w-full mt-4" isLoading={isLoading}>
                            Register
                        </Button>
                    </form>

                    <div className="mt-4 text-center text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Already have an account? </span>
                        <Link to="/login" className="font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300">
                            Sign in
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </AuthLayout>
    );
}
