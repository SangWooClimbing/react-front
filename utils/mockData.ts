import { Gym, VideoPost, User, Notification, UserProfile, ClimbingDay, DifficultyGrade, StoreItem, MediaItem } from '../types';
import { MOCK_USER_ID, DIFFICULTY_LEVELS, STORE_CATEGORIES, APP_LOGO_URL } from '../constants';

export const mockUsers: User[] = [
  { id: MOCK_USER_ID, username: 'Alex Honnold Jr.', profileImageUrl: `https://picsum.photos/seed/${MOCK_USER_ID}/100/100`, bio: 'Just climbing rocks and stuff. Living the vertical life!', isCertifiedSeller: true },
  { id: 'user2', username: 'Lynn Hill Fan', profileImageUrl: 'https://picsum.photos/seed/user2/100/100', bio: 'Free climbing enthusiast.', isCertifiedSeller: false },
  { id: 'user3', username: 'BoulderBro', profileImageUrl: 'https://picsum.photos/seed/user3/100/100', bio: 'Pebble wrestler for life.', isCertifiedSeller: false },
  { id: 'user4', username: 'GearGuru', profileImageUrl: 'https://picsum.photos/seed/user4/100/100', bio: 'Official ClimbLog Store seller. Specializes in high-end gear.', isCertifiedSeller: true },
];

export const mockGyms: Gym[] = [
  {
    id: 'gym1',
    name: 'The Crux Climbing Center',
    location: 'Sunnyvale, CA',
    instagramId: 'thecruxclimbing',
    website: 'https://thecrux.example.com',
    logoUrl: 'https://picsum.photos/seed/gym1logo/50/50',
    coverImageUrl: 'https://picsum.photos/seed/gym1cover/600/300',
    stats: { averageRating: 4.8, difficultyDistribution: { 'V3': 20, 'V4': 30, 'V5': 25 }, dailyUserCounts: {} },
    description: 'State-of-the-art facility with diverse routes for all levels. Friendly atmosphere and great community.'
  },
  {
    id: 'gym2',
    name: 'Vertical Ventures',
    location: 'Austin, TX',
    instagramId: 'verticalventuresatx',
    website: 'https://verticalventures.example.com',
    logoUrl: 'https://picsum.photos/seed/gym2logo/50/50',
    coverImageUrl: 'https://picsum.photos/seed/gym2cover/600/300',
    stats: { averageRating: 4.5, difficultyDistribution: { 'V5': 30, 'V6': 35, 'V7': 20 }, dailyUserCounts: {} },
    description: 'Tall walls and challenging overhangs. Home to local competitions and pro climber workshops.'
  },
  {
    id: 'gym3',
    name: 'Boulder Bliss',
    location: 'Boulder, CO',
    instagramId: 'boulderblissgym',
    website: 'https://boulderbliss.example.com',
    logoUrl: 'https://picsum.photos/seed/gym3logo/50/50',
    coverImageUrl: 'https://picsum.photos/seed/gym3cover/600/300',
    stats: { averageRating: 4.9, difficultyDistribution: { 'V1': 15, 'V2': 25, 'V3': 30 }, dailyUserCounts: {} },
    description: 'Focus on bouldering with a wide variety of problem styles. Regular setting updates.'
  },
    {
    id: 'gym4',
    name: 'Peak Performance',
    location: 'Seattle, WA',
    instagramId: 'peakperformancesea',
    website: 'https://peakperformance.example.com',
    logoUrl: 'https://picsum.photos/seed/gym4logo/50/50',
    coverImageUrl: 'https://picsum.photos/seed/gym4cover/600/300',
    stats: { averageRating: 4.6, difficultyDistribution: { 'V4': 22, 'V5': 33, 'V6': 28 }, dailyUserCounts: {} },
    description: 'Training-focused gym with system boards and a dedicated fitness area.'
  },
];

const generateMediaItems = (postId: string, count: number = 1): MediaItem[] => {
  const items: MediaItem[] = [];
  for (let i = 0; i < count; i++) {
    const type = Math.random() > 0.3 ? 'image' : 'video'; // 70% images, 30% videos
    if (type === 'image') {
      items.push({
        id: `${postId}-media${i}`,
        type: 'image',
        url: `https://picsum.photos/seed/${postId}img${i}/800/600`,
        thumbnailUrl: `https://picsum.photos/seed/${postId}imgthumb${i}/400/300`,
      });
    } else {
      items.push({
        id: `${postId}-media${i}`,
        type: 'video',
        url: 'https://www.w3schools.com/html/mov_bbb.mp4', // Generic placeholder video
        thumbnailUrl: `https://picsum.photos/seed/${postId}vidthumb${i}/400/225`, // Placeholder thumbnail for video
      });
    }
  }
  return items;
};

export let mockVideoPosts: VideoPost[] = [
  {
    id: 'post1',
    title: 'My First V5 Send!',
    media: generateMediaItems('post1', 3), // Post with 3 media items
    climbDate: '2024-07-10',
    uploader: mockUsers[0],
    gym: mockGyms[0],
    tags: [DifficultyGrade.V5, 'Overhang', 'Crimpy', 'The Crux'],
    description: 'So stoked to finally send this V5 project at The Crux! Took a few sessions but got it.',
    uploadDate: '2024-07-15T10:00:00Z',
    views: 1250,
    likes: 150,
  },
  {
    id: 'post2',
    title: 'Training Montage - Getting Stronger',
    media: generateMediaItems('post2', 1), // Single video post
    climbDate: '2024-07-12',
    uploader: mockUsers[1],
    gym: mockGyms[1],
    tags: ['Training', 'Campus Board', 'MoonBoard', DifficultyGrade.V7],
    description: 'Putting in the work at Vertical Ventures. Progress is slow but steady.',
    uploadDate: '2024-07-14T14:30:00Z',
    views: 800,
    likes: 95,
  },
  {
    id: 'post3',
    title: 'Fun Slab Problem at Boulder Bliss',
    media: generateMediaItems('post3', 5), // 5 media items (mix of image/video)
    climbDate: '2024-07-13',
    uploader: mockUsers[2],
    gym: mockGyms[2],
    tags: [DifficultyGrade.V3, 'Slab', 'Balance', 'Techy'],
    description: 'Slabs require so much technique! Fun little problem from today.',
    uploadDate: '2024-07-13T09:15:00Z',
    views: 2300,
    likes: 210,
  },
  {
    id: 'post4',
    title: 'Dyno Competition Highlights',
    media: generateMediaItems('post4', 1),
    climbDate: '2024-07-11',
    uploader: mockUsers[0],
    gym: mockGyms[3],
    tags: ['Competition', 'Dyno', 'Dynamic', 'Peak Performance'],
    description: 'Some cool dynos from the local comp at Peak Performance. Didn\'t win but had a blast!',
    uploadDate: '2024-07-12T18:00:00Z',
    views: 5000,
    likes: 450,
  },
   {
    id: 'post5',
    title: 'Cruising a V4 at The Crux',
    media: generateMediaItems('post5', 2),
    climbDate: '2024-07-09',
    uploader: mockUsers[1],
    gym: mockGyms[0],
    tags: [DifficultyGrade.V4, 'Flowy', 'Jug Haul', 'The Crux'],
    description: 'Nice and flowy V4 to warm up. Love the setting here.',
    uploadDate: '2024-07-11T11:00:00Z',
    views: 950,
    likes: 70,
  },
  {
    id: 'post6',
    title: 'Projecting a Tough V8',
    media: generateMediaItems('post6', 1),
    climbDate: '2024-07-08',
    uploader: mockUsers[0],
    gym: mockGyms[1],
    tags: [DifficultyGrade.V8, 'Project', 'Small Holds', 'Vertical Ventures'],
    description: 'This V8 is shutting me down! Making progress on the moves though.',
    uploadDate: '2024-07-10T16:45:00Z',
    views: 1800,
    likes: 180,
  },
];

export const mockNotifications: Notification[] = [
  { id: 'notif1', type: 'gym_update', title: 'New Routes at The Crux!', message: 'Fresh set of routes in the V3-V6 range. Come check them out!', date: '2024-07-15T09:00:00Z', read: false, relatedGym: mockGyms[0] },
  { id: 'notif2', type: 'event', title: 'Boulder Comp this Saturday', message: 'Vertical Ventures is hosting its annual bouldering competition. Sign up now!', date: '2024-07-14T12:00:00Z', read: false, relatedGym: mockGyms[1], link: '#' },
  { id: 'notif3', type: 'gym_update', title: 'Holiday Hours for Boulder Bliss', message: 'Boulder Bliss will have reduced hours on July 4th. Check website for details.', date: '2024-07-13T17:00:00Z', read: true, relatedGym: mockGyms[2] },
  { id: 'notif4', type: 'mention', title: '@BoulderBro mentioned you', message: 'Check out this sick dyno @Alex Honnold Jr. did!', date: '2024-07-12T10:00:00Z', read: false, link: `/post/post4`}, // Assuming post detail pages
  { id: 'notif5', type: 'store_new_item', title: 'New Climbing Shoes in Store!', message: 'La Sportiva Solutions now available from GearGuru.', date: '2024-07-16T10:00:00Z', read: false, relatedStoreItemId: 'item1' },
];

const generateClimbingActivity = (): ClimbingDay[] => {
  const activities: ClimbingDay[] = [];
  const today = new Date();
  for (let i = 0; i < 90; i++) {
    if (Math.random() > 0.7) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const gymIndex = Math.floor(Math.random() * mockGyms.length);
      const gym = mockGyms[gymIndex];
      activities.push({
        date: date.toISOString().split('T')[0],
        gymId: gym.id,
        gymName: gym.name,
        gymLogoUrl: gym.logoUrl,
      });
    }
  }
  // Add activities based on mockVideoPosts for the MOCK_USER_ID
  mockVideoPosts.forEach(post => {
    if (post.uploader.id === MOCK_USER_ID && post.gym && post.climbDate) {
        const existingActivity = activities.find(act => act.date === post.climbDate && act.gymId === post.gym!.id);
        if(!existingActivity) {
            activities.push({
                date: post.climbDate,
                gymId: post.gym.id,
                gymName: post.gym.name,
                gymLogoUrl: post.gym.logoUrl,
            });
        }
        // Simulate gym daily user count update for mock data initialization
        const gymToUpdate = mockGyms.find(g => g.id === post.gym!.id);
        if (gymToUpdate) {
            gymToUpdate.stats.dailyUserCounts[post.climbDate] = (gymToUpdate.stats.dailyUserCounts[post.climbDate] || 0) + 1;
        }
    }
  });
  return activities.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

export let mockUserProfile: UserProfile = {
  ...mockUsers[0], 
  isCertifiedSeller: true,
  bio: 'Lover of crimps and highballs. Always seeking the next challenge. Currently working on my V9 project.',
  solvedStats: {
    totalSolved: mockVideoPosts.filter(p => p.uploader.id === MOCK_USER_ID).length, // total posts by user
    grades: mockVideoPosts.filter(p => p.uploader.id === MOCK_USER_ID).reduce((acc, post) => {
        const gradeTag = post.tags.find(tag => DIFFICULTY_LEVELS.includes(tag as DifficultyGrade)) as DifficultyGrade | undefined;
        if (gradeTag) {
            acc[gradeTag] = (acc[gradeTag] || 0) + 1;
        }
        return acc;
    }, {} as { [key in DifficultyGrade]?: number }),
    problemTypes: { 'Overhang': 2, 'Project': 1, 'Competition': 1 }, // Simplified, could derive from tags
  },
  frequentGyms: [ // This could be dynamically calculated based on post.gym
    { gym: mockGyms[0], visitCount: mockVideoPosts.filter(p => p.uploader.id === MOCK_USER_ID && p.gym?.id === mockGyms[0].id).length },
    { gym: mockGyms[1], visitCount: mockVideoPosts.filter(p => p.uploader.id === MOCK_USER_ID && p.gym?.id === mockGyms[1].id).length },
  ].filter(fg => fg.visitCount > 0).sort((a,b) => b.visitCount - a.visitCount),
  climbingActivity: generateClimbingActivity(),
  posts: mockVideoPosts.filter(post => post.uploader.id === MOCK_USER_ID)
                      .sort((a, b) => new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime()),
};

const generateStoreItemImages = (itemId: string, count: number): MediaItem[] => {
  const items: MediaItem[] = [];
  for (let i = 0; i < count; i++) {
    items.push({
      id: `${itemId}-storeimage${i}`,
      type: 'image',
      url: `https://picsum.photos/seed/${itemId}storeimg${i}/800/600`,
      thumbnailUrl: `https://picsum.photos/seed/${itemId}storethumb${i}/200/150`,
    });
  }
  return items;
}

export const mockStoreItems: StoreItem[] = [
  {
    id: 'item1',
    name: 'La Sportiva Solution Climbing Shoes',
    description: `
### High-Performance Aggression

The La Sportiva Solution is a **legendary** climbing shoe, renowned for its aggressive downturn and P3 (Permanent Power Platform) technology. This ensures the shoe maintains its powerful shape over time, delivering exceptional edging and hooking capabilities.

#### Key Features:
*   **Aggressive Downturn:** Perfect for steep bouldering and sport routes.
*   **P3 Platform:** Retains downturned shape.
*   **Lock Harness System®:** Provides a secure and snug fit.
*   **Vibram® XS Grip2™ Rubber:** Offers unparalleled stickiness.
*   **Condition:** Barely used, excellent condition. Soles show minimal wear.

Ideal for climbers looking to push their grades on challenging terrain. These shoes excel in toe hooks, heel hooks, and precise footwork on small holds.
    `,
    price: 120,
    currency: 'USD',
    images: generateStoreItemImages('item1', 4), // 4 images for this item
    category: 'Shoes',
    seller: mockUsers.find(u => u.username.includes('Guru')) || mockUsers[3],
    postedDate: '2024-07-16T09:00:00Z',
    condition: 'Used - Like New',
    brand: 'La Sportiva',
    specs: { "Size": "EU 42 / US M 9", "Color": "White/Yellow" },
    stock: 1,
  },
  {
    id: 'item2',
    name: 'Black Diamond Momentum Harness Package',
    description: `
### Complete Beginner Setup

Everything a new climber needs to get started safely! The Black Diamond Momentum Harness is known for its comfort and adjustability.

#### Package Includes:
1.  **Momentum Harness:** Size Medium, Speed Adjust waistbelt.
2.  **ATC-XP Belay/Rappel Device:** Versatile and reliable.
3.  **RockLock Screwgate Carabiner:** Secure locking mechanism.
4.  **Mojo Chalk Bag:** With belt.
5.  **BD White Gold Chalk (sample):** Get started right away!

This package is brand new and has never been used. Perfect gift for someone starting their climbing journey or for a gym-to-crag transition.
    `,
    price: 85,
    currency: 'USD',
    images: generateStoreItemImages('item2', 3),
    category: 'Gear',
    seller: mockUsers.find(u => u.username.includes('Guru')) || mockUsers[3],
    postedDate: '2024-07-15T14:00:00Z',
    condition: 'New',
    brand: 'Black Diamond',
    specs: { "Harness Size": "Medium", "Included Items": "5" },
    stock: 5, // Example of an item with multiple stock
  },
  {
    id: 'item3',
    name: 'Organic Climbing Chalk Bucket',
    description: `
### Stylish and Durable Bouldering Essential

Stand out at the crag or gym with this unique Organic Climbing chalk bucket. Known for their robust construction and one-of-a-kind designs.

*   **Durable Cordura Fabric:** Built to last.
*   **Fleece Lining:** Soft and helps distribute chalk.
*   **Secure Closure:** Minimizes chalk spills.
*   **Brush Holders:** Keep your brushes handy.
*   **Zippered Pocket:** For keys, tape, or small essentials.

This chalk bucket has seen some love but is in great functional condition. Colors are vibrant, and all zippers/closures work perfectly.
    `,
    price: 35,
    currency: 'USD',
    images: generateStoreItemImages('item3', 2),
    category: 'Chalk',
    seller: mockUsers.find(u => u.username.includes('Alex')) || mockUsers[0],
    postedDate: '2024-07-14T11:00:00Z',
    condition: 'Used - Good',
    brand: 'Organic Climbing',
    stock: 1,
  },
  {
    id: 'item4',
    name: 'Prana Stretch Zion Pant - Men\'s',
    description: `
### The Ultimate Climbing Pant

Versatile, durable, and incredibly comfortable. The Prana Stretch Zion Pant is a favorite among climbers and outdoor enthusiasts for good reason.

*   **Stretch Zion Fabric:** Abrasion-resistant and quick-drying.
*   **DWR Finish:** Water repellent.
*   **UPF 50+ Sun Protection.**
*   **Adjustable Waistband.**
*   **Roll-up Leg Snaps.**

Brand new with tags. Size Medium, Color: Mud.
    `,
    price: 50,
    currency: 'USD',
    images: generateStoreItemImages('item4', 3),
    category: 'Clothing',
    seller: mockUsers.find(u => u.username.includes('Guru')) || mockUsers[3],
    postedDate: '2024-07-16T11:00:00Z',
    condition: 'New',
    brand: 'Prana',
    specs: { "Size": "Medium", "Color": "Mud", "Material": "Stretch Zion" },
    stock: 3,
  },
   {
    id: 'item5',
    name: 'Metolius Crash Pad',
    description: `
### Essential Bouldering Protection

A large, reliable crash pad from Metolius. Offers excellent impact absorption for bouldering falls.

*   **Thick Foam Layers:** Combination of closed-cell and open-cell foam.
*   **Hinge Design:** Folds easily for transport.
*   **Durable Cover:** Resists abrasion and moisture.
*   **Padded Shoulder Straps & Waist Belt:** Comfortable carrying.

Foam is still in good condition. Some external wear and tear (scuffs, dirt) as expected from outdoor use, but fully functional and safe. No major rips or damage to buckles/straps.
    `,
    price: 150,
    currency: 'USD',
    images: generateStoreItemImages('item5', 2),
    category: 'Crash Pads',
    seller: mockUsers.find(u => u.username.includes('Alex')) || mockUsers[0],
    postedDate: '2024-07-13T10:00:00Z',
    condition: 'Used - Good',
    brand: 'Metolius',
    specs: { "Dimensions (Open)": "Approx 48x36x4 inches", "Weight": "Approx 12 lbs" },
    stock: 1,
  }
];


// Helper to simulate gym usage update - call this from UploadPage after a "successful" mock upload
export const simulateGymVisitAndUpdateStats = (gymId: string, climbDate: string, userId: string) => {
  const gymIndex = mockGyms.findIndex(g => g.id === gymId);
  if (gymIndex !== -1) {
    mockGyms[gymIndex].stats.dailyUserCounts[climbDate] = (mockGyms[gymIndex].stats.dailyUserCounts[climbDate] || 0) + 1;
    console.log(`Updated dailyUserCounts for ${mockGyms[gymIndex].name} on ${climbDate}:`, mockGyms[gymIndex].stats.dailyUserCounts[climbDate]);
  }

  if (userId === MOCK_USER_ID && mockGyms[gymIndex]) {
     // For mockUserProfile, we directly mutate the imported object or a copy if it's complex state management
     const activityExists = mockUserProfile.climbingActivity.some(act => act.date === climbDate && act.gymId === gymId);
     if (!activityExists) {
        mockUserProfile.climbingActivity.push({
            date: climbDate,
            gymId: mockGyms[gymIndex].id,
            gymName: mockGyms[gymIndex].name,
            gymLogoUrl: mockGyms[gymIndex].logoUrl,
        });
        mockUserProfile.climbingActivity.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        console.log(`Added to user's climbingActivity for ${climbDate} at ${mockGyms[gymIndex].name}`);
     }
  }
};