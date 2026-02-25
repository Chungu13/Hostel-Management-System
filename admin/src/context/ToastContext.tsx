import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
    id: string;
    message: string;
    type: ToastType;
}

interface ToastContextType {
    showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const showToast = useCallback((message: string, type: ToastType = 'success') => {
        const id = Math.random().toString(36).substring(2, 9);
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, 5000);
    }, []);

    const removeToast = (id: string) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    };

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none">
                <AnimatePresence>
                    {toasts.map(toast => (
                        <motion.div
                            key={toast.id}
                            initial={{ opacity: 0, y: 20, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                            className="pointer-events-auto"
                        >
                            <div className={`
                                min-w-[320px] max-w-md p-4 rounded-2xl shadow-2xl border flex items-center gap-4
                                ${toast.type === 'success' ? 'bg-white border-emerald-100' :
                                    toast.type === 'error' ? 'bg-white border-rose-100' :
                                        'bg-white border-zinc-100'}
                            `}>
                                <div className={`
                                    w-10 h-10 rounded-xl flex items-center justify-center shrink-0
                                    ${toast.type === 'success' ? 'bg-emerald-50 text-emerald-500' :
                                        toast.type === 'error' ? 'bg-rose-50 text-rose-500' :
                                            'bg-zinc-50 text-zinc-500'}
                                `}>
                                    {toast.type === 'success' ? <CheckCircle size={20} /> :
                                        toast.type === 'error' ? <XCircle size={20} /> :
                                            <CheckCircle size={20} />}
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-bold text-zinc-900">{toast.type.charAt(0).toUpperCase() + toast.type.slice(1)}</p>
                                    <p className="text-xs text-zinc-500 font-medium leading-relaxed">{toast.message}</p>
                                </div>
                                <button
                                    onClick={() => removeToast(toast.id)}
                                    className="p-1 rounded-lg hover:bg-zinc-50 text-zinc-400 transition-colors"
                                >
                                    <X size={16} />
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </ToastContext.Provider>
    );
};

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) throw new Error('useToast must be used within ToastProvider');
    return context;
};
