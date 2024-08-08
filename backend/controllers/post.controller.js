import Post from "../models/post.model.js";
import User from "../models/user.model.js";
import Notification from "../models/notificationmodel.js";

export const getAllPost = async (req, res) => {
  try {
    console.log("Inside get All Posts");
    const post = await Post.find()
      .sort({ createdAt: -1 })
      .populate({ path: "user", select: "-password" })
      .populate({ path: "comment.user", select: "-password" });

    console.log(post);
    if (post.length === 0) {
      return res.status(400).json({ message: "No Posts Found" });
    }
    res.status(200).json(post);
  } catch (error) {
    console.log("Error in Get All Post", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getLikedPosts = async (req, res) => {
  const userId = req.params.id;
  console.log("Inside Get Likes Post", userId);
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(400).json({ error: "User not found" });
    }
    console.log(user);
    const likedPosts = await Post.find({
      _id: { $in: user.likedPosts },
    })
      .populate({ path: "user", selected: "-password" })
      .populate({ path: "comment", selected: "-password" });

    res.status(200).json(likedPosts);
  } catch (error) {
    console.log("Error in get All Like Post", error);
    res.status(500).json(error);
  }
};
export const createPost = async (req, res) => {
  try {
    const { text } = req.body;
    let { img } = req.body;

    const userId = req.user._id.toString();
    const user = await User.findById(userId);
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }
    if (!text && !img) {
      return res.status(400).json({ message: "Post must have image or text" });
    }

    if (img) {
      const uploadedResponse = await cloudinary.uploader.upload(img);
      img = upload.secure_url;
    }

    const newPost = new Post({
      user: userId,
      img,
      text,
    });
    await newPost.save();
    res.status(201).json(newPost);
  } catch (error) {
    console.log("Error in Create Post");
    res.status(500).json({ error: error.message });
  }
};

export const likeUnlikePost = async (req, res) => {
  console.log("Like Unlike Post");
  try {
    const postId = req.params.id;
    const userId = req.user._id;

    const post = await Post.findById(postId);
    const user = await User.findById(userId);
    console.log(post);

    if (!post) {
      return res.status(400).json({ error: "Post not found" });
    }
    const userLikedPost = post.likes.includes(userId);
    if (userLikedPost) {
      //user already likes, so we need to unlike
      await Post.updateOne({ _id: postId }, { $pull: { likes: userId } });
      await User.updateOne({ _id: userId }, { $pull: { likedPosts: postId } });
      res.status(200).json({ message: "Post Unliked Successfully" });
    } else {
      //Like Post
      post.likes.push(userId);
      user.likedPosts.push(postId);
      await post.save();
      await user.save();

      const notification = new Notification({
        from: userId,
        to: post.user,
        type: "like",
      });
      await notification.save();

      res.status(200).json({ message: "Post Liked Successfully" });
    }
  } catch (error) {
    console.log("Error in LikeUnlike controller");
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const commentOnPost = async (req, res) => {
  try {
    const { text } = req.body;
    const postId = req.params.id;
    const userId = req.user._id;

    if (!text) {
      return res.status(400).json({ error: "Text is required" });
    }
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(400).json({ error: "Post not found" });
    } else {
      const comment = { user: userId, text };

      post.comment.push(comment);
      await post.save();
      res.status(200).json(post);
    }
  } catch (error) {
    console.log("Error in commentOnPost controller : ", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (req.user._id.toString() !== post.user.toString()) {
      return res
        .status(401)
        .json({ message: "You are not authorized to delete this post" });
    }

    if (post.img) {
      const imgId = post.img.split("/").pop().split(".")[0];
      await cloudinary.uploader.destroy(imgId);
    }
    await Post.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: "Post deleted successfully" });
  } catch (error) {
    console.log("Error in Delete Post controller: ", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getFollowingPosts = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);
    // console.log(user);
    if (!user) {
      return res.status(400).json({ error: "User not found" });
    }

    const following = user.following;

    const feedPosts = await Post.find({ user: { $in: following } })
      .sort({ createdAt: -1 })
      .populate({ path: "user", select: "-password" })
      .populate({ path: "comment.user", select: "-password" });

    res.status(200).json(feedPosts);
  } catch (error) {
    console.log("Error in getFollowingPosts controller: ", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getUserPosts = async (req, res) => {
  const username = req.params.username;
  try {
    const userId = await User.findOne({ username }).select("_id");
    if (!userId) {
      return res.status(400).json({ message: "Invalid Username" });
    }
    // console.log(userId);
    const posts = await Post.find({ user: userId });
    return res.status(200).json(posts);
  } catch (error) {
    console.log("Error in get user posts", error);
    res.status(500).json("Internal Server Error");
  }
};
