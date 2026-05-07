import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY,
  baseURL: "https://api.deepseek.com",
});

export async function generateBMIAnalysis(data: {
  bmi: number;
  category: string;
  country: string;
  language: string;
  gender?: string;
  age?: number;
}) {
  const prompt = `
You are a professional health assistant.

User Information:
- BMI: ${data.bmi}
- BMI Category: ${data.category}
- Country: ${data.country}
- Language: ${data.language}
- Gender: ${data.gender || "unknown"}
- Age: ${data.age || "unknown"}

Requirements:
1. Explain the BMI result clearly
2. Mention possible health risks
3. Provide safe lifestyle suggestions
4. Keep tone friendly and supportive
5. Do NOT provide medical diagnosis
6. Maximum 120 words
7. Add disclaimer:
"AI-generated content. Please use your own judgment."

Respond ONLY in ${data.language}.
`;

  const completion = await client.chat.completions.create({
    model: "deepseek-chat",
    messages: [
      {
        role: "system",
        content: "You are a helpful AI health assistant.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
    temperature: 0.7,
    max_tokens: 300,
  });

  return completion.choices[0].message.content ?? "";
}