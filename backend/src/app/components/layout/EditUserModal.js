'use client';

import { useState } from 'react';
import Image from 'next/image';

export default function EditUserModal({ user, onClose, onSave }) {
  const [formData, setFormData] = useState(user);

  const fields = [
    { name: 'name', label: 'ชื่อผู้ใช้', icon: '/User.png' },
    { name: 'email', label: 'อีเมล', icon: '/Email.png' },
    { name: 'password', label: 'รหัสผ่าน', icon: '/Lock.png' },
    { name: 'phoneNumber', label: 'เบอร์โทร', icon: '/Call.png' },
    { name: 'facebook', label: 'Facebook', icon: '/fackbook.png' },
    { name: 'ig', label: 'Instagram', icon: '/ig.png' },
    { name: 'idline', label: 'Line', icon: '/Line.png' },
  ];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = () => {
    onSave(formData);
  };

  return (
    <div style={modalOverlay}>
      <div style={modalContent}>
        <h2 style={{ marginBottom: '20px' }}>แก้ไขผู้ใช้ในระบบ</h2>

        {fields.map((field, index) => (
          <div key={index} style={{ display: "flex", alignItems: "center", marginBottom: "10px" }}>
            <div style={{ position: 'relative', width: 24, height: 24, marginRight: 10 }}>
              <Image src={field.icon} alt="icon" fill />
            </div>
            <input
              type="text"
              name={field.name}
              value={formData[field.name] || ''}
              onChange={handleChange}
              placeholder={field.label}
              style={{
                backgroundColor: '#FFFFFF',
                border: '1px solid black',
                borderRadius: '5px',
                padding: '8px',
                flex: 1
              }}
            />
          </div>
        ))}

        <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-between' }}>
          <button onClick={onClose} style={cancelButtonStyle}>ยกเลิก</button>
          <button onClick={handleSubmit} style={confirmButtonStyle}>ยืนยัน</button>
        </div>
      </div>
    </div>
  );
}

const modalOverlay = {
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  backgroundColor: 'rgba(0,0,0,0.5)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 1000
};

const modalContent = {
  backgroundColor: '#FFF9C4',
  padding: '30px',
  borderRadius: '10px',
  width: '400px'
};

const cancelButtonStyle = {
  padding: '10px',
  borderRadius: '8px',
  backgroundColor: '#ddd',
  width: '45%',
  border: 'none',
  cursor: 'pointer'
};

const confirmButtonStyle = {
  padding: '10px',
  borderRadius: '8px',
  backgroundColor: '#4CAF50',
  color: 'white',
  width: '45%',
  border: 'none',
  cursor: 'pointer'
};
