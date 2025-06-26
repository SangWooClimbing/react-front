import { DifficultyGrade, StoreItem } from './types';

export const ROUTE_PATHS = {
  HOME: '/',
  NOTIFICATIONS: '/notifications',
  UPLOAD: '/upload',
  SEARCH_RESULTS: '/search-results', 
  PROFILE: '/profile', 
  USER_VIDEOS: (userId: string) => `/profile/${userId}/videos`, 
  VIDEO_POST_DETAILS: (postId: string) => `/post/${postId}`,
  LOGIN: '/login',
  STORE: '/store', 
  STORE_ITEM: (itemId: string) => `/store/${itemId}`, 
  SETTINGS: '/settings', 
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

// MOCK_USER_ID is removed as authentication is now handled dynamically.
// Components should rely on the loggedInUserId prop from App.tsx or similar.

export const APP_LOGO_TEXT = "ClimbLog";

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

export const STORE_CATEGORIES: StoreItem['category'][] = ['Clothing', 'Chalk', 'Shoes', 'Crash Pads', 'Gear', 'Other'];
