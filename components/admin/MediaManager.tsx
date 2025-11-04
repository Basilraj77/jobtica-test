import React, { useState, useEffect, useCallback, useRef } from 'react';
import Icon from '../Icon.tsx';

interface MediaFile {
    id: string;
    filename: string;
    original_filename: string;
    file_path: string;
    public_url: string;
    file_size: number;
    mime_type: string;
    media_type: 'image' | 'video' | 'audio' | 'document' | 'other';
    category?: string;
    alt_text?: string;
    title?: string;
    width?: number;
    height?: number;
    created_at: string;
}

interface MediaManagerProps {
    onSelectMedia?: (media: MediaFile) => void;
    onClose?: () => void;
    mode?: 'select' | 'manage';
}

const MediaManager: React.FC<MediaManagerProps> = ({ onSelectMedia, onClose, mode = 'manage' }) => {
    const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState<string>('all');
    const [selectedFile, setSelectedFile] = useState<MediaFile | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const dropZoneRef = useRef<HTMLDivElement>(null);

    const ITEMS_PER_PAGE = 20;

    useEffect(() => {
        loadMediaFiles();
    }, [currentPage, filterType]);

    const loadMediaFiles = async () => {
        setLoading(true);
        setError(null);
        try {
            const params = new URLSearchParams({
                page: currentPage.toString(),
                limit: ITEMS_PER_PAGE.toString(),
            });
            if (filterType !== 'all') {
                params.append('type', filterType);
            }

            const response = await fetch(`/api/media?${params}`, {
                credentials: 'include',
            });

            if (!response.ok) {
                throw new Error('Failed to load media files');
            }

            const data = await response.json();
            setMediaFiles(data.media || []);
            setTotalPages(data.pagination?.total_pages || 1);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load media');
            console.error('Error loading media:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleFileUpload = async (files: FileList | null) => {
        if (!files || files.length === 0) return;

        setUploading(true);
        setError(null);

        try {
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                const formData = new FormData();
                formData.append('file', file);
                formData.append('category', 'content-media');

                const response = await fetch('/api/media/upload', {
                    method: 'POST',
                    body: formData,
                    credentials: 'include',
                });

                if (!response.ok) {
                    throw new Error(`Failed to upload ${file.name}`);
                }
            }

            await loadMediaFiles();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Upload failed');
            console.error('Upload error:', err);
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (mediaId: string) => {
        if (!confirm('Are you sure you want to delete this media file?')) return;

        try {
            const response = await fetch(`/api/media/${mediaId}`, {
                method: 'DELETE',
                credentials: 'include',
            });

            if (!response.ok) {
                throw new Error('Failed to delete media');
            }

            await loadMediaFiles();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Delete failed');
            console.error('Delete error:', err);
        }
    };

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        handleFileUpload(e.dataTransfer.files);
    }, []);

    const filteredMedia = mediaFiles.filter(media => {
        if (searchQuery) {
            return (
                media.original_filename.toLowerCase().includes(searchQuery.toLowerCase()) ||
                media.alt_text?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                media.title?.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }
        return true;
    });

    const formatFileSize = (bytes: number): string => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    const getMediaIcon = (type: string): string => {
        switch (type) {
            case 'image': return 'image';
            case 'video': return 'video';
            case 'audio': return 'music';
            case 'document': return 'file-alt';
            default: return 'file';
        }
    };

    return (
        <div className="flex flex-col h-full bg-white rounded-lg">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b">
                <h2 className="text-xl font-semibold">Media Library</h2>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Icon name="upload" />
                        {uploading ? 'Uploading...' : 'Upload Files'}
                    </button>
                    {onClose && (
                        <button
                            onClick={onClose}
                            className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded"
                        >
                            <Icon name="times" />
                        </button>
                    )}
                </div>
            </div>

            {/* Search and Filter */}
            <div className="flex flex-wrap items-center gap-3 p-4 border-b bg-gray-50">
                <div className="flex-1 min-w-[200px]">
                    <div className="relative">
                        <Icon name="search" className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search media..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>
                <select
                    value={filterType}
                    onChange={(e) => {
                        setFilterType(e.target.value);
                        setCurrentPage(1);
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    <option value="all">All Types</option>
                    <option value="image">Images</option>
                    <option value="video">Videos</option>
                    <option value="audio">Audio</option>
                    <option value="document">Documents</option>
                </select>
            </div>

            {/* Drop Zone */}
            <div
                ref={dropZoneRef}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`mx-4 mt-4 p-8 border-2 border-dashed rounded-lg text-center transition-colors ${
                    isDragging
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-300 bg-gray-50'
                }`}
            >
                <Icon name="cloud-upload-alt" className="text-4xl text-gray-400 mb-2" />
                <p className="text-gray-600 mb-2">Drag and drop files here</p>
                <p className="text-sm text-gray-500">or click the Upload button above</p>
            </div>

            {/* Error Message */}
            {error && (
                <div className="mx-4 mt-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-center gap-2 text-red-700">
                    <Icon name="exclamation-circle" />
                    <span>{error}</span>
                </div>
            )}

            {/* Media Grid */}
            <div className="flex-1 overflow-y-auto p-4">
                {loading ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="flex flex-col items-center gap-3">
                            <Icon name="spinner" className="text-4xl text-blue-600 animate-spin" />
                            <p className="text-gray-600">Loading media files...</p>
                        </div>
                    </div>
                ) : filteredMedia.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                        <Icon name="folder-open" className="text-5xl mb-3" />
                        <p className="text-lg">No media files found</p>
                        <p className="text-sm">Upload some files to get started</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {filteredMedia.map((media) => (
                            <div
                                key={media.id}
                                onClick={() => setSelectedFile(media)}
                                className={`group relative aspect-square rounded-lg overflow-hidden border-2 cursor-pointer transition-all ${
                                    selectedFile?.id === media.id
                                        ? 'border-blue-500 ring-2 ring-blue-200'
                                        : 'border-gray-200 hover:border-gray-300'
                                }`}
                            >
                                {/* Thumbnail */}
                                {media.media_type === 'image' ? (
                                    <img
                                        src={media.public_url}
                                        alt={media.alt_text || media.original_filename}
                                        className="w-full h-full object-cover"
                                        loading="lazy"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-gray-100">
                                        <Icon name={getMediaIcon(media.media_type)} className="text-4xl text-gray-400" />
                                    </div>
                                )}

                                {/* Overlay */}
                                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                                    <div className="flex gap-2">
                                        {mode === 'select' && onSelectMedia && (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onSelectMedia(media);
                                                    onClose?.();
                                                }}
                                                className="p-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                                title="Select"
                                            >
                                                <Icon name="check" />
                                            </button>
                                        )}
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                window.open(media.public_url, '_blank');
                                            }}
                                            className="p-2 bg-gray-700 text-white rounded-md hover:bg-gray-800"
                                            title="View"
                                        >
                                            <Icon name="eye" />
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDelete(media.id);
                                            }}
                                            className="p-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                                            title="Delete"
                                        >
                                            <Icon name="trash" />
                                        </button>
                                    </div>
                                </div>

                                {/* File info */}
                                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-2 text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                                    <p className="truncate" title={media.original_filename}>
                                        {media.original_filename}
                                    </p>
                                    <p className="text-gray-300">{formatFileSize(media.file_size)}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 p-4 border-t">
                    <button
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="px-3 py-1 border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                        <Icon name="chevron-left" />
                    </button>
                    <span className="text-sm text-gray-600">
                        Page {currentPage} of {totalPages}
                    </span>
                    <button
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className="px-3 py-1 border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                        <Icon name="chevron-right" />
                    </button>
                </div>
            )}

            {/* Hidden file input */}
            <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*,video/*,audio/*,.pdf,.doc,.docx"
                onChange={(e) => handleFileUpload(e.target.files)}
                className="hidden"
            />

            {/* Selected File Details */}
            {selectedFile && mode === 'manage' && (
                <div className="border-t p-4 bg-gray-50">
                    <h3 className="font-semibold mb-2">File Details</h3>
                    <div className="space-y-2 text-sm">
                        <p><strong>Name:</strong> {selectedFile.original_filename}</p>
                        <p><strong>Type:</strong> {selectedFile.mime_type}</p>
                        <p><strong>Size:</strong> {formatFileSize(selectedFile.file_size)}</p>
                        {selectedFile.width && selectedFile.height && (
                            <p><strong>Dimensions:</strong> {selectedFile.width} × {selectedFile.height}</p>
                        )}
                        <p><strong>Uploaded:</strong> {new Date(selectedFile.created_at).toLocaleDateString()}</p>
                        <div className="pt-2">
                            <button
                                onClick={() => {
                                    navigator.clipboard.writeText(selectedFile.public_url);
                                    alert('URL copied to clipboard!');
                                }}
                                className="px-3 py-1 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 text-xs"
                            >
                                Copy URL
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MediaManager;
