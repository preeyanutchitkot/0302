'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from "@/firebase";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      const userDocRef = doc(db, "useradmin", user.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        const userData = userDocSnap.data();
        if (userData.role === 'admin') {
          router.push('/home');
        } else {
          setError('คุณไม่มีสิทธิ์เข้าถึงระบบนี้');
          await signOut(auth);
        }
      } else {
        setError('ไม่พบข้อมูลสิทธิ์ผู้ใช้');
        await signOut(auth);
      }
    } catch (err) {
      console.error(err);
      setError('อีเมลหรือรหัสผ่านไม่ถูกต้อง');
    }
  };

  return (
    <div 
      style={{
        textAlign: 'center',
        margin: 0,
        padding: 0,
        backgroundColor: '#91E2FF',
        backgroundImage: 'url(/bg1.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        minHeight: '100vh',
        width: '100vw',
        position: 'fixed',
        top: 0,
        left: 0,
        overflow: 'auto',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
        paddingTop: '20px'
      }}
    >
      {/* โลโก้ THANGSISUK */}
      <img 
        src="/bg2.png" 
        alt="THANGSISUK Logo" 
        style={{
          width: '120px',
          marginBottom: '30px',
          zIndex: 10
        }} 
      />

      {/* ฟอร์มเข้าสู่ระบบ */}
      <div style={{
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        padding: '25px',
        borderRadius: '10px',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
        width: '300px',
        marginBottom: '20px'
      }}>
        <h2 style={{ color: '#333', marginBottom: '20px', fontSize: '20px' }}>เข้าสู่ระบบ</h2>

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <input 
            type="email" 
            placeholder="ชื่อผู้ใช้หรืออีเมล" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ 
              padding: '10px', 
              borderRadius: '5px', 
              border: '1px solid #ddd',
              backgroundColor: '#fff',
              color: '#000', // เพิ่มสีข้อความเป็นสีดำ
              fontSize: '14px' // ปรับขนาดฟอนต์
            }}
          />
          
          <input 
            type="password" 
            placeholder="รหัสผ่าน" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ 
              padding: '10px', 
              borderRadius: '5px', 
              border: '1px solid #ddd',
              backgroundColor: '#fff',
              color: '#000', // เพิ่มสีข้อความเป็นสีดำ
              fontSize: '14px' // ปรับขนาดฟอนต์
            }}
          />
          
          <button 
            type="submit"
            style={{ 
              padding: '10px', 
              backgroundColor: '#00C853', 
              color: 'white', 
              border: 'none', 
              borderRadius: '5px', 
              fontSize: '16px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            เข้าสู่ระบบ
          </button>
        </form>

        {error && <p style={{ color: 'red', marginTop: '15px', fontSize: '14px' }}>{error}</p>}
      </div>
    </div>
  );
}