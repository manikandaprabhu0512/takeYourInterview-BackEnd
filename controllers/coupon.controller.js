import Coupon from "../models/coupon.model.js";
import User from "../models/user.model.js";

export const addCoupon = async (req, res) => {
  console.log("Adding Coupon...");

  try {
    const { coupon, quantity, expiryDate, credits } = req.body;
    const userId = req.userId;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.role === "USER") {
      return res.status(403).json({ message: "Forbidden user" });
    }

    if (!coupon || !expiryDate) {
      return res
        .status(400)
        .json({ message: "coupon and expiryDate are required" });
    }
    console.log("Coupon not expired");

    const existing = await Coupon.findOne({ coupon });
    if (existing) {
      return res.status(409).json({ message: "Coupon already exists" });
    }

    console.log("Coupon doesn't exists");
    const newCoupon = await Coupon.create({
      coupon,
      quantity: quantity ?? 1,
      credits: credits ?? 0,
      expiryDate,
    });

    console.log("New Coupon added:", newCoupon.coupon);
    return res.status(201).json(newCoupon);
  } catch (error) {
    return res.status(500).json({ message: `addCoupon error ${error}` });
  }
};

export const getAllCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find({
      expiryDate: { $gt: new Date() },
      credits: { $gt: 0 },
      quantity: { $gt: 0 },
    }).sort({ createdAt: -1 });
    return res.status(200).json(coupons);
  } catch (error) {
    return res.status(500).json({ message: `getAllCoupons error ${error}` });
  }
};

export const verifyCoupon = async (req, res) => {
  try {
    const { coupon } = req.body;
    const userId = req.userId;

    if (!coupon) {
      return res.status(400).json({ message: "coupon is required" });
    }

    const foundCoupon = await Coupon.findOne({ coupon });
    if (!foundCoupon) {
      return res.status(404).json({ message: "Coupon not found" });
    }

    const now = new Date();
    if (foundCoupon.expiryDate < now) {
      return res.status(400).json({ message: "Coupon has expired" });
    }

    if (foundCoupon.quantity <= 0) {
      return res
        .status(400)
        .json({ message: "Coupon has already been fully redeemed" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Redeem the coupon
    foundCoupon.quantity -= 1;
    await foundCoupon.save();

    user.credits = (user.credits ?? 0) + (foundCoupon.credits ?? 0);
    await user.save();

    return res.status(200).json({
      message: "Coupon redeemed successfully",
      credits: user.credits,
      remainingQuantity: foundCoupon.quantity,
    });
  } catch (error) {
    return res.status(500).json({ message: `verifyCoupon error ${error}` });
  }
};
