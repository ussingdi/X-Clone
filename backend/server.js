//console.log("Server is Running");

import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import { v2 as cloudinary } from "cloudinary";

import authRoutes from "./routes/auth.route.js";
import usersRoutes from "./routes/users.route.js";
import postsRoutes from "./routes/post.route.js";
import connectMongoDB from "./db/connectMongodb.js";

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

//console.log(process.env.MONGO_URI);

const app = express();
const PORT = process.env.PORT || 5500;

app.use(express.json()); //to parse req.body
app.use(cookieParser());

app.use("/api/auth", authRoutes);

app.use("/api/users", usersRoutes);

app.use("/api/posts", postsRoutes);

app.listen(PORT, () => {
  console.log(`Server is Running at Port ${PORT}`);
  connectMongoDB();
});
