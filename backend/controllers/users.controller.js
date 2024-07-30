import User from "../models/user.model.js";
import Notification from "../models/notificationmodel.js";
import bcrypt from "bcrypt";
import { v2 as cloudinary } from "cloudinary";

export const getAll = async (req, res) => {
  console.log("Insie Get ALL");
  try {
    const users = await User.find({});
    //console.log(users);
    users.forEach((user) => {
      user.password = null;
    });
    res.status(200).json({ Data: users });
  } catch (error) {
    res.status(400).json({ error: error });
  }
};

export const getUserProfile = async (req, res) => {
  const { username } = req.params;
  //console.log(username);
  try {
    const user = await User.findOne({ username: username }).select("-password");
    console.log(user);
    if (!user) {
      return res.status(404).json({ error: "User not Found" });
    }
    res.status(200).json({ user });
  } catch (error) {
    console.log("Error in getUserprofile");
    res.status(500).json({ error: error });
  }
};

export const followUnfollowUser = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(id);
    const userToModify = await User.findById(id);
    const currentUser = await User.findById(req.user._id);
    console.log(userToModify, currentUser);

    if (id == req.user._id) {
      return res
        .status(400)
        .json({ error: "You cant follow/unfollow yourself" });
    }
    if (!userToModify || !currentUser) {
      return res.status(400).json({ error: "User not Found" });
    }

    const isFollowing = currentUser.following.includes(id);

    if (isFollowing) {
      //unfollow the user
      await User.findByIdAndUpdate(id, { $pull: { followers: req.user._id } });
      await User.findByIdAndUpdate(req.user._id, { $pull: { following: id } });
      //Send Notification
      res.status(200).json({ message: "User Unfollowed Succesfully" });
    } else {
      //follow the user
      await User.findByIdAndUpdate(id, { $push: { followers: req.user._id } });
      await User.findByIdAndUpdate(req.user._id, { $push: { following: id } });
      //Send Notification
      const newNotification = new Notification({
        type: "follow",
        to: userToModify._id,
        from: req.user._id,
      });
      await newNotification.save();
      res.status(200).json({ message: "User Followed Succesfully" });
    }
  } catch (error) {
    console.log("Error in followUnfollow ");
    res.status(500).json({ error: error.message });
  }
};

export const getSuggestedUsers = async (req, res) => {
  try {
    const userId = req.user._id;

    const usersFollowedByMe = await User.findById(userId).select("following");
    const users = await User.aggregate([
      {
        $match: {
          _id: { $ne: userId },
        },
      },
      {
        $sample: { size: 10 },
      },
    ]);

    const filteredUser = users.filter(
      (user) => !usersFollowedByMe.following.includes(user._id)
    );
    const suggestedUsers = filteredUser.slice(0, 4);

    suggestedUsers.forEach((user) => (user.password = null));
    res.status(200).json(suggestedUsers);
  } catch (error) {
    console.log("Errorin getSuggested Users");
    res.status(500).json({ error: error.message });
  }
};

export const updateUserProfile = async (req, res) => {
  const { fullname, email, username, currentPassword, newPassword, bio, link } =
    req.body;
  let { profileImg, coverImg } = req.body;

  const userId = req.user._id;
  try {
    let user = await User.findById(userId);
    console.log(user.password);
    if (!user) {
      return res.status(400).json({ error: "user not found" });
    }
    if (
      (!newPassword && currentPassword) ||
      (newPassword && !currentPassword)
    ) {
      return res.status(400).json({ error: "Please provide both password" });
    }
    if (currentPassword && newPassword) {
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({ error: "Current Password is Incorrect" });
      }
      if (newPassword.length < 8) {
        return res
          .status(400)
          .json({ error: "Password Length must be atleast 8 char long" });
      }

      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, salt);
    }
    if (profileImg) {
      if (user.profileImg) {
        await cloudinary.uploader.destroy(
          user.profileImg.split("/").pop().split(".")[0]
        );
      }
      const uploadedResponse = await cloudinary.uploader.upload(profileImg);
      profileImg = uploadedResponse.secure_url;
    }
    if (coverImg) {
      if (user.coverImg) {
        await cloudinary.uploader.destroy(
          user.coverImg.split("/").pop().split(".")[0]
        );
      }
      const uploadedResponse = await cloudinary.uploader.upload(coverImg);
      coverImg = uploadedResponse.secure_url;
    }

    user.fullname = fullname || user.fullname;
    user.email = email || user.email;
    user.username = username || user.username;
    user.bio = bio || user.bio;
    user.link = link || user.link;
    user.profileImg = profileImg || user.profileImg;
    user.coverImg = coverImg || user.coverImg;

    user = await user.save();
    console.log(user.password);
    user.password = null;
    return res.status(200).json(user);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: error });
  }
};
