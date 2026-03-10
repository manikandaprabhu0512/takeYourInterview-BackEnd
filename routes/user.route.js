import express from "express";
import isAuth from "../middlewares/isAuth.js";
import {
  createUser,
  deleteUser,
  getCurrentUser,
} from "../controllers/user.controller.js";

const userRouter = express.Router();

userRouter.post("/", createUser);
userRouter.get("/current-user", isAuth, getCurrentUser);
userRouter.delete("/:id", isAuth, deleteUser);

export default userRouter;
