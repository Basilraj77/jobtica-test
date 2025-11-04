import { Router } from 'express';
import { slugify } from '../../utils/slugify.js';
import { selectAll, getSetting } from '../../lib/supabase-helpers.js';

const router = Router();

// GET /api/data - Fetch all site data
router.get('/data', async (req, res, next) => {
    try {
        const supabase = req.db;
        
        // Fetch all settings from key_value_store
        const { data: settingsRows } = await supabase
            .from('key_value_store')
            .select('key_name, value');
        
        const settingsObject = (settingsRows || []).reduce((acc, row) => {
            acc[row.key_name] = row.value;
            return acc;
        }, {});

        // Fetch public data
        const jobs = await selectAll(supabase, 'jobs', 'created_at', false);
        const quickLinks = await selectAll(supabase, 'quick_links', 'title', true);
        const posts = await selectAll(supabase, 'content_posts', 'created_at', false);
        const breakingNews = await selectAll(supabase, 'breaking_news');
        const sponsoredAds = await selectAll(supabase, 'sponsored_ads');
        const preparationCourses = await selectAll(supabase, 'preparation_courses', 'title', true);
        const preparationBooks = await selectAll(supabase, 'preparation_books', 'title', true);
        const upcomingExams = await selectAll(supabase, 'upcoming_exams', 'deadline', true);
        
        // Map jobs to frontend format
        const parsedJobs = jobs.map(job => ({
            id: job.id,
            title: job.title,
            department: job.department,
            category: job.category,
            description: job.description,
            qualification: job.qualification,
            vacancies: job.vacancies,
            postedDate: job.posted_date,
            lastDate: job.last_date,
            applyLink: job.apply_link,
            status: job.status,
            createdAt: job.created_at,
            updatedAt: job.updated_at,
            affiliateCourses: job.affiliate_courses || [],
            affiliateBooks: job.affiliate_books || []
        }));
        
        const publicData = {
            jobs: parsedJobs,
            quickLinks,
            posts,
            breakingNews,
            sponsoredAds,
            preparationCourses,
            preparationBooks,
            upcomingExams,
            ...settingsObject,
        };

        if (req.session.isAdmin) {
            const subscribers = await selectAll(supabase, 'subscribers', 'subscription_date', false);
            const activityLogs = await selectAll(supabase, 'activity_logs', 'timestamp', false);
            const contacts = await selectAll(supabase, 'contact_submissions', 'submitted_at', false);
            const emailNotifications = await selectAll(supabase, 'email_notifications', 'sent_at', false);
            const customEmails = await selectAll(supabase, 'custom_emails', 'sent_at', false);
            const emailTemplates = await selectAll(supabase, 'email_templates', 'name', true);
            
            res.status(200).json({
                ...publicData,
                subscribers,
                activityLogs,
                contacts,
                emailNotifications,
                customEmails,
                emailTemplates,
            });
        } else {
            res.status(200).json({
                ...publicData,
                subscribers: [],
                activityLogs: [],
                contacts: [],
                emailNotifications: [],
                customEmails: [],
                emailTemplates: [],
            });
        }
    } catch (error) {
        next(error);
    }
});

// GET /api/health - A simple health check endpoint
router.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
});

// GET /api/robots - Serve the robots.txt content
const robotsContent = `User-agent: *
Allow: /
Sitemap: /sitemap.xml

Disallow: /admin/
Disallow: /api/`;

router.get('/robots', (req, res) => {
    res.setHeader('Content-Type', 'text/plain');
    res.status(200).send(robotsContent);
});

// GET /api/sitemap - Dynamically generate the sitemap.xml
const BASE_URL = process.env.BASE_URL || 'https://jobtica.vercel.app';

const generateSitemap = (pages) => {
    const urls = pages.map(({ url, lastModified }) => `
        <url>
            <loc>${url}</loc>
            ${lastModified ? `<lastmod>${lastModified}</lastmod>` : ''}
            <changefreq>daily</changefreq>
            <priority>0.8</priority>
        </url>
    `).join('');
    return `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`;
};

router.get('/sitemap', async (req, res, next) => {
    try {
        const supabase = req.db;
        
        const { data: jobs } = await supabase
            .from('jobs')
            .select('title, created_at')
            .neq('status', 'expired');
        
        const { data: posts } = await supabase
            .from('content_posts')
            .select('id, created_at')
            .eq('status', 'published')
            .eq('type', 'posts');

        const jobPages = (jobs || []).map(job => ({
            url: `${BASE_URL}/job/${slugify(job.title)}`,
            lastModified: new Date(job.created_at).toISOString(),
        }));
        
        const postPages = (posts || []).map(post => ({
            url: `${BASE_URL}/blog/${post.id}`,
            lastModified: new Date(post.created_at).toISOString(),
        }));
        
        const staticPages = ['/', '/blog', '/preparation', '/about', '/contact', '/privacy', '/terms', '/disclaimer']
            .map(path => ({ url: `${BASE_URL}${path}` }));
        
        const allPages = [...staticPages, ...jobPages, ...postPages];
        const sitemap = generateSitemap(allPages);

        res.setHeader('Content-Type', 'text/xml');
        res.status(200).send(sitemap);
    } catch (error) {
        next(error);
    }
});

export default router;
