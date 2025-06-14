import { NextResponse } from "next/server";

export async function POST(req) {
  const { prompt } = await req.json();

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer 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`, // เปลี่ยนเป็น key จริง
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "openai/gpt-3.5-turbo",
      messages: [
        { role: "system", content: "คุณคือนักวิเคราะห์ปัญหาในเมือง เช่น ขยะ น้ำท่วม ถนนพัง" },
        { role: "user", content: prompt }
      ]
    })
  });

  const data = await response.json();
  return NextResponse.json({ text: data.choices[0].message.content });
}
