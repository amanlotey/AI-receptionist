import OpenAI from "openai";
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

export async function generateReply(text: string): Promise<string> {
  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: "You are a friendly AI assistant." },
      { role: "user", content: text },
    ],
  });

  return completion.choices[0].message.content || "Sorry, I didn’t catch that.";
}
