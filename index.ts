import express from "express";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import cors from "cors";
dotenv.config();
const placeSchema = new mongoose.Schema({
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
  duration: String,
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
  additionalServices: [String],
  languagesSpoken: [String],
  hotelClass: Number,
});

const CommentSchema = new mongoose.Schema({
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

const PhotoSchema = new mongoose.Schema({
  placeID: { type: String, required: true },
  userID: { type: String, required: true },
  userName: String,
  dateOfTaken: { type: Date, default: Date.now },
  image: { type: String, default: "default-image.jpg" },
});

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  userName: { type: String, default: "New User" },
  password: String, // Passwords should always be provided explicitly and hashed
  joinDate: { type: Date, default: Date.now }, // Automatically set the join date to the current date
  rank: { type: String, default: "Explorer" }, // Default user ranks Explorer, Adventurer, Trailblazer
  points: { type: Number, default: 0 }, // Start points at 0
  email: String, // Email should be provided explicitly if required
  description: { type: String, default: "No description provided." },
  contribution: { type: Number, default: 0 }, // Default contribution score
  comments: { type: Number, default: 0 }, // Default number of comments
  photos: { type: Number, default: 0 }, // Default number of photos
  placesVisited: { type: Number, default: 0 }, // Default number of places visited
  badges: { type: [String], default: [] }, // Default to an empty array of badges
  reviewComments: { type: [String], default: [] }, // Default to an empty array for review comments
  photosReview: { type: [String], default: [] }, // Default to an empty array for photo reviews
  trips: { type: [String], default: [] }, // Default to an empty array of trips
  runningTrip: { type: String, default: "No active trip" }, // Default to 'No active trip' if none is running
});

const TripSchema = new mongoose.Schema({
  userID: { type: String, required: true },
  tripName: { type: String, default: "New Trip" }, // Default value for tripName
  region: { type: [String], default: [] }, // Default value as an empty array
  totalDays: { type: Number, default: 1 }, // Default value for totalDays
  description: { type: String, default: "No description provided." }, // Default description
  imageTrip: { type: String, default: "default-image.jpg" }, // Default image path
  likedPlaces: { type: [String], default: [] }, // Default as empty array
  days: { type: [[String]], default: [[]] }, // Nested array with a default empty array
});

const Place = mongoose.model("Place", placeSchema);
const Comment = mongoose.model("Comment", CommentSchema);
const Photo = mongoose.model("Photo", PhotoSchema);
const User = mongoose.model("User", UserSchema);
const Trip = mongoose.model("Trip", TripSchema);

const app = express();
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

const mongoUrl = process.env.MONGO_URL;
if (!mongoUrl) {
  console.error("MONGO_URL environment variable is not set");
  process.exit(1);
}

mongoose
  .connect(mongoUrl)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error", err));
app.use(express.json());

app.post("/signUp", async (req, res) => {
  try {
    const { name, username, email, password } = req.body;
    const check = await User.findOne({ email });
    if (check) {
      return res.status(400).send("User already exists");
    }
    const hashedPassword = await bcrypt.hash(password.trim(), 10);
    // 10 is the saltRounds
    const user = new User({
      email,
      password: hashedPassword,
      name,
      userName: username,
    });
    await user.save();

    console.log("Sign up successful", user);
    res.send("Sign up successful");
  } catch (err) {
    console.error("Signup error", err);
    res.status(500).send("Internal server error");
  }
});

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (typeof password !== "string") {
      return res.status(400).send("Bad request: password must be a string");
    }
    const user = await User.findOne({ email });
    if (!user || typeof user.password !== "string") {
      return res
        .status(401)
        .send("Login failed: user not found or password is not a string");
    }
    const isMatch = await bcrypt.compare(password.trim(), user.password);

    console.log("isMatch", isMatch);
    if (!isMatch) {
      console.log("original password", password);
      console.log("hashed password", user.password);
      return res.status(401).send("Login failed: incorrect password");
    }
    res.send("Login successful");
  } catch (err) {
    console.error("Login error", err);
    res.status(500).send("Internal server error");
  }
});

app.listen(4000, () => console.log("App listening on port 4000!"));
