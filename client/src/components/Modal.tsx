import React from 'react';

interface ModalProps {
    children: React.ReactNode;
    show: boolean;
    onClose: () => void;
}
const Modal: React.FC<ModalProps> = ({ children, show = false, onClose }) => {
    return (
        show && (
            <div className="fixed inset-0 flex items-center justify-center z-20">
                <div onClick={onClose} className="absolute inset-0 z-30 bg-black/60" />
                {children}
            </div>
        )
    );
};

export default Modal;
