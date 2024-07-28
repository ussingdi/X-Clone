//console.log("Server is Running");

import express from "express";
import authRoutes from "./routes/auth.routes.js";
import dotenv from "dotenv";
import connectMongoDB from "./db/connectMongodb.js";
import cookieParser from "cookie-parser";

dotenv.config();

//console.log(process.env.MONGO_URI);

const app = express();
const PORT = process.env.PORT || 5500;

app.use(express.json()); //to parse req.body
app.use(cookieParser());

app.use("/api/auth", authRoutes);

app.listen(PORT, () => {
  console.log(`Server is Running at Port ${PORT}`);
  connectMongoDB();
});
