import express from "express";
import { googleAuth, login, logOut } from "../controllers/auth.controller.js";
import isAuth from "../middlewares/isAuth.js";

const authRouter = express.Router();

authRouter.post("/google", googleAuth);
authRouter.post("/login", login);
authRouter.get("/logout", isAuth, logOut);

export default authRouter;
