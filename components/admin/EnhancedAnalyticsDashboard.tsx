import React, { useState, useEffect, useRef } from 'react';
import {
    LineChart, Line, BarChart, Bar, AreaChart, Area, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';
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

interface VisitorAnalytics {
    visitorTrend: Array<{ date: string; visitors: number }>;
    topPages: Array<{ page: string; views: number }>;
    topReferrers: Array<{ referrer: string; count: number }>;
    totalVisits: number;
}

interface RevenueData {
    date: string;
    revenue: number;
    transactions: number;
}

interface Notification {
    id: string;
    type: 'critical' | 'warning' | 'info';
    message: string;
    timestamp: string;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

const MetricCard: React.FC<{
    title: string;
    value: string | number;
    icon: string;
    color: string;
    trend?: string;
    subtitle?: string;
    alert?: boolean;
}> = ({ title, value, icon, color, trend, subtitle, alert }) => (
    <div className={`bg-white rounded-lg shadow-sm p-6 border ${alert ? 'border-red-300' : 'border-gray-100'} ${alert ? 'animate-pulse' : ''}`}>
        <div className="flex items-start justify-between">
            <div className="flex-1">
                <p className="text-sm font-medium text-gray-500">{title}</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
                {subtitle && (
                    <p className="text-xs text-gray-400 mt-1">{subtitle}</p>
                )}
                {trend && (
                    <p className={`text-xs mt-1 flex items-center ${trend.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                        <Icon name={trend.startsWith('+') ? 'arrow-up' : 'arrow-down'} className="mr-1 text-xs" />
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

const EnhancedAnalyticsDashboard: React.FC = () => {
    const [realtimeStats, setRealtimeStats] = useState<RealtimeStats | null>(null);
    const [performance, setPerformance] = useState<PerformanceMetrics | null>(null);
    const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);
    const [visitorAnalytics, setVisitorAnalytics] = useState<VisitorAnalytics | null>(null);
    const [loading, setLoading] = useState(true);
    const [timeRange, setTimeRange] = useState<number>(7);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [showNotifications, setShowNotifications] = useState(false);
    const intervalRef = useRef<number | null>(null);
    const notificationCheckRef = useRef<number | null>(null);

    // Simulated revenue data (replace with real API call)
    const [revenueData, setRevenueData] = useState<RevenueData[]>([]);

    const fetchAnalytics = async () => {
        try {
            const [realtimeRes, perfRes, healthRes, visitorsRes] = await Promise.all([
                fetch('/api/analytics/realtime'),
                fetch('/api/analytics/performance'),
                fetch('/api/analytics/system-health'),
                fetch(`/api/analytics/visitors?days=${timeRange}`)
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
                
                // Check for critical alerts
                checkSystemAlerts(data);
            }

            if (visitorsRes.ok) {
                const data = await visitorsRes.json();
                setVisitorAnalytics(data);
            }

            setLoading(false);
        } catch (error) {
            console.error('Failed to fetch analytics:', error);
            setLoading(false);
        }
    };

    const checkSystemAlerts = (health: SystemHealth) => {
        const newNotifications: Notification[] = [];
        
        // Memory alert
        if (health.memory.percentage > 80) {
            newNotifications.push({
                id: `mem-${Date.now()}`,
                type: 'critical',
                message: `High memory usage: ${health.memory.percentage}%`,
                timestamp: new Date().toISOString()
            });
        }
        
        // Error rate alert
        if (health.errors.lastHour > 10) {
            newNotifications.push({
                id: `err-${Date.now()}`,
                type: 'warning',
                message: `High error rate: ${health.errors.lastHour} errors in the last hour`,
                timestamp: new Date().toISOString()
            });
        }
        
        // Database slow response
        if (health.database.responseTime && parseInt(health.database.responseTime) > 200) {
            newNotifications.push({
                id: `db-${Date.now()}`,
                type: 'warning',
                message: `Slow database response: ${health.database.responseTime}`,
                timestamp: new Date().toISOString()
            });
        }
        
        if (newNotifications.length > 0) {
            setNotifications(prev => [...newNotifications, ...prev].slice(0, 20));
        }
    };

    const generateRevenueData = () => {
        // Simulated revenue data - replace with actual API
        const data: RevenueData[] = [];
        for (let i = timeRange - 1; i >= 0; i--) {
            const date = format(subDays(new Date(), i), 'yyyy-MM-dd');
            data.push({
                date,
                revenue: Math.floor(Math.random() * 5000) + 1000,
                transactions: Math.floor(Math.random() * 100) + 10
            });
        }
        setRevenueData(data);
    };

    useEffect(() => {
        fetchAnalytics();
        generateRevenueData();

        // Refresh every 10 seconds
        intervalRef.current = window.setInterval(() => {
            fetchAnalytics();
        }, 10000);

        // Check for notifications every 30 seconds
        notificationCheckRef.current = window.setInterval(() => {
            if (systemHealth) {
                checkSystemAlerts(systemHealth);
            }
        }, 30000);

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
            if (notificationCheckRef.current) {
                clearInterval(notificationCheckRef.current);
            }
        };
    }, [timeRange]);

    const exportToCSV = () => {
        if (!visitorAnalytics) return;
        
        const csv = [
            ['Date', 'Visitors'],
            ...visitorAnalytics.visitorTrend.map(d => [d.date, d.visitors.toString()])
        ].map(row => row.join(',')).join('\n');
        
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `analytics-${format(new Date(), 'yyyy-MM-dd')}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
    };

    const exportToJSON = () => {
        const data = {
            realtime: realtimeStats,
            performance,
            systemHealth,
            visitors: visitorAnalytics,
            revenue: revenueData,
            exportedAt: new Date().toISOString()
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `analytics-${format(new Date(), 'yyyy-MM-dd')}.json`;
        a.click();
        window.URL.revokeObjectURL(url);
    };

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

    const criticalNotifications = notifications.filter(n => n.type === 'critical');

    return (
        <div className="space-y-6">
            {/* Header with Controls */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Real-time Analytics Dashboard</h2>
                    <p className="text-sm text-gray-500 mt-1">
                        Last updated: {realtimeStats?.lastUpdated ? new Date(realtimeStats.lastUpdated).toLocaleTimeString() : '-'}
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    {/* Time Range Selector */}
                    <select
                        value={timeRange}
                        onChange={(e) => setTimeRange(parseInt(e.target.value))}
                        className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value={7}>Last 7 days</option>
                        <option value={14}>Last 14 days</option>
                        <option value={30}>Last 30 days</option>
                        <option value={90}>Last 90 days</option>
                    </select>

                    {/* Export Dropdown */}
                    <div className="relative group">
                        <button className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 transition-colors flex items-center gap-2">
                            <Icon name="download" />
                            Export
                        </button>
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                            <button
                                onClick={exportToCSV}
                                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 rounded-t-lg flex items-center gap-2"
                            >
                                <Icon name="file-csv" />
                                Export as CSV
                            </button>
                            <button
                                onClick={exportToJSON}
                                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 rounded-b-lg flex items-center gap-2"
                            >
                                <Icon name="file-code" />
                                Export as JSON
                            </button>
                        </div>
                    </div>

                    {/* Notifications Bell */}
                    <button
                        onClick={() => setShowNotifications(!showNotifications)}
                        className="relative px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200 transition-colors"
                    >
                        <Icon name="bell" />
                        {criticalNotifications.length > 0 && (
                            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                                {criticalNotifications.length}
                            </span>
                        )}
                    </button>

                    {/* Live Status */}
                    <div className="flex items-center space-x-2 px-3 py-2 bg-green-50 rounded-lg">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-sm text-green-700 font-medium">Live</span>
                    </div>
                </div>
            </div>

            {/* Notifications Panel */}
            {showNotifications && notifications.length > 0 && (
                <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold text-gray-900">System Notifications</h3>
                        <button
                            onClick={() => setNotifications([])}
                            className="text-sm text-gray-500 hover:text-gray-700"
                        >
                            Clear all
                        </button>
                    </div>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                        {notifications.map(notification => (
                            <div
                                key={notification.id}
                                className={`p-3 rounded-lg flex items-start gap-3 ${
                                    notification.type === 'critical' ? 'bg-red-50 border-l-4 border-red-500' :
                                    notification.type === 'warning' ? 'bg-yellow-50 border-l-4 border-yellow-500' :
                                    'bg-blue-50 border-l-4 border-blue-500'
                                }`}
                            >
                                <Icon
                                    name={notification.type === 'critical' ? 'exclamation-circle' : 
                                          notification.type === 'warning' ? 'exclamation-triangle' : 'info-circle'}
                                    className={`text-xl ${
                                        notification.type === 'critical' ? 'text-red-600' :
                                        notification.type === 'warning' ? 'text-yellow-600' :
                                        'text-blue-600'
                                    }`}
                                />
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-gray-900">{notification.message}</p>
                                    <p className="text-xs text-gray-500 mt-1">
                                        {new Date(notification.timestamp).toLocaleString()}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Real-time Metrics Grid */}
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
                    alert={(performance?.avgResponseTime || 0) > 500}
                />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Visitor Trend Chart */}
                <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Visitor Trend</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={visitorAnalytics?.visitorTrend || []}>
                            <defs>
                                <linearGradient id="colorVisitors" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis 
                                dataKey="date" 
                                stroke="#6b7280"
                                style={{ fontSize: '12px' }}
                            />
                            <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} />
                            <Tooltip 
                                contentStyle={{ 
                                    backgroundColor: 'white', 
                                    border: '1px solid #e5e7eb',
                                    borderRadius: '0.5rem'
                                }}
                            />
                            <Area 
                                type="monotone" 
                                dataKey="visitors" 
                                stroke="#3b82f6" 
                                fillOpacity={1} 
                                fill="url(#colorVisitors)" 
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                {/* Revenue Analytics Chart */}
                <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Analytics</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={revenueData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis 
                                dataKey="date" 
                                stroke="#6b7280"
                                style={{ fontSize: '12px' }}
                            />
                            <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} />
                            <Tooltip 
                                contentStyle={{ 
                                    backgroundColor: 'white', 
                                    border: '1px solid #e5e7eb',
                                    borderRadius: '0.5rem'
                                }}
                            />
                            <Legend />
                            <Line 
                                type="monotone" 
                                dataKey="revenue" 
                                stroke="#10b981" 
                                strokeWidth={2}
                                dot={{ fill: '#10b981' }}
                            />
                            <Line 
                                type="monotone" 
                                dataKey="transactions" 
                                stroke="#8b5cf6" 
                                strokeWidth={2}
                                dot={{ fill: '#8b5cf6' }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Top Pages and Referrers */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top Pages */}
                <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Pages</h3>
                    {visitorAnalytics && visitorAnalytics.topPages.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={visitorAnalytics.topPages.slice(0, 5)} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                <XAxis type="number" stroke="#6b7280" style={{ fontSize: '12px' }} />
                                <YAxis 
                                    dataKey="page" 
                                    type="category" 
                                    width={150}
                                    stroke="#6b7280"
                                    style={{ fontSize: '11px' }}
                                />
                                <Tooltip 
                                    contentStyle={{ 
                                        backgroundColor: 'white', 
                                        border: '1px solid #e5e7eb',
                                        borderRadius: '0.5rem'
                                    }}
                                />
                                <Bar dataKey="views" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <p className="text-sm text-gray-500 text-center py-8">No page data available</p>
                    )}
                </div>

                {/* Top Referrers */}
                <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Traffic Sources</h3>
                    {visitorAnalytics && visitorAnalytics.topReferrers.length > 0 ? (
                        <div className="space-y-3">
                            {visitorAnalytics.topReferrers.slice(0, 5).map((ref, index) => (
                                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <div className="flex items-center gap-3 flex-1 min-w-0">
                                        <div 
                                            className="w-8 h-8 rounded-full flex items-center justify-center text-white font-semibold text-sm"
                                            style={{ backgroundColor: COLORS[index % COLORS.length] }}
                                        >
                                            {index + 1}
                                        </div>
                                        <span className="text-sm font-medium text-gray-700 truncate">{ref.referrer || 'Direct'}</span>
                                    </div>
                                    <span className="text-sm font-bold text-gray-900">{ref.count}</span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-gray-500 text-center py-8">No referrer data available</p>
                    )}
                </div>
            </div>

            {/* System Health */}
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">System Health</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Database Status */}
                    <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                            <Icon name="database" className="text-green-600 text-xl" />
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-gray-900">Database</p>
                            <p className="text-xs text-gray-500">
                                {systemHealth?.database.status || 'Unknown'} - {systemHealth?.database.responseTime || '-'}
                            </p>
                        </div>
                    </div>

                    {/* API Status */}
                    <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                            <Icon name="server" className="text-blue-600 text-xl" />
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-gray-900">API Server</p>
                            <p className="text-xs text-gray-500">
                                {systemHealth?.api.status || 'Unknown'} - Uptime: {formatUptime(systemHealth?.api.uptime || 0)}
                            </p>
                        </div>
                    </div>

                    {/* Memory Usage */}
                    <div className="flex items-center space-x-4">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                            (systemHealth?.memory.percentage || 0) > 80 ? 'bg-red-100' : 'bg-purple-100'
                        }`}>
                            <Icon name="memory" className={`text-xl ${
                                (systemHealth?.memory.percentage || 0) > 80 ? 'text-red-600' : 'text-purple-600'
                            }`} />
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-gray-900">Memory</p>
                            <p className="text-xs text-gray-500">
                                {systemHealth?.memory.used || 0}MB / {systemHealth?.memory.total || 0}MB ({systemHealth?.memory.percentage || 0}%)
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Activity Stream and Error Monitor */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Activity */}
                <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
                    <div className="space-y-3 max-h-80 overflow-y-auto">
                        {realtimeStats?.recentActivity && realtimeStats.recentActivity.length > 0 ? (
                            realtimeStats.recentActivity.map((activity, index) => (
                                <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
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
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                                (systemHealth?.errors.lastHour || 0) > 10 ? 'bg-red-100' : 'bg-green-100'
                            }`}>
                                <Icon name="exclamation-triangle" className={`text-xl ${
                                    (systemHealth?.errors.lastHour || 0) > 10 ? 'text-red-600' : 'text-green-600'
                                }`} />
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

            {/* Performance Summary */}
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

export default EnhancedAnalyticsDashboard;
