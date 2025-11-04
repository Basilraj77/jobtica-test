import express from 'express';
import { createClient } from '@supabase/supabase-js';
import multer from 'multer';

const router = express.Router();

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ 
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['text/csv', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only CSV and Excel files are allowed.'));
        }
    }
});

// Advanced Search with Filters and Pagination
router.get('/search', async (req, res) => {
    try {
        const {
            query = '',
            status,
            department,
            category,
            location,
            dateFrom,
            dateTo,
            salaryMin,
            salaryMax,
            is_featured,
            page = 1,
            limit = 20,
            sortBy = 'posted_date',
            sortOrder = 'desc'
        } = req.query;

        let supabaseQuery = supabase
            .from('jobs')
            .select('*', { count: 'exact' });

        // Full-text search
        if (query && query.trim()) {
            supabaseQuery = supabaseQuery.textSearch('title', query);
        }

        // Filters
        if (status && status !== 'all') {
            if (status === 'expired') {
                supabaseQuery = supabaseQuery.lt('last_date', new Date().toISOString());
            } else if (status === 'active') {
                supabaseQuery = supabaseQuery
                    .eq('status', 'active')
                    .gte('last_date', new Date().toISOString());
            } else {
                supabaseQuery = supabaseQuery.eq('status', status);
            }
        }

        if (department && department !== 'all') {
            supabaseQuery = supabaseQuery.eq('department', department);
        }

        if (category && category !== 'all') {
            supabaseQuery = supabaseQuery.eq('category', category);
        }

        if (location) {
            supabaseQuery = supabaseQuery.ilike('location', `%${location}%`);
        }

        if (dateFrom) {
            supabaseQuery = supabaseQuery.gte('posted_date', dateFrom);
        }

        if (dateTo) {
            supabaseQuery = supabaseQuery.lte('posted_date', dateTo);
        }

        if (salaryMin) {
            supabaseQuery = supabaseQuery.gte('salary_min', parseFloat(salaryMin));
        }

        if (salaryMax) {
            supabaseQuery = supabaseQuery.lte('salary_max', parseFloat(salaryMax));
        }

        if (is_featured === 'true') {
            supabaseQuery = supabaseQuery.eq('is_featured', true);
        }

        // Exclude archived unless specifically requested
        if (status !== 'archived') {
            supabaseQuery = supabaseQuery.is('archived_at', null);
        }

        // Sorting
        supabaseQuery = supabaseQuery.order(sortBy, { ascending: sortOrder === 'asc' });

        // Pagination
        const offset = (parseInt(page) - 1) * parseInt(limit);
        supabaseQuery = supabaseQuery.range(offset, offset + parseInt(limit) - 1);

        const { data, error, count } = await supabaseQuery;

        if (error) throw error;

        res.json({
            jobs: data,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: count,
                total_pages: Math.ceil(count / parseInt(limit))
            }
        });
    } catch (error) {
        console.error('Search error:', error);
        res.status(500).json({ error: 'Failed to search jobs', message: error.message });
    }
});

// Bulk Operations
router.post('/bulk-operations', async (req, res) => {
    try {
        const { action, job_ids } = req.body;

        if (!action || !job_ids || !Array.isArray(job_ids) || job_ids.length === 0) {
            return res.status(400).json({ error: 'Invalid request. Action and job_ids array required.' });
        }

        let result;

        switch (action) {
            case 'activate':
                result = await supabase
                    .from('jobs')
                    .update({ status: 'active', archived_at: null })
                    .in('id', job_ids);
                break;

            case 'deactivate':
                result = await supabase
                    .from('jobs')
                    .update({ status: 'inactive' })
                    .in('id', job_ids);
                break;

            case 'archive':
                result = await supabase
                    .from('jobs')
                    .update({ status: 'archived', archived_at: new Date().toISOString() })
                    .in('id', job_ids);
                break;

            case 'delete':
                result = await supabase
                    .from('jobs')
                    .delete()
                    .in('id', job_ids);
                break;

            case 'feature':
                result = await supabase
                    .from('jobs')
                    .update({ is_featured: true })
                    .in('id', job_ids);
                break;

            case 'unfeature':
                result = await supabase
                    .from('jobs')
                    .update({ is_featured: false })
                    .in('id', job_ids);
                break;

            default:
                return res.status(400).json({ error: 'Invalid action' });
        }

        if (result.error) throw result.error;

        res.json({ 
            success: true, 
            message: `Successfully ${action}d ${job_ids.length} jobs`,
            affected_count: job_ids.length
        });
    } catch (error) {
        console.error('Bulk operation error:', error);
        res.status(500).json({ error: 'Bulk operation failed', message: error.message });
    }
});

// Export Jobs to CSV
router.get('/export', async (req, res) => {
    try {
        const { format = 'csv', ...filters } = req.query;

        let query = supabase.from('jobs').select('*');

        // Apply same filters as search
        if (filters.status && filters.status !== 'all') {
            query = query.eq('status', filters.status);
        }
        if (filters.department) {
            query = query.eq('department', filters.department);
        }
        if (filters.category) {
            query = query.eq('category', filters.category);
        }

        const { data, error } = await query;

        if (error) throw error;

        if (format === 'csv') {
            // Convert to CSV
            const headers = ['ID', 'Title', 'Department', 'Category', 'Qualification', 'Vacancies', 'Status', 'Posted Date', 'Last Date', 'Apply Link'];
            const csvRows = [headers.join(',')];

            data.forEach(job => {
                const row = [
                    job.id,
                    `"${job.title?.replace(/"/g, '""') || ''}"`,
                    `"${job.department || ''}"`,
                    `"${job.category || ''}"`,
                    `"${job.qualification?.replace(/"/g, '""') || ''}"`,
                    job.vacancies || '',
                    job.status || '',
                    job.posted_date || '',
                    job.last_date || '',
                    job.apply_link || ''
                ];
                csvRows.push(row.join(','));
            });

            const csv = csvRows.join('\n');
            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', `attachment; filename=jobs_export_${Date.now()}.csv`);
            res.send(csv);
        } else {
            res.json({ jobs: data });
        }
    } catch (error) {
        console.error('Export error:', error);
        res.status(500).json({ error: 'Failed to export jobs', message: error.message });
    }
});

// Import Jobs from CSV/Excel
router.post('/import', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const fileContent = req.file.buffer.toString('utf-8');
        const lines = fileContent.split('\n').filter(line => line.trim());
        
        if (lines.length < 2) {
            return res.status(400).json({ error: 'File is empty or invalid' });
        }

        const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
        const jobs = [];
        const errors = [];

        for (let i = 1; i < lines.length; i++) {
            try {
                const values = lines[i].match(/(".*?"|[^,]+)(?=\s*,|\s*$)/g)?.map(v => v.trim().replace(/^"|"$/g, ''));
                
                if (!values || values.length === 0) continue;

                const job = {};
                headers.forEach((header, index) => {
                    const key = header.toLowerCase().replace(/ /g, '_');
                    job[key] = values[index] || '';
                });

                // Validate required fields
                if (!job.title || !job.department) {
                    errors.push({ line: i + 1, error: 'Missing required fields (title, department)' });
                    continue;
                }

                jobs.push({
                    title: job.title,
                    department: job.department,
                    category: job.category || 'General',
                    qualification: job.qualification || '',
                    description: job.description || '',
                    vacancies: job.vacancies || '1',
                    posted_date: job.posted_date || new Date().toISOString(),
                    last_date: job.last_date || null,
                    apply_link: job.apply_link || '',
                    status: job.status || 'draft',
                    location: job.location || null,
                    salary_min: job.salary_min ? parseFloat(job.salary_min) : null,
                    salary_max: job.salary_max ? parseFloat(job.salary_max) : null
                });
            } catch (error) {
                errors.push({ line: i + 1, error: error.message });
            }
        }

        if (jobs.length === 0) {
            return res.status(400).json({ error: 'No valid jobs found in file', errors });
        }

        // Insert jobs in batches
        const { data, error } = await supabase
            .from('jobs')
            .insert(jobs)
            .select();

        if (error) throw error;

        res.json({
            success: true,
            imported: data.length,
            errors: errors.length > 0 ? errors : undefined,
            jobs: data
        });
    } catch (error) {
        console.error('Import error:', error);
        res.status(500).json({ error: 'Failed to import jobs', message: error.message });
    }
});

// Get Job Templates
router.get('/templates', async (req, res) => {
    try {
        const { category, is_active = true } = req.query;

        let query = supabase
            .from('job_templates')
            .select('*')
            .eq('is_active', is_active)
            .order('usage_count', { ascending: false });

        if (category && category !== 'all') {
            query = query.eq('category', category);
        }

        const { data, error } = await query;

        if (error) throw error;

        res.json({ templates: data });
    } catch (error) {
        console.error('Get templates error:', error);
        res.status(500).json({ error: 'Failed to fetch templates', message: error.message });
    }
});

// Create Job Template
router.post('/templates', async (req, res) => {
    try {
        const { name, category, description, template_data, is_default = false } = req.body;

        if (!name || !category || !template_data) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const { data, error } = await supabase
            .from('job_templates')
            .insert({
                name,
                category,
                description,
                template_data,
                is_default,
                created_by: req.session?.user?.id || null
            })
            .select()
            .single();

        if (error) throw error;

        res.json({ success: true, template: data });
    } catch (error) {
        console.error('Create template error:', error);
        res.status(500).json({ error: 'Failed to create template', message: error.message });
    }
});

// Get Job Analytics by ID
router.get('/analytics/:jobId', async (req, res) => {
    try {
        const { jobId } = req.params;
        const { days = 30 } = req.query;

        // Get job details with analytics
        const { data: job, error: jobError } = await supabase
            .from('jobs')
            .select('id, title, view_count, application_count, success_rate, is_featured, posted_date, last_date')
            .eq('id', jobId)
            .single();

        if (jobError) throw jobError;

        // Get analytics events
        const dateFrom = new Date();
        dateFrom.setDate(dateFrom.getDate() - parseInt(days));

        const { data: events, error: eventsError } = await supabase
            .from('job_analytics')
            .select('event_type, created_at')
            .eq('job_id', jobId)
            .gte('created_at', dateFrom.toISOString())
            .order('created_at', { ascending: true });

        if (eventsError) throw eventsError;

        // Aggregate by day
        const dailyStats = {};
        events.forEach(event => {
            const date = event.created_at.split('T')[0];
            if (!dailyStats[date]) {
                dailyStats[date] = { views: 0, applications: 0, clicks: 0 };
            }
            dailyStats[date][event.event_type + 's'] = (dailyStats[date][event.event_type + 's'] || 0) + 1;
        });

        res.json({
            job,
            analytics: {
                daily_stats: dailyStats,
                total_events: events.length
            }
        });
    } catch (error) {
        console.error('Get analytics error:', error);
        res.status(500).json({ error: 'Failed to fetch analytics', message: error.message });
    }
});

// Get Dashboard Metrics
router.get('/dashboard-metrics', async (req, res) => {
    try {
        // Get total counts
        const { count: totalJobs } = await supabase
            .from('jobs')
            .select('*', { count: 'exact', head: true });

        const { count: activeJobs } = await supabase
            .from('jobs')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'active')
            .gte('last_date', new Date().toISOString());

        const { count: expiredJobs } = await supabase
            .from('jobs')
            .select('*', { count: 'exact', head: true })
            .lt('last_date', new Date().toISOString());

        const { count: draftJobs } = await supabase
            .from('jobs')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'draft');

        // Get top categories
        const { data: categories } = await supabase
            .from('jobs')
            .select('category')
            .not('category', 'is', null);

        const categoryCounts = {};
        categories?.forEach(job => {
            categoryCounts[job.category] = (categoryCounts[job.category] || 0) + 1;
        });

        const topCategories = Object.entries(categoryCounts)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 10)
            .map(([category, count]) => ({ category, count }));

        // Get application stats
        const { data: applicationStats } = await supabase
            .from('jobs')
            .select('application_count, view_count')
            .not('application_count', 'is', null);

        const totalApplications = applicationStats?.reduce((sum, job) => sum + (job.application_count || 0), 0) || 0;
        const totalViews = applicationStats?.reduce((sum, job) => sum + (job.view_count || 0), 0) || 0;
        const overallSuccessRate = totalViews > 0 ? (totalApplications / totalViews * 100).toFixed(2) : 0;

        res.json({
            totals: {
                total_jobs: totalJobs || 0,
                active_jobs: activeJobs || 0,
                expired_jobs: expiredJobs || 0,
                draft_jobs: draftJobs || 0
            },
            applications: {
                total_applications: totalApplications,
                total_views: totalViews,
                success_rate: parseFloat(overallSuccessRate)
            },
            top_categories: topCategories
        });
    } catch (error) {
        console.error('Get dashboard metrics error:', error);
        res.status(500).json({ error: 'Failed to fetch metrics', message: error.message });
    }
});

// Validate Job Data
router.post('/validate', async (req, res) => {
    try {
        const jobData = req.body;
        const errors = [];
        const warnings = [];

        // Required field validation
        if (!jobData.title || jobData.title.trim().length === 0) {
            errors.push({ field: 'title', message: 'Title is required' });
        }
        if (!jobData.department || jobData.department.trim().length === 0) {
            errors.push({ field: 'department', message: 'Department is required' });
        }
        if (!jobData.qualification || jobData.qualification.trim().length === 0) {
            warnings.push({ field: 'qualification', message: 'Qualification is recommended' });
        }
        if (!jobData.description || jobData.description.trim().length < 50) {
            warnings.push({ field: 'description', message: 'Description should be at least 50 characters' });
        }

        // Date validation
        if (jobData.last_date) {
            const lastDate = new Date(jobData.last_date);
            const today = new Date();
            if (lastDate < today) {
                warnings.push({ field: 'last_date', message: 'Last date is in the past' });
            }
        } else {
            warnings.push({ field: 'last_date', message: 'Last date is recommended' });
        }

        // URL validation
        if (jobData.apply_link && !jobData.apply_link.match(/^https?:\/\/.+/)) {
            errors.push({ field: 'apply_link', message: 'Invalid URL format' });
        }

        // Salary validation
        if (jobData.salary_min && jobData.salary_max) {
            if (parseFloat(jobData.salary_min) > parseFloat(jobData.salary_max)) {
                errors.push({ field: 'salary', message: 'Minimum salary cannot be greater than maximum salary' });
            }
        }

        const completeness = Math.max(0, 100 - (errors.length * 20) - (warnings.length * 5));
        const isValid = errors.length === 0;

        res.json({
            is_valid: isValid,
            errors,
            warnings,
            completeness_score: completeness,
            can_publish: isValid && completeness >= 70
        });
    } catch (error) {
        console.error('Validation error:', error);
        res.status(500).json({ error: 'Validation failed', message: error.message });
    }
});

// Update Job Status
router.put('/:id/status', async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const allowedStatuses = ['active', 'inactive', 'draft', 'archived'];
        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({ error: 'Invalid status' });
        }

        const updateData = { status };
        if (status === 'archived') {
            updateData.archived_at = new Date().toISOString();
        } else if (status === 'active') {
            updateData.archived_at = null;
        }

        const { data, error } = await supabase
            .from('jobs')
            .update(updateData)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;

        res.json({ success: true, job: data });
    } catch (error) {
        console.error('Update status error:', error);
        res.status(500).json({ error: 'Failed to update status', message: error.message });
    }
});

// Get Validation Rules
router.get('/validation-rules', (req, res) => {
    res.json({
        required_fields: ['title', 'department'],
        recommended_fields: ['qualification', 'description', 'last_date', 'apply_link', 'vacancies'],
        field_rules: {
            title: { min_length: 10, max_length: 200 },
            description: { min_length: 50, max_length: 5000 },
            apply_link: { pattern: '^https?://.+' },
            vacancies: { type: 'number', min: 1 }
        }
    });
});

export default router;
