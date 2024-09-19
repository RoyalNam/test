import React from 'react';

const AccountLayout = ({ children }: { children: React.ReactNode }) => {
    return (
        <div className="h-screen flex items-center justify-center flex-col">
            <h5 className="text-4xl font-mono italic mb-5">Social</h5>
            <div>{children}</div>
        </div>
    );
};

export default AccountLayout;
