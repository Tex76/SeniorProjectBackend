"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Trip = exports.User = exports.Photo = exports.Comment = exports.Place = void 0;
var mongoose_1 = require("mongoose");
mongoose_1.default
    .connect("mongodb+srv://clickventureSenior:<Xbd7S5eb3e68dyPB>@cluster0.mhkksx7.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0")
    .then(function () {
    console.log("Connected to the database");
})
    .catch(function (err) {
    console.log("Error connecting to the database", err);
});
var placeSchema = new mongoose_1.default.Schema({
    name: { type: String, required: true },
    region: { type: String },
    category: {
        type: String,
        enum: ["thingsToDo", "thingsToEat", "placesToStay"],
    },
    subTags: [String],
    rate: Number,
    location: String,
    googleLocation: {
        lat: Number,
        lng: Number,
        placeId: String, // Optional Google Place ID
    },
    description: String,
    comments: [String],
    photos: [String],
    totalComments: Number,
    imagePlace: [String],
    type: String,
    priceRange: String,
    email: String,
    phoneNumber: String,
    website: String,
    // Optional fields for ThingsToDo
    locationRate: Number,
    safety: Number,
    facilities: Number,
    convenience: Number,
    staff: Number,
    duration: Number,
    activityType: [String],
    accessibility: [String],
    whatToExpect: [String],
    // Optional fields for ThingsToEat
    foodQuality: Number,
    valueForMoney: Number,
    service: Number,
    menuVariety: Number,
    ambiance: Number,
    cuisines: [String],
    specialDiets: [String],
    meals: [String],
    featuresList: [String],
    // Optional fields for PlacesToStay
    serviceRate: Number,
    roomQuality: Number,
    cleanliness: Number,
    accommodationType: [String],
    amenities: [String],
    roomType: [String],
    locationType: String,
    additionalServices: String,
    languagesSpoken: [String],
    hotelClass: Number,
});
var CommentSchema = new mongoose_1.default.Schema({
    userID: { type: String, required: true },
    placeID: { type: String, required: true },
    rank: Number,
    rate: Number,
    title: String,
    dateOfWritten: Date,
    commentBody: String,
    dateVisit: Date,
    services: Number,
    roomQuality: Number,
    facility: Number,
    location: Number,
    cleanliness: Number,
    ambiance: Number,
    commentValue: Number,
});
// images/photo.png
var PhotoSchema = new mongoose_1.default.Schema({
    placeID: { type: String, required: true },
    userID: { type: String, required: true },
    userName: String,
    dateOfTaken: Date,
    image: String,
});
var UserSchema = new mongoose_1.default.Schema({
    name: { type: String, required: true },
    userName: String,
    password: String,
    joinDate: Date,
    rank: String,
    points: Number,
    email: String,
    description: String,
    contribution: Number,
    comments: Number,
    photos: Number,
    placesVisited: Number,
    badges: [String],
    reviewComments: [String],
    photosReview: [String],
    trips: [String],
    runningTrip: String,
});
var TripSchema = new mongoose_1.default.Schema({
    userID: { type: String, required: true },
    tripName: String,
    region: [String],
    totalDays: Number,
    description: String,
    imageTrip: String,
    likedPlaces: [String],
    days: [[String]],
});
var Place = mongoose_1.default.model("Place", placeSchema);
exports.Place = Place;
var Comment = mongoose_1.default.model("Comment", CommentSchema);
exports.Comment = Comment;
var Photo = mongoose_1.default.model("Photo", PhotoSchema);
exports.Photo = Photo;
var User = mongoose_1.default.model("User", UserSchema);
exports.User = User;
var Trip = mongoose_1.default.model("Trip", TripSchema);
exports.Trip = Trip;
