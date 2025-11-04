import React, { useState, useEffect, useMemo } from 'react';
import Icon from '../Icon.tsx';

interface SeoOptimizerProps {
    title: string;
    content: string;
    seoTitle: string;
    seoDescription: string;
    slug?: string;
    onUpdate: (data: { seoTitle: string; seoDescription: string; slug?: string }) => void;
}

const SeoOptimizer: React.FC<SeoOptimizerProps> = ({
    title,
    content,
    seoTitle,
    seoDescription,
    slug,
    onUpdate
}) => {
    const [localSeoTitle, setLocalSeoTitle] = useState(seoTitle);
    const [localSeoDescription, setLocalSeoDescription] = useState(seoDescription);
    const [localSlug, setLocalSlug] = useState(slug || '');
    const [focusKeyword, setFocusKeyword] = useState('');
    const [showAdvanced, setShowAdvanced] = useState(false);

    useEffect(() => {
        setLocalSeoTitle(seoTitle);
    }, [seoTitle]);

    useEffect(() => {
        setLocalSeoDescription(seoDescription);
    }, [seoDescription]);

    useEffect(() => {
        setLocalSlug(slug || '');
    }, [slug]);

    const handleUpdate = () => {
        onUpdate({
            seoTitle: localSeoTitle,
            seoDescription: localSeoDescription,
            slug: localSlug
        });
    };

    const stripHtml = (html: string): string => {
        const tmp = document.createElement('div');
        tmp.innerHTML = html;
        return tmp.textContent || tmp.innerText || '';
    };

    const contentText = stripHtml(content);
    const wordCount = contentText.split(/\s+/).filter(w => w.length > 0).length;
    const readingTime = Math.ceil(wordCount / 200);

    // Auto-generate SEO title from main title
    const autoGenerateSeoTitle = () => {
        const generated = title.substring(0, 60);
        setLocalSeoTitle(generated);
        handleUpdate();
    };

    // Auto-generate SEO description from content
    const autoGenerateSeoDescription = () => {
        const sentences = contentText.match(/[^.!?]+[.!?]+/g) || [];
        const firstSentences = sentences.slice(0, 2).join(' ');
        const generated = firstSentences.substring(0, 155);
        setLocalSeoDescription(generated);
        handleUpdate();
    };

    // Generate slug from title
    const generateSlug = () => {
        const slug = title
            .toLowerCase()
            .replace(/[^\w\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim();
        setLocalSlug(slug);
        handleUpdate();
    };

    // Readability score (simplified Flesch Reading Ease)
    const calculateReadability = (): { score: number; rating: string; color: string } => {
        const sentences = contentText.match(/[^.!?]+[.!?]+/g)?.length || 1;
        const words = wordCount;
        const syllables = contentText.split(/\s+/).reduce((count, word) => {
            return count + Math.max(1, word.match(/[aeiouy]{1,2}/gi)?.length || 1);
        }, 0);

        const score = Math.min(100, Math.max(0,
            206.835 - 1.015 * (words / sentences) - 84.6 * (syllables / words)
        ));

        let rating = '';
        let color = '';
        if (score >= 80) {
            rating = 'Very Easy';
            color = 'text-green-600';
        } else if (score >= 70) {
            rating = 'Easy';
            color = 'text-green-500';
        } else if (score >= 60) {
            rating = 'Fairly Easy';
            color = 'text-blue-600';
        } else if (score >= 50) {
            rating = 'Standard';
            color = 'text-yellow-600';
        } else if (score >= 30) {
            rating = 'Difficult';
            color = 'text-orange-600';
        } else {
            rating = 'Very Difficult';
            color = 'text-red-600';
        }

        return { score: Math.round(score), rating, color };
    };

    const readability = calculateReadability();

    // Keyword density analysis
    const keywordDensity = useMemo(() => {
        if (!focusKeyword) return 0;
        const keyword = focusKeyword.toLowerCase();
        const text = contentText.toLowerCase();
        const matches = (text.match(new RegExp(keyword, 'g')) || []).length;
        return wordCount > 0 ? ((matches / wordCount) * 100).toFixed(2) : 0;
    }, [focusKeyword, contentText, wordCount]);

    // SEO checks
    const seoChecks = [
        {
            name: 'SEO Title Length',
            passed: localSeoTitle.length >= 50 && localSeoTitle.length <= 60,
            message: `${localSeoTitle.length}/60 characters (optimal: 50-60)`
        },
        {
            name: 'Meta Description Length',
            passed: localSeoDescription.length >= 120 && localSeoDescription.length <= 155,
            message: `${localSeoDescription.length}/155 characters (optimal: 120-155)`
        },
        {
            name: 'Content Length',
            passed: wordCount >= 300,
            message: `${wordCount} words (minimum: 300)`
        },
        {
            name: 'Focus Keyword in Title',
            passed: focusKeyword ? title.toLowerCase().includes(focusKeyword.toLowerCase()) : null,
            message: focusKeyword ? (title.toLowerCase().includes(focusKeyword.toLowerCase()) ? 'Found' : 'Not found') : 'Set a focus keyword'
        },
        {
            name: 'Focus Keyword in Content',
            passed: focusKeyword ? contentText.toLowerCase().includes(focusKeyword.toLowerCase()) : null,
            message: focusKeyword ? `Density: ${keywordDensity}% (optimal: 1-2%)` : 'Set a focus keyword'
        }
    ];

    const passedChecks = seoChecks.filter(check => check.passed === true).length;
    const totalChecks = seoChecks.filter(check => check.passed !== null).length;
    const seoScore = totalChecks > 0 ? Math.round((passedChecks / totalChecks) * 100) : 0;

    return (
        <div className="space-y-6 p-4 bg-white rounded-lg">
            {/* SEO Score Overview */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <Icon name="search" />
                    SEO Score
                </h3>
                <div className="flex items-center gap-6">
                    <div className="flex-shrink-0">
                        <div className="relative w-24 h-24">
                            <svg className="transform -rotate-90 w-24 h-24">
                                <circle
                                    cx="48"
                                    cy="48"
                                    r="40"
                                    stroke="#e5e7eb"
                                    strokeWidth="8"
                                    fill="none"
                                />
                                <circle
                                    cx="48"
                                    cy="48"
                                    r="40"
                                    stroke={seoScore >= 70 ? '#10b981' : seoScore >= 40 ? '#f59e0b' : '#ef4444'}
                                    strokeWidth="8"
                                    fill="none"
                                    strokeDasharray={`${2 * Math.PI * 40}`}
                                    strokeDashoffset={`${2 * Math.PI * 40 * (1 - seoScore / 100)}`}
                                    strokeLinecap="round"
                                />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-2xl font-bold">{seoScore}</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex-1">
                        <p className="text-gray-600 mb-2">
                            {seoScore >= 80 && 'Excellent! Your content is well optimized.'}
                            {seoScore >= 60 && seoScore < 80 && 'Good! A few improvements could help.'}
                            {seoScore >= 40 && seoScore < 60 && 'Fair. Several areas need attention.'}
                            {seoScore < 40 && 'Needs improvement. Focus on the recommendations below.'}
                        </p>
                        <div className="text-sm text-gray-500">
                            {passedChecks} of {totalChecks} checks passed
                        </div>
                    </div>
                </div>
            </div>

            {/* SEO Title */}
            <div>
                <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-semibold text-gray-700">
                        SEO Title *
                    </label>
                    <button
                        onClick={autoGenerateSeoTitle}
                        className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                    >
                        <Icon name="magic" className="text-xs" />
                        Auto-generate
                    </button>
                </div>
                <input
                    type="text"
                    value={localSeoTitle}
                    onChange={(e) => setLocalSeoTitle(e.target.value)}
                    onBlur={handleUpdate}
                    placeholder="Enter SEO title..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <div className="mt-1 flex items-center justify-between text-sm">
                    <span className={localSeoTitle.length >= 50 && localSeoTitle.length <= 60 ? 'text-green-600' : 'text-gray-500'}>
                        {localSeoTitle.length}/60 characters
                    </span>
                    <div className="w-48 bg-gray-200 rounded-full h-2">
                        <div
                            className={`h-2 rounded-full transition-all ${
                                localSeoTitle.length < 50 ? 'bg-yellow-500' :
                                localSeoTitle.length <= 60 ? 'bg-green-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${Math.min(100, (localSeoTitle.length / 60) * 100)}%` }}
                        />
                    </div>
                </div>
            </div>

            {/* Meta Description */}
            <div>
                <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-semibold text-gray-700">
                        Meta Description *
                    </label>
                    <button
                        onClick={autoGenerateSeoDescription}
                        className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                    >
                        <Icon name="magic" className="text-xs" />
                        Auto-generate
                    </button>
                </div>
                <textarea
                    value={localSeoDescription}
                    onChange={(e) => setLocalSeoDescription(e.target.value)}
                    onBlur={handleUpdate}
                    placeholder="Enter meta description..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <div className="mt-1 flex items-center justify-between text-sm">
                    <span className={localSeoDescription.length >= 120 && localSeoDescription.length <= 155 ? 'text-green-600' : 'text-gray-500'}>
                        {localSeoDescription.length}/155 characters
                    </span>
                    <div className="w-48 bg-gray-200 rounded-full h-2">
                        <div
                            className={`h-2 rounded-full transition-all ${
                                localSeoDescription.length < 120 ? 'bg-yellow-500' :
                                localSeoDescription.length <= 155 ? 'bg-green-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${Math.min(100, (localSeoDescription.length / 155) * 100)}%` }}
                        />
                    </div>
                </div>
            </div>

            {/* URL Slug */}
            <div>
                <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-semibold text-gray-700">
                        URL Slug
                    </label>
                    <button
                        onClick={generateSlug}
                        className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                    >
                        <Icon name="magic" className="text-xs" />
                        Generate from title
                    </button>
                </div>
                <input
                    type="text"
                    value={localSlug}
                    onChange={(e) => setLocalSlug(e.target.value.toLowerCase().replace(/[^\w-]/g, ''))}
                    onBlur={handleUpdate}
                    placeholder="url-friendly-slug"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                />
            </div>

            {/* SERP Preview */}
            <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <Icon name="eye" />
                    Search Engine Preview
                </h4>
                <div className="p-4 border rounded-md bg-white shadow-sm">
                    <p className="text-sm text-green-700 mb-1">www.jobtica.gov / {localSlug || 'your-page-url'}</p>
                    <h3 className="text-xl text-blue-600 hover:underline cursor-pointer mb-1">
                        {localSeoTitle || title || 'Your SEO Title'}
                    </h3>
                    <p className="text-sm text-gray-600">
                        {localSeoDescription || 'Your meta description will appear here. Make it compelling to increase click-through rates!'}
                    </p>
                </div>
            </div>

            {/* Content Analysis */}
            <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-3">Content Analysis</h4>
                <div className="grid grid-cols-3 gap-4">
                    <div className="bg-gray-50 p-3 rounded-md">
                        <div className="text-2xl font-bold text-gray-900">{wordCount}</div>
                        <div className="text-sm text-gray-600">Words</div>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-md">
                        <div className="text-2xl font-bold text-gray-900">{readingTime} min</div>
                        <div className="text-sm text-gray-600">Read Time</div>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-md">
                        <div className={`text-2xl font-bold ${readability.color}`}>{readability.score}</div>
                        <div className="text-sm text-gray-600">{readability.rating}</div>
                    </div>
                </div>
            </div>

            {/* Focus Keyword */}
            <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Focus Keyword (optional)
                </label>
                <input
                    type="text"
                    value={focusKeyword}
                    onChange={(e) => setFocusKeyword(e.target.value)}
                    placeholder="e.g., government jobs"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {focusKeyword && (
                    <div className="mt-2 p-3 bg-blue-50 rounded-md">
                        <p className="text-sm">
                            <strong>Keyword Density:</strong> {keywordDensity}%
                            <span className={`ml-2 ${parseFloat(keywordDensity.toString()) >= 1 && parseFloat(keywordDensity.toString()) <= 2 ? 'text-green-600' : 'text-orange-600'}`}>
                                {parseFloat(keywordDensity.toString()) >= 1 && parseFloat(keywordDensity.toString()) <= 2 ? '(Optimal)' : '(Aim for 1-2%)'}
                            </span>
                        </p>
                    </div>
                )}
            </div>

            {/* SEO Checklist */}
            <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <Icon name="tasks" />
                    SEO Checklist
                </h4>
                <div className="space-y-2">
                    {seoChecks.map((check, index) => (
                        check.passed !== null && (
                            <div
                                key={index}
                                className={`flex items-start gap-3 p-3 rounded-md ${
                                    check.passed ? 'bg-green-50' : 'bg-red-50'
                                }`}
                            >
                                <Icon
                                    name={check.passed ? 'check-circle' : 'times-circle'}
                                    className={`text-lg mt-0.5 ${check.passed ? 'text-green-600' : 'text-red-600'}`}
                                />
                                <div className="flex-1">
                                    <p className="font-medium text-sm text-gray-900">{check.name}</p>
                                    <p className="text-xs text-gray-600">{check.message}</p>
                                </div>
                            </div>
                        )
                    ))}
                </div>
            </div>

            {/* Advanced SEO (Toggle) */}
            <div>
                <button
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className="flex items-center gap-2 text-sm font-semibold text-gray-700 hover:text-gray-900"
                >
                    <Icon name={showAdvanced ? 'chevron-down' : 'chevron-right'} />
                    Advanced SEO Settings
                </button>
                {showAdvanced && (
                    <div className="mt-4 space-y-4 pl-6">
                        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                            <p className="text-sm text-yellow-800">
                                <Icon name="info-circle" className="mr-2" />
                                Advanced SEO features like Open Graph tags, Twitter Cards, and structured data will be added in future updates.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SeoOptimizer;
