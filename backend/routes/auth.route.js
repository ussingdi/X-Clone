import express from "express";
import { signup, login, logout } from "../controllers/auth.controller.js";
import { protectedRoute } from "../middleware/protectRoute.js";
import User from "../models/user.model.js";

const router = express.Router();

router.get("/me", protectedRoute, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    res.status(200).json(user);
  } catch (error) {
    console.log("Error in getMe controller", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post("/signup", signup);

router.post("/login", login);

router.post("/logout", logout);

export default router;
