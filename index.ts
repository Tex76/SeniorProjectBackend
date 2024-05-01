import express from "express";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import { User } from "./DataBase";

import cors from "cors";

const app = express();
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

mongoose
  .connect("mongodb://localhost:27017/clickVenture")
  .then(() => {
    console.log("Connected to the database");
  })
  .catch((err) => {
    console.log("Error connecting to the database", err);
  });

app.use(express.json());

app.post("/signUp", (req, res) => {
  //fetch from database
  const { name, username, email, password } = req.body;
  console.log({ name, username, email, password });
  // add data to database in collection called users
  res.send("Sign up successful");
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  // Retrieve the user from the database
  const user = await User.findOne({ email });

  if (!user) {
    return res.status(401).send("Login failed: user not found");
  }

  // Compare the provided password with the hashed password in the database
  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    return res.status(401).send("Login failed: incorrect password");
  }

  // If the password is correct, proceed with login...
});

app.listen(4000, () => console.log("Example app listening on port 4000!"));

// currentPoint: 200 maxpoint: 500
