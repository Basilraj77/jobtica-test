import React, { useState, useEffect, useCallback } from 'react';
import Icon from '../Icon.tsx';

const CodeBlock: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <pre className="bg-gray-800 text-white p-3 rounded-md text-sm overflow-x-auto">
        <code>{children}</code>
    </pre>
);

const DatabaseManagement: React.FC = () => {
    const [status, setStatus] = useState<'checking' | 'connected' | 'error'>('checking');
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    const checkConnection = useCallback(async () => {
        setStatus('checking');
        setErrorMsg(null);
        try {
            const response = await fetch('/api/system/db-status');
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'Failed to check status');
            }
            if (data.status === 'connected') {
                setStatus('connected');
            } else {
                setStatus('error');
                setErrorMsg(data.message);
            }
        } catch (err: any) {
            setStatus('error');
            setErrorMsg(err.message);
        }
    }, []);

    useEffect(() => {
        checkConnection();
    }, [checkConnection]);

    return (
        <div className="bg-white p-6 rounded-lg shadow-sm max-w-4xl mx-auto space-y-8">
            <h2 className="text-2xl font-bold text-gray-800">Database Management</h2>

            {/* Connection Status */}
            <div className="p-4 border rounded-lg">
                <h3 className="font-semibold text-lg text-gray-700 mb-2">Connection Status</h3>
                <div className="flex items-center justify-between">
                    {status === 'checking' && (
                        <div className="flex items-center gap-2 text-gray-600">
                            <Icon name="spinner" className="animate-spin" />
                            <span>Checking connection...</span>
                        </div>
                    )}
                    {status === 'connected' && (
                        <div className="flex items-center gap-2 text-green-600 font-semibold">
                            <Icon name="check-circle" />
                            <span>Successfully connected to the database.</span>
                        </div>
                    )}
                    {status === 'error' && (
                        <div className="text-red-600">
                            <div className="flex items-center gap-2 font-semibold">
                                <Icon name="exclamation-triangle" />
                                <span>Failed to connect to the database.</span>
                            </div>
                            {errorMsg && <p className="text-sm mt-1 ml-6 font-mono">{errorMsg}</p>}
                        </div>
                    )}
                    <button
                        onClick={checkConnection}
                        disabled={status === 'checking'}
                        className="bg-gray-200 text-gray-800 px-3 py-1.5 rounded-md hover:bg-gray-300 text-sm flex items-center gap-2 disabled:opacity-50"
                    >
                        <Icon name="sync-alt" /> Re-check
                    </button>
                </div>
            </div>
            
            {/* Compatibility Note */}
            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
                <div className="flex">
                    <div className="flex-shrink-0">
                        <Icon name="info-circle" className="h-5 w-5 text-blue-400" />
                    </div>
                    <div className="ml-3">
                        <p className="text-sm text-blue-700">
                            This application is built to use a <strong>MySQL</strong> database. While Neon is an excellent PostgreSQL provider, it is not directly compatible. To connect a database, you will need a MySQL-compatible connection string.
                        </p>
                    </div>
                </div>
            </div>

            {/* Configuration Guide */}
            <div>
                <h3 className="text-xl font-bold text-gray-700 mb-4">Configuration Guide</h3>
                <div className="space-y-6">
                    <div>
                        <h4 className="font-semibold text-lg text-gray-800">1. Get a MySQL Database</h4>
                        <p className="mt-1 text-gray-600">You'll need a MySQL database. For cloud hosting, services like <a href="https://planetscale.com/" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">PlanetScale</a>, <a href="https://railway.app/" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">Railway</a>, or your cloud provider's managed SQL service are great options. For local development, you can install MySQL Server directly.</p>
                    </div>

                    <div>
                        <h4 className="font-semibold text-lg text-gray-800">2. Find Your Connection String</h4>
                        <p className="mt-1 text-gray-600">From your database provider, get the connection string (sometimes called a DATABASE_URL). It will look like this:</p>
                        <CodeBlock>{`mysql://USER:PASSWORD@HOST:PORT/DATABASE`}</CodeBlock>
                    </div>

                    <div>
                        <h4 className="font-semibold text-lg text-gray-800">3. Set the Environment Variable</h4>
                        <p className="mt-1 text-gray-600">This variable must be named <code className="bg-gray-200 p-1 rounded-sm text-sm">DATABASE_URL</code> and set in the environment where your backend server is running.</p>
                        
                        <div className="mt-4 border p-4 rounded-md">
                            <h5 className="font-semibold text-gray-700 flex items-center gap-2"><Icon name="laptop-code" /> For Local Development</h5>
                            <p className="mt-1 text-sm text-gray-600">Create a file named <code className="bg-gray-200 p-1 rounded-sm">.env</code> in the root of your project and add the following line:</p>
                            <CodeBlock>{`DATABASE_URL="mysql://root:password@localhost:3306/jobtica"`}</CodeBlock>
                        </div>
                        
                        <div className="mt-4 border p-4 rounded-md">
                             <h5 className="font-semibold text-gray-700 flex items-center gap-2"><Icon name="cloud" /> For Render Deployment</h5>
                             <ol className="list-decimal list-inside mt-1 text-sm text-gray-600 space-y-1">
                                <li>Go to your backend service dashboard on Render.</li>
                                <li>Click on the "Environment" tab.</li>
                                <li>Under "Environment Variables", click "Add Environment Variable".</li>
                                <li>Use the key <code className="bg-gray-200 p-1 rounded-sm">DATABASE_URL</code> and paste your full connection string as the value.</li>
                                <li>If you are using Render's own database service, this variable may be automatically injected for you.</li>
                             </ol>
                        </div>
                    </div>

                    <div>
                        <h4 className="font-semibold text-lg text-gray-800">4. Restart and Verify</h4>
                        <p className="mt-1 text-gray-600">After setting the environment variable, you must restart your backend server for the change to take effect. Once restarted, click the "Re-check" button at the top of this page to verify the connection.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DatabaseManagement;