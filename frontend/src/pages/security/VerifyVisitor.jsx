import React, { useState } from 'react';
import Sidebar from '../../components/Sidebar';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, User, Fingerprint, Search, CheckCircle, XCircle, Loader2, ClipboardCheck } from 'lucide-react';
import api from '../../utils/api';

const VerifyVisitor = () => {
    const [credentials, setCredentials] = useState({
        residentName: '',
        visitorUsername: '',
        password: ''
    });
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);

    const handleVerify = async (e) => {
        e.preventDefault();
        setLoading(true);
        setResult(null);
        try {
            const response = await api.post('/api/security/verify', credentials);
            setResult({ success: true, message: response.data.message, data: response.data });
        } catch (err) {
            setResult({ success: false, message: err.response?.data?.message || 'Verification Failed' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex bg-bg-darker min-h-screen">
            <Sidebar />
            <main className="ml-64 p-8 w-full">
                <header className="mb-10">
                    <h1 className="text-3xl font-bold">Visitor Verification</h1>
                    <p className="text-text-muted mt-2">Verify guest credentials and authorize entry</p>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="glass p-8"
                    >
                        <form onSubmit={handleVerify} className="space-y-6">
                            <div className="space-y-2">
                                <label>Resident Host Name</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted w-5 h-5" />
                                    <input
                                        type="text"
                                        className="input-field pl-12"
                                        placeholder="Name of the resident being visited"
                                        value={credentials.residentName}
                                        onChange={(e) => setCredentials({ ...credentials, residentName: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label>Guest Username</label>
                                <div className="relative">
                                    <Fingerprint className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted w-5 h-5" />
                                    <input
                                        type="text"
                                        className="input-field pl-12"
                                        value={credentials.visitorUsername}
                                        onChange={(e) => setCredentials({ ...credentials, visitorUsername: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label>Access PIN / Password</label>
                                <div className="relative">
                                    <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted w-5 h-5" />
                                    <input
                                        type="password"
                                        className="input-field pl-12"
                                        value={credentials.password}
                                        onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            <button type="submit" disabled={loading} className="btn btn-primary w-full py-4 justify-center">
                                {loading ? <Loader2 className="animate-spin" /> : <Search />}
                                {loading ? 'Verifying...' : 'Authenticate Visitor'}
                            </button>
                        </form>
                    </motion.div>

                    <div className="flex flex-col gap-6">
                        <AnimatePresence mode="wait">
                            {result && (
                                <motion.div
                                    key={result.success ? 'success' : 'fail'}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    className={`glass p-8 border-2 ${result.success ? 'border-success/30' : 'border-error/30'}`}
                                >
                                    <div className="flex items-center gap-4 mb-4">
                                        {result.success ? (
                                            <CheckCircle className="text-success w-10 h-10" />
                                        ) : (
                                            <XCircle className="text-error w-10 h-10" />
                                        )}
                                        <h2 className={`text-2xl font-bold ${result.success ? 'text-success' : 'text-error'}`}>
                                            {result.success ? 'Verified' : 'Access Denied'}
                                        </h2>
                                    </div>
                                    <p className="text-text-main text-lg">{result.message}</p>

                                    {result.success && (
                                        <button className="btn btn-primary mt-6 w-full">
                                            <ClipboardCheck /> Log Final Details
                                        </button>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="glass p-6 bg-primary/5">
                            <h3 className="font-semibold mb-4 text-primary">Instructions</h3>
                            <ul className="text-sm text-text-muted space-y-2 list-disc pl-4">
                                <li>Scan guest ID and compare with credentials</li>
                                <li>Verify resident host availability</li>
                                <li>Once verified, log visitor's contact details</li>
                                <li>Issue temporary visitor pass</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default VerifyVisitor;

