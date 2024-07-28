import { z } from "zod";
import User from "../models/user.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const emailSchema = z.string().email();
const passwordSchema = z.string().min(8);

export const signup = async (req, res) => {
  const { fullname, username, email, password } = req.body;
  try {
    emailSchema.parse(email);
  } catch (error) {
    return res.status(400).json({ error: "Invalid email format" });
  }
  const existingUser = await User.findOne({ username: username });
  if (existingUser) {
    return res.status(400).json({ error: "Username already taken" });
  }

  const existingemail = await User.findOne({ email: email });
  if (existingemail) {
    return res.status(400).json({ error: "Emailid already taken" });
  }
  if (!username) {
    return res.status(400).json({ error: "Error in Username" });
  }
  //validate password
  try {
    passwordSchema.parse(password);
  } catch (error) {
    return res.status(400).json({ error: "Invalid Password format" });
  }
  // hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const newUser = new User({
    fullname: fullname,
    username: username,
    email: email,
    password: hashedPassword,
  });

  if (newUser) {
    await newUser.save();
    //generate and store cookie
    tokenAndCookie(res, newUser._id);
    res.status(201).json({
      _id: newUser._id,
      fullname: newUser.fullname,
      username: newUser.username,
      email: newUser.email,
      followers: newUser.followers,
      following: newUser.following,
      profileImg: newUser.profileImg,
      coverImg: newUser.coverImg,
    });
  } else {
    res.status(400).json({ error: "Invalid User Data" });
  }
};

export const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    const isPasswordCorrect = await bcrypt.compare(
      password,
      user?.password || ""
    );

    if (!user || !isPasswordCorrect) {
      res.status(400).json({
        error: "Invalid Credentials",
      });
    } else {
      tokenAndCookie(res, user._id);
      res.status(200).json({
        _id: user._id,
        fullname: user.fullname,
        username: user.username,
        email: user.email,
        followers: user.followers,
        following: user.following,
        profileImg: user.profileImg,
        coverImg: user.coverImg,
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const logout = async (req, res) => {
  try {
    //generate and store cookie
    res.cookie("jwt", "", { maxAge: 0 });
    res.status(200).json({ message: "Logged Out Successfully" });
  } catch (error) {
    console.log("Error in Logout Controller", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

function tokenAndCookie(res, id) {
  const payload = { id };
  const secret = process.env.SECRET_KEY;
  const options = { expiresIn: "15d" };

  const token = jwt.sign(payload, secret, options);
  console.log("token", token);

  res.cookie("jwt", token, {
    maxAge: 15 * 24 * 60 * 60 * 1000,
    httpOnly: true,
    secure: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Strict",
  });
}
