import React, { useEffect } from 'react';
import { useData } from '../contexts/DataContext.tsx';
import Icon from '../components/Icon.tsx';
import PublicFooter from '../components/PublicFooter.tsx';
import PublicHeader from '../components/PublicHeader.tsx';
import JobDetailView from '../components/JobDetailView.tsx';
// FIX: Corrected import to be extensionless to resolve module issues.
import { slugify } from '../utils/slugify';
import { basePath } from '../App.tsx';

const JobDetailPage: React.FC<{ jobSlug: string; navigate: (path: string) => void }> = ({ jobSlug, navigate }) => {
    const { jobs, seoSettings, generalSettings } = useData();
    const job = jobs.find(j => slugify(j.title) === jobSlug);
    const canonicalUrl = `${window.location.origin}${basePath}/job/${jobSlug}`.replace(/([^:]\/)\/+/g, "$1");

    useEffect(() => {
        // Clean up any tags managed by this effect from previous renders
        document.querySelectorAll('[data-seo-managed]').forEach(el => el.remove());

        if (job) {
            document.title = `${job.title} | ${seoSettings.global.siteTitle}`;

            const metaDescription = `Apply online for ${job.title}. Vacancies: ${job.vacancies}. Qualification: ${job.qualification}. Last date: ${job.lastDate}.`;

            const head = document.head;
            const createMeta = (attrs: { [key: string]: string }) => {
                const meta = document.createElement('meta');
                Object.keys(attrs).forEach(key => meta.setAttribute(key, attrs[key]));
                meta.setAttribute('data-seo-managed', 'true');
                head.appendChild(meta);
            };
            const createLink = (attrs: { [key: string]: string }) => {
                const link = document.createElement('link');
                Object.keys(attrs).forEach(key => link.setAttribute(key, attrs[key]));
                link.setAttribute('data-seo-managed', 'true');
                head.appendChild(link);
            };

            // Standard Meta
            createMeta({ name: 'description', content: metaDescription });

            // Open Graph
            createMeta({ property: 'og:title', content: job.title });
            createMeta({ property: 'og:description', content: metaDescription });
            createMeta({ property: 'og:url', content: canonicalUrl });
            createMeta({ property: 'og:type', content: 'article' });
            createMeta({ property: 'og:site_name', content: generalSettings.siteTitle });
            createMeta({ property: 'og:image', content: seoSettings.social.ogImageUrl });
            
            // Twitter Card
            createMeta({ name: 'twitter:card', content: 'summary_large_image' });
            createMeta({ name: 'twitter:title', content: job.title });
            createMeta({ name: 'twitter:description', content: metaDescription });
            createMeta({ name: 'twitter:image', content: seoSettings.social.ogImageUrl });

            // Canonical URL
            createLink({ rel: 'canonical', href: canonicalUrl });

            // Structured Data (JobPosting Schema)
            if (seoSettings.structuredData.jobPostingSchemaEnabled) {
                const jobSchema = {
                    "@context": "https://schema.org",
                    "@type": "JobPosting",
                    "title": job.title,
                    "description": `<p>${job.description.replace(/\n/g, '</p><p>')}</p>`,
                    "identifier": {
                        "@type": "PropertyValue",
                        "name": generalSettings.siteTitle,
                        "value": job.id
                    },
                    "datePosted": job.postedDate,
                    "validThrough": job.lastDate,
                    "employmentType": "FULL_TIME",
                    "hiringOrganization": {
                        "@type": "Organization",
                        "name": job.department,
                        "sameAs": window.location.origin
                    },
                    "jobLocation": {
                        "@type": "Place",
                        "address": {
                            "@type": "PostalAddress",
                            "addressCountry": "IN"
                        }
                    },
                    "qualifications": job.qualification,
                    "totalJobOpenings": job.vacancies,
                };

                const breadcrumbSchema = {
                    "@context": "https://schema.org",
                    "@type": "BreadcrumbList",
                    "itemListElement": [{
                        "@type": "ListItem",
                        "position": 1,
                        "name": "Home",
                        "item": `${window.location.origin}${basePath}/`.replace(/([^:]\/)\/+/g, "$1")
                    }, {
                        "@type": "ListItem",
                        "position": 2,
                        "name": job.title
                    }]
                };

                const script = document.createElement('script');
                script.type = 'application/ld+json';
                script.setAttribute('data-seo-managed', 'true');
                script.innerHTML = JSON.stringify([jobSchema, breadcrumbSchema]);
                head.appendChild(script);
            }

        } else {
            document.title = `Job Not Found | ${seoSettings.global.siteTitle}`;
        }
        
        return () => {
            document.querySelectorAll('[data-seo-managed]').forEach(el => el.remove());
        };
    }, [job, seoSettings, generalSettings, jobSlug, canonicalUrl]);

    if (!job) {
        return (
            <div className="flex flex-col min-h-screen bg-gray-50">
                <PublicHeader navigate={navigate} />
                <main className="flex-grow container mx-auto px-4 py-12">
                    <div className="bg-white p-6 md:p-8 rounded-lg shadow-md max-w-4xl mx-auto text-center">
                        <Icon name="exclamation-circle" className="text-5xl text-red-400 mb-4" />
                        <h1 className="text-3xl font-bold text-[#1e3c72] mb-6">Job Not Found</h1>
                        <p className="text-gray-600 mb-6">The job you are looking for does not exist or may have been removed.</p>
                        <button onClick={() => navigate('/')} className="bg-[var(--primary-color)] text-white px-6 py-2 rounded-md filter hover:brightness-90">
                            Back to Home
                        </button>
                    </div>
                </main>
                <PublicFooter navigate={navigate} />
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-screen bg-gray-50">
            <PublicHeader navigate={navigate} />
            <nav aria-label="Breadcrumb" className="bg-gray-100 border-b">
                <div className="container mx-auto px-4">
                    <ol className="flex items-center space-x-2 text-sm text-gray-500 py-3">
                        <li><a href={`${basePath}/`} onClick={(e) => { e.preventDefault(); navigate('/'); }} className="hover:text-[var(--primary-color)]">Home</a></li>
                        <li><Icon name="chevron-right" className="text-xs" /></li>
                        <li className="font-semibold text-gray-700 truncate" aria-current="page">{job.title}</li>
                    </ol>
                </div>
            </nav>
            <main className="flex-grow container mx-auto px-4 py-12">
                <JobDetailView job={job} />
            </main>
            <PublicFooter navigate={navigate} />
        </div>
    );
};

export default JobDetailPage;