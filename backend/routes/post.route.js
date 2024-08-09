import express from "express";
import { protectedRoute } from "../middleware/protectRoute.js";
import {
  createPost,
  getAllPost,
  likeUnlikePost,
  getLikedPosts,
  getFollowingPosts,
  commentOnPost,
  deletePost,
  getUserPosts,
} from "../controllers/post.controller.js";

const router = express.Router();

router.get("/all", protectedRoute, getAllPost);
router.get("/following", protectedRoute, getFollowingPosts);
router.get("/user/:username", protectedRoute, getUserPosts);
router.get("/allLikes/:id", protectedRoute, getLikedPosts);
router.post("/create", protectedRoute, createPost);
router.post("/like/:id", protectedRoute, likeUnlikePost);
router.post("/comment/:id", protectedRoute, commentOnPost);
router.delete("/:id", protectedRoute, deletePost);

export default router;
