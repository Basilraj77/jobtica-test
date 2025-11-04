import React, { useEffect } from 'react';
import { useData } from '../contexts/DataContext.tsx';

const ThemeApplicator: React.FC = () => {
    const { themeSettings } = useData();

    useEffect(() => {
        const root = document.documentElement;
        if (themeSettings) {
            root.style.setProperty('--primary-color', themeSettings.primaryColor);
            root.style.setProperty('--accent-color', themeSettings.accentColor);
        }
    }, [themeSettings]);

    return null;
};

export default ThemeApplicator;
