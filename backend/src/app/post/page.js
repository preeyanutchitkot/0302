'use client';

import React, { useEffect, useState } from 'react';
import { MainLayout } from '../components/layout/MainLayout';
import { db } from '@/firebase';
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
  getDoc,
  setDoc,
  serverTimestamp,
} from 'firebase/firestore';
import axios from 'axios';

export default function AdminPostScreen() {
  const [posts, setPosts] = useState([]);
  const [editingPostId, setEditingPostId] = useState(null);
  const [editCaption, setEditCaption] = useState('');
  const [activeTab, setActiveTab] = useState('PostSale');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newCaption, setNewCaption] = useState('');
  const [newImageFile, setNewImageFile] = useState(null);
  const [newType, setNewType] = useState('PostSale');

  useEffect(() => {
    fetchPosts();
  }, [activeTab]);

  const fetchPosts = async () => {
  const querySnapshot = await getDocs(collection(db, activeTab));
  const postData = await Promise.all(
    querySnapshot.docs.map(async (docSnap) => {
      const post = { id: docSnap.id, ...docSnap.data() };

      if (post.uid === 'admin') {
        post.ownerName = 'Admin';
        post.profileImageUrl = '/admin-avatar.png';
      } else if (post.uid) {
        try {
          const userDoc = await getDoc(doc(db, 'users', post.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            post.ownerName = userData.username || userData.name || userData.displayName || 'ไม่ระบุชื่อ';
            post.profileImageUrl = userData.profileImageUrl || '/default-avatar.png';
          } else {
            post.ownerName = 'ไม่ระบุชื่อ';
            post.profileImageUrl = '/default-avatar.png';
          }
        } catch (error) {
          post.ownerName = 'ไม่ระบุชื่อ';
          post.profileImageUrl = '/default-avatar.png';
        }
      } else {
        post.ownerName = 'ไม่ระบุชื่อ';
        post.profileImageUrl = '/default-avatar.png';
      }

      return post;
    })
  );
  setPosts(postData);
};


  const handleDelete = async (id) => {
    if (confirm('คุณต้องการลบโพสต์นี้ใช่หรือไม่?')) {
      try {
        const res = await fetch(`/api/posts/${activeTab}/${id}`, {
          method: 'DELETE',
        });
        if (res.ok) {
          setPosts((prev) => prev.filter((post) => post.id !== id));
        } else {
          alert('ลบโพสต์ไม่สำเร็จ');
        }
      } catch (error) {
        alert('เกิดข้อผิดพลาดในการลบโพสต์');
      }
    }
  };

  const handleEdit = (post) => {
    setEditingPostId(post.id);
    setEditCaption(post.caption || '');
  };

  const handleUpdate = async (id) => {
    try {
      const res = await fetch(`/api/posts/${activeTab}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ caption: editCaption }),
      });

      if (res.ok) {
        setEditingPostId(null);
        setEditCaption('');
        fetchPosts();
      } else {
        alert('อัปเดตโพสต์ไม่สำเร็จ');
      }
    } catch (error) {
      alert('เกิดข้อผิดพลาดในการอัปเดตโพสต์');
    }
  };

  const handleCreatePost = async () => {
  if (!newCaption || !newImageFile) return alert('กรุณากรอกคำอธิบายและเลือกรูป');

  try {
    const formData = new FormData();
    formData.append('file', newImageFile);
    formData.append('upload_preset', 'postuser');

    const response = await axios.post(
      'https://api.cloudinary.com/v1_1/dd0ro6iov/image/upload',
      formData
    );

    const imageUrl = response.data.secure_url;

    const postCollection = collection(db, newType);
    const querySnapshot = await getDocs(postCollection);
    const count = querySnapshot.size;

    const prefix = newType === 'PostDonate' ? 'PostProductDonate' : 'PostProductSale';
    const postId = `${prefix}${count + 1}`;

    const newDocRef = doc(db, newType, postId);

    await setDoc(newDocRef, {
      postId,
      caption: newCaption,
      imageUrls: [imageUrl],
      createdAt: serverTimestamp(),
      type: newType === 'PostDonate' ? 'donate' : 'sale',
      uid: 'admin',
      ownerName: 'Admin',
      profileImageUrl: 'https://res.cloudinary.com/dd0ro6iov/image/upload/v1748002019/admin-avatar_lwla6l.jpg'
    });

    setNewCaption('');
    setNewImageFile(null);
    setShowCreateModal(false);
    fetchPosts();

  } catch (err) {
    console.error(err);
    alert('สร้างโพสต์ไม่สำเร็จ');
  }
};


  const filteredPosts = posts.filter((post) => {
    const lowerSearch = searchTerm.toLowerCase();
    return (
      (post.ownerName?.toLowerCase().includes(lowerSearch) || false) ||
      (post.caption?.toLowerCase().includes(lowerSearch) || false)
    );
  });

  return (
    <MainLayout>
      <div style={{ padding: '40px', backgroundColor: '#fefce8' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px' }}>
          จัดการโพสต์{activeTab === 'PostSale' ? 'ซื้อขาย' : 'บริจาค'}
        </h1>

        <div style={{ marginBottom: 20, display: 'flex', gap: 10 }}>
          <button
            onClick={() => setActiveTab('PostSale')}
            style={{ backgroundColor: activeTab === 'PostSale' ? '#0af' : '#ccc', color: 'white', padding: '10px 20px', borderRadius: 8 }}
          >โพสต์ซื้อขาย</button>
          <button
            onClick={() => setActiveTab('PostDonate')}
            style={{ backgroundColor: activeTab === 'PostDonate' ? '#0af' : '#ccc', color: 'white', padding: '10px 20px', borderRadius: 8 }}
          >โพสต์บริจาค</button>
          <button
            onClick={() => setShowCreateModal(true)}
            style={{ backgroundColor: '#007bff', color: 'white', padding: '10px 20px', borderRadius: 8 }}
          >+ สร้างโพสต์ใหม่</button>
        </div>

        {showCreateModal && (
          <div style={{ backgroundColor: 'white', padding: 20, borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.15)', marginBottom: 20 }}>
            <h3>สร้างโพสต์ใหม่</h3>
            <textarea
              value={newCaption}
              onChange={(e) => setNewCaption(e.target.value)}
              placeholder="คำอธิบายโพสต์"
              style={{ width: '100%', padding: 10, borderRadius: 8, marginBottom: 10 }}
            />
            <select
              value={newType}
              onChange={(e) => setNewType(e.target.value)}
              style={{ padding: 8, marginBottom: 10 }}
            >
              <option value="PostSale">โพสต์ซื้อขาย</option>
              <option value="PostDonate">โพสต์บริจาค</option>
            </select>
            <input type="file" accept="image/*" onChange={(e) => setNewImageFile(e.target.files[0])} />
            <div style={{ marginTop: 10, display: 'flex', gap: 10 }}>
              <button onClick={handleCreatePost} style={{ backgroundColor: '#28a745', color: 'white', padding: '8px 16px', borderRadius: 8 }}>ยืนยัน</button>
              <button onClick={() => setShowCreateModal(false)} style={{ backgroundColor: '#ccc', padding: '8px 16px', borderRadius: 8 }}>ยกเลิก</button>
            </div>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(450px, 1fr))', gap: '20px' }}>
          {filteredPosts.map((post) => {
            const isEditing = editingPostId === post.id;
            const showAllImages = isEditing || post.imageUrls?.length <= 2;
            const imagesToShow = showAllImages ? post.imageUrls : post.imageUrls.slice(0, 2);
            const extraCount = post.imageUrls?.length - 2;

            return (
              <div key={post.id} style={{ backgroundColor: 'white', padding: 20, borderRadius: 12, boxShadow: '0 2px 6px rgba(0,0,0,0.1)' }}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: 10 }}>
                  <img src={post.profileImageUrl} alt="profile" style={{ width: 40, height: 40, borderRadius: '50%', marginRight: 10 }} />
                  <div>
                    <strong>{post.ownerName}</strong>
                    <p style={{ fontSize: 12, color: '#666', margin: 0 }}>{post.address || 'ไม่ระบุที่อยู่'}</p>
                  </div>
                </div>
                {isEditing ? (
                  <textarea
                    value={editCaption}
                    onChange={(e) => setEditCaption(e.target.value)}
                    style={{ width: '100%', padding: 10, borderRadius: 8, marginBottom: 10 }}
                  />
                ) : (
                  <p>{post.caption}</p>
                )}

                {post.imageUrls?.length > 0 && (
                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 10 }}>
                    {imagesToShow.map((img, index) => (
                      <div key={index} style={{ position: 'relative' }}>
                        <img src={img} alt="post" style={{ width: 200, height: 200, objectFit: 'cover', borderRadius: 8 }} />
                        {!isEditing && index === 1 && extraCount > 0 && (
                          <div style={{ position: 'absolute', top: 0, left: 0, width: 200, height: 200, backgroundColor: 'rgba(0,0,0,0.5)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 8, fontSize: 24 }}>+{extraCount}</div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  {isEditing ? (
                    <button style={{ backgroundColor: 'green', color: 'white', padding: 10, borderRadius: 8, border: 'none', width: '48%' }} onClick={() => handleUpdate(post.id)}>บันทึก</button>
                  ) : (
                    <button style={{ backgroundColor: 'orange', color: 'white', padding: 10, borderRadius: 8, border: 'none', width: '48%' }} onClick={() => handleEdit(post)}>แก้ไข</button>
                  )}
                  <button style={{ backgroundColor: 'red', color: 'white', padding: 10, borderRadius: 8, border: 'none', width: '48%' }} onClick={() => handleDelete(post.id)}>ลบ</button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </MainLayout>
  );
}