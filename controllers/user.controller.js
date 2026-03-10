import crypto from "crypto";
import User from "../models/user.model.js";

const hashPassword = (password) => {
  return crypto.createHash("sha256").update(password).digest("hex");
};

export const getCurrentUser = async (req, res) => {
  console.log("Fetching User....");

  try {
    const userId = req.userId;
    const user = await User.findById(userId);
    console.log(user);

    if (!user) {
      return res.status(404).json({ message: "user does not found" });
    }
    return res.status(200).json(user);
  } catch (error) {
    return res
      .status(500)
      .json({ message: `failed to get currentUser ${error}` });
  }
};

export const createUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ message: "name, email and password are required" });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ message: "User already exists" });
    }

    const user = await User.create({
      name,
      email,
      password: hashPassword(password),
      role: role ?? "USER",
    });

    return res.status(201).json(user);
  } catch (error) {
    return res.status(500).json({ message: `createUser error ${error}` });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const requesterId = req.userId;

    const requester = await User.findById(requesterId);
    if (!requester) {
      return res.status(404).json({ message: "Requester not found" });
    }

    if (requester.role !== "ADMIN" && requesterId !== id) {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this user" });
    }

    const target = await User.findById(id);
    if (!target) {
      return res.status(404).json({ message: "User not found" });
    }

    await User.findByIdAndDelete(id);
    return res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: `deleteUser error ${error}` });
  }
};
