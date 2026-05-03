import axios from "axios";

const OPENAI_TTS_URL = "https://api.openai.com/v1/audio/speech";

export const createSpeech = async ({
  input,
  voice = "coral",
  instructions = "Speak like a calm, friendly interviewer. Keep the pacing natural and clear.",
}) => {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is not configured.");
  }

  if (!input || !input.trim()) {
    throw new Error("Text input is required.");
  }

  const response = await axios.post(
    OPENAI_TTS_URL,
    {
      model: "gpt-4o-mini-tts",
      voice,
      input,
      instructions,
      response_format: "mp3",
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      responseType: "arraybuffer",
    },
  );

  return Buffer.from(response.data);
};
