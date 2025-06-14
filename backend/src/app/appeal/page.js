'use client';

import { useEffect, useState } from 'react';
import { db } from '@/firebase';
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';
import { MainLayout } from '@/app/components/layout/MainLayout';

export default function AppealPage() {
  const [appeals, setAppeals] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const snapshot = await getDocs(collection(db, 'appeal'));
      const data = snapshot.docs.map(docSnap => ({
        id: docSnap.id,
        ...docSnap.data()
      }));
      setAppeals(data);
    };
    fetchData();
  }, []);

  const handleStatusChange = async (id, newStatus) => {
    const ref = doc(db, 'appeal', id);
    await updateDoc(ref, { status: newStatus });
    setAppeals(prev =>
      prev.map(item => (item.id === id ? { ...item, status: newStatus } : item))
    );
  };

  return (
    <MainLayout activeMenu="appeal">
      <div style={{ backgroundColor: '#f8f9fa', minHeight: '100vh', padding: 30 }}>
        <h1 style={{ fontSize: 22, fontWeight: 'bold', marginBottom: 20, color: '#0D47A1' }}>
          ร้องเรียนปัญหาขยะ
        </h1>

        <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: '#fff' }}>
          <thead style={{ backgroundColor: '#0D47A1', color: '#fff' }}>
            <tr>
              <th style={thStyle}>คำร้องเลขที่</th>
              <th style={thStyle}>ปัญหาขยะ</th>
              <th style={thStyle}>รูปภาพแนบ</th>
              <th style={thStyle}>สถานที่</th>
              <th style={thStyle}>สถานะ</th>
              <th style={thStyle}>เมนูรูป</th>
            </tr>
          </thead>
          <tbody>
            {appeals.map((item, index) => (
              <tr key={item.id} style={{ textAlign: 'center', borderBottom: '1px solid #ddd' }}>
                <td style={tdStyle}>000{index + 1}</td>
                <td style={tdStyle}>{item.title} {item.detail}</td>
                <td style={tdStyle}>
                  {item.image ? (
                    <img src={item.image} alt="evidence" style={{ width: 100, borderRadius: 4 }} />
                  ) : (
                    '-'
                  )}
                </td>
                <td style={tdStyle}>
                  {item.location ? (
                    <a href={item.location} target="_blank" rel="noopener noreferrer">
                      {item.location.slice(0, 35)}...
                    </a>
                  ) : (
                    '-'
                  )}
                </td>
                <td style={tdStyle}>
                  <select
                    value={item.status || 'รอรับเรื่อง'}
                    onChange={e => handleStatusChange(item.id, e.target.value)}
                    style={{
                      backgroundColor: statusColor(item.status),
                      color: '#000',
                      padding: '6px 12px',
                      borderRadius: 5,
                      border: '1px solid #ccc'
                    }}
                  >
                    <option>รอรับเรื่อง</option>
                    <option>กำลังดำเนินการ</option>
                    <option>เสร็จสิ้น</option>
                  </select>
                </td>
                <td style={tdStyle}>
                  {item.image ? (
                    <button
                      style={{
                        border: '1px solid #ccc',
                        padding: 6,
                        borderRadius: 5,
                        backgroundColor: '#f4f4f4',
                        cursor: 'pointer'
                      }}
                      onClick={() => window.open(item.image)}
                    >
                      🔍
                    </button>
                  ) : (
                    '-'
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </MainLayout>
  );
}

// 🔵 Style
const thStyle = {
  padding: 10,
  border: '1px solid #ccc',
  fontWeight: 'bold'
};

const tdStyle = {
  padding: 10,
  border: '1px solid #ddd'
};

const statusColor = (status) => {
  switch (status) {
    case 'รอรับเรื่อง':
      return '#FFCDD2';
    case 'กำลังดำเนินการ':
      return '#FFF59D';
    case 'เสร็จสิ้น':
      return '#C8E6C9';
    default:
      return '#f0f0f0';
  }
};
