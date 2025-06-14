'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MainLayout } from "../components/layout/MainLayout";
import ShopCard from "../components/layout/ShopCard";
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/firebase';

export default function ShopListPage() {
  const [state, setState] = useState({
    shops: [],
    searchTerm: "",
    showCreateModal: false,
    newShop: {
      shopName: '',
      ownerName: '',
      phone: '',
      profileImageUrl: '',
      shopImageUrls: [],
      address: '',
      province: '',
      district: '',
      amphoe: '',
      zipcode: '',
      pinAddress: '',
      category: '',
      detail: '',
    },
    imageFiles: [],
  });

  const router = useRouter();

  useEffect(() => {
    fetchShops();
  }, []);

  const fetchShops = async () => {
    try {
      const res = await fetch('/api/shops');
      const data = await res.json();
      setState(prev => ({ ...prev, shops: data }));
    } catch (error) {
      console.error("โหลดร้านค้าไม่สำเร็จ:", error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setState(prev => ({
      ...prev,
      [name]: value,
      newShop: { ...prev.newShop, [name]: value },
    }));
  };

  const handleFileChange = (e) => {
    setState(prev => ({ ...prev, imageFiles: Array.from(e.target.files) }));
  };

  const handleAddShop = () => {
    setState(prev => ({ ...prev, showCreateModal: true }));
  };

  const handleSubmit = async () => {
    const formData = new FormData();
    const uploadUrls = [];

    for (const file of state.imageFiles) {
      formData.set('file', file);
      formData.set('upload_preset', 'postuser');
      const res = await fetch('https://api.cloudinary.com/v1_1/dd0ro6iov/image/upload', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      uploadUrls.push(data.secure_url);
    }

    const shopSnapshot = await getDocs(collection(db, 'shops'));
    const newId = shopSnapshot.size + 1;

    const newShopData = {
      ...state.newShop,
      id: newId,
      shopImageUrls: uploadUrls,
      profileImageUrl: 'https://res.cloudinary.com/dd0ro6iov/image/upload/v1748002019/admin-avatar_lwla6l.jpg',
      coords: {
        latitude: 16.432,
        longitude: 102.832,
      },
      uid: '25hfyaCCqQSgPUuvYoJ6VQhlhzZ2',
    };

    try {
      await fetch('/api/shops', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newShopData),
      });
      setState(prev => ({ ...prev, showCreateModal: false, newShop: {}, imageFiles: [] }));
      fetchShops();
    } catch (err) {
      alert("เกิดข้อผิดพลาดในการเพิ่มร้านค้า");
    }
  };

  const filteredShops = state.shops.filter(shop =>
    (shop.shopName || '').toLowerCase().includes(state.searchTerm.toLowerCase())
  );

  return (
    <MainLayout activeMenu="shop">
      <div style={{ padding: '30px', width: '100%' }}>
        <h1 style={{ color: '#333', marginBottom: '30px', fontSize: '24px', fontWeight: 'bold' }}>
          ร้านค้าในระบบ
        </h1>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', gap: '20px', alignItems: 'center' }}>
          <input
            type="text"
            placeholder="ค้นหาร้านค้า..."
            name="searchTerm"
            value={state.searchTerm}
            onChange={handleChange}
            style={{ padding: '10px 15px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px', minWidth: '250px', outline: 'none' }}
          />
          <button onClick={handleAddShop} style={{ backgroundColor: '#007bff', color: 'white', padding: '10px 20px', borderRadius: 8, border: 'none' }}>
            + เพิ่มร้านค้า
          </button>
        </div>

        {state.showCreateModal && (
          <div style={{ backgroundColor: 'white', padding: 20, borderRadius: 10, boxShadow: '0 0 10px rgba(0,0,0,0.1)', marginBottom: 30 }}>
            <h2 style={{ marginBottom: 20 }}>เพิ่มร้านค้าใหม่</h2>
            {Object.entries(state.newShop).filter(([key]) => key !== 'shopImageUrls' && key !== 'coords').map(([key, value]) => (
              <input
                key={key}
                name={key}
                placeholder={key}
                value={value}
                onChange={handleChange}
                style={{ width: '100%', padding: '10px', marginBottom: '10px', borderRadius: 8, border: '1px solid #ccc' }}
              />
            ))}
            <input type="file" multiple onChange={handleFileChange} style={{ marginBottom: 10 }} />
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={handleSubmit} style={{ backgroundColor: '#28a745', color: 'white', padding: '10px 20px', borderRadius: 8 }}>บันทึก</button>
              <button onClick={() => setState(prev => ({ ...prev, showCreateModal: false }))} style={{ backgroundColor: '#ccc', padding: '10px 20px', borderRadius: 8 }}>ยกเลิก</button>
            </div>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '25px' }}>
          {filteredShops.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#666', fontSize: '16px', gridColumn: '1 / -1', padding: '40px 0' }}>
              ไม่พบร้านค้าที่ตรงกับคำค้นหา
            </p>
          ) : (
            filteredShops.map((shop) => (
              <ShopCard
                key={shop.docId}
                shop={shop}
                fetchShops={fetchShops}
              />
            ))
          )}
        </div>
      </div>
    </MainLayout>
  );
}