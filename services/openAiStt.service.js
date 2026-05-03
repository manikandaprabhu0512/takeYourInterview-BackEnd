import axios from "axios";

const OPENAI_TRANSCRIPTION_URL =
  "https://api.openai.com/v1/audio/transcriptions";

export const transcribeSpeech = async ({ buffer, filename, mimetype }) => {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is not configured.");
  }

  if (!buffer?.length) {
    throw new Error("Audio file is required.");
  }

  const formData = new FormData();
  formData.append("model", "gpt-4o-mini-transcribe");
  formData.append("response_format", "json");
  formData.append(
    "file",
    new Blob([buffer], { type: mimetype || "audio/webm" }),
    filename || "speech.webm",
  );

  const response = await axios.post(OPENAI_TRANSCRIPTION_URL, formData, {
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
  });

  return response.data?.text || "";
};
