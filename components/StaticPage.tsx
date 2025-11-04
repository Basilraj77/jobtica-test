
import React from 'react';
import PublicFooter from './PublicFooter.tsx';
import PublicHeader from './PublicHeader.tsx';

interface StaticPageProps {
    title: string;
    children: React.ReactNode;
    navigate: (path: string) => void;
}

const StaticPage: React.FC<StaticPageProps> = ({ title, children, navigate }) => {
    return (
        <div className="flex flex-col min-h-screen bg-gray-50">
            <PublicHeader navigate={navigate} />
            <main className="flex-grow container mx-auto px-4 py-12">
                <div className="bg-white p-6 md:p-8 rounded-lg shadow-md max-w-4xl mx-auto">
                    <h1 className="text-3xl font-bold text-[#1e3c72] mb-6 pb-2 border-b-4 border-purple-500">{title}</h1>
                    <div className="static-content">
                        {children}
                    </div>
                </div>
            </main>
            <PublicFooter navigate={navigate} />
        </div>
    );
};

export default StaticPage;