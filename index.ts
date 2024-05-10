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
  tripName: { type: String, default: "New Trip" },
  region: { type: [String], default: [] },
  totalDays: { type: Number, default: 1 },
  description: { type: String, default: "No description provided." },
  imageTrip: { type: String, default: "trips/tripImage.jpg" },
  likedPlaces: { type: [Types.ObjectId], default: [] },
  days: [
    [placeSchema], // Embedding the place schema directly within each day's array
  ],
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
        id: user._id,
        name: user.name,
        userName: user.userName,
        avatarImage: user.avatarImage,
        rank: user.rank,
        rankImage: user.rankImage,
        contribution: user.contribution,
        trips: user.trips,
        runningTrip: user.runningTrip,
      },
      jwtSecret,
      {
        expiresIn: "315360000", // 10 years in seconds
      },
      (err: Error | null, token: string | undefined) => {
        if (err) {
          console.error("JWT sign error:", err);
          return res.status(500).send("Failed to sign token");
        }
        res.cookie("token", token, { httpOnly: true, sameSite: "strict" });
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

app.get("/user/trips/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const results = await User.aggregate([
      // Match the user by ID
      { $match: { _id: new mongoose.Types.ObjectId(id) } },

      // Lookup to fetch the trips
      {
        $lookup: {
          from: "trips", // The collection to join
          localField: "trips", // Field from the users collection
          foreignField: "_id", // Field from the trips collection
          as: "trips", // Resultant array field
        },
      },

      // Optionally project fields
      {
        $project: {
          _id: 0, // Exclude user id
          trips: 1, // Include trips array
        },
      },
    ]);

    if (results.length > 0 && results[0].trips) {
      res.json(results[0].trips);
      console.log("TRIP FROM USER DATA", results[0].trips);
    } else {
      res.status(404).send({ message: "No trips found or user not found." });
    }
  } catch (error) {
    console.error("Error fetching user trips:", error);
    res.status(500).send({ message: "Internal server error" });
  }
});

app.post("/trips", async (req, res) => {
  const { userID, tripName, region, days, description } = req.body;
  const trip = new Trip({
    userID,
    tripName,
    region,
    totalDays: days,
    description,
    days: Array.from({ length: days }, () => []),
  });
  trip.save().then((trip) => {
    User.findByIdAndUpdate(
      userID,
      { $push: { trips: trip._id } },
      { new: true }
    ).then((user) => {
      console.log("Trip saved in user", user);
    });

    res.send(trip);
  });
});

// this part for fetching liked places array in the trip
app.get("/trips/:id", async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({ message: "Invalid trip ID." });
  }

  try {
    const results = await Trip.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(id) } },
      {
        $lookup: {
          from: "places", // This should match the name of the collection containing the place documents
          localField: "likedPlaces", // The field in Trip documents that contains the IDs
          foreignField: "_id", // The corresponding field in Place documents
          as: "likedPlacesDetails", // The name of the new field to be added with the joined data
        },
      },
    ]);

    if (!results || results.length === 0) {
      return res.status(404).send({ message: "Trip not found." });
    }

    const tripWithPlaces = results[0]; // Since we are querying by ID, we only expect one result

    res.json(tripWithPlaces); // Send back the aggregated trip data
    console.log("Trip found", tripWithPlaces);
  } catch (error) {
    console.error("Error fetching trip with places using $lookup:", error);
    res.status(500).send({ message: "Internal server error" });
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
  const { tripId, placeId } = req.body;
  console.log("Trip ID", tripId);
  console.log("Place ID", placeId);

  try {
    const trip = await Trip.findByIdAndUpdate(
      tripId,
      { $addToSet: { likedPlaces: placeId } }, // Using $addToSet to prevent duplicates
      { new: true, runValidators: true }
    );

    if (!trip) {
      return res.status(404).send({ message: "Trip not found." });
    }

    if (trip.likedPlaces.includes(placeId)) {
      return res
        .status(409)
        .send({ message: "Place already exists in this trip." }); // 409 Conflict
    }

    console.log("Place added to liked in trip", trip);
    res.json({
      message: "Place added successfully to liked places.",
      trip: trip,
    });
  } catch (error) {
    console.error("Failed to add place to liked places in trip:", error);
    res.status(500).send({ message: "Internal server error", error: error });
  }
});

// updating the trip information base on trip ID
app.post("/update/trips/:id", async (req, res) => {
  const { tripName, description, coverImage, totalDays } = req.body;
  const { id } = req.params;

  try {
    // Build the update object dynamically
    const update = {
      ...(tripName && { tripName }),
      ...(description && { description }),
      ...(coverImage && { imageTrip: coverImage }),
      ...(totalDays !== undefined && { totalDays }),
    };

    // Update the trip and adjust the `days` array as necessary
    const trip = await Trip.findById(id);
    if (!trip) {
      return res.status(404).send("Trip not found.");
    }

    // Dynamically update trip fields
    Object.assign(trip, update);

    // Adjust the `days` array
    if (totalDays !== undefined) {
      if (totalDays < trip.days.length) {
        trip.days.splice(totalDays); // Cut down extra days
      } else {
        while (trip.days.length < totalDays) {
          trip.days.push([]); // Add new days as empty arrays
        }
      }
    }

    await trip.save(); // Save the updated trip
    console.log("Trip updated --------------------------", trip);
    res.send(trip); // Send back the updated trip object
  } catch (error) {
    console.error("Failed to update trip:", error);
    res.status(500).send("Internal server error");
  }
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
