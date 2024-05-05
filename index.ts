import express from "express";
import mongoose, { Schema, Types } from "mongoose";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import cors from "cors";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";
dotenv.config();
const app = express();
const corsOptions = {
  origin: "http://localhost:3000", // Ensure this matches the exact URL of your frontend
  credentials: true, // Essential for cookies to be sent and received with requests
  optionSuccessStatus: 200,
  methods: ["POST", "PUT", "GET", "OPTIONS", "HEAD"],
};

app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors(corsOptions));

const bcryptSalt = bcrypt.genSaltSync(10);
const jwtSecret = "secret-key";

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
  comments: [Types.ObjectId],
  // [ObjecId("id"), ObjecId("id"), ObjecId("id")]
  photos: [Types.ObjectId],
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
  money: Number,
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

const CommentSchema = new Schema({
  userID: { type: Types.ObjectId, required: true, ref: "User" },
  placeID: { type: Types.ObjectId, required: true, ref: "Place" },
  rank: Number,
  rate: Number,
  title: String,
  dateOfWritten: Date,
  commentBody: String,
  dateVisit: Date,
  services: Number,
  facility: Number,
  location: Number,
  withWhom: {
    type: String,
    default: "Solo", // Optional default value
  },
  helpfulTip: { type: String, default: "No helpful tips provided." },

  score: { type: Number, default: 0 },

  // Optional properties for ThingsToDo
  locationRate: { type: Number, default: 0 }, // Provide defaults if these are optional
  safety: { type: Number, default: 0 },
  facilities: { type: Number, default: 0 },
  convenience: { type: Number, default: 0 },
  staff: { type: Number, default: 0 },

  // Optional properties for ThingsToEat

  foodQuality: { type: Number, default: 0 },
  valueForMoney: { type: Number, default: 0 },
  service: { type: Number, default: 0 },
  menuVariety: { type: Number, default: 0 },
  ambiance: { type: Number, default: 0 },

  // Optional properties for PlacesToStay

  //ambience and location rate also
  serviceRate: { type: Number, default: 0 },
  roomQuality: { type: Number, default: 0 },
  cleanliness: { type: Number, default: 0 }, // Note: this field was already declared, consider renaming if different meanings are intended
});
// images/photo.png

const PhotoSchema = new mongoose.Schema({
  placeID: { type: Types.ObjectId, required: true },
  userID: { type: Types.ObjectId, required: true },
  userName: String,
  dateOfTaken: { type: Date, default: Date.now },
  image: { type: String, default: "default-image.jpg" },
  score: { type: Number, default: 0 },
});

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  userName: { type: String, default: "New User" },
  password: String, // Passwords should always be provided explicitly and hashed
  joinDate: { type: Date, default: Date.now },
  avatarImage: { type: String, default: "avatarImage.jpg" }, // Automatically set the join date to the current date
  rank: { type: String, default: "Explorer" }, // Default user ranks Explorer, Adventurer, Trailblazer
  points: { type: Number, default: 0 }, // Start points at 0
  email: String, // Email should be provided explicitly if required
  description: { type: String, default: "No description provided." },
  contribution: { type: Number, default: 0 }, // Default contribution score
  comments: { type: Number, default: 0 }, // Default number of comments
  photos: { type: Number, default: 0 }, // Default number of photos
  placesVisited: { type: Number, default: 0 }, // Default number of places visited
  badges: { type: [String], default: [] }, // Default to an empty array of badges
  reviewComments: { type: [Types.ObjectId], default: [] }, // Default to an empty array for review comments
  photosReview: { type: [Types.ObjectId], default: [] }, // Default to an empty array for photo reviews
  trips: { type: [Types.ObjectId], default: [] }, // Default to an empty array of trips
  runningTrip: { type: String, default: "No active trip" }, // Default to 'No active trip' if none is running
});

const TripSchema = new mongoose.Schema({
  userID: { type: Types.ObjectId, required: true },
  tripName: { type: String, default: "New Trip" }, // Default value for tripName
  region: { type: [String], default: [] }, // Default value as an empty array
  totalDays: { type: Number, default: 1 }, // Default value for totalDays
  description: { type: String, default: "No description provided." }, // Default description
  imageTrip: { type: String, default: "default-image.jpg" }, // Default image path
  likedPlaces: { type: [Types.ObjectId], default: [] }, // Default as empty array
  days: { type: [[String]], default: [[]] }, // Nested array with a default empty array
});

const Place = mongoose.model("Place", placeSchema);
const Comment = mongoose.model("Comment", CommentSchema);
const Photo = mongoose.model("Photo", PhotoSchema);
const User = mongoose.model("User", UserSchema);
const Trip = mongoose.model("Trip", TripSchema);

const mongoUrl = process.env.MONGO_URL;
if (!mongoUrl) {
  console.error("MONGO_URL environment variable is not set");
  process.exit(1);
}

mongoose
  .connect(mongoUrl)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error", err));

app.post("/signUp", async (req, res) => {
  try {
    const { name, username, email, password } = req.body;
    const check = await User.findOne({ email });
    if (check) {
      return res.status(400).send("User already exists");
    }
    const hashedPassword = await bcrypt.hash(password.trim(), bcryptSalt);
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

  if (!isMatch) {
    return res.status(401).send("Login failed: incorrect password");
  } else {
    jwt.sign(
      { id: user._id, email: user.email, avatar: user.avatarImage },
      jwtSecret,
      { expiresIn: "1h" },
      (err: Error | null, token: string | undefined) => {
        if (err) {
          console.error("JWT sign error:", err);
          return res.status(500).send("Failed to sign token");
        }
        res.cookie("token", token, { httpOnly: true }).json(user);
        res.status(200).send("Login correct and token set");
      }
    );
  }
});

app.get("/places/:id", async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    console.log(`${id} is not a valid ObjectId`);
    return res.status(400).json({ message: `${id} is not a valid ObjectId` });
  }
  try {
    const results = await Place.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(id) } },
      {
        $lookup: {
          from: "comments", // Ensure this matches the name of your comments collection
          localField: "comments",
          foreignField: "_id",
          as: "comments",
        },
      },

      {
        $lookup: {
          from: "photos", // Ensure this matches the name of your photos collection
          localField: "photos",
          foreignField: "_id",
          as: "photos",
        },
      },
      {
        $unwind: { path: "$comments", preserveNullAndEmptyArrays: true },
      },
      {
        $sort: { "comments.score": -1 },
      },
      {
        $group: {
          _id: "$_id",
          root: { $mergeObjects: "$$ROOT" },
          comments: { $push: "$comments" },
        },
      },
      {
        $replaceRoot: {
          newRoot: {
            $mergeObjects: ["$root", "$$ROOT"],
          },
        },
      },
      {
        $unwind: { path: "$photos", preserveNullAndEmptyArrays: true },
      },
      {
        $sort: { "photos.score": -1 },
      },
      {
        $group: {
          _id: "$_id",
          root: { $mergeObjects: "$$ROOT" },
          photos: { $push: "$photos" },
        },
      },
      {
        $replaceRoot: {
          newRoot: {
            $mergeObjects: ["$root", "$$ROOT"],
          },
        },
      },
    ]);

    if (results.length === 0) {
      return res.status(404).json({ message: "Place not found" });
    } else {
      return res.json(results[0]); // Since we are doing a findOne equivalent
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
});

app.listen(4000, () => console.log("App listening on port 4000!"));
