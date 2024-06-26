// import mongoose from "mongoose";

// const placeSchema = new mongoose.Schema({
//   name: { type: String, required: true },
//   region: { type: String },
//   category: {
//     type: String,
//     enum: ["thingsToDo", "thingsToEat", "placesToStay"],
//   },
//   subTags: [String],
//   rate: Number,
//   location: String,
//   googleLocation: {
//     lat: Number,
//     lng: Number,
//     placeId: String, // Optional Google Place ID
//   },
//   description: String,
//   comments: [String],
//   photos: [String],
//   totalComments: Number,
//   imagePlace: [String],
//   type: String,
//   priceRange: String,
//   email: String,
//   phoneNumber: String,
//   website: String,

//   // Optional fields for ThingsToDo
//   locationRate: Number,
//   safety: Number,
//   facilities: Number,
//   convenience: Number,
//   staff: Number,
//   duration: Number,
//   activityType: [String],
//   accessibility: [String],
//   whatToExpect: [String],

//   // Optional fields for ThingsToEat
//   foodQuality: Number,
//   valueForMoney: Number,
//   service: Number,
//   menuVariety: Number,
//   ambiance: Number,
//   cuisines: [String],
//   specialDiets: [String],
//   meals: [String],
//   featuresList: [String],

//   // Optional fields for PlacesToStay
//   serviceRate: Number,
//   roomQuality: Number,
//   cleanliness: Number,
//   accommodationType: [String],
//   amenities: [String],
//   roomType: [String],
//   locationType: String,
//   additionalServices: String,
//   languagesSpoken: [String],
//   hotelClass: Number,
// });

// const CommentSchema = new mongoose.Schema({
//   userID: { type: String, required: true },
//   placeID: { type: String, required: true },
//   rank: Number,
//   rate: Number,
//   title: String,
//   dateOfWritten: Date,
//   commentBody: String,
//   dateVisit: Date,
//   services: Number,
//   roomQuality: Number,
//   facility: Number,
//   location: Number,
//   cleanliness: Number,
//   ambiance: Number,
//   commentValue: Number,
// });

// // images/photo.png

// const PhotoSchema = new mongoose.Schema({
//   placeID: { type: String, required: true },
//   userID: { type: String, required: true },
//   userName: String,
//   dateOfTaken: Date,
//   image: String,
// });

// const UserSchema = new mongoose.Schema({
//   name: { type: String, required: true },
//   userName: String,
//   password: String,
//   joinDate: Date,
//   rank: String,
//   points: Number,
//   email: String,
//   description: String,
//   contribution: Number,
//   comments: Number,
//   photos: Number,
//   placesVisited: Number,
//   badges: [String],
//   reviewComments: [String],
//   photosReview: [String],
//   trips: [String],
//   runningTrip: String,
// });

// const TripSchema = new mongoose.Schema({
//   userID: { type: String, required: true },
//   tripName: String,
//   region: [String],
//   totalDays: Number,
//   description: String,
//   imageTrip: String,
//   likedPlaces: [String],
//   days: [[String]],
// });

// const Place = mongoose.model("Place", placeSchema);
// const Comment = mongoose.model("Comment", CommentSchema);
// const Photo = mongoose.model("Photo", PhotoSchema);
// const User = mongoose.model("User", UserSchema);
// const Trip = mongoose.model("Trip", TripSchema);

// // Ensure that all necessary models are correctly exported from your database module file.
// export { Place, Comment, Photo, User, Trip };
