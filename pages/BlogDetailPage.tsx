import React, { useEffect } from 'react';
import { useData } from '../contexts/DataContext.tsx';
import Icon from '../components/Icon.tsx';
import PublicFooter from '../components/PublicFooter.tsx';
import PublicHeader from '../components/PublicHeader.tsx';
import { basePath } from '../App.tsx';
import AdComponent from '../components/AdComponent.tsx';
// FIX: Corrected import to be extensionless to resolve module issues.
import { getAdCodeForPlacement } from '../utils/jobUtils';
import MarkdownRenderer from '../components/MarkdownRenderer.tsx';

const BlogDetailPage: React.FC<{ postId: string; navigate: (path: string) => void }> = ({ postId, navigate }) => {
    const { posts, seoSettings, generalSettings, adSettings } = useData();
    const post = posts.find(p => p.id === postId);
    const canonicalUrl = `${window.location.origin}${basePath}/blog/${postId}`.replace(/([^:]\/)\/+/g, "$1");
    const blogDetailTopAdCode = getAdCodeForPlacement('blogDetailTopAd', adSettings);

    useEffect(() => {
        document.querySelectorAll('[data-seo-managed]').forEach(el => el.remove());

        if (post) {
            const seoTitle = post.seoTitle || post.title;
            const seoDescription = post.seoDescription || post.content.substring(0, 160) + (post.content.length > 160 ? '...' : '');

            document.title = `${seoTitle} | ${seoSettings.global.siteTitle}`;

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

            // Standard & Social Meta
            createMeta({ name: 'description', content: seoDescription });
            createMeta({ property: 'og:title', content: seoTitle });
            createMeta({ property: 'og:description', content: seoDescription });
            createMeta({ property: 'og:url', content: canonicalUrl });
            createMeta({ property: 'og:type', content: 'article' });
            createMeta({ property: 'og:site_name', content: generalSettings.siteTitle });
            if (post.imageUrl || seoSettings.social.ogImageUrl) {
                createMeta({ property: 'og:image', content: post.imageUrl || seoSettings.social.ogImageUrl });
            }
            createMeta({ name: 'twitter:card', content: 'summary_large_image' });
            createMeta({ name: 'twitter:title', content: seoTitle });
            createMeta({ name: 'twitter:description', content: seoDescription });
             if (post.imageUrl || seoSettings.social.ogImageUrl) {
                createMeta({ name: 'twitter:image', content: post.imageUrl || seoSettings.social.ogImageUrl });
            }

            // Canonical URL
            createLink({ rel: 'canonical', href: canonicalUrl });
            
            // Structured Data
            const articleSchema = {
                 "@context": "https://schema.org",
                "@type": "Article",
                "mainEntityOfPage": {
                    "@type": "WebPage",
                    "@id": canonicalUrl
                },
                "headline": post.title,
                "description": seoDescription,
                "image": post.imageUrl || seoSettings.social.ogImageUrl,
                "author": {
                    "@type": "Organization",
                    "name": generalSettings.siteTitle
                },
                "publisher": {
                    "@type": "Organization",
                    "name": generalSettings.siteTitle,
                    "logo": {
                        "@type": "ImageObject",
                        "url": generalSettings.siteIconUrl
                    }
                },
                "datePublished": post.publishedDate
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
                    "name": "Blog",
                    "item": `${window.location.origin}${basePath}/blog`.replace(/([^:]\/)\/+/g, "$1")
                }, {
                    "@type": "ListItem",
                    "position": 3,
                    "name": post.title
                }]
            };

            const script = document.createElement('script');
            script.type = 'application/ld+json';
            script.setAttribute('data-seo-managed', 'true');
            script.innerHTML = JSON.stringify([articleSchema, breadcrumbSchema]);
            head.appendChild(script);

        } else {
            document.title = `Post Not Found | ${seoSettings.global.siteTitle}`;
        }
        
        return () => {
            document.querySelectorAll('[data-seo-managed]').forEach(el => el.remove());
        };
    }, [post, seoSettings, generalSettings, postId, canonicalUrl]);

    if (!post) {
        return (
            <div className="flex flex-col min-h-screen bg-gray-50">
                <PublicHeader navigate={navigate} />
                <main className="flex-grow container mx-auto px-4 py-12">
                    <div className="bg-white p-6 md:p-8 rounded-lg shadow-md max-w-4xl mx-auto text-center">
                        <Icon name="exclamation-circle" className="text-5xl text-red-400 mb-4" />
                        <h1 className="text-3xl font-bold text-[#1e3c72] mb-6">Post Not Found</h1>
                        <p className="text-gray-600 mb-6">The blog post you are looking for does not exist or may have been removed.</p>
                        <button onClick={() => navigate('/blog')} className="bg-[var(--primary-color)] text-white px-6 py-2 rounded-md filter hover:brightness-90">
                            Back to Blog
                        </button>
                    </div>
                </main>
                <PublicFooter navigate={navigate} />
            </div>
        );
    }
    
    const shareTitle = post.title;
    const summary = post.content.substring(0, 100) + '...';
    const facebookShareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(canonicalUrl)}`;
    const twitterShareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(canonicalUrl)}&text=${encodeURIComponent(shareTitle)}`;
    const linkedinShareUrl = `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(canonicalUrl)}&title=${encodeURIComponent(shareTitle)}&summary=${encodeURIComponent(summary)}`;
    const whatsappShareUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareTitle + "\n\n" + canonicalUrl)}`;
    const telegramShareUrl = `https://t.me/share/url?url=${encodeURIComponent(canonicalUrl)}&text=${encodeURIComponent(shareTitle)}`;
    const emailShareUrl = `mailto:?subject=${encodeURIComponent(shareTitle)}&body=${encodeURIComponent("Check out this blog post:\n\n" + canonicalUrl)}`;

    return (
        <div className="flex flex-col min-h-screen bg-gray-50">
            <PublicHeader navigate={navigate} />
             <nav aria-label="Breadcrumb" className="bg-gray-100 border-b">
                <div className="container mx-auto px-4">
                    <ol className="flex items-center space-x-2 text-sm text-gray-500 py-3">
                        <li><a href={`${basePath}/`} onClick={(e) => { e.preventDefault(); navigate('/'); }} className="hover:text-[var(--primary-color)]">Home</a></li>
                        <li><Icon name="chevron-right" className="text-xs" /></li>
                        <li><a href={`${basePath}/blog`} onClick={(e) => { e.preventDefault(); navigate('/blog'); }} className="hover:text-[var(--primary-color)]">Blog</a></li>
                        <li><Icon name="chevron-right" className="text-xs" /></li>
                        <li className="font-semibold text-gray-700 truncate" aria-current="page">{post.title}</li>
                    </ol>
                </div>
            </nav>
            <main className="flex-grow container mx-auto px-4 py-12">
                 <div className="bg-white p-6 md:p-8 rounded-lg shadow-md max-w-4xl mx-auto">
                    {blogDetailTopAdCode && (
                        <div className="mb-6 -mx-6 -mt-6 md:-mx-8 md:-mt-8 rounded-t-lg overflow-hidden">
                            <AdComponent code={blogDetailTopAdCode} placement="header" />
                        </div>
                    )}
                    {post.imageUrl && (
                        <img src={post.imageUrl} alt={post.title} className="w-full h-auto max-h-96 object-cover rounded-lg mb-6" loading="lazy" />
                    )}
                    <h1 className="text-3xl font-bold text-[#1e3c72] mb-4">{post.title}</h1>
                    <div className="text-sm text-gray-600 mb-6 border-b pb-4">
                        <span><Icon name="calendar-alt" className="mr-2 text-gray-400" />Published on {post.publishedDate}</span>
                        <span className="ml-4"><Icon name="tag" className="mr-2 text-gray-400" />{post.category}</span>
                    </div>

                    <div className="static-content">
                        <MarkdownRenderer content={post.content} />
                    </div>

                    <div className="mt-8 pt-6 border-t flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                        <span className="text-sm font-semibold text-gray-500">Share this post:</span>
                        <div className="flex items-center gap-4 text-gray-500">
                            <a href={facebookShareUrl} target="_blank" rel="nofollow noopener noreferrer" aria-label="Share on Facebook" className="hover:text-blue-600 transition-colors"><Icon prefix="fab" name="facebook-f" className="text-2xl" /></a>
                            <a href={twitterShareUrl} target="_blank" rel="nofollow noopener noreferrer" aria-label="Share on Twitter" className="hover:text-sky-500 transition-colors"><Icon prefix="fab" name="twitter" className="text-2xl" /></a>
                             <a href={linkedinShareUrl} target="_blank" rel="nofollow noopener noreferrer" aria-label="Share on LinkedIn" className="hover:text-blue-700 transition-colors"><Icon prefix="fab" name="linkedin-in" className="text-2xl" /></a>
                            <a href={whatsappShareUrl} target="_blank" rel="nofollow noopener noreferrer" aria-label="Share on WhatsApp" className="hover:text-green-500 transition-colors"><Icon prefix="fab" name="whatsapp" className="text-2xl" /></a>
                            <a href={telegramShareUrl} target="_blank" rel="nofollow noopener noreferrer" aria-label="Share on Telegram" className="hover:text-blue-400 transition-colors"><Icon prefix="fab" name="telegram-plane" className="text-2xl" /></a>
                            <a href={emailShareUrl} target="_blank" rel="nofollow noopener noreferrer" aria-label="Share via Email" className="hover:text-gray-700 transition-colors"><Icon name="envelope" className="text-2xl" /></a>
                        </div>
                    </div>
                </div>
            </main>
            <PublicFooter navigate={navigate} />
        </div>
    );
};

export default BlogDetailPage;