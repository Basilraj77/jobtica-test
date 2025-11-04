import React from 'react';
import { useData } from '../contexts/DataContext.tsx';
import Icon from './Icon.tsx';
import AdComponent from './AdComponent.tsx';
// FIX: Corrected import to be extensionless to resolve module issues.
import { getAdCodeForPlacement } from '../utils/jobUtils';

const PublicFooter: React.FC<{ navigate: (path: string) => void }> = ({ navigate }) => {
    const { posts, socialMediaSettings, adSettings, preparationCourses, preparationBooks } = useData();
    const footerAdCode = getAdCodeForPlacement('footerAd', adSettings);

    const latestPosts = posts
        .filter(p => p.type === 'posts' && p.status === 'published')
        .sort((a, b) => new Date(b.publishedDate).getTime() - new Date(a.publishedDate).getTime())
        .slice(0, 3);
        
    const topCourses = preparationCourses.slice(0, 2);
    const topBooks = preparationBooks.slice(0, 2);

    return (
        <footer className="bg-[#1e3c72] text-white py-10 mt-8">
            <div className="container mx-auto px-4">
                {footerAdCode && (
                    <div className="border-b border-white/20 mb-8">
                        <AdComponent code={footerAdCode} placement="footer" />
                    </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 text-center md:text-left">
                    <div>
                        <h3 className="text-lg font-bold mb-4">About Jobtica</h3>
                        <p className="text-sm text-gray-300">
                            Your premier destination for the latest government job notifications, run by Divine Computer, Elathagiri. We are dedicated to providing timely and accurate updates to help you achieve your career goals in the public sector.
                        </p>
                    </div>
                    <div>
                        <h3 className="text-lg font-bold mb-4">Quick Links</h3>
                        <ul className="space-y-2 text-sm">
                             <li><a href="/about" onClick={(e) => { e.preventDefault(); navigate('/about'); }} className="text-gray-300 hover:underline">About Us</a></li>
                             <li><a href="/contact" onClick={(e) => { e.preventDefault(); navigate('/contact'); }} className="text-gray-300 hover:underline">Contact Us</a></li>
                             <li><a href="/blog" onClick={(e) => { e.preventDefault(); navigate('/blog'); }} className="text-gray-300 hover:underline">Blog</a></li>
                             <li><a href="/preparation" onClick={(e) => { e.preventDefault(); navigate('/preparation'); }} className="text-gray-300 hover:underline">Exam Prep</a></li>
                             <li><a href="/privacy" onClick={(e) => { e.preventDefault(); navigate('/privacy'); }} className="text-gray-300 hover:underline">Privacy Policy</a></li>
                             <li><a href="/terms" onClick={(e) => { e.preventDefault(); navigate('/terms'); }} className="text-gray-300 hover:underline">Terms & Conditions</a></li>
                             <li><a href="/disclaimer" onClick={(e) => { e.preventDefault(); navigate('/disclaimer'); }} className="text-gray-300 hover:underline">Disclaimer</a></li>
                        </ul>
                    </div>
                     <div>
                        <h3 className="text-lg font-bold mb-4">Study Material</h3>
                        {(topCourses.length > 0 || topBooks.length > 0) ? (
                            <ul className="space-y-2 text-sm">
                                {topCourses.map(course => (
                                    <li key={`c-${course.id}`}>
                                        <a href={course.url} target="_blank" rel="noopener noreferrer nofollow" className="text-gray-300 hover:underline flex items-start text-left" title={course.title}>
                                            <Icon name="chalkboard-teacher" className="mr-2 mt-1 text-xs text-gray-400 flex-shrink-0" />
                                            <span>{course.title.length > 30 ? `${course.title.substring(0, 30)}...` : course.title}</span>
                                        </a>
                                    </li>
                                ))}
                                {topBooks.map(book => (
                                    <li key={`b-${book.id}`}>
                                        <a href={book.url} target="_blank" rel="noopener noreferrer nofollow" className="text-gray-300 hover:underline flex items-start text-left" title={`${book.title} by ${book.author}`}>
                                            <Icon name="book-open" className="mr-2 mt-1 text-xs text-gray-400 flex-shrink-0" />
                                            <span>{book.title.length > 30 ? `${book.title.substring(0, 30)}...` : book.title}</span>
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                             <p className="text-sm text-gray-400">No material available yet.</p>
                        )}
                    </div>
                     <div>
                        <h3 className="text-lg font-bold mb-4">Latest Blog Posts</h3>
                         {latestPosts.length > 0 ? (
                            <ul className="space-y-2 text-sm">
                                {latestPosts.map(post => (
                                    <li key={post.id}>
                                        <a href={`/blog/${post.id}`} onClick={(e) => { e.preventDefault(); navigate(`/blog/${post.id}`); }} className="text-gray-300 hover:underline" title={post.title}>
                                            {post.title.length > 35 ? `${post.title.substring(0, 35)}...` : post.title}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-sm text-gray-400">No recent blog posts.</p>
                        )}
                    </div>
                </div>
                <div className="border-t border-white/20 mt-8 pt-6 flex flex-col md:flex-row-reverse justify-between items-center text-center">
                    <div className="mb-4 md:mb-0 md:text-right">
                        <p className="text-xs text-gray-400">&copy; 2025 Jobtica. All Rights Reserved.</p>
                        <p className="text-xs text-gray-400 mt-1">Developed & Maintained by <strong className="font-semibold text-gray-200">Divine Marketing Solutions</strong></p>
                    </div>
                     <div className="flex justify-center space-x-6">
                        {socialMediaSettings.facebook && <a href={socialMediaSettings.facebook} target="_blank" rel="nofollow noopener noreferrer" aria-label="Visit our Facebook page" className="text-white hover:text-blue-500 transition-colors"><Icon prefix="fab" name="facebook-f" className="text-2xl" /></a>}
                        {socialMediaSettings.instagram && <a href={socialMediaSettings.instagram} target="_blank" rel="nofollow noopener noreferrer" aria-label="Visit our Instagram page" className="text-white hover:text-pink-500 transition-colors"><Icon prefix="fab" name="instagram" className="text-2xl" /></a>}
                        {socialMediaSettings.telegram && <a href={socialMediaSettings.telegram} target="_blank" rel="nofollow noopener noreferrer" aria-label="Join our Telegram channel" className="text-white hover:text-blue-400 transition-colors"><Icon prefix="fab" name="telegram-plane" className="text-2xl" /></a>}
                        {socialMediaSettings.whatsapp && <a href={socialMediaSettings.whatsapp} target="_blank" rel="nofollow noopener noreferrer" aria-label="Contact us on WhatsApp" className="text-white hover:text-green-500 transition-colors"><Icon prefix="fab" name="whatsapp" className="text-2xl" /></a>}
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default PublicFooter;