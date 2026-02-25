import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, X } from 'lucide-react';

interface ConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    variant?: 'danger' | 'primary';
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    variant = 'primary'
}) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[10000] flex items-center justify-center p-6">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-zinc-900/40 backdrop-blur-sm"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-full max-w-md bg-white rounded-[2rem] p-8 shadow-2xl border border-zinc-100 overflow-hidden"
                    >
                        {/* Status Icon */}
                        <div className={`
                            w-14 h-14 rounded-2xl flex items-center justify-center mb-6
                            ${variant === 'danger' ? 'bg-rose-50 text-rose-500' : 'bg-emerald-50 text-emerald-500'}
                        `}>
                            <AlertCircle size={28} />
                        </div>

                        <button
                            onClick={onClose}
                            className="absolute top-8 right-8 p-2 rounded-xl hover:bg-zinc-50 text-zinc-400 transition-colors"
                        >
                            <X size={20} />
                        </button>

                        <h3 className="text-2xl font-black text-zinc-900 tracking-tight mb-2">
                            {title}
                        </h3>
                        <p className="text-zinc-500 font-medium leading-relaxed mb-10">
                            {message}
                        </p>

                        <div className="grid grid-cols-2 gap-4">
                            <button
                                onClick={onClose}
                                className="py-4 bg-zinc-50 text-zinc-600 font-bold rounded-2xl hover:bg-zinc-100 transition-all border border-zinc-100"
                            >
                                {cancelText}
                            </button>
                            <button
                                onClick={() => {
                                    onConfirm();
                                    onClose();
                                }}
                                className={`
                                    py-4 text-white font-extrabold rounded-2xl shadow-lg transition-all hover:-translate-y-1 active:translate-y-0
                                    ${variant === 'danger' ? 'bg-rose-500 shadow-rose-200' : 'bg-emerald-600 shadow-emerald-200'}
                                `}
                            >
                                {confirmText}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default ConfirmModal;
