import React, { useEffect } from 'react';
import { useData } from '../contexts/DataContext.tsx';

const CSPEffect: React.FC = () => {
    const { securitySettings } = useData();
    const CSP_TAG_ID = 'app-csp-policy';

    useEffect(() => {
        let metaTag = document.getElementById(CSP_TAG_ID) as HTMLMetaElement;
        
        if (securitySettings.enableCSP) {
            if (!metaTag) {
                metaTag = document.createElement('meta');
                metaTag.id = CSP_TAG_ID;
                metaTag.httpEquiv = 'Content-Security-Policy';
                document.head.appendChild(metaTag);
            }
            // This CSP is permissive to allow existing CDN scripts, styles, fonts, and data URI/https images.
            const content = "default-src 'self'; " +
                            "script-src 'self' https://cdn.tailwindcss.com https://aistudiocdn.com; " +
                            "style-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com; " +
                            "font-src 'self' https://cdnjs.cloudflare.com; " +
                            "img-src 'self' data: https: blob:; " +
                            "connect-src 'self' https:;";
            metaTag.content = content;
        } else {
            if (metaTag) {
                metaTag.remove();
            }
        }

    }, [securitySettings.enableCSP]);

    return null; // This component renders nothing
};

export default CSPEffect;
