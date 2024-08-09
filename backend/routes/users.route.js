import express from "express";
import { protectedRoute } from "../middleware/protectRoute.js";
import {
  getUserProfile,
  followUnfollowUser,
  getAll,
  getSuggestedUsers,
  updateUserProfile,
} from "../controllers/users.controller.js";

const router = express.Router();

router.get("/getUsers", protectedRoute, getAll);

router.get("/profile/:username", protectedRoute, getUserProfile);
router.get("/suggested/", protectedRoute, getSuggestedUsers);
router.post("/follow/:id", protectedRoute, followUnfollowUser);
router.post("/update", protectedRoute, updateUserProfile);

export default router;
