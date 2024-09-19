import React, { useEffect, useState } from 'react';
import { BsEye } from 'react-icons/bs';

export interface InputProps {
    type?: 'text' | 'email' | 'password' | 'number';
    placeholder: string;
    value: any;
    err?: string;
    onChange: (value: string) => void;
    onBlur?: (value: string) => void;
    onFocus?: () => void;
}
const InputCus = ({ item }: { item: InputProps }) => {
    const [typeVal, setType] = useState(item.type || 'text');
    const [isEmpty, setIsEmpty] = useState(true);
    const handleBlur = item.onBlur ?? (() => {});
    const handleFocus = item.onFocus ?? (() => {});

    useEffect(() => {
        setIsEmpty(!item.value.trim());
    }, [item.value]);

    return (
        <div>
            <div className="relative group border rounded-md min-w-80 focus-within:border-blue-400">
                <input
                    type={typeVal}
                    placeholder={item.placeholder}
                    value={item.value}
                    required
                    onChange={
                        item.type === 'text'
                            ? (e) => item.onChange(e.target.value.trimStart())
                            : (e) => item.onChange(e.target.value.trim())
                    }
                    onBlur={(e) => handleBlur(e.target.value.trim())}
                    onFocus={handleFocus}
                    className="w-full px-4 pt-2 pb-1 bg-transparent outline-none"
                />
                {item.type === 'password' && !isEmpty && (
                    <span
                        className="absolute right-2 top-1/2 -translate-y-1/2 group-hover:block hidden"
                        onClick={() => {
                            setType(typeVal === 'password' ? 'text' : 'password');
                        }}
                        title="Show"
                    >
                        <BsEye />
                    </span>
                )}
                <span
                    className={`absolute left-2 -top-4 bg-white dark:bg-primary px-1 ${isEmpty ? 'hidden' : 'block'}`}
                >
                    {item.placeholder}
                </span>
                {item.err && <span className="absolute top-10 inset-0 text-red-500 text-xs">{item.err}</span>}
            </div>
        </div>
    );
};

export default InputCus;
