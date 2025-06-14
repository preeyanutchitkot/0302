'use client';

import { useEffect, useState } from "react";
import axios from "axios";
import { MainLayout } from "../components/layout/MainLayout";

export default function HomePage() {
  const [knowledges, setKnowledges] = useState([]);

  useEffect(() => {
    fetchKnowledges();
  }, []);

  const fetchKnowledges = async () => {
    try {
      const res = await fetch("/api/knowledges");
      const data = await res.json();
      setKnowledges(data);
    } catch (err) {
      console.error("โหลดข้อมูลล้มเหลว:", err);
    }
  };

  const handleUpload = async (e, position = "top") => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "unsigned_upload");

    try {
      const res = await axios.post(
        "https://api.cloudinary.com/v1_1/dd0ro6iov/image/upload",
        formData
      );

      const imageUrl = res.data.secure_url;

      await fetch("/api/knowledges", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl, position })
      });

      alert("อัปโหลดสำเร็จ");
      fetchKnowledges();
    } catch (error) {
      console.error("อัปโหลดล้มเหลว:", error);
      alert("อัปโหลดล้มเหลว");
    }
  };

  const handleDelete = async (id) => {
    await fetch(`/api/knowledges/${id}`, { method: "DELETE" });
    fetchKnowledges();
  };

  return (
    <MainLayout activeMenu="home">
      <h1>ข้อมูลความรู้ในระบบ</h1>

      {/* Banner Section */}
      <h2 style={{ marginTop: 30 }}>ภาพแถวบน (Banner)</h2>
      <div style={imageContainer}>
        <div style={imageBox}>
          <label style={iconButton}>
            ➕
            <input type="file" hidden onChange={(e) => handleUpload(e, "top")} />
          </label>
        </div>

        {knowledges
          .filter(item => item.position === 'top')
          .map(item => (
            <div key={item.id} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <div style={imageBox}>
                <img src={item.imageUrl} alt="Uploaded" style={{ width: "100%", height: "auto", borderRadius: "10px" }} />
                <button style={closeButton} onClick={() => handleDelete(item.id)}>❌</button>
              </div>
            </div>
          ))}
      </div>

      {/* Infographic Section */}
      <h2 style={{ marginTop: 30 }}>ภาพแถวล่าง (Infographic)</h2>
      <div style={imageContainer}>
        <div style={imageBox}>
          <label style={iconButton}>
            ➕
            <input type="file" hidden onChange={(e) => handleUpload(e, "bottom")} />
          </label>
        </div>

        {knowledges
          .filter(item => item.position === 'bottom')
          .map(item => (
            <div key={item.id} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <div style={imageBox}>
                <img src={item.imageUrl} alt="Uploaded" style={{ width: "100%", height: "auto", borderRadius: "10px" }} />
                <button style={closeButton} onClick={() => handleDelete(item.id)}>❌</button>
              </div>
            </div>
          ))}
      </div>
    </MainLayout>
  );
}

// Style objects
const imageContainer = {
  display: "flex",
  flexDirection: "row",
  flexWrap: "wrap",
  gap: "20px",
  justifyContent: "flex-start",
  marginBottom: "40px",
};

const imageBox = {
  width: "320px",
  height: "200px",
  backgroundColor: "#fff",
  borderRadius: "12px",
  boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  padding: "10px",
  position: "relative",
  overflow: "hidden",
};

const iconButton = {
  width: 50,
  height: 50,
  borderRadius: "50%",
  backgroundColor: "#e0e0e0",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: 24,
  cursor: "pointer",
};

const closeButton = {
  position: "absolute",
  top: "10px",
  right: "10px",
  backgroundColor: "transparent",
  border: "none",
  fontSize: "20px",
  cursor: "pointer",
  color: "#ff0000",
};
