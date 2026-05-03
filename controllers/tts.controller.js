import { createSpeech } from "../services/openAiTts.service.js";

const VOICES = new Set([
  "alloy",
  "ash",
  "ballad",
  "coral",
  "echo",
  "fable",
  "nova",
  "onyx",
  "sage",
  "shimmer",
  "verse",
  "marin",
  "cedar",
]);

export const generateSpeech = async (req, res) => {
  try {
    const { text, voice, instructions } = req.body;
    const selectedVoice = VOICES.has(voice) ? voice : "coral";

    const audio = await createSpeech({
      input: text,
      voice: selectedVoice,
      instructions,
    });

    res.set({
      "Content-Type": "audio/mpeg",
      "Content-Length": audio.length,
      "Cache-Control": "no-store",
    });

    res.send(audio);
  } catch (error) {
    console.error("OpenAI TTS Error:", error.response?.data || error.message);
    res.status(500).json({ message: "Unable to generate speech." });
  }
};
