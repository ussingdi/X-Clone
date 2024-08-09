import express from "express";
import { signup, login, logout } from "../controllers/auth.controller.js";
import { protectedRoute } from "../middleware/protectRoute.js";

const router = express.Router();

router.get("/me", protectedRoute, (req, res) => {
  res.send("This is a protected route. You are authenticated.");
});

router.post("/signup", signup);

router.post("/login", login);

router.post("/logout", logout);

export default router;
