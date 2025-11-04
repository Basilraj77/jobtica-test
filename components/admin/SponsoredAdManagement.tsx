import React, { useState, useMemo } from 'react';
import { useData } from '../../contexts/DataContext.tsx';
import { SponsoredAd } from '../../types.ts';
import Icon from '../Icon.tsx';
import Modal from '../Modal.tsx';
import ConfirmationModal from './ConfirmationModal.tsx';
// import { useAuth } from '../../contexts/AuthContext.tsx'; // Removed as isDemoUser comes from useData

const EmptyState: React.FC<{ message: string; buttonText?: string; onButtonClick?: () => void; }> = ({ message, buttonText, onButtonClick }) => (
    <div className="text-center py-16 border-t">
      <Icon name="dollar-sign" className="text-5xl text-gray-300 mb-4" />
      <h3 className="text-lg font-semibold text-gray-600">{message}</h3>
      {buttonText && onButtonClick && (
        <button onClick={onButtonClick} className="mt-4 bg-[var(--primary-color)] text-white px-4 py-2 rounded-md flex items-center gap-2 filter hover:brightness-90 mx-auto">
          <Icon name="plus" /> {buttonText}
        </button>
      )}
    </div>
);

const SponsoredAdForm: React.FC<{ ad?: SponsoredAd; onSave: (ad: Omit<SponsoredAd, 'id' | 'clicks'>, id?: string) => void; onCancel: () => void; }> = ({ ad, onSave, onCancel }) => {
    const [formData, setFormData] = useState<Omit<SponsoredAd, 'id' | 'clicks'>>(ad ? { ...ad, clicks: undefined } : {
        imageUrl: '',
        destinationUrl: '',
        placement: 'sidebar-top',
        status: 'active'
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value as any }));
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({ ...prev, imageUrl: reader.result as string }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData, ad?.id);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700">Ad Image URL *</label>
                <div className="mt-2 flex items-center gap-4">
                    {formData.imageUrl ? (
                        <img src={formData.imageUrl} alt="Ad Preview" className="h-16 w-auto max-w-[64px] object-contain rounded-md border p-1 bg-gray-100" loading="lazy" />
                    ) : (
                        <div className="h-16 w-16 bg-gray-100 rounded-md flex items-center justify-center border">
                            <Icon name="image" className="text-3xl text-gray-400" />
                        </div>
                    )}
                    <div className="flex-grow">
                        <input
                            id="ad-image-upload"
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="hidden"
                        />
                        <label htmlFor="ad-image-upload" className="cursor-pointer bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50">
                            Upload Image
                        </label>
                        <p className="text-xs text-gray-500 mt-1">Or paste URL below</p>
                    </div>
                </div>
                <input type="url" name="imageUrl" value={formData.imageUrl} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" required />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Destination URL *</label>
                <input type="url" name="destinationUrl" value={formData.destinationUrl} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" required />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Placement *</label>
                    <select name="placement" value={formData.placement} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md bg-white" required>
                        <option value="sidebar-top">Sidebar Top</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Status *</label>
                    <select name="status" value={formData.status} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md bg-white" required>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                    </select>
                </div>
            </div>
            <div className="flex justify-end gap-4 mt-6 pt-4 border-t">
                <button type="button" onClick={onCancel} className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300">Cancel</button>
                <button type="submit" className="bg-[var(--primary-color)] text-white px-4 py-2 rounded-md filter hover:brightness-90">Save Ad</button>
            </div>
        </form>
    );
};

const SponsoredAdManagement: React.FC = () => {
    const { sponsoredAds, addSponsoredAd, updateSponsoredAd, deleteSponsoredAd, demoUserSettings, securitySettings } = useData();
    // Fix: Use securitySettings.demoModeEnabled, not demoUserSettings
    const isDemoUser = securitySettings.demoModeEnabled;
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAd, setEditingAd] = useState<SponsoredAd | undefined>(undefined);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [adToDelete, setAdToDelete] = useState<SponsoredAd | null>(null);

    const canManage = !isDemoUser || demoUserSettings.canManageAds;

    const handleSave = (adData: Omit<SponsoredAd, 'id' | 'clicks'>, id?: string) => {
        if (!canManage) return;
        if (id) {
            // Clicks should not be updated from here, only internally tracked
            updateSponsoredAd({ ...adData, id, clicks: editingAd?.clicks || 0 });
        } else {
            addSponsoredAd(adData);
        }
        setIsModalOpen(false);
        setEditingAd(undefined);
    };

    const handleEdit = (ad: SponsoredAd) => {
        if (!canManage) return;
        setEditingAd(ad);
        setIsModalOpen(true);
    };

    const handleDeleteRequest = (ad: SponsoredAd) => {
        if (!canManage) return;
        setAdToDelete(ad);
        setIsConfirmModalOpen(true);
    };

    const confirmDelete = () => {
        if (adToDelete) {
            deleteSponsoredAd(adToDelete.id);
        }
        setIsConfirmModalOpen(false);
        setAdToDelete(null);
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-700">Sponsored Ads</h2>
                {canManage && (
                    <button onClick={() => { setEditingAd(undefined); setIsModalOpen(true); }} className="bg-[var(--primary-color)] text-white px-4 py-2 rounded-md flex items-center gap-2 filter hover:brightness-90">
                        <Icon name="plus" /> Add New Ad
                    </button>
                )}
            </div>
            {sponsoredAds.length > 0 ? (
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500 responsive-table">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                        <tr>
                            <th className="px-6 py-3">Image</th>
                            <th className="px-6 py-3">Destination URL</th>
                            <th className="px-6 py-3">Placement</th>
                            <th className="px-6 py-3">Status</th>
                            <th className="px-6 py-3">Clicks</th>
                            <th className="px-6 py-3">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sponsoredAds.map(ad => (
                            <tr key={ad.id} className="bg-white hover:bg-gray-50 border-b">
                                <td data-label="Image" className="px-6 py-4">
                                    <img src={ad.imageUrl} alt="Ad" className="w-16 h-10 object-cover rounded-md bg-gray-200" loading="lazy" />
                                </td>
                                <td data-label="URL" className="px-6 py-4 truncate max-w-xs"><a href={ad.destinationUrl} target="_blank" rel="noopener noreferrer" className="text-[var(--primary-color)] hover:underline">{ad.destinationUrl}</a></td>
                                <td data-label="Placement" className="px-6 py-4">{ad.placement}</td>
                                <td data-label="Status" className="px-6 py-4">
                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${ad.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{ad.status}</span>
                                </td>
                                <td data-label="Clicks" className="px-6 py-4">{ad.clicks}</td>
                                <td data-label="Actions" className="px-6 py-4 flex gap-4 actions-cell">
                                    {canManage && (
                                        <>
                                            <button onClick={() => handleEdit(ad)} className="text-yellow-500 hover:text-yellow-700" aria-label={`Edit ad: ${ad.destinationUrl}`}><Icon name="edit" /></button>
                                            <button onClick={() => handleDeleteRequest(ad)} className="text-red-500 hover:text-red-700" aria-label={`Delete ad: ${ad.destinationUrl}`}><Icon name="trash" /></button>
                                        </>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            ) : (
                <EmptyState 
                    message="No sponsored ads have been added yet."
                    buttonText={canManage ? "Add New Ad" : undefined}
                    onButtonClick={canManage ? () => { setEditingAd(undefined); setIsModalOpen(true); } : undefined}
                />
            )}
             <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingAd ? 'Edit Sponsored Ad' : 'Add New Sponsored Ad'}>
                <SponsoredAdForm ad={editingAd} onSave={handleSave} onCancel={() => setIsModalOpen(false)} />
            </Modal>
            <ConfirmationModal
                isOpen={isConfirmModalOpen}
                onClose={() => setIsConfirmModalOpen(false)}
                onConfirm={confirmDelete}
                title="Confirm Deletion"
                message={<>Are you sure you want to delete this sponsored ad for: <strong>"{adToDelete?.destinationUrl}"</strong>?</>}
                confirmText="Delete"
            />
        </div>
    );
};

export default SponsoredAdManagement;