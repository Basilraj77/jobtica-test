
import React, { useEffect, useRef } from 'react';
import Icon from './Icon.tsx';

export type AdPlacement = 'header' | 'sidebar' | 'footer' | 'in-feed';

interface AdComponentProps {
    code: string;
    placement: AdPlacement;
}

const AdComponent: React.FC<AdComponentProps> = ({ code, placement }) => {
    const adContainerRef = useRef<HTMLDivElement>(null);
    const isPlaceholder = code.trim().startsWith('<!--') && code.trim().endsWith('-->');

    // New Test Ad Logic
    if (code.trim().startsWith('<!-- JOBTICA_TEST_AD::')) {
        const placementName = code.match(/::(.*?)\s*-->/)?.[1] || 'Test Ad';
        return (
            <div className="my-6 flex flex-col items-center justify-center bg-yellow-300 border-2 border-dashed border-yellow-500 rounded-md mx-auto p-4 text-center" style={{ maxWidth: '728px', minHeight: '90px' }}>
                <Icon name="vial" className="text-yellow-700 text-2xl mb-2" />
                <span className="text-yellow-800 font-bold text-lg">TEST MODE ACTIVE</span>
                <span className="text-yellow-700 font-mono text-sm">{placementName}</span>
            </div>
        );
    }

    useEffect(() => {
        if (isPlaceholder || !adContainerRef.current) return;

        const container = adContainerRef.current;
        
        // Clear container from previous renders before adding new content.
        container.innerHTML = '';

        // Append the ad code's HTML structure and scripts.
        // Scripts inserted this way are not executed by the browser.
        container.innerHTML = code;
        
        // Find all script tags that were just inserted.
        const scripts = Array.from(container.querySelectorAll("script"));
        
        // Re-create each script tag to force the browser to execute it.
        scripts.forEach((oldScript: HTMLScriptElement) => {
            const newScript = document.createElement("script");
            
            // Copy all attributes from the old script to the new one.
            Array.from(oldScript.attributes).forEach((attr: Attr) => {
                newScript.setAttribute(attr.name, attr.value);
            });
            
            // Copy the inline script content.
            newScript.appendChild(document.createTextNode(oldScript.innerHTML));
            
            // Replace the non-executable script with the new, executable one.
            oldScript.parentNode?.replaceChild(newScript, oldScript);
        });

        // Crucial cleanup function to run when the component unmounts.
        // This prevents errors and memory leaks when navigating between pages.
        return () => {
            if (adContainerRef.current) {
                adContainerRef.current.innerHTML = '';
            }
        };

    }, [code, isPlaceholder]);

    if (isPlaceholder) {
        const dimensions = {
            header: { width: '728px', height: '90px', text: '728x90 Ad Space' },
            sidebar: { width: '300px', height: '250px', text: '300x250 Ad Space' },
            footer: { width: '728px', height: '90px', text: '728x90 Ad Space' },
            'in-feed': { width: '728px', height: '90px', text: '728x90 In-Feed Ad' },
        };
        const style = dimensions[placement];

        return (
            <div className="my-6 flex items-center justify-center bg-gray-200 border-2 border-dashed border-gray-400 rounded-md mx-auto" style={{ maxWidth: style.width, minHeight: style.height }}>
                <span className="text-gray-500 font-semibold">{style.text}</span>
            </div>
        );
    }
    
    return <div key={code} ref={adContainerRef} className="my-6 flex justify-center items-center" />;
};

export default AdComponent;