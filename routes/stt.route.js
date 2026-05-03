import express from "express";
import multer from "multer";
import isAuth from "../middlewares/isAuth.js";
import { transcribeAudio } from "../controllers/stt.controller.js";

const sttRouter = express.Router();
const uploadAudio = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 },
});

sttRouter.post("/transcribe", isAuth, uploadAudio.single("audio"), transcribeAudio);

export default sttRouter;
