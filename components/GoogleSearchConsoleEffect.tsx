import React, { useEffect } from 'react';
import { useData } from '../contexts/DataContext.tsx';

const GSC_TAG_ID = 'google-site-verification-tag';

const GoogleSearchConsoleEffect: React.FC = () => {
    const { googleSearchConsoleSettings } = useData();

    useEffect(() => {
        // Remove any existing tag first to handle updates
        const existingTag = document.getElementById(GSC_TAG_ID);
        if (existingTag) {
            existingTag.remove();
        }

        const tagContent = googleSearchConsoleSettings.verificationTag;

        if (tagContent && tagContent.includes('google-site-verification')) {
            // Parse the meta tag string to create a DOM element
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = tagContent;
            const metaTag = tempDiv.querySelector('meta');

            if (metaTag) {
                metaTag.id = GSC_TAG_ID;
                document.head.appendChild(metaTag);
            }
        }

    }, [googleSearchConsoleSettings.verificationTag]);

    return null; // This component renders nothing
};

export default GoogleSearchConsoleEffect;
