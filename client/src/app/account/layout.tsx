import React from 'react';

const AccountLayout = ({ children }: { children: React.ReactNode }) => {
    return (
        <div className="h-screen flex items-center justify-center flex-col">
            <img src="/logo.png" alt="" className="w-16 h-16 mb-4" />
            <div>{children}</div>
        </div>
    );
};

export default AccountLayout;
