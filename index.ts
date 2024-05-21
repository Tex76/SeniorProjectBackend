import express from "express";
import mongoose, { Schema, Types } from "mongoose";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import cors from "cors";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";
const { ObjectId } = mongoose.Types;
dotenv.config();
const app = express();
const corsOptions = {
  origin: "http://localhost:3000", // Ensure this matches the exact URL of your frontend
  credentials: true, // Essential for cookies to be sent and received with requests
  optionSuccessStatus: 200,
  methods: ["POST", "PUT", "GET", "OPTIONS", "HEAD"],
};
import { Request, Response } from "express";

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
  userID: { type: Types.ObjectId, required: true, ref: "User" },
  placeID: { type: Types.ObjectId, required: true, ref: "Place" },
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
  avatarImage: {
    type: String,
    default:
      "https://static.vecteezy.com/system/resources/previews/009/734/564/non_2x/default-avatar-profile-icon-of-social-media-user-vector.jpg",
  }, // Automatically set the join date to the current date
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
        points: user.points,
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
app.get("/places", async (req, res) => {
  try {
    // Fetch the top 10 places sorted by rating in descending order
    const places = await Place.find().sort({ rate: -1 }).limit(20);
    console.log("places", places);
    res.json(places);
  } catch (error) {
    console.error("Error fetching places:", error);
    res.status(500).send({ message: "Internal server error" });
  }
});

app.get("/places/:id", async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    console.log(`${id} is not a valid ObjectId`);
    return res.status(400).json({ message: `${id} is not a valid ObjectId` });
  }

  try {
    // Step 1: Fetch the place document
    const place: any | null = await Place.findById(id).lean();

    if (!place) {
      return res.status(404).json({ message: "Place not found" });
    }

    // Step 2: Populate comments with user details
    const comments = await Comment.aggregate([
      { $match: { _id: { $in: place.comments } } },
      {
        $lookup: {
          from: "users",
          localField: "userID",
          foreignField: "_id",
          as: "userDetails",
        },
      },
      {
        $unwind: {
          path: "$userDetails",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $addFields: {
          username: "$userDetails.name",
          rank: "$userDetails.rank",
          rankImage: "$userDetails.rankImage",
          avatarImage: "$userDetails.avatarImage",
          contribution: "$userDetails.contribution",
          userID: "$userDetails._id",
        },
      },
      {
        $project: {
          userDetails: 0,
        },
      },
    ]);

    // Step 3: Populate photos with user details
    const photos = await Photo.aggregate([
      { $match: { _id: { $in: place.photos } } },
      {
        $lookup: {
          from: "users",
          localField: "userID",
          foreignField: "_id",
          as: "userDetails",
        },
      },
      {
        $unwind: {
          path: "$userDetails",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $addFields: {
          username: "$userDetails.name",
          rank: "$userDetails.rank",
          rankImage: "$userDetails.rankImage",
          avatarImage: "$userDetails.avatarImage",
          contribution: "$userDetails.contribution",
          userID: "$userDetails._id",
        },
      },
      {
        $project: {
          userDetails: 0,
        },
      },
    ]);
    Math;

    // Step 4: Calculate average ratings and other fields
    const rate = Math.round(
      comments.length > 0
        ? comments.reduce((acc, comment) => acc + comment.rate, 0) /
            comments.length
        : 0 * 10
    );
    const subRatings: Record<string, number> = {
      locationRate:
        comments.length > 0
          ? comments.reduce((acc, comment) => acc + comment.location, 0) /
            comments.length
          : 0,
      service:
        comments.length > 0
          ? comments.reduce((acc, comment) => acc + comment.service, 0) /
            comments.length
          : 0,
      facilities:
        comments.length > 0
          ? comments.reduce((acc, comment) => acc + comment.facilities, 0) /
            comments.length
          : 0,
      roomQuality:
        comments.length > 0
          ? comments.reduce((acc, comment) => acc + comment.roomQuality, 0) /
            comments.length
          : 0,
      cleanliness:
        comments.length > 0
          ? comments.reduce((acc, comment) => acc + comment.cleanliness, 0) /
            comments.length
          : 0,
    };

    if (place.category === "thingsToDo") {
      subRatings.convenience =
        comments.length > 0
          ? comments.reduce((acc, comment) => acc + comment.convenience, 0) /
            comments.length
          : 0;
      subRatings.staff =
        comments.length > 0
          ? comments.reduce((acc, comment) => acc + comment.staff, 0) /
            comments.length
          : 0;
      subRatings.safety =
        comments.length > 0
          ? comments.reduce((acc, comment) => acc + comment.safety, 0) /
            comments.length
          : 0;
    } else if (place.category === "thingsToEat") {
      subRatings.foodQuality =
        comments.length > 0
          ? comments.reduce((acc, comment) => acc + comment.foodQuality, 0) /
            comments.length
          : 0;
      subRatings.valueForMoney =
        comments.length > 0
          ? comments.reduce((acc, comment) => acc + comment.valueForMoney, 0) /
            comments.length
          : 0;
      subRatings.menuVariety =
        comments.length > 0
          ? comments.reduce((acc, comment) => acc + comment.menuVariety, 0) /
            comments.length
          : 0;
      subRatings.ambiance =
        comments.length > 0
          ? comments.reduce((acc, comment) => acc + comment.ambiance, 0) /
            comments.length
          : 0;
    }

    // Step 5: Combine all data into the final response
    const response = {
      ...place,
      comments: comments.length > 0 ? comments : [],
      photos: photos.length > 0 ? photos : [],
      rate,
      totalComments: comments.length,
      subRatings,
    };

    console.log("Place found", response);
    return res.json(response);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
});

app.get("/profile", async (req, res) => {
  const { token } = req.cookies;

  if (!token) {
    return res.status(401).send("Unauthorized");
  }

  jwt.verify(token, jwtSecret, {}, async (err, decoded) => {
    if (err) {
      console.error("JWT verify error:", err);
      return res.status(401).send("Unauthorized");
    }

    if (typeof decoded === "object" && "id" in decoded) {
      try {
        const user = await User.findById(decoded.id).select("-password"); // Fetch the latest user data, excluding the password
        if (!user) {
          return res.status(404).send("User not found");
        }
        return res.json({
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
          points: user.points,
        });
      } catch (error) {
        console.error("Error fetching user profile:", error);
        return res.status(500).send("Server error");
      }
    } else {
      return res.status(401).send("Unauthorized");
    }
  });
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
        user.points += 10;
        user.save().then((updatedUser: any) => {
          res.json({
            message: "Comment saved successfully",
            user: {
              ...updatedUser._doc,
              points: updatedUser.points,
            },
          });
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
        user.points += 10;
        user.save().then((updatedUser: any) => {
          res.json({
            message: "Comment saved successfully",
            user: {
              ...updatedUser._doc,
              points: updatedUser.points,
            },
          });
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
        user.points += 10;
        user.save().then((updatedUser: any) => {
          res.json({
            message: "Comment saved successfully",
            user: {
              ...updatedUser._doc,
              points: updatedUser.points,
            },
          });
        });
      });
    });
  }
});

app.post("/setPhoto", async (req, res) => {
  const { imageUrl, placeId, userId, date } = req.body;

  try {
    // Create and save a new photo
    const photo = new Photo({
      placeID: placeId,
      userID: userId,
      dateOfTaken: date,
      image: imageUrl,
    });
    await photo.save();

    const photoID = photo._id;

    // Update the place with the new photo
    const place = await Place.findByIdAndUpdate(
      placeId,
      { $push: { photos: photoID } },
      { new: true }
    );
    if (!place) {
      return res.status(404).send("Place not found");
    }

    console.log("Photo saved in place", place);

    // Update the user with the new photo and points
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).send("User not found");
    }
    user.photosReview.push(photoID);
    user.points += 30;
    const updatedUser = await user.save();

    // Respond with a success message and the updated user data
    res.json({
      message: "Photo saved successfully",
      user: {
        ...updatedUser.toObject(),
        points: updatedUser.points,
      },
    });
  } catch (error) {
    console.error("Error saving photo:", error);
    res.status(500).send("Server error");
  }
});

// RESTFUL API
app.get("/user/trips/:id", async (req, res) => {
  const { id } = req.params;

  // Check if the id is a valid ObjectId
  if (!ObjectId.isValid(id)) {
    return res.status(400).send({ message: "Invalid user ID." });
  }

  try {
    const results = await User.aggregate([
      // Match the user by ID
      { $match: { _id: new ObjectId(id) } },

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

    if (results.length > 0 && results[0].trips.length > 0) {
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
    let likedPlaces: any[] = [];

    // Create an empty days array with the structure needed
    const daysArray = Array.from({ length: days }, () => []);

    // Simplified cleaning of userId assuming it's a direct ObjectId string
    const userObjectId = userid;

    console.log("User ID", userObjectId);

    const trip = new Trip({
      tripName,
      region,
      days: daysArray,
      description,
      totalDays: days,
      userID: userObjectId,
      likedPlaces,
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

app.post("/trip/delete/:id", async (req, res) => {
  const { id } = req.params;
  const { userID } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({ message: "Invalid trip ID." });
  }
  User.findByIdAndUpdate(userID, { $pull: { trips: id } }, { new: true })
    .then(() => {
      Trip.findByIdAndDelete(id)
        .then(() => {
          res.send("Trip deleted successfully");
        })
        .catch((err) => {
          console.error("Error deleting trip:", err);
          res.status(500).send("Failed to delete trip");
        });
    })
    .catch((err) => {
      console.error("Error deleting trip:", err);
      res.status(500).send("Failed to delete trip");
    });
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

app.get("/UserSystem/:id", async (req, res) => {
  const id = req.params.id;

  try {
    const user = await User.findById(id)
      .populate({
        path: "reviewComments",
        populate: { path: "placeID", model: "Place" }, // Populate the place details in each comment
      })
      .populate({
        path: "photosReview",
        populate: { path: "placeID", model: "Place" }, // Populate the place details in each photo
      });

    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }

    res.send(user);
  } catch (error) {
    res.status(500).send({ message: "Server error" });
  }
});

app.patch("/UserSystem/:id", async (req, res) => {
  const { id } = req.params;
  const { name, userName, description, avatarImage } = req.body; // Receive the new values from the request body

  try {
    const user = await User.findByIdAndUpdate(
      id,
      { name, userName, description, avatarImage },
      { new: true, runValidators: true } // Return the updated object and ensure validators are run
    );

    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }

    res.send(user);
  } catch (error) {
    res.status(500).send({ message: "Server error" });
  }
});

app.get("/setrunningTrip/:id", async (req, res) => {
  const id = req.params.id;

  // Validate the id parameter
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({ message: "Invalid trip ID" });
  }

  try {
    const trip = await Trip.findById(id);
    if (!trip) {
      return res.status(404).send({ message: "Trip not found" });
    }

    const user = await User.findByIdAndUpdate(
      trip.userID,
      { runningTrip: trip._id },
      { new: true }
    );
    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }

    console.log("Running trip set successfully", trip);

    res.send(trip);
  } catch (err) {
    console.error("Error fetching the trip or updating the user:", err);
    res.status(500).send({ message: "Internal server error" });
  }
});

app.post("/purchase", (req, res) => {
  const { userId, total } = req.body;
  User.findByIdAndUpdate(
    userId,
    { $inc: { points: -total } },
    { new: true }
  ).then((user) => {
    res.json(user);
  });
});

app.post("/terminateTrip", (req, res) => {
  const { userId } = req.body;
  User.findByIdAndUpdate(
    userId,
    { runningTrip: "No active trip" },
    { new: true }
  ).then((user) => {
    res.json(user);
  });
});

app.listen(4000, () => console.log("App listening on port 4000!"));
