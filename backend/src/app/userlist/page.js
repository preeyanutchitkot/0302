'use client';

import { useEffect, useState } from "react";
import { MainLayout } from "../components/layout/MainLayout";
import EditUserModal from '../components/layout/EditUserModal';

export default function UserListPage() {
  const [users, setUsers] = useState([]);
  const [editingUser, setEditingUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/users');
      const data = await res.json();
      setUsers(data);
    } catch (error) {
      console.error("โหลดผู้ใช้ล้มเหลว:", error);
    }
  };

  const handleDelete = async (uid) => {
    const confirmDelete = window.confirm('คุณต้องการลบผู้ใช้นี้หรือไม่?');
    if (!confirmDelete) return;
    try {
      await fetch(`/api/users/${uid}`, { method: 'DELETE' });
      setUsers(users.filter((user) => user.uid !== uid));
      alert('ลบสำเร็จแล้ว');
    } catch (error) {
      console.error('เกิดข้อผิดพลาด:', error);
      alert('เกิดข้อผิดพลาดในการลบ');
    }
  };

  const handleSaveEdit = async (newData) => {
    try {
      await fetch(`/api/users/${newData.uid}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newData)
      });
      setEditingUser(null);
      fetchUsers();
      alert('แก้ไขข้อมูลสำเร็จ');
    } catch (error) {
      console.error('แก้ไขไม่สำเร็จ:', error);
      alert('เกิดข้อผิดพลาดในการแก้ไข');
    }
  };

  const filteredUsers = users.filter(user =>
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <MainLayout activeMenu="users">
      <div style={{ padding: '40px', backgroundColor: '#f2f2f2', borderRadius: '10px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px' }}>ผู้ใช้ในระบบ</h1>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="ค้นหา..."
            style={{ padding: '8px', width: '200px', borderRadius: '4px', border: '1px solid #ddd' }}
          />
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(420px, 1fr))',
          gap: '20px'
        }}>
          {filteredUsers.map((user) => (
            <div key={user.uid} style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 6px rgba(0,0,0,0.1)' }}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                <img
                  src={user.profileImageUrl || '/default-avatar.png'}
                  alt="avatar"
                  style={{ width: 48, height: 48, borderRadius: '50%', marginRight: 12 }}
                />
                <div>
                  <strong>{user.name || '-'}</strong>
                  <p style={{ fontSize: 12, color: '#888', margin: 0 }}>{user.email || '-'}</p>
                </div>
              </div>
              <p style={{ fontSize: 13, marginBottom: 10 }}><b>เบอร์โทร:</b> {user.phoneNumber || '-'}</p>
              <p style={{ fontSize: 13, marginBottom: 10 }}><b>Facebook:</b> {user.facebook || '-'}</p>
              <p style={{ fontSize: 13, marginBottom: 10 }}><b>Instagram:</b> {user.ig || '-'}</p>
              <p style={{ fontSize: 13, marginBottom: 10 }}><b>Line:</b> {user.idline || '-'}</p>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '15px' }}>
                <button style={editButtonStyle} onClick={() => setEditingUser(user)}>แก้ไข</button>
                <button style={deleteButtonStyle} onClick={() => handleDelete(user.uid)}>ลบ</button>
              </div>
            </div>
          ))}
        </div>

        {editingUser && (
          <EditUserModal
            key={editingUser.uid}
            user={editingUser}
            onClose={() => setEditingUser(null)}
            onSave={handleSaveEdit}
          />
        )}
      </div>
    </MainLayout>
  );
}

const editButtonStyle = {
  backgroundColor: '#FFC107',
  border: 'none',
  padding: '10px 20px',
  borderRadius: '8px',
  fontWeight: 'bold',
  cursor: 'pointer',
  width: '48%'
};

const deleteButtonStyle = {
  backgroundColor: '#f44336',
  border: 'none',
  padding: '10px 20px',
  borderRadius: '8px',
  fontWeight: 'bold',
  color: 'white',
  cursor: 'pointer',
  width: '48%'
};