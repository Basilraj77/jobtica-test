import React, { useState, useEffect } from 'react';
import { PopupAdSettings } from '../types.ts';

interface PopupAdProps {
    settings: PopupAdSettings;
}

const PopupAd: React.FC<PopupAdProps> = ({ settings }) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Session control logic
        if (settings.showOncePerSession) {
            const sessionKey = 'popupAdShown_session';
            const hasBeenShown = sessionStorage.getItem(sessionKey);
            if (hasBeenShown) {
                return; // Don't show again in this session
            }
        }

        // Open delay timer
        const openTimer = setTimeout(() => {
            setIsVisible(true);
            if (settings.showOncePerSession) {
                sessionStorage.setItem('popupAdShown_session', 'true');
            }
        }, settings.openDelaySeconds * 1000);

        return () => clearTimeout(openTimer);
    }, [settings]);

    useEffect(() => {
        if (isVisible && settings.closeAfterSeconds > 0) {
            const closeTimer = setTimeout(() => {
                handleClose();
            }, settings.closeAfterSeconds * 1000);
            return () => clearTimeout(closeTimer);
        }
    }, [isVisible, settings.closeAfterSeconds]);

    const handleClose = () => {
        setIsVisible(false);
    };
    
    if (!isVisible) return null;

    const sizeClasses = {
        small: 'max-w-sm',
        medium: 'max-w-md',
        large: 'max-w-lg',
    };
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" role="dialog" aria-modal="true" aria-label="Advertisement">
            <div className={`relative ${sizeClasses[settings.size]} w-full`}>
                <button 
                    onClick={handleClose} 
                    className="absolute -top-3 -right-3 bg-white rounded-full h-8 w-8 flex items-center justify-center text-gray-700 text-2xl font-bold shadow-lg hover:bg-gray-200 z-10"
                    aria-label="Close ad"
                >
                    &times;
                </button>
                <a href={settings.destinationUrl} target="_blank" rel="noopener noreferrer sponsored">
                    <img src={settings.imageUrl} alt="Advertisement" className="w-full h-auto rounded-lg shadow-xl" />
                </a>
            </div>
        </div>
    );
};

export default PopupAd;
