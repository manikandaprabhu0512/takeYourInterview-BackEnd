import crypto from "crypto";
import genToken from "../config/token.js";
import User from "../models/user.model.js";

const hashPassword = (password) => {
  return crypto.createHash("sha256").update(password).digest("hex");
};

export const googleAuth = async (req, res) => {
  try {
    const { name, email } = req.body;
    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({
        name,
        email,
      });
    }

    const token = await genToken(user._id);
    res.cookie("token", token, {
      http: true,
      secure: false,
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json(user);
  } catch (error) {
    return res.status(500).json({ message: `Google auth error ${error}` });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "email and password are required" });
    }

    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.password) {
      return res
        .status(400)
        .json({ message: "This account does not support password login" });
    }

    const hashed = hashPassword(password);
    if (hashed !== user.password) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = await genToken(user._id);
    res.cookie("token", token, {
      http: true,
      secure: false,
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    console.log("Token generated:", token);

    const safeUser = user.toObject();
    delete safeUser.password;

    return res.status(200).json(safeUser);
  } catch (error) {
    return res.status(500).json({ message: `Login error ${error}` });
  }
};

export const logOut = async (req, res) => {
  try {
    await res.clearCookie("token");
    return res.status(200).json({ message: "LogOut Successfully" });
  } catch (error) {
    return res.status(500).json({ message: `Logout error ${error}` });
  }
};
