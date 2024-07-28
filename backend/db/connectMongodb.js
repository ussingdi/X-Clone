import mongoose from "mongoose";

const connectMongoDB = async () => {
  try {
    const connect = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected : ${connect.connection.host}`);
  } catch (error) {
    console.error(`Error to connect MongoDB : ${e.message}`);
    process.exit(1);
  }
};

export default connectMongoDB;
