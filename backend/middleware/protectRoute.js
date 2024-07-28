import User from "../models/user.model.js";
import jwt from "jsonwebtoken";

export const protectedRoute = async (req, res, next) => {
  try {
    const token = req.cookies.jwt;

    if (!token) {
      return res.status(401).json({ error: "Unauthorized:No Token Provided" });
    }

    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    if (!decoded) {
      return res.status(401).json({ error: "Unauthorized: Invalid Token" });
    }

    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return res.status(404).json({ error: "User not Found" });
    }
    req.user = user;
    next();
  } catch (error) {
    console.log("Error in Protected Route", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
