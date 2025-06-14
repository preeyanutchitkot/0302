import { NextResponse } from "next/server";

export async function POST(req) {
  try {
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


    // แสดงข้อมูลการตอบกลับจาก API เพื่อดูข้อมูล response
    console.log("API Response Status:", response.status);
    const data = await response.json();
    console.log("API Response Data:", data);

    if (!response.ok) {
      throw new Error('ไม่สามารถเชื่อมต่อกับ API ได้');
    }

    if (data.choices && data.choices[0] && data.choices[0].message) {
      return NextResponse.json({ text: data.choices[0].message.content });
    } else {
      return NextResponse.json({ text: "ไม่สามารถประมวลผลคำขอของคุณได้ กรุณาลองใหม่" });
    }
  } catch (error) {
    console.error("Error:", error.message);  // แสดงข้อความข้อผิดพลาดจาก try-catch
    return NextResponse.json({ text: `เกิดข้อผิดพลาด: ${error.message}` });
  }
}
