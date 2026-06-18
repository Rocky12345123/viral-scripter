import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST requests allowed" });
  }

  const { productName, productDescription, tone } = req.body;

  if (!productName || !productDescription) {
    return res.status(400).json({ error: "Missing productName or productDescription" });
  }

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `You generate TikTok Shop scripts in an organic, awkward, UGC style. 
            You ALWAYS include a full SEO keyword list at the end. 
            You keep scripts short, punchy, and creator-friendly.`
          },
          {
            role: "user",
            content: `
Generate a TikTok Shop script.

Product: ${productName}
Description: ${productDescription}
Tone: ${tone || "UGC awkward"}

Return:
1. A hook
2. A full script (10–20 seconds)
3. A shorter version (5–7 seconds)
4. A POV version
5. A FOMO version
6. A full SEO keyword list`
          }
        ],
        temperature: 0.8
      })
    });

    const data = await response.json();

    return res.status(200).json({
      success: true,
      script: data.choices?.[0]?.message?.content || "No script generated",
    });

  } catch (error) {
    console.error("API Error:", error);
    return res.status(500).json({ error: "Failed to generate script" });
  }
}
