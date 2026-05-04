import express from "express";
import isAuth from "../middlewares/isAuth.js";
import { upload } from "../middlewares/multer.js";
import {
  analyzeResume,
  evaluateConversationAnswer,
  finishInterview,
  generateFollowUpQuestion,
  generateQuestion,
  getInterviewReport,
  getMyInterviews,
  submitAnswer,
} from "../controllers/interview.controller.js";

const interviewRouter = express.Router();

interviewRouter.post("/resume", isAuth, upload.single("resume"), analyzeResume);
interviewRouter.post("/generate-questions", isAuth, generateQuestion);
interviewRouter.post("/submit-answer", isAuth, submitAnswer);
interviewRouter.post("/follow-up", isAuth, generateFollowUpQuestion);
interviewRouter.post("/evaluate-thread", isAuth, evaluateConversationAnswer);
interviewRouter.post("/finish", isAuth, finishInterview);

interviewRouter.get("/get-interview", isAuth, getMyInterviews);
interviewRouter.get("/report/:id", isAuth, getInterviewReport);

export default interviewRouter;
