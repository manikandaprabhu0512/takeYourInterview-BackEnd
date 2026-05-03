import express from "express";
import isAuth from "../middlewares/isAuth.js";
import { generateSpeech } from "../controllers/tts.controller.js";

const ttsRouter = express.Router();

ttsRouter.post("/speech", isAuth, generateSpeech);

export default ttsRouter;
