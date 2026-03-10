import express from "express";
import isAuth from "../middlewares/isAuth.js";
import {
  addCoupon,
  getAllCoupons,
  verifyCoupon,
} from "../controllers/coupon.controller.js";

const couponRouter = express.Router();

// Fetch all coupons (admin only)
couponRouter.get("/", isAuth, getAllCoupons);

// Create a new coupon
couponRouter.post("/", isAuth, addCoupon);

// Redeem / verify a coupon for the authenticated user
couponRouter.post("/verify", isAuth, verifyCoupon);

export default couponRouter;
