'use client';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

import { User } from '@/types';

interface AuthContextType {
    authUser: User | null;
    updateAuthUser: (updateAuthUser: User) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

const AuthContextProvider = ({ children }: { children: React.ReactNode }) => {
    const [authUser, setAuthUser] = useState<User | null>(null);
    const router = useRouter();
    const memoizedUser = useMemo(() => authUser, [authUser]);

    useEffect(() => {
        if (!authUser) router.push('/account/login');
    }, [authUser]);

    const updateAuthUser = (updatedUser: User) => {
        setAuthUser(updatedUser);
    };

    const contextValue: AuthContextType = {
        authUser: memoizedUser,
        updateAuthUser,
    };

    return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
};

const useAuthContextProvider = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuthContextProvider must be used within an AuthContextProvider');
    }
    return context;
};

export { AuthContextProvider, useAuthContextProvider };
