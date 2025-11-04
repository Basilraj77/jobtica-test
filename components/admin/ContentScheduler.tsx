import React, { useState } from 'react';
import Icon from '../Icon.tsx';

interface ContentSchedulerProps {
    scheduledDate?: string;
    scheduledTime?: string;
    onScheduleChange: (date: string, time: string) => void;
    status: 'published' | 'draft' | 'scheduled';
    onStatusChange: (status: 'published' | 'draft' | 'scheduled') => void;
}

const ContentScheduler: React.FC<ContentSchedulerProps> = ({
    scheduledDate,
    scheduledTime,
    onScheduleChange,
    status,
    onStatusChange
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [localDate, setLocalDate] = useState(scheduledDate || '');
    const [localTime, setLocalTime] = useState(scheduledTime || '');

    const handleApply = () => {
        if (localDate && localTime) {
            onScheduleChange(localDate, localTime);
            onStatusChange('scheduled');
            setIsOpen(false);
        }
    };

    const handleClear = () => {
        setLocalDate('');
        setLocalTime('');
        onScheduleChange('', '');
        onStatusChange('published');
        setIsOpen(false);
    };

    const getMinDateTime = () => {
        const now = new Date();
        return {
            minDate: now.toISOString().split('T')[0],
            minTime: now.toTimeString().slice(0, 5)
        };
    };

    const { minDate, minTime } = getMinDateTime();

    return (
        <div className="border rounded-md">
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex justify-between items-center p-3 text-left font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-t-md"
            >
                <span className="flex items-center gap-2">
                    <Icon name="clock" />
                    Content Scheduling
                    {status === 'scheduled' && scheduledDate && (
                        <span className="ml-2 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                            Scheduled for {scheduledDate} at {scheduledTime}
                        </span>
                    )}
                </span>
                <Icon name={isOpen ? 'chevron-up' : 'chevron-down'} />
            </button>
            
            {isOpen && (
                <div className="p-4 border-t space-y-4">
                    <div className="bg-blue-50 p-3 rounded-md flex items-start gap-2">
                        <Icon name="info-circle" className="text-blue-600 mt-0.5" />
                        <div className="text-sm text-blue-800">
                            <p className="font-medium">Schedule your content for future publication</p>
                            <p className="text-xs mt-1">Content will automatically publish at the specified date and time</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Publish Date
                            </label>
                            <input
                                type="date"
                                value={localDate}
                                onChange={(e) => setLocalDate(e.target.value)}
                                min={minDate}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Publish Time
                            </label>
                            <input
                                type="time"
                                value={localTime}
                                onChange={(e) => setLocalTime(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-2 border-t">
                        <button
                            type="button"
                            onClick={handleClear}
                            className="px-4 py-2 text-sm bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                        >
                            Clear Schedule
                        </button>
                        <button
                            type="button"
                            onClick={handleApply}
                            disabled={!localDate || !localTime}
                            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Apply Schedule
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ContentScheduler;
