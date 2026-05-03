import { transcribeSpeech } from "../services/openAiStt.service.js";

export const transcribeAudio = async (req, res) => {
  try {
    console.log("Audio File: ", req.file);

    if (!req.file) {
      return res.status(400).json({ message: "Audio file is required." });
    }

    const text = await transcribeSpeech({
      buffer: req.file.buffer,
      filename: req.file.originalname,
      mimetype: req.file.mimetype,
    });

    res.status(200).json({ text });
  } catch (error) {
    console.error("OpenAI STT Error:", error.response?.data || error.message);
    res.status(500).json({ message: "Unable to transcribe audio." });
  }
};
