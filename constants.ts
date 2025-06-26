
import { DifficultyGrade, StoreItem } from './types';

export const ROUTE_PATHS = {
  HOME: '/',
  NOTIFICATIONS: '/notifications',
  UPLOAD: '/upload',
  SEARCH_RESULTS: '/search-results', // Changed from SEARCH
  PROFILE: '/profile', // Base path, will often be /profile/:userId
  USER_VIDEOS: (userId: string) => `/profile/${userId}/videos`, // New
  LOGIN: '/login',
  STORE: '/store', // New
  STORE_ITEM: (itemId: string) => `/store/${itemId}`, // New for viewing a specific item
  SETTINGS: '/settings', // New settings page
};

export const DIFFICULTY_LEVELS: DifficultyGrade[] = [
  DifficultyGrade.VB,
  DifficultyGrade.V0,
  DifficultyGrade.V1,
  DifficultyGrade.V2,
  DifficultyGrade.V3,
  DifficultyGrade.V4,
  DifficultyGrade.V5,
  DifficultyGrade.V6,
  DifficultyGrade.V7,
  DifficultyGrade.V8,
  DifficultyGrade.V9,
  DifficultyGrade.V10_PLUS,
];

export const MOCK_USER_ID = 'user123'; // For current logged-in user simulation

export const APP_LOGO_TEXT = "ClimbLog";
// Using a generic placeholder for logo. Replace with actual logo URL if available.
// For example, a simple SVG or a link to an image.
// Using a text-based SVG for simplicity:
const generateLogoSvg = (text: string) => {
    const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="30" viewBox="0 0 100 30">
        <rect width="100%" height="100%" fill="#3B82F6"/>
        <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="Arial, sans-serif" font-size="14" fill="white" font-weight="bold">
            ${text}
        </text>
    </svg>`;
    return `data:image/svg+xml;base64,${btoa(svgContent)}`;
};
export const APP_LOGO_URL = generateLogoSvg(APP_LOGO_TEXT);

// FIX: Corrected to use StoreItem type, which requires importing it.
export const STORE_CATEGORIES: StoreItem['category'][] = ['Clothing', 'Chalk', 'Shoes', 'Crash Pads', 'Gear', 'Other'];