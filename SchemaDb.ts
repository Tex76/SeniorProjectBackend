export interface User {
  _id: string; // Assuming ObjectID from MongoDB
  name: string;
  userName: string;
  password: string; // Hashed password string
  joinDate: Date;
  rank: string;
  points: number;
  description: string;
  contribution: number;
  comments: number;
  photos: number;
  email: string;
  placesVisited: number;
  badges: string[];
  reviewComments: Comment[]; // Array of comment IDs
  photosReview: Photo[]; // Array of photo IDs
  trips: Trip[]; // Array of trip IDs
  runningTrip: string; // Reference to Trip
}

export interface Comment {
  _id: string; // Assuming ObjectID from MongoDB
  userID: string; // Reference to User
  placeID: string; // Reference to Place
  userName: string;
  rankImage: string;
  userAvatar: string;
  contributionNumber: number;
  rank: number;
  rate: number;
  title: string;
  writtenDate: Date;
  commentBody: string;
  visitDate: Date;
  services: number;
  facility: number;
  location: number;
  commentValue: number;
  score: number;

  // Optional properties for ThingsToDo
  locationRate?: number;
  safety?: number;
  facilities?: number;
  convenience?: number;
  staff?: number;

  // Optional properties for ThingsToEat
  foodQuality?: number;
  valueForMoney?: number;
  service?: number;
  menuVariety?: number;
  ambiance?: number;

  // Optional properties for PlacesToStay
  serviceRate?: number;
  roomQuality?: number;
  cleanliness?: number;
}

export interface Photo {
  _id: string;
  placeID: string; // Reference to Place
  userID: string; // Reference to User
  userName: string;
  rank: string;
  contributionNumber: number;
  rankImage: string;
  userAvatar: string;
  dateOfTaken: Date;
  image: string; // Image URL or path
  score: number;
}

export interface Place {
  _id: string;
  name: string;
  region: string;
  category: "thingsToDo" | "PlacesToStay" | "thingsToEat";
  subTags: string[];
  rate: number;
  location: string;
  googleLocation: { lat: number; lng: number; placeId?: string };
  description: string;
  comments: Comment[];
  photos: Photo[];
  totalComments: number;
  imagePlace: string[];
  type: string;
  priceRange: string;
  email: string;
  phoneNumber: string;
  website: string;
  exceptional: number;
  great: number;
  satisfactory: number;
  poor: number;
  bad: number;

  // Optional properties for ThingsToDo
  locationRate?: number;
  safety?: number;
  facilities?: number;
  convenience?: number;
  staff?: number;
  duration?: string;
  activityType?: string[];
  accessibility?: string[];
  whatToExpect?: string[];

  // Optional properties for ThingsToEat
  foodQuality?: number;
  valueForMoney?: number;
  service?: number;
  menuVariety?: number;
  ambiance?: number;
  cuisines?: string[];
  specialDiets?: string[];
  meals?: string[];
  featuresList?: string[];

  // Optional properties for PlacesToStay
  serviceRate?: number;
  roomQuality?: number;
  cleanliness?: number;
  accommodationType?: string[];
  amenities?: string[];
  roomType?: string[];
  locationType?: string;
  additionalServices?: string[];
  languagesSpoken?: string[];
  hotelClass?: number;
}

export interface Trip {
  _id: string;
  userID: string;
  tripName: string;
  region: string[];
  toatlDays: number;
  descripton: string;
  imageTrip: string;
  likedPlacs: string[];
  Days: Place[][]; // Array of days, each day contains array of places
}
// we need to complete by adding Trip interface and make place contain all schemas of palces
