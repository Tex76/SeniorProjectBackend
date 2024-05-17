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
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors(corsOptions));
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));

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
  imageTrip: {
    type: String,
    default:
      "https://media-cdn.tripadvisor.com/media/attractions-splice-spp-720x480/10/4e/8e/2e.jpg",
  },
  likedPlaces: { type: [Types.ObjectId], default: [] },
  days: [[placeSchema]],
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
    } else {
      res.status(404).send({ message: "No trips found or user not found." });
    }
  } catch (error) {
    console.error("Error fetching user trips:", error);
    res.status(500).send({ message: "Internal server error" });
  }
});

app.post("/trips", async (req, res) => {
  const { userid, tripName, region, days, description } = req.body;
  console.log("Request body of createTripForm", req.body);
  // Validate incoming data (basic example)
  if (!userid || !tripName || !region || !days || !description) {
    return res.status(400).send({ message: "All fields are required" });
  }

  try {
    // Create a new trip instance
    const trip = new Trip({
      userID: userid,
      tripName,
      region,
      totalDays: days,
      description,
      days: Array.from({ length: days }, () => []),
    });

    // Save the trip to the database
    const savedTrip = await trip.save();

    // Update the user's trips list
    const updatedUser = await User.findByIdAndUpdate(
      userid,
      { $push: { trips: savedTrip._id } },
      { new: true }
    );

    console.log("Trip saved in user", updatedUser);

    // Send the saved trip as a response
    res.send({ trip: savedTrip });
  } catch (error) {
    console.error("Error creating trip", error);
    res.status(500).send({ message: "Failed to create trip" });
  }
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
          as: "likedPlaces", // The name of the new field to be added with the joined data
        },
      },
    ]);

    if (!results || results.length === 0) {
      return res.status(404).send({ message: "Trip not found." });
    }

    const tripWithPlaces = results[0]; // Since we are querying by ID, we only expect one result

    res.json(tripWithPlaces); // Send back the aggregated trip data
  } catch (error) {
    console.error("Error fetching trip with places using $lookup:", error);
    res.status(500).send({ message: "Internal server error" });
  }
});

app.post("/trip/search", async (req, res) => {
  const { location, likedPlaces } = req.body;

  try {
    // Query places that are not already liked and match the given location
    const results = await Place.find({
      region: { $in: location }, // Assuming 'location' is an array of locations the user is interested in
      _id: { $nin: likedPlaces }, // Ensure the places are not in the likedPlaces array
    });

    // Send back the results
    res.json(results);
  } catch (error) {
    console.error("Error searching places:", error);
    res.status(500).send({ message: "Internal server error" });
  }
});

app.post("/trip/places/addLiked", async (req, res) => {
  const { tripId, placeId, placeregion, tripregion } = req.body;

  try {
    // Check if place region is in trip regions
    if (!tripregion.includes(placeregion)) {
      return res.status(400).send({
        message:
          "You can't add this place because there is a conflict in the regions.",
      });
    }

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

    res.send(trip); // Send back the updated trip object
  } catch (error) {
    console.error("Failed to update trip:", error);
    res.status(500).send("Internal server error");
  }
});

app.post("/trip/addPlaceToDay", async (req, res) => {
  const { tripId, placeId, dayIndex } = req.body;

  // Validate input for dayIndex to ensure it's a non-negative integer
  if (dayIndex < 0) {
    return res
      .status(400)
      .send("Invalid day index: Index must be zero or positive.");
  }

  try {
    // Fetch the place document to ensure it's valid
    const place = await Place.findById(placeId);
    if (!place) {
      return res.status(404).send("Place not found.");
    }

    // Prepare the query and update object using proper types
    const query: { [key: string]: any } = { _id: tripId };
    query[`days.${dayIndex}`] = { $exists: true };

    const update = {
      $push: { [`days.${dayIndex}`]: place },
    };

    // Update the trip with the new place document at the specified dayIndex
    const result = await Trip.findOneAndUpdate(query, update, {
      new: true,
      runValidators: true,
    });

    if (!result) {
      return res.status(404).send("Trip not found or day index out of range.");
    }

    res.send({
      message: "Place added successfully to the day.",
      trip: result,
    });
  } catch (error) {
    console.error("Failed to add place to day:", error);
    res.status(500).send("Internal server error");
  }
});

app.post("/trip/places/delete", async (req, res) => {
  const { tripId, placeId, dayIndex } = req.body;

  if (dayIndex < 0) {
    return res
      .status(400)
      .send("Invalid day index: Index must be zero or positive.");
  }

  try {
    const trip = await Trip.findById(tripId);
    if (!trip) {
      return res.status(404).send("Trip not found.");
    }

    // Check if the dayIndex is within the range of the days array
    if (dayIndex >= trip.days.length) {
      return res.status(400).send("Day index out of range.");
    }

    const update = {
      $pull: { [`days.${dayIndex}`]: { _id: placeId } },
    };

    const result = await Trip.findOneAndUpdate(
      { _id: tripId, [`days.${dayIndex}`]: { $exists: true } },
      update,
      { new: true, runValidators: true }
    );

    if (!result) {
      return res.status(404).send("Place not found or day index out of range.");
    }

    res.send({
      message: "Place deleted successfully from the day.",
      trip: result,
    });
  } catch (error) {
    console.error("Failed to delete place from day:", error);
    res.status(500).send("Internal server error");
  }
});

app.post("/api/add_trip", async (req, res) => {
  const { name, selectedRegion, Days, description, numberOfDays, userId } =
    req.body;

  try {
    let likedPlaces: any[] = [];

    // Map through days and places to convert place IDs to ObjectId
    const days: any[][] = [[]];
    for (let i = 0; i < Days.length; i++) {
      days[i] = [];
      const { places } = Days[i];
      for (let j = 0; j < places.length; j++) {
        days[i].push(places[j]);
        likedPlaces.push(places[j]);
      }
    }

    // Use Set directly with ObjectId if supported by your database
    // likedPlaces = Array.from(new Set(likedPlaces));

    // Simplified cleaning of userId assuming it's a direct ObjectId string
    const userObjectId = userId;

    console.log("user ID", userObjectId);

    const trip = new Trip({
      tripName: name,
      region: selectedRegion,
      days: days,
      description: description,
      totalDays: numberOfDays,
      userID: userObjectId,
      likedPlaces: likedPlaces,
      imageTrip:
        "https://media-cdn.tripadvisor.com/media/attractions-splice-spp-720x480/10/4e/8e/2e.jpg",
    });

    const savedTrip = await trip.save();
    console.log("Trip saved successfully", savedTrip._id);
    User.findByIdAndUpdate(
      userObjectId,
      { $push: { trips: savedTrip._id } },
      { new: true }
    )
      .then((user) => {
        res.json({ tripID: savedTrip._id });
        console.log("Trip saved in user", user);
      })
      .catch((err) => {
        console.error("Error updating user with trip:", err);
        res.status(500).send("Failed to update user with trip");
      });
  } catch (err) {
    console.error("Error processing request", err);
    res.status(500).send("Failed to save trip due to server error");
  }
});

app.listen(4000, () => console.log("App listening on port 4000!"));
