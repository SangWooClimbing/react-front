export interface User {
  id: string;
  username: string;
  profileImageUrl: string;
  bio?: string;
  isCertifiedSeller?: boolean;
}

export interface MediaItem {
  id: string; // Unique ID for the media item
  type: 'image' | 'video';
  url: string; // URL for the full-size image or video file
  thumbnailUrl?: string; // Optional: for video posters or optimized image previews
}

export interface GymStats {
  // totalRoutes: number; // Removed
  averageRating: number;
  difficultyDistribution: { [difficulty: string]: number };
  dailyUserCounts: Record<string, number>; // Key: "YYYY-MM-DD", Value: count
}

export interface Gym {
  id: string;
  name: string;
  location: string;
  instagramId?: string;
  website?: string;
  logoUrl: string;
  coverImageUrl: string;
  stats: GymStats;
  description: string;
  bookmarkedByUsers: string[]; // Array of user IDs who bookmarked the gym
}

export interface VideoPost {
  id: string;
  title: string;
  media: MediaItem[]; // Array of media items, max 20
  climbDate: string; // YYYY-MM-DD format
  uploader: User;
  gym?: Gym;
  tags: string[];
  description: string;
  uploadDate: string; // ISO string for when the post was created
  views: number;
  likes: number; // Represents the count of likes, derived from likedByUsers.length
  likedByUsers: string[]; // Array of user IDs who liked the post
  bookmarkedByUsers: string[]; // Array of user IDs who bookmarked the post
}

export interface Notification {
  id: string;
  type: 'new_route' | 'event' | 'gym_update' | 'mention' | 'store_new_item';
  title: string;
  message: string;
  date: string; // ISO string
  read: boolean;
  link?: string;
  relatedGym?: Gym;
  relatedStoreItemId?: string;
}

export interface UserProfile extends User {
  solvedStats: {
    totalSolved: number; // This might now represent total posts or unique problems from posts
    grades: { [grade: string]: number };
    problemTypes: { [type: string]: number };
  };
  frequentGyms: { gym: Gym; visitCount: number }[];
  climbingActivity: ClimbingDay[]; // For calendar, updated by posts with climbDate and gym
  posts: VideoPost[];
  bookmarkedPostIds: string[]; // Array of VideoPost IDs
  bookmarkedGymIds: string[]; // Array of Gym IDs
}

export interface ClimbingDay {
  date: string; // YYYY-MM-DD
  gymId: string;
  gymName: string;
  gymLogoUrl: string;
}

export enum DifficultyGrade {
  VB = 'VB',
  V0 = 'V0',
  V1 = 'V1',
  V2 = 'V2',
  V3 = 'V3',
  V4 = 'V4',
  V5 = 'V5',
  V6 = 'V6',
  V7 = 'V7',
  V8 = 'V8',
  V9 = 'V9',
  V10_PLUS = 'V10+',
}

export interface StoreItem {
  id: string;
  name: string;
  description: string; // Markdown content
  price: number;
  currency: string;
  images: MediaItem[]; // Array of images for the item
  category: 'Clothing' | 'Chalk' | 'Shoes' | 'Crash Pads' | 'Gear' | 'Other';
  seller: User;
  postedDate: string; // ISO string
  condition?: 'New' | 'Used - Like New' | 'Used - Good' | 'Used - Fair';
  brand?: string;
  specs?: Record<string, string>; // e.g., {"Size": "M", "Weight": "200g"}
  stock?: number; // For items that might have multiple in stock, defaults to 1 if undefined for used gear
}

export interface CartItem extends StoreItem {
  quantity: number;
}

export type SearchResultItem = Gym | VideoPost | StoreItem;

export function isGym(item: SearchResultItem): item is Gym {
  return (item as Gym).stats !== undefined && (item as Gym).coverImageUrl !== undefined;
}

export function isVideoPost(item: SearchResultItem): item is VideoPost {
  // Check for media array presence and uploader as distinguishing factors
  return (item as VideoPost).media !== undefined && (item as VideoPost).uploader !== undefined;
}

export function isStoreItem(item: SearchResultItem): item is StoreItem {
  return (item as StoreItem).price !== undefined && (item as StoreItem).images !== undefined;
}