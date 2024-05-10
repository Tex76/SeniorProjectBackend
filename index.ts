import express from "express";
import mongoose, { Schema, Types } from "mongoose";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import cors from "cors";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";
import { ObjectId } from "mongodb";
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
  rate: Number,
  title: String,
  writtenDate: Date,
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
  locationRate: { type: Number }, // Provide defaults if these are optional
  safety: { type: Number },
  facilities: { type: Number },
  convenience: { type: Number },
  staff: { type: Number },

  // Optional properties for ThingsToEat

  foodQuality: { type: Number },
  valueForMoney: { type: Number },
  service: { type: Number },
  menuVariety: { type: Number },
  ambiance: { type: Number },

  // Optional properties for PlacesToStay

  //ambience and location rate also
  serviceRate: { type: Number },
  roomQuality: { type: Number },
  cleanliness: { type: Number }, // Note: this field was already declared, consider renaming if different meanings are intended
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
  avatarImage: { type: String, default: "avatars/avatarImage.jpg" }, // Automatically set the join date to the current date
  rank: { type: String, default: "Explorer" }, // Default user ranks Explorer, Adventurer, Trailblazer
  points: { type: Number, default: 0 }, // Start points at 0
  email: String, // Email should be provided explicitly if required
  description: { type: String, default: "No description provided." },
  contribution: { type: Number, default: 0 },
  comments: { type: Number, default: 0 },
  photos: { type: Number, default: 0 },
  reviewComments: {
    type: [Schema.Types.ObjectId],
    ref: "Comment",
    default: [],
  },
  photosReview: { type: [Schema.Types.ObjectId], ref: "Photo", default: [] },
  placesVisited: { type: Number, default: 0 }, // Default number of places visited
  badges: { type: [String], default: [] }, // Default to an empty array of badges

  trips: { type: [Types.ObjectId], default: [] }, // Default to an empty array of trips
  runningTrip: { type: String, default: "No active trip" }, // Default to 'No active trip' if none is running
  rankImage: { type: String, default: "ranks/rankImagelevelThree.jpg" },
});

const TripSchema = new mongoose.Schema({
  userID: { type: Types.ObjectId, required: true },
  tripName: { type: String, default: "New Trip" }, // Default value for tripName
  region: { type: [String], default: [] }, // Default value as an empty array
  totalDays: { type: Number, default: 1 }, // Default value for totalDays
  description: { type: String, default: "No description provided." }, // Default description
  imageTrip: { type: String, default: "trips/tripImage.jpg" }, // Default image path
  likedPlaces: { type: [Types.ObjectId], default: [] }, // Default as empty array
  days: { type: [[String]], default: [[]] }, // Nested array with a default empty array
});

UserSchema.pre("save", function (next) {
  this.comments = this.reviewComments.length;
  this.photos = this.photosReview.length;
  this.contribution = this.comments + this.photos;
  next();
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
      {
        email: user.email,
        name: user.name,
        id: user._id,
        points: user.points,
        rank: user.rank,
        avatarImage: user.avatarImage,
      },
      jwtSecret,
      { expiresIn: "1day" },
      (err: Error | null, token: string | undefined) => {
        if (err) {
          console.error("JWT sign error:", err);
          return res.status(500).send("Failed to sign token");
        }
        res.cookie("token", token, { httpOnly: true });
        res.status(200).json(user);
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
          from: "comments",
          localField: "comments",
          foreignField: "_id",
          as: "comments",
        },
      },
      {
        $unwind: { path: "$comments", preserveNullAndEmptyArrays: true },
      },
      {
        $lookup: {
          from: "users",
          localField: "comments.userID",
          foreignField: "_id",
          as: "comments.userDetails",
        },
      },
      {
        $unwind: {
          path: "$comments.userDetails",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $addFields: {
          "comments.username": "$comments.userDetails.username",
          "comments.rank": "$comments.userDetails.rank",
          "comments.rankImage": "$comments.userDetails.rankImage",
          "comments.avatarImage": "$comments.userDetails.avatarImage",
          "comments.contribution": "$comments.userDetails.contribution",
        },
      },
      {
        $project: {
          "comments.userDetails": 0,
        },
      },
      {
        $group: {
          _id: "$_id",
          root: { $mergeObjects: "$$ROOT" },
          comments: { $push: "$comments" },
        },
      },
      {
        $addFields: {
          "root.rate": { $avg: "$comments.rate" },
          "root.totalComments": { $size: "$comments" },
          "root.subRatings": {
            $switch: {
              branches: [
                {
                  case: { $eq: ["$root.category", "thingsToDo"] },
                  then: {
                    locationRate: { $avg: "$comments.location" },
                    safety: { $avg: "$comments.safety" },
                    facilities: { $avg: "$comments.facilities" },
                    convenience: { $avg: "$comments.convenience" },
                    staff: { $avg: "$comments.staff" },
                  },
                },
                {
                  case: { $eq: ["$root.category", "thingsToEat"] },
                  then: {
                    foodQuality: { $avg: "$comments.foodQuality" },
                    valueForMoney: { $avg: "$comments.valueForMoney" },
                    service: { $avg: "$comments.service" },
                    menuVariety: { $avg: "$comments.menuVariety" },
                    ambiance: { $avg: "$comments.ambiance" },
                  },
                },
              ],
              default: {
                location: { $avg: "$comments.location" },
                service: { $avg: "$comments.service" },
                facilities: { $avg: "$comments.facilities" },
                roomQuality: { $avg: "$comments.roomQuality" },
                cleanliness: { $avg: "$comments.cleanliness" },
              },
            },
          },
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
      console.log("Place found", results[0]);
      return res.json(results[0]); // Since we are doing a findOne equivalent
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
});

app.get("/profile", async (req, res) => {
  const { token } = req.cookies;
  if (token) {
    jwt.verify(token, jwtSecret, {}, (err, user) => {
      if (err) {
        console.error("JWT verify error:", err);
        return res.status(401).send("Unauthorized");
      } else {
        return res.json(user);
      }
    });
  }
});

app.post("/logout", (req, res) => {
  res.clearCookie("token").send("Logged out");
});

// Used For data fetching Search Bar in the frontend
app.get("/api/data", async (_, res) => {
  try {
    const data: Array<typeof Place> = await Place.find({});
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).send(err);
  }
});

app.post("/setComment", async (req, res) => {
  const placeInfo = await Place.findById(req.body.placeID);

  if (placeInfo?.category === "thingsToDo") {
    const {
      placeID,
      userID,
      rate,
      title,
      commentBody,
      dateVisit,
      location,
      convenience,
      safety,
      facilities,
      staff,
      writtenDate,
      withWhom,
    } = req.body;
    const comment = new Comment({
      placeID,
      userID,
      rate,
      title,
      commentBody,
      dateVisit,
      location,
      convenience,
      safety,
      facilities,
      staff,
      writtenDate,
      withWhom,
    });

    comment.save().then((comment) => {
      const commentID = comment._id;
      Place.findByIdAndUpdate(
        placeID,
        { $push: { comments: commentID } },
        { new: true }
      ).then((place) => {
        console.log("Comment saved in place", place);
      });

      User.findById(userID).then((user: any) => {
        user.reviewComments.push(commentID);
        user.save().then((updatedUser: any) => {
          console.log("Comment saved in user", updatedUser);
        });
      });
    });
  } else if (placeInfo?.category === "thingsToEat") {
    const {
      placeID,
      userID,
      rate,
      title,
      commentBody,
      dateVisit,
      service,
      foodQuality,
      valueForMoney,
      menuVariety,
      ambiance,
      writtenDate,
      withWhom,
    } = req.body;
    const comment = new Comment({
      placeID,
      userID,
      rate,
      title,
      commentBody,
      dateVisit,
      service,
      foodQuality,
      valueForMoney,
      menuVariety,
      ambiance,

      writtenDate,
      withWhom,
    });
    comment.save().then((comment) => {
      const commentID = comment._id;
      Place.findByIdAndUpdate(
        placeID,
        { $push: { comments: commentID } },
        { new: true }
      ).then((place) => {
        console.log("Comment saved in place", place);
      });

      User.findById(userID).then((user: any) => {
        user.reviewComments.push(commentID);
        user.save().then((updatedUser: any) => {
          console.log("Comment saved in user", updatedUser);
        });
      });
    });
  } else {
    const {
      placeID,
      userID,
      rate,
      title,
      commentBody,
      dateVisit,
      location,
      service,
      facilities,
      roomQuality,
      cleanliness,
      writtenDate,
      withWhom,
    } = req.body;
    const comment = new Comment({
      placeID,
      userID,
      rate,
      title,
      commentBody,
      dateVisit,
      location,
      service,
      facilities,
      roomQuality,
      cleanliness,
      writtenDate,
      withWhom,
    });

    comment.save().then((comment) => {
      const commentID = comment._id;
      Place.findByIdAndUpdate(
        placeID,
        { $push: { comments: commentID } },
        { new: true }
      ).then((place) => {
        console.log("Comment saved in place", place);
      });

      User.findById(userID).then((user: any) => {
        user.reviewComments.push(commentID);
        user.save().then((updatedUser: any) => {
          console.log("Comment saved in user", updatedUser);
        });
      });
    });
  }

  res.send("trying to save the comment");
});

app.get("/user/trips/:id", (req, res) => {
  const { id } = req.params;
  User.findById(id)
    .populate("trips")
    .then((user: any) => {
      if (user) res.json(user.trips);
    });
});
app.post("/trips", async (req, res) => {
  const { userID, tripName, region, days, description } = req.body;
  const trip = new Trip({
    userID,
    tripName,
    region,
    totalDays: days,
    description,
  });
  trip.save().then((trip) => {
    User.findByIdAndUpdate(
      userID,
      { $push: { trips: trip._id } },
      { new: true }
    ).then((user) => {
      console.log("Trip saved in user", user);
    });
    res.send({ id: trip._id });
  });
});

app.get("/trips/:id", async (req, res) => {
  const { id } = req.params;
  Trip.findById(id).then((trip) => {
    res.json(trip);
  });
});

// this part for fetching liked places array in the trip
app.get("/trip/places/:id", async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    console.log(`${id} is not a valid ObjectId`);
    return res.status(400).json({ message: `${id} is not a valid ObjectId` });
  }
  try {
    const results = await Trip.aggregate([
      // Match the trip by ID
      { $match: { _id: new mongoose.Types.ObjectId(id) } },

      // Lookup to fetch the details of the liked places
      {
        $lookup: {
          from: "places", // This should match the collection name where places are stored
          localField: "likedPlaces",
          foreignField: "_id",
          as: "likedPlacesDetails",
        },
      },

      // Optionally you can add a projection to format the output
      {
        $project: {
          _id: 1, // Include trip id
          name: 1, // Include any other fields you care about from the trip
          likedPlacesDetails: 1, // This will include the array of populated liked places
        },
      },
    ]);

    if (results.length === 0) {
      return res.status(404).json({ message: "Trip not found" });
    }

    // Send back the populated liked places details
    res.json(results[0].likedPlacesDetails);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

app.post("/trip/search", async (req, res) => {
  // return the places that are not in the likedPlaces array and have same location
  const { location, likedPlaces } = req.body;
  const results = await Place.find({
    location,
    _id: { $nin: likedPlaces },
  });
  res.json(results);
});

app.post("/trip/places/addLiked", async (req, res) => {
  const { tripID, placeId } = req.body;
  Trip.findByIdAndUpdate(
    tripID,
    { $push: { likedPlaces: placeId } },
    { new: true }
  ).then((trip) => {
    console.log("Place added to liked in trip", trip);
  });
});
// updating the trip information base on trip ID
app.post("/update/trips/:id", async (req, res) => {
  const { tripName, description, coverImage, totalDays } = req.body;
  const { id } = req.params;
  Trip.findByIdAndUpdate(
    id,
    { tripName, description, imageTrip: coverImage, totalDays },
    { new: true }
  ).then((trip) => {
    console.log("Trip updated", trip);
  });
  res.send("Trip updated");
});

/*
const TripSchema = new mongoose.Schema({
  userID: { type: Types.ObjectId, required: true },
  tripName: { type: String, default: "New Trip" }, // Default value for tripName
  region: { type: [String], default: [] }, // Default value as an empty array
  totalDays: { type: Number, default: 1 }, // Default value for totalDays
  description: { type: String, default: "No description provided." }, // Default description
  imageTrip: { type: String, default: "trips/tripImage.jpg" }, // Default image path
  likedPlaces: { type: [Types.ObjectId], default: [] }, // Default as empty array
  days: { type: [[String]], default: [[]] }, // Nested array with a default empty array
});

*/
app.listen(4000, () => console.log("App listening on port 4000!"));
