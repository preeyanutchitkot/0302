'use client';

import { useEffect, useState } from 'react';
import { db } from '@/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { MainLayout } from '@/app/components/layout/MainLayout';

import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
} from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

export default function DashboardPage() {
  const [appeals, setAppeals] = useState([]);
  const [aiSummary, setAiSummary] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAndAnalyze = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'appeal'));
        const data = snapshot.docs.map(doc => doc.data());
        setAppeals(data);

        // 🔢 นับจำนวนปัญหา
        const countMap = {};
        const locations = [];

        data.forEach(item => {
          const title = item.title?.trim();
          const detail = item.detail?.trim();

          if (title) {
            countMap[title] = (countMap[title] || 0) + 1;
          }
          if (detail) {
            locations.push(detail);
          }
        });

        const prompt = `
ข้อมูลที่รวบรวมจากคำร้องเรียนของประชาชน:

1. จำนวนปัญหา:
${Object.entries(countMap).map(([k, v]) => `- ${k}: ${v} ครั้ง`).join('\n')}

2. พื้นที่ที่พบในคำร้อง:
${locations.map((l, i) => `${i + 1}. ${l}`).join('\n')}

กรุณาวิเคราะห์และสรุปข้อมูลในรูปแบบ JSON:
{
  "ranked_problems": ["น้ำท่วม", "ถนนพัง", "ขยะล้น"],
  "urgent_area": ["ถนนหน้ารพ.เก่า", "ถนนสายชลประทาน", "หน้าหอพัก A ซอย 5", "หน้าตลาดโต้รุ่งกลางเมือง", "ซอยโรงน้ำแข็ง"],
  "solutions": {
    "น้ำท่วม": "ควรเร่งเปิดทางระบายน้ำ และวางแผนลอกท่อ",
    "ถนนพัง": "ควรซ่อมถนนและปิดหลุมชั่วคราวเพื่อความปลอดภัย",
    "ขยะล้น": "ควรเพิ่มถังขยะและเพิ่มรอบเก็บขยะให้มากขึ้น"
  }
}
`;

        const res = await fetch('/api/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt }),
        });

        const result = await res.json();
        let text = result.text?.trim();

        if (text?.startsWith('```json')) {
          text = text.replace(/```json|```/g, '').trim();
        }

        const parsed = JSON.parse(text);
        setAiSummary(parsed);
      } catch (err) {
        console.error('❌ ERROR:', err);
        setError('เกิดข้อผิดพลาดในการวิเคราะห์ข้อมูล');
      }
    };

    fetchAndAnalyze();
  }, []);

  // 📊 Chart จากข้อมูลจริง
  const chartData = (() => {
    const countMap = {};
    appeals.forEach(item => {
      const title = item.title?.trim();
      if (title) countMap[title] = (countMap[title] || 0) + 1;
    });

    const labels = Object.keys(countMap);
    const values = Object.values(countMap);

    return {
      labels,
      datasets: [
        {
          label: 'จำนวนปัญหา',
          data: values,
          backgroundColor: ['#f87171', '#60a5fa', '#facc15', '#34d399', '#a78bfa'],
          borderWidth: 1,
        },
      ],
    };
  })();

  return (
    <MainLayout activeMenu="dashboard">
      <div style={{ padding: 30, backgroundColor: '#F9FAFB', minHeight: '100vh' }}>
        <h1 style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 20 }}>
          📊 Dashboard การวิเคราะห์ปัญหา
        </h1>

        {error && <div style={{ color: 'red' }}>⚠️ {error}</div>}

        {/* กราฟ */}
        <div style={{ display: 'flex', gap: 30, flexWrap: 'wrap' }}>
          <div style={{ width: '45%', background: '#fff', padding: 20, borderRadius: 10 }}>
            <h3 style={{ marginBottom: 10 }}>ประเภทปัญหาที่พบบ่อย (Pie)</h3>
            <Pie data={chartData} />
          </div>
          <div style={{ width: '45%', background: '#fff', padding: 20, borderRadius: 10 }}>
            <h3 style={{ marginBottom: 10 }}>แนวโน้มปัญหา (Bar)</h3>
            <Bar data={chartData} />
          </div>
        </div>

        {/* AI Summary */}
        {aiSummary && (
          <div
            style={{
              background: '#fff',
              padding: 20,
              borderRadius: 10,
              marginTop: 30,
              boxShadow: '0 0 5px rgba(0,0,0,0.1)',
            }}
          >
            <h2 style={{ fontSize: 18, fontWeight: 'bold' }}>🤖 สรุปโดย AI</h2>

            <p style={{ marginTop: 16 }}><strong>📌 ปัญหาที่พบบ่อย (จัดอันดับ):</strong></p>
            <ol>
              {aiSummary.ranked_problems?.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ol>

            <p style={{ marginTop: 16 }}><strong>📍 พื้นที่เร่งด่วน:</strong></p>
           <ul>
            {aiSummary.urgent_area?.map((item, i) => (
              <li key={i}>• {item.location} — ปัญหา: {item.problem}</li>
            ))}
          </ul>

            <p style={{ marginTop: 16 }}><strong>🛠 แนวทางการแก้ไขเบื้องต้น:</strong></p>
            <ul>
              {Object.entries(aiSummary.solutions || {}).map(([problem, solution], i) => (
                <li key={i}>• <strong>{problem}:</strong> {solution}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
