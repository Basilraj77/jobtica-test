import React, { useEffect } from 'react';

const ContentProtection: React.FC = () => {
    useEffect(() => {
        // Disable right-click context menu
        const handleContextMenu = (e: MouseEvent) => {
            e.preventDefault();
        };
        document.addEventListener('contextmenu', handleContextMenu);

        // Add CSS class to body to disable selection and printing
        document.body.classList.add('content-protection-active');

        // Cleanup function to run when the component unmounts
        return () => {
            document.removeEventListener('contextmenu', handleContextMenu);
            document.body.classList.remove('content-protection-active');
        };
    }, []);

    return null; // This component doesn't render anything visible
};

export default ContentProtection;