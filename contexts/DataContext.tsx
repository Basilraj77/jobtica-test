import React, { createContext, useContext, ReactNode, useCallback, useState, useEffect } from 'react';
import { 
    Job, QuickLink, ContentPost, Subscriber, BreakingNews, AdSettings, SEOSettings, GeneralSettings, 
    SocialMediaSettings, SMTPSettings, ActivityLog, ContactSubmission, EmailNotification, CustomEmail, 
    RSSSettings, AlertSettings, SponsoredAd, PlacementKey, PopupAdSettings, ThemeSettings,
    SecuritySettings, DemoUserSettings, EmailTemplate, GoogleSearchConsoleSettings, PreparationCourse, PreparationBook, UpcomingExam, BackupData
} from '../types.ts';
import {
    initialAdSettings,
    initialAlertSettings,
    initialDemoUserSettings,
    initialGeneralSettings,
    initialGoogleSearchConsoleSettings,
    initialPopupAdSettings,
    initialRssSettings,
    initialSecuritySettings,
    initialSeoSettings,
    initialSmtpSettings,
    initialSocialMediaSettings,
    initialThemeSettings
} from '../constants.ts';


// Helper for API calls
async function apiCall<T>(endpoint: string, method: string = 'GET', body?: any): Promise<T> {
    const response = await fetch(`/api${endpoint.startsWith('/') ? '' : '/'}${endpoint}`, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: body ? JSON.stringify(body) : undefined,
    });
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: response.statusText }));
        throw new Error(errorData.message || `API call to ${endpoint} failed with status ${response.status}`);
    }
    if (response.status === 204) {
        return {} as T;
    }
    return response.json();
}


// Define initial empty state
const getInitialState = (): BackupData => ({
    jobs: [], 
    quickLinks: [], 
    posts: [], 
    subscribers: [], 
    breakingNews: [],
    activityLogs: [], 
    sponsoredAds: [], 
    contacts: [], 
    emailNotifications: [],
    customEmails: [], 
    emailTemplates: [], 
    preparationCourses: [], 
    preparationBooks: [],
    upcomingExams: [],
    adSettings: initialAdSettings, 
    seoSettings: initialSeoSettings, 
    generalSettings: initialGeneralSettings, 
    socialMediaSettings: initialSocialMediaSettings, 
    smtpSettings: initialSmtpSettings, 
    rssSettings: initialRssSettings, 
    alertSettings: initialAlertSettings, 
    popupAdSettings: initialPopupAdSettings, 
    themeSettings: initialThemeSettings, 
    securitySettings: initialSecuritySettings, 
    demoUserSettings: initialDemoUserSettings,
    googleSearchConsoleSettings: initialGoogleSearchConsoleSettings
});


interface DataContextType {
  isLoading: boolean;
  jobs: Job[];
  addJob: (job: Omit<Job, 'id' | 'createdAt'>) => Promise<Job | null>;
  updateJob: (job: Job) => Promise<void>;
  deleteJob: (id: string) => Promise<void>;
  addMultipleJobs: (jobs: Omit<Job, 'id' | 'status' | 'createdAt'>[]) => Promise<Job[]>;
  deleteMultipleJobs: (ids: string[]) => Promise<void>;
  quickLinks: QuickLink[];
  addQuickLink: (link: Omit<QuickLink, 'id'>) => Promise<void>;
  updateQuickLink: (link: QuickLink) => Promise<void>;
  deleteQuickLink: (id: string) => Promise<void>;
  posts: ContentPost[];
  addPost: (post: Omit<ContentPost, 'id' | 'createdAt'>) => Promise<void>;
  updatePost: (post: ContentPost) => Promise<void>;
  deletePost: (id: string) => Promise<void>;
  deleteMultiplePosts: (ids: string[]) => Promise<void>;
  subscribers: Subscriber[];
  addSubscriber: (email: string) => Promise<{ success: boolean; message?: string; }>;
  deleteSubscriber: (id: string) => Promise<void>;
  breakingNews: BreakingNews[];
  addNews: (news: Omit<BreakingNews, 'id'>) => Promise<void>;
  updateNews: (news: BreakingNews) => Promise<void>;
  deleteNews: (id: string) => Promise<void>;
  sponsoredAds: SponsoredAd[];
  addSponsoredAd: (ad: Omit<SponsoredAd, 'id'>) => Promise<void>;
  updateSponsoredAd: (ad: SponsoredAd) => Promise<void>;
  deleteSponsoredAd: (id: string) => Promise<void>;
  adSettings: AdSettings;
  updateAdSettings: (settings: AdSettings) => Promise<void>;
  trackSponsoredAdClick: (adId: string) => void;
  toggleAdTest: (placement: PlacementKey) => void;
  seoSettings: SEOSettings;
  updateSEOSettings: (settings: SEOSettings) => Promise<void>;
  generalSettings: GeneralSettings;
  updateGeneralSettings: (settings: GeneralSettings) => Promise<void>;
  socialMediaSettings: SocialMediaSettings;
  updateSocialMediaSettings: (settings: SocialMediaSettings) => Promise<void>;
  smtpSettings: SMTPSettings;
  updateSmtpSettings: (settings: SMTPSettings) => Promise<void>;
  rssSettings: RSSSettings;
  updateRssSettings: (settings: RSSSettings) => Promise<void>;
  alertSettings: AlertSettings;
  updateAlertSettings: (settings: AlertSettings) => Promise<void>;
  popupAdSettings: PopupAdSettings;
  updatePopupAdSettings: (settings: PopupAdSettings) => Promise<void>;
  themeSettings: ThemeSettings;
  updateThemeSettings: (settings: ThemeSettings) => Promise<void>;
  securitySettings: SecuritySettings;
  updateSecuritySettings: (settings: SecuritySettings) => Promise<void>;
  demoUserSettings: DemoUserSettings;
  updateDemoUserSettings: (settings: DemoUserSettings) => Promise<void>;
  googleSearchConsoleSettings: GoogleSearchConsoleSettings;
  updateGoogleSearchConsoleSettings: (settings: GoogleSearchConsoleSettings) => Promise<void>;
  activityLogs: ActivityLog[];
  addActivityLog: (action: string, details: string) => Promise<void>;
  clearActivityLogs: () => Promise<void>;
  contacts: ContactSubmission[];
  addContact: (contact: Omit<ContactSubmission, 'id' | 'submittedAt'>) => Promise<void>;
  deleteContact: (id: string) => Promise<void>;
  emailNotifications: EmailNotification[];
  deleteEmailNotification: (id: string) => Promise<void>;
  clearAllEmailNotifications: () => Promise<void>;
  customEmails: CustomEmail[];
  sendCustomEmail: (subject: string, body: string) => Promise<void>;
  deleteCustomEmail: (id: string) => Promise<void>;
  emailTemplates: EmailTemplate[];
  addEmailTemplate: (template: Omit<EmailTemplate, 'id'>) => Promise<void>;
  updateEmailTemplate: (template: EmailTemplate) => Promise<void>;
  deleteEmailTemplate: (id: string) => Promise<void>;
  sendNewJobAlert: (job: Job) => Promise<void>;
  sendBulkJobAlerts: (jobs: Job[]) => Promise<void>;
  preparationCourses: PreparationCourse[];
  addPreparationCourse: (course: Omit<PreparationCourse, 'id'>) => Promise<void>;
  updatePreparationCourse: (course: PreparationCourse) => Promise<void>;
  deletePreparationCourse: (id: string) => Promise<void>;
  preparationBooks: PreparationBook[];
  addPreparationBook: (book: Omit<PreparationBook, 'id'>) => Promise<void>;
  updatePreparationBook: (book: PreparationBook) => Promise<void>;
  deletePreparationBook: (id: string) => Promise<void>;
  upcomingExams: UpcomingExam[];
  addUpcomingExam: (exam: Omit<UpcomingExam, 'id'>) => Promise<void>;
  updateUpcomingExam: (exam: UpcomingExam) => Promise<void>;
  deleteUpcomingExam: (id: string) => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);


export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [state, setState] = useState<BackupData>(getInitialState());

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await apiCall<BackupData>('/data');
            // Ensure all properties exist, falling back to initial state for any missing ones.
            const fullState = { ...getInitialState(), ...data };
            setState(fullState);
        } catch (error) {
            console.error('Failed to fetch initial data:', error);
            // In case of a fetch error, we still have the initial empty state.
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleDataUpdate = async (apiPromise: Promise<any>) => {
        await apiPromise;
        await fetchData(); // Refetch all data to ensure consistency
    };
    
    // This is a generic settings update function.
    const updateSettings = async (key: string, value: any) => {
        await handleDataUpdate(apiCall('/system/settings', 'POST', { key, value }));
    };

    const value: DataContextType = {
        isLoading,
        ...state,
        addJob: async (jobData) => {
            const newJob = await apiCall<Job>('/content/jobs', 'POST', jobData);
            await fetchData();
            return newJob;
        },
        updateJob: (job) => handleDataUpdate(apiCall('/content/jobs', 'PUT', job)),
        deleteJob: (id) => handleDataUpdate(apiCall('/content/jobs', 'DELETE', { id })),
        addMultipleJobs: async (jobsData) => {
            const newJobs = await apiCall<Job[]>('/content/jobs', 'POST', jobsData);
            await fetchData();
            return newJobs;
        },
        deleteMultipleJobs: (ids) => handleDataUpdate(apiCall('/content/jobs', 'DELETE', { ids })),

        addQuickLink: (data) => handleDataUpdate(apiCall('/content/quick-links', 'POST', data)),
        updateQuickLink: (item) => handleDataUpdate(apiCall('/content/quick-links', 'PUT', item)),
        deleteQuickLink: (id) => handleDataUpdate(apiCall('/content/quick-links', 'DELETE', { id })),

        addPost: (data) => handleDataUpdate(apiCall('/content/posts', 'POST', data)),
        updatePost: (item) => handleDataUpdate(apiCall('/content/posts', 'PUT', item)),
        deletePost: (id) => handleDataUpdate(apiCall('/content/posts', 'DELETE', { id })),
        deleteMultiplePosts: (ids) => handleDataUpdate(apiCall('/content/posts', 'DELETE', { ids })),
        
        addSubscriber: async (email) => {
             try {
                await apiCall('/audience/subscribers', 'POST', { email });
                await fetchData();
                return { success: true };
            } catch (error: any) {
                return { success: false, message: error.message };
            }
        },
        deleteSubscriber: (id) => handleDataUpdate(apiCall('/audience/subscribers', 'DELETE', { id })),

        addNews: (data) => handleDataUpdate(apiCall('/content/breaking-news', 'POST', data)),
        updateNews: (item) => handleDataUpdate(apiCall('/content/breaking-news', 'PUT', item)),
        deleteNews: (id) => handleDataUpdate(apiCall('/content/breaking-news', 'DELETE', { id })),
        
        addSponsoredAd: (data) => handleDataUpdate(apiCall('/marketing/sponsored-ads', 'POST', data)),
        updateSponsoredAd: (item) => handleDataUpdate(apiCall('/marketing/sponsored-ads', 'PUT', item)),
        deleteSponsoredAd: (id) => handleDataUpdate(apiCall('/marketing/sponsored-ads', 'DELETE', { id })),
        trackSponsoredAdClick: (adId) => apiCall('/marketing/sponsored-ads', 'PUT', { id: adId, trackClick: true }),
        toggleAdTest: async (placement) => {
            const currentTests = state.adSettings.activeTests || [];
            const newActiveTests = currentTests.includes(placement)
                ? currentTests.filter(p => p !== placement)
                : [...currentTests, placement];
            const newSettings = { ...state.adSettings, activeTests: newActiveTests };
            // Optimistically update local state for immediate UI feedback
            setState(p => ({ ...p, adSettings: newSettings })); 
            await updateSettings('adSettings', newSettings);
        },

        updateAdSettings: (s) => updateSettings('adSettings', s),
        updateSEOSettings: (s) => updateSettings('seoSettings', s),
        updateGeneralSettings: (s) => updateSettings('generalSettings', s),
        updateSocialMediaSettings: (s) => updateSettings('socialMediaSettings', s),
        updateSmtpSettings: (s) => updateSettings('smtpSettings', s),
        updateRssSettings: (s) => updateSettings('rssSettings', s),
        updateAlertSettings: (s) => updateSettings('alertSettings', s),
        updatePopupAdSettings: (s) => updateSettings('popupAdSettings', s),
        updateThemeSettings: (s) => updateSettings('themeSettings', s),
        updateSecuritySettings: (s) => updateSettings('securitySettings', s),
        updateDemoUserSettings: (s) => updateSettings('demoUserSettings', s),
        updateGoogleSearchConsoleSettings: (s) => updateSettings('googleSearchConsoleSettings', s),

        addActivityLog: (action, details) => handleDataUpdate(apiCall('/system/activity-logs', 'POST', { action, details })),
        clearActivityLogs: () => handleDataUpdate(apiCall('/system/activity-logs', 'DELETE', { clearAll: true })),
        
        addContact: (data) => handleDataUpdate(apiCall('/audience/contacts', 'POST', data)),
        deleteContact: (id) => handleDataUpdate(apiCall('/audience/contacts', 'DELETE', { id })),

        deleteEmailNotification: (id) => handleDataUpdate(apiCall('/system/email-notifications', 'DELETE', { id })),
        clearAllEmailNotifications: () => handleDataUpdate(apiCall('/system/email-notifications', 'DELETE', { clearAll: true })),

        sendCustomEmail: (subject, body) => handleDataUpdate(apiCall('/marketing/custom-emails', 'POST', { subject, body })),
        deleteCustomEmail: (id) => handleDataUpdate(apiCall('/marketing/custom-emails', 'DELETE', { id })),

        addEmailTemplate: (data) => handleDataUpdate(apiCall('/marketing/email-templates', 'POST', data)),
        updateEmailTemplate: (item) => handleDataUpdate(apiCall('/marketing/email-templates', 'PUT', item)),
        deleteEmailTemplate: (id) => handleDataUpdate(apiCall('/marketing/email-templates', 'DELETE', { id })),

        sendNewJobAlert: async (job: Job) => { console.log(`(Simulated) Sending new job alert for: ${job.title}. This happens server-side.`); },
        sendBulkJobAlerts: async (jobs: Job[]) => { console.log(`(Simulated) Sending bulk job alerts for ${jobs.length} jobs. This happens server-side.`); },
        
        addPreparationCourse: (data) => handleDataUpdate(apiCall('/preparation/courses', 'POST', data)),
        updatePreparationCourse: (item) => handleDataUpdate(apiCall('/preparation/courses', 'PUT', item)),
        deletePreparationCourse: (id) => handleDataUpdate(apiCall('/preparation/courses', 'DELETE', { id })),

        addPreparationBook: (data) => handleDataUpdate(apiCall('/preparation/books', 'POST', data)),
        updatePreparationBook: (item) => handleDataUpdate(apiCall('/preparation/books', 'PUT', item)),
        deletePreparationBook: (id) => handleDataUpdate(apiCall('/preparation/books', 'DELETE', { id })),
        
        addUpcomingExam: (data) => handleDataUpdate(apiCall('/content/upcoming-exams', 'POST', data)),
        updateUpcomingExam: (item) => handleDataUpdate(apiCall('/content/upcoming-exams', 'PUT', item)),
        deleteUpcomingExam: (id) => handleDataUpdate(apiCall('/content/upcoming-exams', 'DELETE', { id })),
    };

    return (
        <DataContext.Provider value={value}>
            {children}
        </DataContext.Provider>
    );
};

export const useData = (): DataContextType => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
