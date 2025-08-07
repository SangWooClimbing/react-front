import React, { useState, useEffect, useCallback } from 'react';
import { Gym, DifficultyGrade, MediaItem } from '../types';
import { DIFFICULTY_LEVELS } from '../constants';
import Button from '../components/ui/Button';
import { ArrowUpTrayIcon, TagIcon, MapPinIcon, PencilIcon, CalendarDaysIcon, TrashIcon } from '@heroicons/react/24/outline';

interface TagInputProps {
  tags: string[];
  setTags: React.Dispatch<React.SetStateAction<string[]>>;
  suggestions?: string[];
}

const TagInput: React.FC<TagInputProps> = ({ tags, setTags, suggestions = [] }) => {
  const [inputValue, setInputValue] = useState('');
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    if (value && suggestions.length > 0) {
      setFilteredSuggestions(
        suggestions.filter(suggestion =>
          suggestion.toLowerCase().includes(value.toLowerCase()) && !tags.includes(suggestion)
        )
      );
    } else {
      setFilteredSuggestions([]);
    }
  };

  const addTag = (tagValue: string) => {
    const newTag = tagValue.trim();
    if (newTag && !tags.includes(newTag)) {
      setTags([...tags, newTag]);
    }
    setInputValue('');
    setFilteredSuggestions([]);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(inputValue);
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-2">
        {tags.map(tag => (
          <span key={tag} className="bg-primary text-white px-3 py-1 rounded-full text-sm flex items-center">
            {tag}
            <button onClick={() => removeTag(tag)} className="ml-2 text-blue-200 hover:text-white" aria-label={`Remove tag ${tag}`}>
              &times;
            </button>
          </span>
        ))}
      </div>
      <input
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        placeholder="Add tags (e.g., V5, Overhang, Dyno)"
        className="w-full p-2 border border-slate-300 rounded-md focus:ring-primary focus:border-primary"
      />
      {filteredSuggestions.length > 0 && (
        <ul className="border border-slate-300 rounded-md mt-1 max-h-40 overflow-y-auto">
          {filteredSuggestions.map(suggestion => (
            <li 
              key={suggestion} 
              onClick={() => addTag(suggestion)}
              className="p-2 hover:bg-slate-100 cursor-pointer"
            >
              {suggestion}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

interface MediaFilePreview extends File {
  previewUrl: string;
  id: string; 
}

const MAX_MEDIA_FILES = 20;

interface UploadPageProps {
    userId: string | null; 
}

const UploadPage: React.FC<UploadPageProps> = ({ userId }) => {
  const [mediaFiles, setMediaFiles] = useState<MediaFilePreview[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [climbDate, setClimbDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [tags, setTags] = useState<string[]>([]);
  const [selectedGymId, setSelectedGymId] = useState<string>('');
  const [availableGyms, setAvailableGyms] = useState<Gym[]>([]);
  const [isLoadingGyms, setIsLoadingGyms] = useState(true);
  const [difficulty, setDifficulty] = useState<DifficultyGrade | ''>('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string>('');

  const predefinedTagSuggestions = [...DIFFICULTY_LEVELS, "Overhang", "Slab", "Vertical", "Crimpy", "Slopers", "Dyno", "Static", "Competition", "Training"];

  useEffect(() => {
    const fetchGyms = async () => {
      setIsLoadingGyms(true);
      try {
        // Assuming this is the correct endpoint for gyms.
        const response = await fetch('/api/gyms'); // Adjust if your API is different
        if (!response.ok) throw new Error('Failed to fetch gyms');
        const data = await response.json();
        setAvailableGyms(data.data || []);
      } catch (error) {
        console.error("Error fetching gyms:", error);
        setUploadError("Could not load gym list.");
      } finally {
        setIsLoadingGyms(false);
      }
    };
    fetchGyms();
  }, []);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      if (mediaFiles.length + files.length > MAX_MEDIA_FILES) {
        setUploadError(`You can upload a maximum of ${MAX_MEDIA_FILES} media items.`);
        return;
      }
      setUploadError('');
      const newMediaFiles: MediaFilePreview[] = Array.from(files).map(file => Object.assign(file, {
        previewUrl: URL.createObjectURL(file),
        id: `${file.name}-${Date.now()}`
      }));
      setMediaFiles(prev => [...prev, ...newMediaFiles]);
    }
  };

  const removeMediaFile = (fileIdToRemove: string) => {
    setMediaFiles(prev => {
      const fileToRemove = prev.find(f => f.id === fileIdToRemove);
      if (fileToRemove) URL.revokeObjectURL(fileToRemove.previewUrl);
      return prev.filter(file => file.id !== fileIdToRemove);
    });
    if (mediaFiles.length -1 <= MAX_MEDIA_FILES) setUploadError('');
  };
  
  useEffect(() => {
    return () => {
      mediaFiles.forEach(file => URL.revokeObjectURL(file.previewUrl));
    };
  }, [mediaFiles]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!userId) {
        setUploadError('You must be logged in to upload.');
        return;
    }
    if (mediaFiles.length === 0) {
      setUploadError('Please select at least one media file.');
      return;
    }
    if (!title.trim()) {
      setUploadError('Please provide a title.');
      return;
    }
    if (!climbDate) {
      setUploadError('Please select the climb date.');
      return;
    }
    setUploadError('');
    setIsUploading(true);

    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('climbDate', climbDate);
    formData.append('uploaderId', userId);
    if (difficulty) formData.append('difficulty', difficulty);
    tags.forEach(tag => formData.append('tags', tag));
    if (selectedGymId) formData.append('gymId', selectedGymId);
    mediaFiles.forEach(file => formData.append('mediaFiles', file, file.name));

    try {
      const token = localStorage.getItem('accessToken');
      // Assuming this is the correct endpoint for uploading videos.
      const response = await fetch('/api/videos', { // Assuming POST to /api/videos for new video posts
        method: 'POST',
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}, // No 'Content-Type' for FormData
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: `Upload failed with status: ${response.statusText}`}));
        throw new Error(errorData.message || 'Upload failed.');
      }
      
      // const newPostData = await response.json(); // If backend returns the created post
      alert('Post uploaded successfully!');
      
      mediaFiles.forEach(file => URL.revokeObjectURL(file.previewUrl));
      setMediaFiles([]);
      setTitle('');
      setDescription('');
      setClimbDate(new Date().toISOString().split('T')[0]);
      setTags([]);
      setSelectedGymId('');
      setDifficulty('');

    } catch (err) {
      console.error('Upload API error:', err);
      setUploadError(err instanceof Error ? err.message : 'An unexpected error occurred during upload.');
    } finally {
      setIsUploading(false);
    }
  };


  return (
    <div className="max-w-3xl mx-auto bg-white p-8 rounded-lg shadow-xl">
      <h1 className="text-3xl font-bold text-slate-800 mb-8 text-center flex items-center justify-center">
        <ArrowUpTrayIcon className="h-8 w-8 mr-3 text-primary" /> Upload Your Climb
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="mediaFiles" className="block text-sm font-medium text-slate-700 mb-1">
            Media Files (Images/Videos - Max {MAX_MEDIA_FILES})
          </label>
          <input
            type="file"
            id="mediaFiles"
            accept="image/*,video/*"
            multiple
            onChange={handleFileChange}
            className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-blue-700 cursor-pointer"
            disabled={mediaFiles.length >= MAX_MEDIA_FILES}
          />
           {mediaFiles.length >= MAX_MEDIA_FILES && <p className="text-xs text-amber-600 mt-1">Maximum number of files reached.</p>}
        </div>

        {mediaFiles.length > 0 && (
          <div>
            <h3 className="text-md font-medium text-slate-700 mb-2">Selected Media ({mediaFiles.length}/{MAX_MEDIA_FILES}):</h3>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
              {mediaFiles.map((file) => (
                <div key={file.id} className="relative group aspect-square bg-slate-100 rounded-md overflow-hidden">
                  {file.type.startsWith('image/') ? (
                    <img src={file.previewUrl} alt={file.name} className="w-full h-full object-cover" />
                  ) : (
                    <video src={file.previewUrl} className="w-full h-full object-cover" muted playsInline />
                  )}
                  <button 
                    type="button"
                    onClick={() => removeMediaFile(file.id)}
                    className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Remove media"
                    aria-label={`Remove ${file.name}`}
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                   <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-1 truncate">
                    {file.name}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {uploadError && <p className="text-sm text-red-600 bg-red-50 p-3 rounded-md">{uploadError}</p>}

        <div>
          <label htmlFor="title" className="block text-sm font-medium text-slate-700 mb-1">Title</label>
          <div className="relative">
            <PencilIcon className="h-5 w-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2"/>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., My Crux Send on 'The Archangel'"
              className="w-full p-2 pl-10 border border-slate-300 rounded-md focus:ring-primary focus:border-primary"
              required
            />
          </div>
        </div>

        <div>
          <label htmlFor="climbDate" className="block text-sm font-medium text-slate-700 mb-1">Climb Date</label>
          <div className="relative">
            <CalendarDaysIcon className="h-5 w-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2"/>
            <input
              type="date"
              id="climbDate"
              value={climbDate}
              onChange={(e) => setClimbDate(e.target.value)}
              className="w-full p-2 pl-10 border border-slate-300 rounded-md focus:ring-primary focus:border-primary"
              required
            />
          </div>
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-slate-700 mb-1">Description</label>
           <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="Tell us about your climb! What was challenging? Any beta?"
            className="w-full p-2 border border-slate-300 rounded-md focus:ring-primary focus:border-primary"
          ></textarea>
        </div>
        
        <div>
          <label htmlFor="difficulty" className="block text-sm font-medium text-slate-700 mb-1">Difficulty</label>
          <select
            id="difficulty"
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value as DifficultyGrade)}
            className="w-full p-2 border border-slate-300 rounded-md focus:ring-primary focus:border-primary"
          >
            <option value="">Select difficulty (optional)</option>
            {DIFFICULTY_LEVELS.map(level => (
              <option key={level} value={level}>{level}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="tags" className="block text-sm font-medium text-slate-700 mb-1">Tags</label>
          <TagInput tags={tags} setTags={setTags} suggestions={predefinedTagSuggestions} />
        </div>

        <div>
          <label htmlFor="gym" className="block text-sm font-medium text-slate-700 mb-1">Gym (Optional)</label>
          <div className="relative">
            <MapPinIcon className="h-5 w-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2"/>
            <select
              id="gym"
              value={selectedGymId}
              onChange={(e) => setSelectedGymId(e.target.value)}
              className="w-full p-2 pl-10 border border-slate-300 rounded-md focus:ring-primary focus:border-primary"
              disabled={isLoadingGyms}
            >
              <option value="">Select a gym</option>
              {availableGyms.map(gym => (
                <option key={gym.id} value={gym.id}>{gym.name}</option>
              ))}
              {isLoadingGyms && <option value="" disabled>Loading gyms...</option>}
              {!isLoadingGyms && availableGyms.length === 0 && <option value="" disabled>No gyms available.</option>}
            </select>
          </div>
        </div>

        <Button type="submit" variant="primary" size="lg" isLoading={isUploading} className="w-full" leftIcon={<ArrowUpTrayIcon className="h-5 w-5"/>} disabled={!userId || isUploading}>
          {isUploading ? 'Uploading...' : 'Upload Climb'}
        </Button>
      </form>
    </div>
  );
};

export default UploadPage;
