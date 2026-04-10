import axios from "axios";
import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";

export async function synthesizeSpeech(text: string): Promise<string> {
  const fileName = `${uuidv4()}.mp3`;

  // ✅ Save directly inside /public
  const publicDir = path.resolve(__dirname, "../../public");
  const filePath = path.join(publicDir, fileName);

  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
    console.log("📁 Created public directory at:", publicDir);
  }

  const response = await axios.post(
    "https://api.elevenlabs.io/v1/text-to-speech/pNInz6obpgDQGcFmaJgB",
    { text, model_id: "eleven_multilingual_v2" },
    {
      headers: {
        "xi-api-key": process.env.ELEVENLABS_API_KEY!,
        "Content-Type": "application/json",
      },
      responseType: "arraybuffer",
    }
  );

  fs.writeFileSync(filePath, Buffer.from(response.data));

  const fileUrl = `http://localhost:${process.env.PORT || 8080}/${fileName}`;
  console.log("🗣️ AI voice saved at:", filePath);
  console.log("🌐 Accessible at:", fileUrl);

  // ✅ Return full URL for frontend playback
  return `http://localhost:${process.env.PORT || 8080}/${fileName}`;
}
