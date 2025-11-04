import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext.tsx';
import Icon from '../components/Icon.tsx';
import Dashboard from '../components/admin/Dashboard.tsx';
import JobManagement from '../components/admin/JobManagement.tsx';
import ContentPostManagement from '../components/admin/ContentPostManagement.tsx';
import SubscriberManagement from '../components/admin/SubscriberManagement.tsx';
import QuickLinkManagement from '../components/admin/QuickLinkManagement.tsx';
import BreakingNewsManagement from '../components/admin/BreakingNewsManagement.tsx';
import ContactManagement from '../components/admin/ContactManagement.tsx';
import SettingsManagement from '../components/admin/SettingsManagement.tsx';
import UserProfile from '../components/admin/UserProfile.tsx';
import ExamNoticeManagement from '../components/admin/ExamNoticeManagement.tsx';
import ResultManagement from '../components/admin/ResultManagement.tsx';
import EmailMarketing from '../components/admin/EmailMarketing.tsx';
import NotificationHistory from '../components/admin/NotificationHistory.tsx';
import SecurityLogs from '../components/admin/SecurityLogs.tsx';
import { useData } from '../contexts/DataContext.tsx';
import SponsoredAdManagement from '../components/admin/SponsoredAdManagement.tsx';
import PopupAdManagement from '../components/admin/PopupAdManagement.tsx';
import EmailTemplateManagement from '../components/admin/EmailTemplateManagement.tsx';
import PreparationManagement from '../components/admin/PreparationManagement.tsx';
import DatabaseManagement from '../components/admin/DatabaseManagement.tsx';
import { AdminTab } from '../components/admin/types.ts';

const AdminPanel: React.FC = () => {
    const { logout } = useAuth();
    const { generalSettings, securitySettings, demoUserSettings } = useData();
    // Fix: Use securitySettings.demoModeEnabled, not demoUserSettings
    const isDemoUser = securitySettings.demoModeEnabled;
    const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const logoutTimer = useRef<number | null>(null);

    const resetLogoutTimer = useCallback(() => {
        if (logoutTimer.current) {
            clearTimeout(logoutTimer.current);
        }

        let timeoutMinutes = 0;
        if (isDemoUser && securitySettings.demoSessionTimeoutMinutes > 0) {
            timeoutMinutes = securitySettings.demoSessionTimeoutMinutes;
        } else if (!isDemoUser && securitySettings.autoLogoutMinutes > 0) {
            timeoutMinutes = securitySettings.autoLogoutMinutes;
        }

        if (timeoutMinutes > 0) {
            logoutTimer.current = window.setTimeout(() => {
                logout();
            }, timeoutMinutes * 60 * 1000);
        }
    }, [logout, isDemoUser, securitySettings.autoLogoutMinutes, securitySettings.demoSessionTimeoutMinutes]);

    useEffect(() => {
        const events = ['mousemove', 'keydown', 'mousedown', 'touchstart'];
        
        events.forEach(event => {
            window.addEventListener(event, resetLogoutTimer);
        });
        
        resetLogoutTimer(); // Start the timer on component mount

        return () => {
            events.forEach(event => {
                window.removeEventListener(event, resetLogoutTimer);
            });
            if (logoutTimer.current) {
                clearTimeout(logoutTimer.current);
            }
        };
    }, [resetLogoutTimer]);

    const renderContent = () => {
        switch (activeTab) {
            case 'dashboard': return <Dashboard setActiveTab={setActiveTab} />;
            case 'jobs': return <JobManagement />;
            case 'posts': return <ContentPostManagement />;
            case 'exam-notices': return <ExamNoticeManagement />;
            case 'results': return <ResultManagement />;
            case 'exam-prep': return <PreparationManagement />;
            case 'quick-links': return <QuickLinkManagement />;
            case 'breaking-news': return <BreakingNewsManagement />;
            case 'subscribers': return <SubscriberManagement />;
            case 'contacts': return <ContactManagement />;
            case 'email-marketing': return <EmailMarketing />;
            case 'email-templates': return <EmailTemplateManagement />;
            case 'sponsored-ads': return <SponsoredAdManagement />;
            case 'popup-ad': return <PopupAdManagement />;
            case 'alerts': return <SettingsManagement defaultTab="alerts" />;
            case 'notification-history': return <NotificationHistory />;
            case 'settings': return <SettingsManagement />;
            case 'database': return <DatabaseManagement />;
            case 'theme': return <SettingsManagement defaultTab="theme" />;
            case 'security': return <SettingsManagement defaultTab="security" />;
            case 'profile': return <UserProfile />;
            case 'activity-logs': return <SecurityLogs />;
            default: return <Dashboard setActiveTab={setActiveTab} />;
        }
    };
    
    const NavLink: React.FC<{ tab: AdminTab; icon: string; label: string; permission?: boolean }> = ({ tab, icon, label, permission = true }) => {
        if (!permission) {
            return (
                <div className="flex items-center w-full px-3 py-2 text-sm rounded-md text-gray-500 cursor-not-allowed">
                    <Icon name={icon} className="w-6 mr-3" />
                    <span>{label}</span>
                </div>
            );
        }
        return (
            <button
                onClick={() => { setActiveTab(tab); setIsSidebarOpen(false); }}
                className={`flex items-center w-full px-3 py-2 text-sm rounded-md transition-colors ${activeTab === tab ? 'bg-[var(--primary-color)] text-white' : 'text-white opacity-75 hover:opacity-100 hover:bg-gray-700'}`}
            >
                <Icon name={icon} className="w-6 mr-3" />
                <span>{label}</span>
            </button>
        );
    };

    return (
        <div className="flex h-screen bg-gray-100 font-sans">
            {/* Sidebar */}
            <aside className={`bg-gray-800 text-white w-64 fixed inset-y-0 left-0 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 transition-transform duration-200 ease-in-out z-30`}>
                <div className="p-4 flex items-center gap-3 border-b border-gray-700">
                    {generalSettings.siteIconUrl && <img src={generalSettings.siteIconUrl} alt="Logo" className="h-8 w-8 rounded-full" />}
                    <h1 className="text-xl font-bold">{generalSettings.siteTitle}</h1>
                </div>
                <nav className="p-2 space-y-1">
                    <NavLink tab="dashboard" icon="tachometer-alt" label="Dashboard" />
                    <div className="pt-2">
                        <h2 className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Content</h2>
                        <NavLink tab="jobs" icon="briefcase" label="Job Listings" permission={!isDemoUser || demoUserSettings.canManageJobs} />
                        <NavLink tab="posts" icon="file-alt" label="General Posts" permission={!isDemoUser || demoUserSettings.canManageContent} />
                        <NavLink tab="exam-notices" icon="bell" label="Exam Notices" permission={!isDemoUser || demoUserSettings.canManageContent} />
                        <NavLink tab="results" icon="poll" label="Results" permission={!isDemoUser || demoUserSettings.canManageContent} />
                        <NavLink tab="exam-prep" icon="graduation-cap" label="Exam Prep" permission={!isDemoUser || demoUserSettings.canManageContent} />
                        <NavLink tab="quick-links" icon="link" label="Quick Links" permission={!isDemoUser || demoUserSettings.canManageLinks} />
                        <NavLink tab="breaking-news" icon="newspaper" label="Breaking News" permission={!isDemoUser || demoUserSettings.canManageLinks} />
                    </div>
                     <div className="pt-2">
                        <h2 className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Audience</h2>
                        <NavLink tab="subscribers" icon="users" label="Subscribers" permission={!isDemoUser || demoUserSettings.canManageAudience} />
                        <NavLink tab="contacts" icon="envelope" label="Contact Messages" permission={!isDemoUser || demoUserSettings.canManageAudience} />
                    </div>
                     <div className="pt-2">
                        <h2 className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Marketing</h2>
                        <NavLink tab="email-marketing" icon="paper-plane" label="Email Campaigns" permission={!isDemoUser || demoUserSettings.canSendEmails} />
                        <NavLink tab="email-templates" icon="envelope-open-text" label="Email Templates" permission={!isDemoUser || demoUserSettings.canSendEmails} />
                        <NavLink tab="sponsored-ads" icon="dollar-sign" label="Sponsored Ads" permission={!isDemoUser || demoUserSettings.canManageAds} />
                        <NavLink tab="popup-ad" icon="window-maximize" label="Popup Ad" permission={!isDemoUser || demoUserSettings.canManageAds} />
                        <NavLink tab="alerts" icon="bullhorn" label="Alerts" permission={!isDemoUser} />
                        <NavLink tab="notification-history" icon="history" label="Notification History" permission={!isDemoUser} />
                    </div>
                    <div className="pt-2">
                        <h2 className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">System</h2>
                        <NavLink tab="settings" icon="cogs" label="Settings" permission={!isDemoUser} />
                        <NavLink tab="database" icon="database" label="Database" permission={!isDemoUser} />
                        <NavLink tab="theme" icon="palette" label="Theme" permission={!isDemoUser || demoUserSettings.canChangeTheme} />
                        <NavLink tab="security" icon="shield-alt" label="Security" permission={!isDemoUser} />
                        <NavLink tab="profile" icon="user-circle" label="Admin Profile" permission={!isDemoUser} />
                        <NavLink tab="activity-logs" icon="file-contract" label="Activity Logs" permission={!isDemoUser} />
                    </div>
                </nav>
            </aside>

            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Header */}
                <header className="bg-white shadow-sm z-20 flex justify-between items-center p-4">
                    <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="text-gray-600 md:hidden">
                        <Icon name="bars" className="text-2xl" />
                    </button>
                    <h2 className="text-2xl font-bold text-gray-800 capitalize">{activeTab.replace('-', ' ')}</h2>
                    <button onClick={logout} className="flex items-center gap-2 text-sm text-gray-600 hover:text-[var(--primary-color)]">
                        <Icon name="sign-out-alt" />
                        <span>Logout</span>
                    </button>
                </header>
                
                {isDemoUser && (
                  <div className="bg-yellow-400 text-black text-sm p-2 text-center font-semibold shadow-inner">
                      <Icon name="user-secret" className="mr-2" />
                      You are in Demo Mode. Some actions are restricted.
                  </div>
                )}
                
                {/* Main Content */}
                <main id="admin-main-content" className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
                    {renderContent()}
                </main>
            </div>
        </div>
    );
};

export default AdminPanel;