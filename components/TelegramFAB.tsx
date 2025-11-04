import React from 'react';
import { useData } from '../contexts/DataContext.tsx';
import Icon from './Icon.tsx';

const TelegramFAB: React.FC = () => {
    const { socialMediaSettings } = useData();

    if (!socialMediaSettings.telegramGroup) {
        return null;
    }

    return (
        <a
            href={socialMediaSettings.telegramGroup}
            target="_blank"
            rel="nofollow noopener noreferrer"
            aria-label="Join our Telegram Group"
            className="fixed bottom-8 right-8 bg-green-500 text-white w-16 h-16 rounded-full flex items-center justify-center shadow-lg hover:bg-green-600 transition-transform hover:scale-110 z-[99]"
        >
            <Icon name="comments" className="text-3xl" />
        </a>
    );
};

export default TelegramFAB;