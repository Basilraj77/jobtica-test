import React, { useState, useEffect } from 'react';
import Icon from '../Icon.tsx';

interface ContentVersion {
    id: string;
    content_id: string;
    version_number: number;
    title: string;
    content: string;
    seo_title?: string;
    seo_description?: string;
    status: string;
    created_by_name?: string;
    created_at: string;
    change_summary?: string;
    is_published_version: boolean;
    is_auto_save: boolean;
}

interface VersionControlProps {
    contentId: string;
    onRestore?: (versionData: Partial<ContentVersion>) => void;
}

const VersionControl: React.FC<VersionControlProps> = ({ contentId, onRestore }) => {
    const [versions, setVersions] = useState<ContentVersion[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedVersion, setSelectedVersion] = useState<ContentVersion | null>(null);
    const [compareMode, setCompareMode] = useState(false);
    const [compareVersion, setCompareVersion] = useState<ContentVersion | null>(null);
    const [restoring, setRestoring] = useState(false);

    useEffect(() => {
        if (contentId) {
            loadVersions();
        }
    }, [contentId]);

    const loadVersions = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`/api/content/${contentId}/versions`, {
                credentials: 'include',
            });

            if (!response.ok) {
                throw new Error('Failed to load version history');
            }

            const data = await response.json();
            setVersions(data.versions || []);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load versions');
            console.error('Error loading versions:', err);
        } finally {
            setLoading(false);
        }
    };

    const createVersion = async (changeSummary: string) => {
        try {
            const response = await fetch(`/api/content/${contentId}/versions`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    change_summary: changeSummary,
                    is_auto_save: false,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to create version');
            }

            await loadVersions();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create version');
            console.error('Create version error:', err);
        }
    };

    const restoreVersion = async (versionId: string) => {
        if (!confirm('Are you sure you want to restore this version? Current content will be replaced.')) {
            return;
        }

        setRestoring(true);
        setError(null);

        try {
            const response = await fetch(`/api/content/${contentId}/versions/${versionId}/restore`, {
                method: 'POST',
                credentials: 'include',
            });

            if (!response.ok) {
                throw new Error('Failed to restore version');
            }

            const data = await response.json();
            
            if (onRestore && data.restored_content) {
                onRestore(data.restored_content);
            }

            await loadVersions();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to restore version');
            console.error('Restore error:', err);
        } finally {
            setRestoring(false);
        }
    };

    const deleteVersion = async (versionId: string) => {
        if (!confirm('Are you sure you want to delete this version? This cannot be undone.')) {
            return;
        }

        try {
            const response = await fetch(`/api/content/${contentId}/versions/${versionId}`, {
                method: 'DELETE',
                credentials: 'include',
            });

            if (!response.ok) {
                throw new Error('Failed to delete version');
            }

            await loadVersions();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to delete version');
            console.error('Delete version error:', err);
        }
    };

    const stripHtml = (html: string): string => {
        const tmp = document.createElement('div');
        tmp.innerHTML = html;
        return tmp.textContent || tmp.innerText || '';
    };

    const formatDate = (dateString: string): string => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
        if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
        if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
        
        return date.toLocaleDateString() + ' at ' + date.toLocaleTimeString();
    };

    return (
        <div className="flex flex-col h-full bg-white rounded-lg">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                    <Icon name="history" />
                    Version History
                </h2>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => {
                            const summary = prompt('Enter a description for this version:');
                            if (summary) createVersion(summary);
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                        <Icon name="save" />
                        Create Version
                    </button>
                    {compareMode && (
                        <button
                            onClick={() => {
                                setCompareMode(false);
                                setCompareVersion(null);
                            }}
                            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                        >
                            Exit Compare
                        </button>
                    )}
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="mx-4 mt-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-center gap-2 text-red-700">
                    <Icon name="exclamation-circle" />
                    <span>{error}</span>
                </div>
            )}

            {/* Version List */}
            <div className="flex-1 overflow-y-auto">
                {loading ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="flex flex-col items-center gap-3">
                            <Icon name="spinner" className="text-4xl text-blue-600 animate-spin" />
                            <p className="text-gray-600">Loading version history...</p>
                        </div>
                    </div>
                ) : versions.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                        <Icon name="clock" className="text-5xl mb-3" />
                        <p className="text-lg">No version history yet</p>
                        <p className="text-sm">Versions will be created automatically when you save changes</p>
                    </div>
                ) : (
                    <div className="divide-y">
                        {versions.map((version, index) => (
                            <div
                                key={version.id}
                                className={`p-4 hover:bg-gray-50 transition-colors ${
                                    selectedVersion?.id === version.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                                }`}
                                onClick={() => setSelectedVersion(version)}
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-semibold bg-gray-200 text-gray-700">
                                                Version {version.version_number}
                                            </span>
                                            {version.is_published_version && (
                                                <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-semibold bg-green-100 text-green-800">
                                                    <Icon name="check-circle" className="mr-1" />
                                                    Published
                                                </span>
                                            )}
                                            {version.is_auto_save && (
                                                <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-semibold bg-yellow-100 text-yellow-800">
                                                    Auto-saved
                                                </span>
                                            )}
                                            {index === 0 && (
                                                <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-semibold bg-blue-100 text-blue-800">
                                                    Current
                                                </span>
                                            )}
                                        </div>
                                        
                                        <h3 className="font-semibold text-gray-900 mb-1">
                                            {version.title}
                                        </h3>
                                        
                                        {version.change_summary && (
                                            <p className="text-sm text-gray-600 mb-2">
                                                {version.change_summary}
                                            </p>
                                        )}
                                        
                                        <div className="flex items-center gap-4 text-xs text-gray-500">
                                            <span className="flex items-center gap-1">
                                                <Icon name="user" />
                                                {version.created_by_name || 'Unknown'}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Icon name="clock" />
                                                {formatDate(version.created_at)}
                                            </span>
                                            <span>
                                                {stripHtml(version.content).split(' ').length} words
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 ml-4">
                                        {compareMode ? (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setCompareVersion(version);
                                                }}
                                                disabled={selectedVersion?.id === version.id}
                                                className="px-3 py-1 text-sm bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                Compare
                                            </button>
                                        ) : (
                                            <>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setSelectedVersion(version);
                                                        setCompareMode(true);
                                                    }}
                                                    className="p-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-md"
                                                    title="Compare versions"
                                                >
                                                    <Icon name="code-branch" />
                                                </button>
                                                {index !== 0 && (
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            restoreVersion(version.id);
                                                        }}
                                                        disabled={restoring}
                                                        className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md disabled:opacity-50"
                                                        title="Restore this version"
                                                    >
                                                        <Icon name="undo" />
                                                    </button>
                                                )}
                                                {!version.is_published_version && index !== 0 && (
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            deleteVersion(version.id);
                                                        }}
                                                        className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-md"
                                                        title="Delete this version"
                                                    >
                                                        <Icon name="trash" />
                                                    </button>
                                                )}
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Version Preview/Compare Panel */}
            {(selectedVersion || compareVersion) && (
                <div className="border-t bg-gray-50 max-h-[50%] overflow-y-auto">
                    <div className="p-4">
                        {compareMode && selectedVersion && compareVersion ? (
                            <>
                                <h3 className="font-semibold mb-3">Comparing Versions</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <div className="bg-blue-100 text-blue-800 px-3 py-2 rounded-t-md text-sm font-semibold">
                                            Version {selectedVersion.version_number}
                                        </div>
                                        <div className="bg-white border border-t-0 rounded-b-md p-4 max-h-64 overflow-y-auto">
                                            <h4 className="font-semibold mb-2">{selectedVersion.title}</h4>
                                            <div 
                                                className="text-sm prose prose-sm max-w-none"
                                                dangerouslySetInnerHTML={{ __html: selectedVersion.content }}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <div className="bg-purple-100 text-purple-800 px-3 py-2 rounded-t-md text-sm font-semibold">
                                            Version {compareVersion.version_number}
                                        </div>
                                        <div className="bg-white border border-t-0 rounded-b-md p-4 max-h-64 overflow-y-auto">
                                            <h4 className="font-semibold mb-2">{compareVersion.title}</h4>
                                            <div 
                                                className="text-sm prose prose-sm max-w-none"
                                                dangerouslySetInnerHTML={{ __html: compareVersion.content }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </>
                        ) : selectedVersion ? (
                            <>
                                <h3 className="font-semibold mb-3">Version {selectedVersion.version_number} Preview</h3>
                                <div className="bg-white border rounded-md p-4 max-h-96 overflow-y-auto">
                                    <h4 className="text-xl font-semibold mb-4">{selectedVersion.title}</h4>
                                    {selectedVersion.seo_title && (
                                        <div className="mb-3 pb-3 border-b">
                                            <p className="text-sm text-gray-600"><strong>SEO Title:</strong> {selectedVersion.seo_title}</p>
                                            {selectedVersion.seo_description && (
                                                <p className="text-sm text-gray-600 mt-1"><strong>SEO Description:</strong> {selectedVersion.seo_description}</p>
                                            )}
                                        </div>
                                    )}
                                    <div 
                                        className="prose prose-sm max-w-none"
                                        dangerouslySetInnerHTML={{ __html: selectedVersion.content }}
                                    />
                                </div>
                            </>
                        ) : null}
                    </div>
                </div>
            )}
        </div>
    );
};

export default VersionControl;
