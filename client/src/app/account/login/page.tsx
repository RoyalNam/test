'use client';
import React, { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import InputCus from '@/components/InputCus';
import userApi, { userEndpoint } from '@/api/modules/user.api';
import { useAuthContextProvider } from '@/context/authUserContext';

const LoginPage = () => {
    return (
        <Suspense fallback="loading....">
            <Login />
        </Suspense>
    );
};
const Login = () => {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { updateAuthUser } = useAuthContextProvider();
    const [isErr, setErr] = useState(false);
    const initialData = {
        email: '',
        password: '',
    };
    const [formData, setFormData] = useState(initialData);

    useEffect(() => {
        handleLogin();
    }, []);

    const handleLogin = async () => {
        const searchToken = searchParams.get('token');
        if (searchToken) {
            localStorage.setItem('authToken', searchToken);
            const userRes = await userApi.loginSuccess(searchToken);
            if (userRes) {
                console.log('User logged in:', userRes);
                updateAuthUser(userRes.data.user);
                router.push('/');
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const userData = await userApi.loginLocal(formData);
        console.log('users', userData);

        if (userData) {
            updateAuthUser(userData.user);
            router.push('/');
        } else {
            setErr(true);
        }
    };

    const handleInputChange = (name: string, value: string) => {
        setFormData((prevState) => ({
            ...prevState,
            [name]: value,
        }));
        setErr(false);
    };

    const redirectToRegister = () => {
        router.push('/account/register');
    };
    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center flex-col gap-4">
                <form action="" method="post" onSubmit={handleSubmit} className="flex flex-col gap-8">
                    <InputCus
                        item={{
                            type: 'email',
                            placeholder: 'Email',
                            value: formData.email,
                            onChange: (value) => handleInputChange('email', value),
                        }}
                    />
                    <InputCus
                        item={{
                            type: 'password',
                            placeholder: 'Password',
                            value: formData.password,
                            onChange: (value) => handleInputChange('password', value),
                        }}
                    />
                    <button className="underline font-medium text-lg my-2 transition ease-in-out scale-100 hover:scale-105">
                        Log In
                    </button>
                </form>
                <span className="text-sm">OR</span>
                <div className="flex justify-center gap-2">
                    <Link href={userEndpoint.auth.google}>
                        <img src="/icons8-google.svg" alt="" className="w-10" />
                    </Link>
                    <Link href={userEndpoint.auth.facebook}>
                        <img src="/icons8-facebook.svg" alt="" className="w-10" />
                    </Link>
                </div>
                {isErr && (
                    <span className="text-red-500 text-sm">
                        Sorry, an error occurred during login. Please try again later.
                    </span>
                )}
            </div>
            <div className="text-center">
                <span>
                    No account -{' '}
                    <button className="opacity-50 hover:underline" onClick={redirectToRegister}>
                        Join now
                    </button>
                </span>
            </div>
        </div>
    );
};

export default LoginPage;
