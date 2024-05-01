import mongoose from "mongoose";

mongoose
  .connect("mongodb://localhost:27017/clickVenture")
  .then(() => {
    console.log("Connected to the database");
  })
  .catch((err) => {
    console.log("Error connecting to the database", err);
  });

const placeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  region: { type: String, required: true },
  category: {
    type: String,
    required: true,
    enum: ["thingsToDo", "thingsToEat", "placesToStay"],
  },
  subTags: { type: [String], required: true },
  rate: { type: Number, required: true },
  location: { type: String, required: true },
  googleLocation: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    placeId: { type: String, required: false }, // Optional Google Place ID
  },
  description: { type: String, required: true },
  comments: { type: [String], required: true },
  photos: { type: [String], required: true },
  totalComments: { type: Number, required: true },
  imagePlace: { type: [String], required: true },
  type: { type: String, required: true },
  priceRange: { type: String, required: true },
  email: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  website: { type: String, required: true },

  // Optional fields for ThingsToDo
  locationRate: { type: Number },
  safety: { type: Number },
  facilities: { type: Number },
  convenience: { type: Number },
  staff: { type: Number },
  duration: { type: Number },
  activityType: { type: [String] },
  accessibility: { type: [String] },
  whatToExpect: { type: [String] },

  // Optional fields for ThingsToEat
  foodQuality: { type: Number },
  valueForMoney: { type: Number },
  service: { type: Number },
  menuVariety: { type: Number },
  ambiance: { type: Number },
  cuisines: { type: [String] },
  specialDiets: { type: [String] },
  meals: { type: [String] },
  featuresList: { type: [String] },

  // Optional fields for PlacesToStay
  serviceRate: { type: Number },
  roomQuality: { type: Number },
  cleanliness: { type: Number },
  accommodationType: { type: [String] },
  amenities: { type: [String] },
  roomType: { type: [String] },
  locationType: { type: String },
  additionalServices: { type: String },
  languagesSpoken: { type: [String] },
  hotelClass: { type: Number },
});

const CommentSchema = new mongoose.Schema({
  userID: { type: String, required: true },
  placeID: { type: String, required: true },
  rank: { type: Number, required: true },
  rate: { type: Number, required: true },
  title: { type: String, required: true },
  dateOfWritten: { type: Date, required: true },
  commentBody: { type: String, required: true },
  dateVisit: { type: Date, required: true },
  services: { type: Number, required: true },
  roomQuality: { type: Number, required: true },
  facility: { type: Number, required: true },
  location: { type: Number, required: true },
  cleanliness: { type: Number, required: true },
  ambiance: { type: Number, required: true },
  commentValue: { type: Number, required: true },
});

// images/photo.png

const PhotoSchema = new mongoose.Schema({
  placeID: { type: String, required: true },
  userID: { type: String, required: true },
  userName: { type: String, required: true },
  dateOfTaken: { type: Date, required: true },
  image: { type: String, required: true },
});

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  userName: { type: String, required: true },
  password: { type: String, required: true },
  joinDate: { type: Date, required: true },
  rank: { type: String, required: true },
  points: { type: Number, required: true },
  email: { type: String, required: true },
  description: { type: String, required: true },
  contribution: { type: Number, required: true },
  comments: { type: Number, required: true },
  photos: { type: Number, required: true },
  placesVisited: { type: Number, required: true },
  badges: { type: [String], required: true },
  reviewComments: { type: [String], required: true },
  photosReview: { type: [String], required: true },
  trips: { type: [String], required: true },
  runningTrip: { type: String, required: true },
});
const TripSchema = new mongoose.Schema({
  userID: { type: String, required: true },
  tripName: { type: String, required: true },
  region: { type: [String], required: true },
  totalDays: { type: Number, required: true },
  description: { type: String, required: true },
  imageTrip: { type: String, required: true },
  likedPlaces: { type: [String], required: true },
  days: { type: [[String]], required: true },
});

const Place = mongoose.model("Place", placeSchema);
const Comment = mongoose.model("Comment", CommentSchema);
const Photo = mongoose.model("Photo", PhotoSchema);
const User = mongoose.model("User", UserSchema);
const Trip = mongoose.model("Trip", TripSchema);

const place = new Place({
  name: "Bahrain National Museum",
  region: "Manama",
  category: "thingsToDo",
  subTags: ["Museum", "History"],
  rate: 4.5,
  location: "",
  googleLocation: {
    lat: 26.2186,
    lng: 50.5831,
  },
  description:
    "The Bahrain National Museum is the largest and one of the oldest public museums in Bahrain. It is constructed near the King Faisal Highway in Manama and opened in December 1988.",
  comments: [],
  photos: [],
  totalComments: 0,
  imagePlace: [
    "https://upload.wikimedia.org/wikipedia/commons/2/2e/Bahrain_National_Museum.jpg",
  ],
  type: "Museum",
  priceRange: "Free",
  email: "",
  phoneNumber: "+973 1729 8777",
  website: "https://www.culture.gov.bh/en/",
  locationRate: 4.5,
  safety: 4.5,
  facilities: 4.5,
  convenience: 4.5,
  staff: 4.5,
  duration: 2,
  activityType: ["Indoor"],
  accessibility: ["Wheelchair Accessible"],
  whatToExpect: ["History", "Culture"],
})
  .save()
  .then((place) => {
    console.log("Place saved", place);
  })
  .catch((err) => {
    console.log("Error saving place", err);
  });
// Ensure that all necessary models are correctly exported from your database module file.
module.exports = {
  Place,
  Comment,
  Photo,
  User,
  Trip,
};
