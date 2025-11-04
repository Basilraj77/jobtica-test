// Default initial settings for the application
// These values are used when no data is loaded from the database

// Ad Settings
export const initialAdSettings = {
  googleAdClient: '',
  googleAdSlots: {
    header: '',
    sidebar: '',
    content: '',
    footer: '',
    mobileBanner: '',
    interstitial: ''
  },
  popupAdEnabled: false,
  activeTests: []
};

// Alert Settings
export const initialAlertSettings = {
  emailNotifications: true,
  pushNotifications: false,
  smsNotifications: false,
  newJobAlerts: true,
  breakingNewsAlerts: true,
  examAlerts: true
};

// Demo User Settings
export const initialDemoUserSettings = {
  enabled: false,
  email: 'demo@jobtica.com',
  password: 'demo123',
  autoLogin: false
};

// General Settings
export const initialGeneralSettings = {
  siteName: 'Jobtica Portal',
  siteDescription: 'Government Job Portal',
  siteUrl: '',
  contactEmail: '',
  supportEmail: '',
  timezone: 'UTC',
  dateFormat: 'DD/MM/YYYY',
  language: 'en',
  currency: 'INR',
  maintenanceMode: false,
  registrationEnabled: true,
  userVerificationRequired: false
};

// Google Search Console Settings
export const initialGoogleSearchConsoleSettings = {
  siteVerification: '',
  sitemapUrl: '',
  trackingCode: '',
  enabled: false
};

// Popup Ad Settings
export const initialPopupAdSettings = {
  enabled: false,
  showDelay: 5000,
  frequency: 'once',
  title: '',
  content: '',
  buttonText: '',
  buttonUrl: '',
  closeButton: true
};

// RSS Settings
export const initialRssSettings = {
  enabled: true,
  title: 'Jobtica Portal RSS',
  description: 'Latest government job updates',
  author: 'Jobtica Portal',
  language: 'en-US',
  categories: ['Jobs', 'Results', 'Admit Cards']
};

// Security Settings
export const initialSecuritySettings = {
  maxLoginAttempts: 5,
  lockoutDuration: 15, // minutes
  sessionTimeout: 30, // minutes
  passwordMinLength: 8,
  requireSpecialChars: true,
  requireNumbers: true,
  twoFactorEnabled: false,
  ipWhitelist: [],
  rateLimiting: {
    enabled: true,
    maxRequests: 100,
    timeWindow: 60 // seconds
  }
};

// SEO Settings
export const initialSeoSettings = {
  metaTitle: 'Jobtica Portal - Government Jobs',
  metaDescription: 'Find latest government job notifications, results, and exam information',
  metaKeywords: 'government jobs, sarkari naukri, result, admit card',
  googleAnalyticsId: '',
  googleTagManagerId: '',
  facebookPixelId: '',
  customCss: '',
  customJs: '',
  robotsTxt: '',
  sitemapEnabled: true,
  schemaMarkup: true
};

// SMTP Settings
export const initialSmtpSettings = {
  host: '',
  port: 587,
  secure: false,
  username: '',
  password: '',
  fromName: 'Jobtica Portal',
  fromEmail: 'noreply@jobtica.com',
  replyTo: 'support@jobtica.com',
  enabled: false
};

// Social Media Settings
export const initialSocialMediaSettings = {
  facebook: '',
  twitter: '',
  instagram: '',
  linkedin: '',
  youtube: '',
  telegram: '',
  whatsapp: '',
  shareButtonsEnabled: true,
  socialLoginEnabled: false
};

// Theme Settings
export const initialThemeSettings = {
  primaryColor: '#3b82f6',
  secondaryColor: '#64748b',
  accentColor: '#10b981',
  backgroundColor: '#ffffff',
  textColor: '#1f2937',
  fontFamily: 'Inter, sans-serif',
  fontSize: 'medium',
  borderRadius: 'medium',
  shadows: true,
  darkMode: false,
  customCss: ''
};

// Placement Keys for ads
export type PlacementKey = 
  | 'header'
  | 'sidebar' 
  | 'content'
  | 'footer'
  | 'mobileBanner'
  | 'interstitial';

// Additional interfaces for completeness
export interface SEOSettings {
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;
  googleAnalyticsId: string;
  googleTagManagerId: string;
  facebookPixelId: string;
  customCss: string;
  customJs: string;
  robotsTxt: string;
  sitemapEnabled: boolean;
  schemaMarkup: boolean;
}

export interface GeneralSettings {
  siteName: string;
  siteDescription: string;
  siteUrl: string;
  contactEmail: string;
  supportEmail: string;
  timezone: string;
  dateFormat: string;
  language: string;
  currency: string;
  maintenanceMode: boolean;
  registrationEnabled: boolean;
  userVerificationRequired: boolean;
}

export interface SocialMediaSettings {
  facebook: string;
  twitter: string;
  instagram: string;
  linkedin: string;
  youtube: string;
  telegram: string;
  whatsapp: string;
  shareButtonsEnabled: boolean;
  socialLoginEnabled: boolean;
}

export interface SMTPSettings {
  host: string;
  port: number;
  secure: boolean;
  username: string;
  password: string;
  fromName: string;
  fromEmail: string;
  replyTo: string;
  enabled: boolean;
}

export interface RSSSettings {
  enabled: boolean;
  title: string;
  description: string;
  author: string;
  language: string;
  categories: string[];
}

export interface AlertSettings {
  emailNotifications: boolean;
  pushNotifications: boolean;
  smsNotifications: boolean;
  newJobAlerts: boolean;
  breakingNewsAlerts: boolean;
  examAlerts: boolean;
}

export interface PopupAdSettings {
  enabled: boolean;
  showDelay: number;
  frequency: string;
  title: string;
  content: string;
  buttonText: string;
  buttonUrl: string;
  closeButton: boolean;
}

export interface ThemeSettings {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  textColor: string;
  fontFamily: string;
  fontSize: string;
  borderRadius: string;
  shadows: boolean;
  darkMode: boolean;
  customCss: string;
}

export interface SecuritySettings {
  maxLoginAttempts: number;
  lockoutDuration: number;
  sessionTimeout: number;
  passwordMinLength: number;
  requireSpecialChars: boolean;
  requireNumbers: boolean;
  twoFactorEnabled: boolean;
  ipWhitelist: string[];
  rateLimiting: {
    enabled: boolean;
    maxRequests: number;
    timeWindow: number;
  };
}

export interface DemoUserSettings {
  enabled: boolean;
  email: string;
  password: string;
  autoLogin: boolean;
}

export interface GoogleSearchConsoleSettings {
  siteVerification: string;
  sitemapUrl: string;
  trackingCode: string;
  enabled: boolean;
}

// Additional types for backup data
export interface Subscriber {
  id: string;
  email: string;
  subscribedAt: string;
  isActive: boolean;
}

export interface BreakingNews {
  id: string;
  title: string;
  content: string;
  priority: 'low' | 'medium' | 'high';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ActivityLog {
  id: string;
  action: string;
  details: string;
  userId?: string;
  ipAddress?: string;
  timestamp: string;
}

export interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  submittedAt: string;
  status: 'new' | 'read' | 'replied';
}

export interface EmailNotification {
  id: string;
  recipient: string;
  subject: string;
  body: string;
  sentAt: string;
  status: 'pending' | 'sent' | 'failed';
}

export interface CustomEmail {
  id: string;
  subject: string;
  body: string;
  recipientCount: number;
  sentAt: string;
  status: 'draft' | 'sent' | 'failed';
}

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  type: 'welcome' | 'job_alert' | 'newsletter' | 'custom';
  isActive: boolean;
  createdAt: string;
}

export interface SponsoredAd {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  linkUrl: string;
  placement: PlacementKey;
  clicks: number;
  impressions: number;
  budget: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  createdAt: string;
}

export interface PreparationCourse {
  id: string;
  title: string;
  description: string;
  instructor: string;
  price: number;
  duration: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  isActive: boolean;
  createdAt: string;
}

export interface PreparationBook {
  id: string;
  title: string;
  description: string;
  author: string;
  price: number;
  isbn: string;
  publisher: string;
  isActive: boolean;
  createdAt: string;
}

export interface UpcomingExam {
  id: string;
  examName: string;
  organization: string;
  examDate: string;
  applicationStart: string;
  applicationEnd: string;
  vacancyCount: string;
  eligibility: string;
  officialWebsite: string;
  isActive: boolean;
  createdAt: string;
}

export interface BackupData {
  jobs: Job[];
  quickLinks: QuickLink[];
  posts: ContentPost[];
  subscribers: Subscriber[];
  breakingNews: BreakingNews[];
  activityLogs: ActivityLog[];
  sponsoredAds: SponsoredAd[];
  contacts: ContactSubmission[];
  emailNotifications: EmailNotification[];
  customEmails: CustomEmail[];
  emailTemplates: EmailTemplate[];
  preparationCourses: PreparationCourse[];
  preparationBooks: PreparationBook[];
  upcomingExams: UpcomingExam[];
  adSettings: AdSettings;
  seoSettings: SEOSettings;
  generalSettings: GeneralSettings;
  socialMediaSettings: SocialMediaSettings;
  smtpSettings: SMTPSettings;
  rssSettings: RSSSettings;
  alertSettings: AlertSettings;
  popupAdSettings: PopupAdSettings;
  themeSettings: ThemeSettings;
  securitySettings: SecuritySettings;
  demoUserSettings: DemoUserSettings;
  googleSearchConsoleSettings: GoogleSearchConsoleSettings;
}