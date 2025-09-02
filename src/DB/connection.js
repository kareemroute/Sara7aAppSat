import mongoose from "mongoose";

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log("Database connected");
  } catch (error) {
    console.log("Database connection error", error.message);
  }
};

export default connectDB;
