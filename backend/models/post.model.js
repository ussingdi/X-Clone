import mongoose, { mongo } from "mongoose";

const schema = {
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  text: {
    type: String,
  },
  img: {
    type: String,
  },
  likes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
  ],
  comment: [
    {
      text: {
        type: String,
        required: true,
      },
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    },
  ],
};

const postSchema = new mongoose.Schema(schema, { timestamps: true });

const Post = mongoose.model("Post", postSchema);

export default Post;
