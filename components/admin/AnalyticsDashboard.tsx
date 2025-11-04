import React, { useState, useEffect, useRef } from 'react';
import Icon from '../Icon.tsx';

interface RealtimeStats {
    activeVisitors: number;
    todayVisitors: number;
    pageViews: number;
    recentActivity: any[];
    lastUpdated: string;
}

interface PerformanceMetrics {
    totalRequests: number;
    avgResponseTime: number;
    last24Hours: number;
}

interface SystemHealth {
    database: {
        status: string;
        responseTime: string;
    };
    api: {
        status: string;
        uptime: number;
    };
    memory: {
        used: number;
        total: number;
        percentage: number;
    };
    errors: {
        lastHour: number;
        recent: any[];
    };
}

const MetricCard: React.FC<{
    title: string;
    value: string | number;
    icon: string;
    color: string;
    trend?: string;
    subtitle?: string;
}> = ({ title, value, icon, color, trend, subtitle }) => (
    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
        <div className="flex items-start justify-between">
            <div>
                <p className="text-sm font-medium text-gray-500">{title}</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
                {subtitle && (
                    <p className="text-xs text-gray-400 mt-1">{subtitle}</p>
                )}
                {trend && (
                    <p className="text-xs text-green-600 mt-1 flex items-center">
                        <Icon name="arrow-up" className="mr-1" />
                        {trend}
                    </p>
                )}
            </div>
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${color}`}>
                <Icon name={icon} className="text-white text-xl" />
            </div>
        </div>
    </div>
);

const AnalyticsDashboard: React.FC = () => {
    const [realtimeStats, setRealtimeStats] = useState<RealtimeStats | null>(null);
    const [performance, setPerformance] = useState<PerformanceMetrics | null>(null);
    const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);
    const [loading, setLoading] = useState(true);
    const intervalRef = useRef<number | null>(null);

    const fetchAnalytics = async () => {
        try {
            const [realtimeRes, perfRes, healthRes] = await Promise.all([
                fetch('/api/analytics/realtime'),
                fetch('/api/analytics/performance'),
                fetch('/api/analytics/system-health')
            ]);

            if (realtimeRes.ok) {
                const data = await realtimeRes.json();
                setRealtimeStats(data);
            }

            if (perfRes.ok) {
                const data = await perfRes.json();
                setPerformance(data);
            }

            if (healthRes.ok) {
                const data = await healthRes.json();
                setSystemHealth(data);
            }

            setLoading(false);
        } catch (error) {
            console.error('Failed to fetch analytics:', error);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAnalytics();

        // Refresh every 10 seconds
        intervalRef.current = window.setInterval(() => {
            fetchAnalytics();
        }, 10000);

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <Icon name="spinner" className="animate-spin text-4xl text-blue-500 mb-4" />
                    <p className="text-gray-500">Loading analytics...</p>
                </div>
            </div>
        );
    }

    const formatUptime = (seconds: number) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        return `${hours}h ${minutes}m`;
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Real-time Analytics</h2>
                    <p className="text-sm text-gray-500 mt-1">
                        Last updated: {realtimeStats?.lastUpdated ? new Date(realtimeStats.lastUpdated).toLocaleTimeString() : '-'}
                    </p>
                </div>
                <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm text-gray-600">Live</span>
                </div>
            </div>

            {/* Real-time Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <MetricCard
                    title="Active Visitors"
                    value={realtimeStats?.activeVisitors || 0}
                    icon="users"
                    color="bg-blue-500"
                    subtitle="Currently online"
                />
                <MetricCard
                    title="Today's Visitors"
                    value={realtimeStats?.todayVisitors || 0}
                    icon="chart-line"
                    color="bg-green-500"
                    trend="+12% from yesterday"
                />
                <MetricCard
                    title="Page Views"
                    value={realtimeStats?.pageViews || 0}
                    icon="eye"
                    color="bg-purple-500"
                    subtitle="Total today"
                />
                <MetricCard
                    title="Avg Response Time"
                    value={`${performance?.avgResponseTime || 0}ms`}
                    icon="tachometer-alt"
                    color="bg-yellow-500"
                    subtitle="Last 24 hours"
                />
            </div>

            {/* System Health */}
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">System Health</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Database Status */}
                    <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                            <Icon name="database" className="text-green-600" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-900">Database</p>
                            <p className="text-xs text-gray-500">
                                {systemHealth?.database.status || 'Unknown'} - {systemHealth?.database.responseTime || '-'}
                            </p>
                        </div>
                    </div>

                    {/* API Status */}
                    <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <Icon name="server" className="text-blue-600" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-900">API Server</p>
                            <p className="text-xs text-gray-500">
                                {systemHealth?.api.status || 'Unknown'} - Uptime: {formatUptime(systemHealth?.api.uptime || 0)}
                            </p>
                        </div>
                    </div>

                    {/* Memory Usage */}
                    <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                            <Icon name="memory" className="text-purple-600" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-900">Memory</p>
                            <p className="text-xs text-gray-500">
                                {systemHealth?.memory.used || 0}MB / {systemHealth?.memory.total || 0}MB ({systemHealth?.memory.percentage || 0}%)
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Performance Metrics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Activity */}
                <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
                    <div className="space-y-3 max-h-80 overflow-y-auto">
                        {realtimeStats?.recentActivity && realtimeStats.recentActivity.length > 0 ? (
                            realtimeStats.recentActivity.map((activity, index) => (
                                <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                                    <Icon name="circle" className="text-xs text-blue-500 mt-1" />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-900 truncate">
                                            {activity.action}
                                        </p>
                                        <p className="text-xs text-gray-500 truncate">
                                            {new Date(activity.timestamp).toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-sm text-gray-500 text-center py-8">No recent activity</p>
                        )}
                    </div>
                </div>

                {/* Error Monitor */}
                <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Error Monitor</h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <div>
                                <p className="text-sm font-medium text-gray-900">Errors (Last Hour)</p>
                                <p className="text-2xl font-bold text-gray-900 mt-1">
                                    {systemHealth?.errors.lastHour || 0}
                                </p>
                            </div>
                            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                                <Icon name="exclamation-triangle" className="text-red-600 text-xl" />
                            </div>
                        </div>

                        {systemHealth?.errors.recent && systemHealth.errors.recent.length > 0 && (
                            <div className="space-y-2 max-h-48 overflow-y-auto">
                                {systemHealth.errors.recent.map((error, index) => (
                                    <div key={index} className="p-3 bg-red-50 border-l-4 border-red-500 rounded">
                                        <p className="text-xs font-medium text-red-900">{error.action}</p>
                                        <p className="text-xs text-red-700 mt-1">
                                            {new Date(error.timestamp).toLocaleString()}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Summary</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                        <p className="text-sm text-gray-500">Total Requests (24h)</p>
                        <p className="text-2xl font-bold text-gray-900 mt-1">{performance?.totalRequests || 0}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Activity Logs (24h)</p>
                        <p className="text-2xl font-bold text-gray-900 mt-1">{performance?.last24Hours || 0}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">System Status</p>
                        <p className="text-2xl font-bold text-green-600 mt-1 flex items-center">
                            <Icon name="check-circle" className="mr-2" />
                            Healthy
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AnalyticsDashboard;
