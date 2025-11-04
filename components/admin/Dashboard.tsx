import React, { useState, useEffect } from 'react';
import { useData } from '../../contexts/DataContext.tsx';
import Icon from '../Icon.tsx';
import { Job, ContentPost, Subscriber, ActivityLog, PlacementKey } from '../../types.ts';
// FIX: Corrected import to be extensionless to resolve module issues.
import { getEffectiveJobStatus } from '../../utils/jobUtils';
import { AdminTab } from './types.ts';
import EnhancedAnalyticsDashboard from './EnhancedAnalyticsDashboard.tsx';

const StatCard: React.FC<{ title: string; value: number | string; icon: string; color: string; onClick?: () => void; }> = ({ title, value, icon, color, onClick }) => (
    <div
        className={`bg-white p-6 rounded-lg shadow-sm flex items-center gap-4 ${onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}`}
        onClick={onClick}
    >
        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${color}`}>
            <Icon name={icon} className="text-white text-xl" />
        </div>
        <div>
            <div className="text-3xl font-bold text-gray-800">{value}</div>
            <div className="text-sm font-medium text-gray-500">{title}</div>
        </div>
    </div>
);

const Dashboard: React.FC<{ setActiveTab: (tab: AdminTab) => void }> = ({ setActiveTab }) => {
    const { 
        jobs, posts, subscribers, activityLogs, adSettings, toggleAdTest, demoUserSettings, securitySettings
    } = useData();
    // Fix: Use securitySettings.demoModeEnabled, not demoUserSettings
    const isDemoUser = securitySettings.demoModeEnabled;
    
    const [dbStatus, setDbStatus] = useState<'checking' | 'connected' | 'error'>('checking');
    const [dbError, setDbError] = useState<string | null>(null);
    const [view, setView] = useState<'overview' | 'analytics'>('overview');

    useEffect(() => {
        const checkConnection = async () => {
            try {
                const response = await fetch('/api/system/db-status');
                const data = await response.json();
                if (!response.ok) throw new Error(data.message || 'Failed to fetch status');
                if (data.status === 'connected') {
                    setDbStatus('connected');
                } else {
                    setDbStatus('error');
                    setDbError(data.message);
                }
            } catch (err: any) {
                setDbStatus('error');
                setDbError(err.message);
            }
        };
        checkConnection();
    }, []);


    const activeJobs = jobs.filter(job => getEffectiveJobStatus(job) === 'active' || getEffectiveJobStatus(job) === 'closing-soon');
    const closingSoonJobs = jobs.filter(job => getEffectiveJobStatus(job) === 'closing-soon');
    const publishedPosts = posts.filter(post => post.status === 'published');
    const activeSubscribers = subscribers.filter(sub => sub.status === 'active');
    
    const recentJobs = [...jobs].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5);
    const recentLogs = activityLogs.slice(0, 5);

    const placementLabels: Record<PlacementKey, string> = {
        headerAd: "Header Ad",
        sidebarAd: "Sidebar Ad",
        footerAd: "Footer Ad",
        inFeedJobsAd: "In-Feed (Jobs)",
        inFeedBlogAd: "In-Feed (Blog)",
        jobDetailTopAd: "Job Detail (Top)",
        blogDetailTopAd: "Blog Detail (Top)",
    };

    return (
        <div className="space-y-6">
            {dbStatus === 'error' && (
                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md" role="alert">
                    <div className="flex">
                        <div className="py-1"><Icon name="exclamation-triangle" className="h-6 w-6 text-red-500 mr-3" /></div>
                        <div>
                            <p className="font-bold">Critical Error: Database Connection Failed</p>
                            <p className="text-sm mt-1 mb-2 font-mono bg-red-200 p-2 rounded">{dbError || 'An unknown error occurred.'}</p>
                            <p className="text-sm">The admin panel may not function correctly. Please resolve the database configuration issue.</p>
                            <button
                                onClick={() => setActiveTab('database')}
                                className="mt-2 text-sm font-bold text-red-800 hover:underline"
                            >
                                Go to Database Configuration Guide &rarr;
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* View Toggle */}
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                <div className="flex bg-white rounded-lg shadow-sm border border-gray-200 p-1">
                    <button
                        onClick={() => setView('overview')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                            view === 'overview'
                                ? 'bg-blue-500 text-white'
                                : 'text-gray-700 hover:bg-gray-100'
                        }`}
                    >
                        <Icon name="th-large" className="inline mr-2" />
                        Overview
                    </button>
                    <button
                        onClick={() => setView('analytics')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                            view === 'analytics'
                                ? 'bg-blue-500 text-white'
                                : 'text-gray-700 hover:bg-gray-100'
                        }`}
                    >
                        <Icon name="chart-bar" className="inline mr-2" />
                        Analytics
                    </button>
                </div>
            </div>

            {view === 'analytics' ? (
                <EnhancedAnalyticsDashboard />
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <StatCard title="Active Jobs" value={activeJobs.length} icon="briefcase" color="bg-blue-500" onClick={() => setActiveTab('jobs')} />
                        <StatCard title="Closing Soon" value={closingSoonJobs.length} icon="hourglass-half" color="bg-yellow-500" onClick={() => setActiveTab('jobs')} />
                        <StatCard title="Published Posts" value={publishedPosts.length} icon="file-alt" color="bg-green-500" onClick={() => setActiveTab('posts')} />
                        <StatCard title="Active Subscribers" value={activeSubscribers.length} icon="users" color="bg-purple-500" onClick={() => setActiveTab('subscribers')} />
                    </div>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Recent Jobs */}
                        <div className="bg-white p-6 rounded-lg shadow-sm">
                            <h3 className="text-lg font-bold text-gray-700 mb-4">Recently Added Jobs</h3>
                            <ul className="space-y-3">
                                {recentJobs.length > 0 ? recentJobs.map(job => (
                                    <li key={job.id} className="text-sm text-gray-600 border-b pb-2 last:border-0 last:pb-0">
                                        <p className="font-semibold text-gray-800">{job.title}</p>
                                        <p className="text-xs text-gray-500">{job.department} - Last Date: {job.lastDate}</p>
                                    </li>
                                )) : <p className="text-sm text-gray-500">No jobs added yet.</p>}
                            </ul>
                        </div>

                        {/* Recent Activity */}
                         <div className="bg-white p-6 rounded-lg shadow-sm">
                            <h3 className="text-lg font-bold text-gray-700 mb-4">Recent Activity</h3>
                             <ul className="space-y-3">
                                {recentLogs.length > 0 ? recentLogs.map(log => (
                                     <li key={log.id} className="text-sm text-gray-600 border-b pb-2 last:border-0 last:pb-0">
                                        <p><span className="font-semibold text-gray-800">{log.action}:</span> {log.details}</p>
                                        <p className="text-xs text-gray-500">{new Date(log.timestamp).toLocaleString()}</p>
                                    </li>
                                )) : <p className="text-sm text-gray-500">No activity logged yet.</p>}
                            </ul>
                        </div>
                        
                        {/* Ad Placement A/B Testing */}
                        <div className="bg-white p-6 rounded-lg shadow-sm">
                            <h3 className="text-lg font-bold text-gray-700 mb-4 flex items-center gap-2">
                                <Icon name="vial" /> Ad Placement Test Mode
                            </h3>
                            <p className="text-sm text-gray-500 mb-4">
                                Toggle test mode to replace live ads with a placeholder, making it easy to verify placement without affecting ad revenue.
                            </p>
                            <div className="space-y-3">
                                {adSettings.activeTests && Object.keys(placementLabels).map(key => {
                                    const placementKey = key as PlacementKey;
                                    const isTestActive = adSettings.activeTests?.includes(placementKey);
                                    return (
                                        <label key={placementKey} className={`flex items-center justify-between p-2 rounded-md hover:bg-gray-50 ${isDemoUser ? 'cursor-not-allowed' : ''}`}>
                                            <span className="text-sm font-medium text-gray-600">{placementLabels[placementKey]}</span>
                                            <button 
                                                onClick={() => toggleAdTest(placementKey)}
                                                disabled={isDemoUser}
                                                title={isDemoUser ? "Test mode cannot be changed in demo" : "Toggle test mode"}
                                                className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${
                                                    isTestActive ? 'bg-[var(--primary-color)]' : 'bg-gray-200'
                                                } disabled:opacity-50 disabled:cursor-not-allowed`}
                                            >
                                                <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${
                                                    isTestActive ? 'translate-x-6' : 'translate-x-1'
                                                }`} />
                                            </button>
                                        </label>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default Dashboard;