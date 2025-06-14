import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { prompt } = await req.json();

    // เริ่มคำขอไปยัง API
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer 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`,  // ใช้ API Key ที่ถูกต้อง
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

    // ตรวจสอบว่า API ตอบกลับสำเร็จหรือไม่
    console.log("API Response Status:", response.status);

    if (!response.ok) {
      // ถ้า status code ไม่ใช่ 2xx, ก็จะ throw ข้อผิดพลาด
      throw new Error(`API Error: ${response.statusText}`);
    }

    // ดึงข้อมูลจาก API response
    const data = await response.json();
    console.log("API Response Data:", data);

    // ตรวจสอบว่า data มีข้อความหรือไม่
    if (data.choices && data.choices[0] && data.choices[0].message) {
      return NextResponse.json({ text: data.choices[0].message.content });
    } else {
      // ถ้าไม่มีข้อความจาก API
      return NextResponse.json({ text: "ไม่สามารถประมวลผลคำขอของคุณได้ กรุณาลองใหม่" });
    }

  } catch (error) {
    // แสดงข้อผิดพลาดในกรณีที่เกิดข้อผิดพลาด
    console.error("Error:", error.message);
    return NextResponse.json({ text: `เกิดข้อผิดพลาด: ${error.message}` });
  }
}
