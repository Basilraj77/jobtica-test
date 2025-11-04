
import React, { useEffect } from 'react';
import { useData } from '../contexts/DataContext.tsx';
import Icon from '../components/Icon.tsx';

const MaintenancePage: React.FC = () => {
    const { generalSettings, seoSettings } = useData();

    useEffect(() => {
        document.title = `Maintenance | ${seoSettings.global.siteTitle}`;
    }, [seoSettings.global.siteTitle]);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 text-center p-4">
            <div className="w-full max-w-2xl p-8 space-y-6 bg-white rounded-lg shadow-xl">
                <Icon name="tools" className="text-6xl text-indigo-500 mx-auto" />
                <h1 className="text-4xl font-extrabold text-gray-900">Under Maintenance</h1>
                <p className="text-lg text-gray-600">
                    {generalSettings.maintenanceMessage}
                </p>
            </div>
        </div>
    );
};

export default MaintenancePage;