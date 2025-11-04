import React, { useState } from 'react';
import Modal from '../Modal';
import Icon from '../Icon.tsx';

const JSON_TEMPLATE = JSON.stringify({
  "masterNotification": {
    "jobTitle": "",
    "organization": "",
    "category": "",
    "totalVacancies": 0,
    "notificationNo": "",
    "applicationStartDate": "YYYY-MM-DD",
    "applicationLastDate": "YYYY-MM-DD",
    "examDate": null,
    "officialPdfLink": null,
    "applicationLink": null
  },
  "posts": [
    {
      "postName": "",
      "totalVacancies": 0,
      "vacancyBreakdown": "UR: X, EWS: Y, OBC: Z, SC: A, ST: B",
      "payLevel": "",
      "ageLimit": "",
      "qualification": "",
      "experience": null,
      "examPattern": "",
      "applicationFee": "",
      "selectionProcess": "",
      "importantNotes": null
    }
  ]
}, null, 2);


const NotificationExtractorModal: React.FC<{ isOpen: boolean; onClose: () => void; }> = ({ isOpen, onClose }) => {
    const [notificationText, setNotificationText] = useState('');
    const [jsonTemplate] = useState(JSON_TEMPLATE);

    const handleCopy = () => {
        if(jsonTemplate){
            navigator.clipboard.writeText(jsonTemplate);
        }
    };

    const handleClose = () => {
        setNotificationText('');
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title="Manual Job Notification Parser">
            <div className="space-y-4">
                <p className="text-sm text-gray-600">
                    Paste the job notification text below for your reference. Then, copy the JSON template and fill in the details manually.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="notification-text" className="block text-sm font-medium text-gray-700">
                            Reference Notification Text
                        </label>
                        <textarea
                            id="notification-text"
                            rows={15}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md font-mono text-sm"
                            placeholder="Paste notification content here for easy reference..."
                            value={notificationText}
                            onChange={(e) => setNotificationText(e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <h3 className="text-sm font-medium text-gray-700">JSON Template</h3>
                        <div className="relative">
                            <pre className="bg-gray-800 text-white p-4 rounded-md overflow-x-auto text-sm max-h-[340px] h-[340px]">
                                <code>{jsonTemplate}</code>
                            </pre>
                            <button
                                onClick={handleCopy}
                                className="absolute top-2 right-2 bg-gray-600 hover:bg-gray-500 text-white px-2 py-1 text-xs rounded-md"
                            >
                                <Icon name="copy" className="mr-1" /> Copy
                            </button>
                        </div>
                    </div>
                </div>
                 <div className="flex justify-end gap-4 mt-6 pt-4 border-t">
                    <button type="button" onClick={handleClose} className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300">
                        Close
                    </button>
                    <button type="button" onClick={() => { handleCopy(); handleClose(); }} className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700">
                       Copy Template & Close
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default NotificationExtractorModal;
