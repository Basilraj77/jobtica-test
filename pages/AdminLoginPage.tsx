import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext.tsx';
import Icon from '../components/Icon.tsx';

const SignupForm: React.FC = () => {
    const { createAdmin } = useAuth();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            await createAdmin({ username, password, email });
            // The AuthContext will handle navigation to the login stage.
        } catch (err) {
            setError('Failed to create admin account. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <div className="text-center">
                <Icon name="user-plus" className="text-5xl text-[var(--primary-color)] mx-auto" />
                <h1 className="mt-4 text-3xl font-extrabold text-gray-900">Create Admin Account</h1>
                <p className="mt-2 text-sm text-gray-600">This is a one-time setup to secure your admin panel.</p>
            </div>
            <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                <div className="rounded-md shadow-sm space-y-3">
                    <input type="email" placeholder="Administrator Email (for password recovery)" required value={email} onChange={e => setEmail(e.target.value)} className="appearance-none relative block w-full px-3 py-2 border border-gray-300 rounded-md" />
                    <input type="text" placeholder="Choose a Username" required value={username} onChange={e => setUsername(e.target.value)} className="appearance-none relative block w-full px-3 py-2 border border-gray-300 rounded-md" />
                    <input type="password" placeholder="Choose a Secure Password" required value={password} onChange={e => setPassword(e.target.value)} className="appearance-none relative block w-full px-3 py-2 border border-gray-300 rounded-md" />
                </div>
                {error && <p className="text-sm text-red-600 text-center">{error}</p>}
                <button type="submit" disabled={isLoading} className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-[var(--primary-color)] filter hover:brightness-90 disabled:opacity-50">
                    {isLoading ? 'Creating...' : 'Create Account'}
                </button>
            </form>
        </>
    );
};

const LoginForm: React.FC = () => {
    const { login, goToForgotPassword, loginAsDemo } = useAuth();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        const result = await login(username, password);
        if (!result.success) {
            setError(result.message || 'Invalid username or password.');
            setIsLoading(false);
        }
    };

    return (
        <>
            <div className="text-center">
                <Icon name="user-shield" className="text-5xl text-[var(--primary-color)] mx-auto" />
                <h1 className="mt-4 text-3xl font-extrabold text-gray-900">Admin Login</h1>
                <p className="mt-2 text-sm text-gray-600">Please sign in to access the dashboard.</p>
            </div>
            <form className="mt-8 space-y-6" onSubmit={handleLogin}>
                 <div className="rounded-md shadow-sm space-y-3">
                    <input type="text" placeholder="Username" required value={username} onChange={e => setUsername(e.target.value)} className="appearance-none relative block w-full px-3 py-2 border border-gray-300 rounded-md" />
                    <input type="password" placeholder="Password" required value={password} onChange={e => setPassword(e.target.value)} className="appearance-none relative block w-full px-3 py-2 border border-gray-300 rounded-md" />
                </div>
                {error && <p className="text-sm text-red-600 text-center">{error}</p>}
                <div className="flex items-center justify-end">
                    <div className="text-sm">
                        <button type="button" onClick={goToForgotPassword} className="font-medium text-[var(--primary-color)] hover:brightness-90">
                            Forgot your password?
                        </button>
                    </div>
                </div>
                <button type="submit" disabled={isLoading} className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-[var(--primary-color)] filter hover:brightness-90 disabled:opacity-50">
                    {isLoading ? 'Verifying...' : 'Sign in'}
                </button>
            </form>
            {/* securitySettings.demoModeEnabled is always true from DataContext mock now */}
            {true && ( 
                <>
                    <div className="relative my-4">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-300"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-white text-gray-500">Or</span>
                        </div>
                    </div>
                    <button 
                        onClick={loginAsDemo}
                        className="group relative w-full flex justify-center py-2 px-4 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                        <Icon name="user-secret" className="mr-2" />
                        Login as Demo User
                    </button>
                </>
            )}
        </>
    );
};

const ForgotPasswordForm: React.FC = () => {
    const { requestPasswordReset, backToLogin } = useAuth();
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        const success = await requestPasswordReset(email);
        if (!success) {
            setError('The provided email does not match the registered admin email.');
            setIsLoading(false);
        }
        // On success, auth context handles stage change.
    };

    return (
        <>
            <div className="text-center">
                <Icon name="question-circle" className="text-5xl text-[var(--primary-color)] mx-auto" />
                <h1 className="mt-4 text-3xl font-extrabold text-gray-900">Forgot Password</h1>
                <p className="mt-2 text-sm text-gray-600">Enter your admin email to begin the reset process.</p>
            </div>
            <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                <input type="email" placeholder="Administrator Email" required value={email} onChange={e => setEmail(e.target.value)} className="appearance-none relative block w-full px-3 py-2 border border-gray-300 rounded-md" />
                {error && <p className="text-sm text-red-600 text-center">{error}</p>}
                <button type="submit" disabled={isLoading} className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-[var(--primary-color)] filter hover:brightness-90 disabled:opacity-50">
                    {isLoading ? 'Verifying...' : 'Request Reset'}
                </button>
                <button type="button" onClick={backToLogin} className="w-full text-center text-sm text-gray-600 hover:underline">
                    Back to login
                </button>
            </form>
        </>
    );
};

const ResetPasswordForm: React.FC = () => {
    const { resetPassword, backToLogin, userEmail } = useAuth();
    const [newPassword, setNewPassword] = useState('');
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage('');
        setIsLoading(true);
        await resetPassword(newPassword);
        // Auth context will navigate away on success.
    };
    
    return (
         <>
            <div className="text-center">
                <Icon name="key" className="text-5xl text-[var(--primary-color)] mx-auto" />
                <h1 className="mt-4 text-3xl font-extrabold text-gray-900">Reset Your Password</h1>
                <p className="mt-2 text-sm text-gray-600">Enter a new password for your account associated with <strong>{userEmail}</strong>.</p>
            </div>
            <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                <input type="password" placeholder="Enter new password" required value={newPassword} onChange={e => setNewPassword(e.target.value)} className="appearance-none relative block w-full px-3 py-2 border border-gray-300 rounded-md" />
                {message && <p className="text-sm text-green-600 text-center">{message}</p>}
                <button type="submit" disabled={isLoading} className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-[var(--primary-color)] filter hover:brightness-90 disabled:opacity-50">
                    {isLoading ? 'Resetting...' : 'Set New Password'}
                </button>
                 <button type="button" onClick={backToLogin} className="w-full text-center text-sm text-gray-600 hover:underline">
                    Back to login
                </button>
            </form>
        </>
    );
};

const AdminLoginPage: React.FC = () => {
    const { authStage } = useAuth();
    const [dbError, setDbError] = useState<string | null>(null);

    useEffect(() => {
        const checkDbStatus = async () => {
            try {
                const response = await fetch('/api/system/db-status');
                const data = await response.json();
                if (data.status === 'error') {
                    setDbError(data.message);
                }
            } catch (err: any) {
                setDbError(err.message || 'Could not connect to the server to check database status.');
            }
        };

        // Only show db error on login/signup pages, not password reset flows
        if (authStage === 'login' || authStage === 'signup') {
            checkDbStatus();
        }
    }, [authStage]);


    const renderForm = () => {
        switch (authStage) {
            case 'signup': return <SignupForm />;
            case 'login': return <LoginForm />;
            case 'forgotPassword': return <ForgotPasswordForm />;
            case 'resetPassword': return <ResetPasswordForm />;
            default: return null; // Should not happen
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
            <div className="w-full max-w-md">
                {dbError && (
                    <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md mb-6 shadow-md" role="alert">
                        <div className="flex">
                            <div className="py-1"><Icon name="exclamation-triangle" className="h-6 w-6 text-red-500 mr-3" /></div>
                            <div>
                                <p className="font-bold">Database Connection Error</p>
                                <p className="text-sm mt-1 mb-2 font-mono bg-red-200 p-2 rounded">{dbError}</p>
                                <p className="text-sm">Please ensure your <code className="bg-gray-200 text-gray-800 p-1 rounded-sm">DATABASE_URL</code> environment variable is correctly configured for a MySQL database and that the server has been restarted.</p>
                            </div>
                        </div>
                    </div>
                )}
                <div className="p-8 space-y-6 bg-white rounded-lg shadow-md">
                    {renderForm()}
                </div>
            </div>
        </div>
    );
};

export default AdminLoginPage;