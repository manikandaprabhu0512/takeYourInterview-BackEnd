import mongoose from "mongoose";

const couponSchema = new mongoose.Schema(
  {
    coupon: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    quantity: {
      // How many times this coupon can be used
      type: Number,
      required: true,
      min: 1,
      default: 1,
    },
    credits: {
      // How many credits the user receives when redeeming this coupon
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    expiryDate: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true },
);

const Coupon = mongoose.model("Coupon", couponSchema);

export default Coupon;
