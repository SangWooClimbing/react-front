import React, { useState, useEffect, useRef } from 'react';
import { UserProfile } from '../../types';
import Button from '../ui/Button';
import { XMarkIcon, CameraIcon, UserIcon, PencilIcon } from '@heroicons/react/24/outline';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  onSave: (updatedData: { username: string; bio: string; profileImageUrl?: string }) => void;
}

const EditProfileModal: React.FC<EditProfileModalProps> = ({ isOpen, onClose, profile, onSave }) => {
  const [editedUsername, setEditedUsername] = useState(profile.username);
  const [editedBio, setEditedBio] = useState(profile.bio || '');
  const [newProfileImageFile, setNewProfileImageFile] = useState<File | null>(null);
  const [newProfileImagePreview, setNewProfileImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setEditedUsername(profile.username);
      setEditedBio(profile.bio || '');
      setNewProfileImageFile(null);
      setNewProfileImagePreview(null); 
    }
  }, [isOpen, profile]);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setNewProfileImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewProfileImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    // In a real app, newProfileImageFile would be uploaded to a server,
    // and newProfileImagePreview would be the URL returned by the server.
    // For mock, we'll just use the preview URL or a new picsum URL if a file was selected.
    let updatedImageUrl = profile.profileImageUrl;
    if (newProfileImageFile) {
        // Simulate new image URL - using picsum based on a new seed for variety
        updatedImageUrl = `https://picsum.photos/seed/${Date.now()}/200/200`;
        console.log("Mock: New profile image selected, would be uploaded. Using new URL:", updatedImageUrl);
    }

    onSave({
      username: editedUsername,
      bio: editedBio,
      profileImageUrl: updatedImageUrl
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div 
        className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-opacity duration-300 ease-in-out"
        aria-modal="true"
        role="dialog"
    >
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md transform transition-all duration-300 ease-in-out scale-100">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-slate-800">Edit Profile</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-700">
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="flex flex-col items-center space-y-3">
            <div className="relative group">
                <img
                    src={newProfileImagePreview || profile.profileImageUrl}
                    alt="Profile"
                    className="w-32 h-32 rounded-full object-cover border-2 border-slate-300"
                />
                <button
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 flex items-center justify-center rounded-full transition-opacity"
                    aria-label="Change profile photo"
                >
                   <CameraIcon className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity"/>
                </button>
            </div>
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleImageChange}
              className="hidden"
            />
             <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} leftIcon={<CameraIcon className="h-4 w-4"/>}>
                Change Photo
            </Button>
          </div>

          <div>
            <label htmlFor="username" className="block text-sm font-medium text-slate-700 mb-1">Username</label>
             <div className="relative">
                <UserIcon className="h-5 w-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2"/>
                <input
                type="text"
                id="username"
                value={editedUsername}
                onChange={(e) => setEditedUsername(e.target.value)}
                className="w-full p-2 pl-10 border border-slate-300 rounded-md focus:ring-primary focus:border-primary"
                />
            </div>
          </div>

          <div>
            <label htmlFor="bio" className="block text-sm font-medium text-slate-700 mb-1">Bio / Status Message</label>
             <div className="relative">
                <PencilIcon className="h-5 w-5 text-slate-400 absolute left-3 top-3"/>
                <textarea
                    id="bio"
                    value={editedBio}
                    onChange={(e) => setEditedBio(e.target.value)}
                    rows={3}
                    className="w-full p-2 pl-10 border border-slate-300 rounded-md focus:ring-primary focus:border-primary"
                    placeholder="Tell us something about yourself..."
                />
            </div>
          </div>
        </div>

        <div className="mt-8 flex justify-end space-x-3">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={handleSave}>Save Changes</Button>
        </div>
      </div>
    </div>
  );
};

export default EditProfileModal;