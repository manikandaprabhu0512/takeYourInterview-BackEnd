import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      unique: true,
      required: true,
    },
    password: {
      type: String,
      select: false,
    },
    role: {
      type: String,
      enum: ["USER", "ADMIN"],
      default: "USER",
    },
    credits: {
      // Remove this for personal purposes.
      type: Number,
      default: 100,
    },
  },
  { timestamps: true },
);

const User = mongoose.model("User", userSchema);

export default User;
