import React, { useState, useEffect } from 'react';
import { useData } from '../contexts/DataContext.tsx';
import Icon from './Icon.tsx';

const PublicHeader: React.FC<{ navigate: (path: string) => void }> = ({ navigate }) => {
    const { generalSettings, socialMediaSettings } = useData();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navLinks = [
        { name: 'Home', path: '/' },
        { name: 'Exam Prep', path: '/preparation'},
        { name: 'Blog', path: '/blog' },
        { name: 'About Us', path: '/about' },
        { name: 'Contact Us', path: '/contact' }
    ];

    const NavLink: React.FC<{ path: string; name: string; isMobile?: boolean; }> = ({ path, name, isMobile = false }) => (
        <a
            href={path}
            onClick={(e) => {
                e.preventDefault();
                navigate(path);
                if (isMobile) setIsMenuOpen(false);
            }}
            className={isMobile
                ? "block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-[var(--primary-color)] hover:bg-gray-100"
                : "text-lg font-medium text-gray-700 hover:text-[var(--primary-color)] px-3 py-2 rounded-md transition-colors relative after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-[var(--primary-color)] after:scale-x-0 after:origin-bottom-left after:transition-transform after:duration-300 hover:after:scale-x-100"
            }
        >
            {name}
        </a>
    );

    return (
        <header className={`bg-white sticky top-0 z-40 transition-shadow duration-300 border-b ${isScrolled ? 'shadow-md' : 'shadow-sm'}`}>
            <div className="mx-auto px-4 w-full max-w-7xl">
                <div className="flex items-center justify-between h-20 md:h-24">
                    <div className="flex items-center">
                        <a href="/" onClick={(e) => { e.preventDefault(); navigate('/'); }} className="flex-shrink-0 flex items-center gap-4">
                            {generalSettings.siteIconUrl ? (
                                <img className="h-12 md:h-16 w-auto" src={generalSettings.siteIconUrl} alt="Site Logo" />
                            ) : (
                                <span className="text-gray-800 text-2xl font-bold">{generalSettings.siteTitle}</span>
                            )}
                        </a>
                    </div>
                    <div className="hidden md:block">
                        <div className="ml-10 flex items-baseline space-x-6">
                            {navLinks.map(link => <NavLink key={link.name} {...link} />)}
                            {socialMediaSettings.telegramGroup && (
                                <a
                                    href={socialMediaSettings.telegramGroup}
                                    target="_blank"
                                    rel="nofollow noopener noreferrer"
                                    className="bg-green-500 text-white px-4 py-2 rounded-full text-sm font-bold hover:bg-green-600 flex items-center gap-2"
                                >
                                    <Icon name={socialMediaSettings.telegramGroupIcon || 'users'} /> Join Group
                                </a>
                            )}
                        </div>
                    </div>
                    <div className="-mr-2 flex md:hidden">
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="bg-white inline-flex items-center justify-center p-2 rounded-md text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                        >
                            <span className="sr-only">Open main menu</span>
                            <Icon name={isMenuOpen ? 'times' : 'bars'} className="text-2xl" />
                        </button>
                    </div>
                </div>
            </div>

            {isMenuOpen && (
                <div className="md:hidden border-t">
                    <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                         {navLinks.map(link => <NavLink key={link.name} {...link} isMobile />)}
                         {socialMediaSettings.telegramGroup && (
                            <a
                                href={socialMediaSettings.telegramGroup}
                                target="_blank"
                                rel="nofollow noopener noreferrer"
                                className="bg-green-500 text-white block px-3 py-2 rounded-md text-base font-medium hover:bg-green-600 flex items-center gap-2"
                            >
                                <Icon name={socialMediaSettings.telegramGroupIcon || 'users'} /> Join Group
                            </a>
                        )}
                    </div>
                </div>
            )}
        </header>
    );
};

export default PublicHeader;