import axios from "axios";

export async function transcribeAudio(audioBase64: string): Promise<string> {
  const buffer = Buffer.from(audioBase64.split(",")[1], "base64");

  const res = await axios.post(
    "https://api.deepgram.com/v1/listen?model=nova",
    buffer,
    {
      headers: {
        Authorization: `Token ${process.env.DG_API_KEY}`,
        "Content-Type": "audio/webm",
      },
    }
  );

  return res.data.results?.channels[0]?.alternatives[0]?.transcript || "";
}
