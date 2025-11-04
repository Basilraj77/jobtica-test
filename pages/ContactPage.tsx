import React, { useState } from 'react';
import StaticPage from '../components/StaticPage.tsx';
import { useData } from '../contexts/DataContext.tsx';
import Icon from '../components/Icon.tsx';

const ContactPage: React.FC<{ navigate: (path: string) => void }> = ({ navigate }) => {
    const { addContact } = useData();
    const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
    const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('submitting');
        try {
            await addContact(formData);
            setStatus('success');
            setFormData({ name: '', email: '', subject: '', message: '' }); // Clear form
        } catch (err) {
            setStatus('error');
        }
    };

    return (
        <StaticPage title="Contact Us" navigate={navigate}>
            <p className="mb-6">
                Have a question, suggestion, or just want to say hello? We'd love to hear from you. Fill out the form below, and we'll get back to you as soon as possible.
            </p>

            {status === 'success' ? (
                <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded-md text-center" role="alert">
                    <Icon name="check-circle" className="text-3xl mb-2" />
                    <p className="font-bold">Message Sent Successfully!</p>
                    <p>Thank you for reaching out. We've received your message and will respond shortly.</p>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Your Name *</label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Your Email *</label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                                required
                            />
                        </div>
                    </div>
                    <div>
                        <label htmlFor="subject" className="block text-sm font-medium text-gray-700">Subject *</label>
                        <input
                            type="text"
                            id="subject"
                            name="subject"
                            value={formData.subject}
                            onChange={handleChange}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="message" className="block text-sm font-medium text-gray-700">Message *</label>
                        <textarea
                            id="message"
                            name="message"
                            rows={6}
                            value={formData.message}
                            onChange={handleChange}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                            required
                        />
                    </div>
                    {status === 'error' && (
                        <p className="text-sm text-red-600">Something went wrong. Please try again.</p>
                    )}
                    <div className="text-right">
                        <button
                            type="submit"
                            disabled={status === 'submitting'}
                            className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 disabled:opacity-50 inline-flex items-center gap-2"
                        >
                            {status === 'submitting' ? (
                                <>
                                    <Icon name="spinner" className="animate-spin" /> Sending...
                                </>
                            ) : (
                                'Send Message'
                            )}
                        </button>
                    </div>
                </form>
            )}
        </StaticPage>
    );
};

export default ContactPage;