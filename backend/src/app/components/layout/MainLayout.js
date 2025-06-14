'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/firebase";
import { doc, getDoc } from "firebase/firestore";
import Image from "next/image";

export const MainLayout = ({ children, activeMenu }) => {
  const router = useRouter();
  const [userName, setUserName] = useState("");
  const [profileImage, setProfileImage] = useState("https://cdn-icons-png.flaticon.com/512/149/149071.png");

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        setUserName(user.displayName || user.email?.split("@")[0] || "ผู้ใช้");

        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            if (data.profileImageUrl) {
              setProfileImage(data.profileImageUrl);
            }
          }
        } catch (err) {
          console.error("โหลดโปรไฟล์ล้มเหลว:", err);
        }
      } else {
        router.push("/");
      }
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = () => {
    auth.signOut();
    router.push("/");
  };

  return (
    <div style={{ fontFamily: "sans-serif", height: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <div style={{
        backgroundColor: "#91E2FF",
        padding: "0px 20px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        height: "80px"
      }}>
        <h2 style={{ margin: "0", fontWeight: "bold" }}>THANGSISUK</h2>
        <Image src="/minilogo.png" alt="Mini Logo" width={40} height={40} />
      </div>

      <div style={{ display: "flex", flex: 1 }}>
        {/* Sidebar */}
        <div style={{
          width: "250px",
          backgroundColor: "#E2E2E2",
          padding: "20px",
          display: "flex",
          flexDirection: "column"
        }}>
          <div style={{ display: "flex", alignItems: "center", marginBottom: "20px" }}>
            <div style={{
              backgroundColor: "#E0E0E0",
              width: "50px",
              height: "50px",
              borderRadius: "50%",
              overflow: "hidden",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginRight: "10px"
            }}>
              <Image src={profileImage} alt="Profile" width={50} height={50} />
            </div>
            <span style={{ fontWeight: "bold", fontSize: "16px" }}>{userName}</span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <MenuButton active={activeMenu === 'home'} onClick={() => router.push("/home")}>
              จัดการความรู้ในระบบ
            </MenuButton>
            <MenuButton active={activeMenu === 'shop'} onClick={() => router.push("/shop")}>
              ร้านค้าในระบบ
            </MenuButton>
            <MenuButton active={activeMenu === 'posts'} onClick={() => router.push("/post")}>
              จัดการโพส
            </MenuButton>
            <MenuButton active={activeMenu === 'users'} onClick={() => router.push("/userlist")}>
              ผู้ใช้ในระบบ
            </MenuButton>
            <MenuButton active={activeMenu === 'appeal'} onClick={() => router.push('/appeal')}>
              การร้องเรียน
            </MenuButton>
            <MenuButton active={activeMenu === 'dashboard'} onClick={() => router.push('/dashboard')}>
              แดชบอร์ด
            </MenuButton>
            <MenuButton isLogout onClick={handleLogout} icon="/Logout.png">
              ออกจากระบบ
            </MenuButton>
          </div>
        </div>

        {/* Content Area */}
        <div style={{ flex: 1, backgroundColor: "#FFF9C4", padding: "30px" }}>
          {children}
        </div>
      </div>
    </div>
  );
};

const MenuButton = ({ children, onClick, active = false, isLogout = false, icon }) => {
  const baseStyle = {
    padding: "10px",
    backgroundColor: active ? "#91E2FF" : "#ffffff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: isLogout ? "center" : "flex-start",
    gap: "10px",
    fontWeight: "bold",
    width: "100%",
  };

  const logoutStyle = {
    backgroundColor: "red",
    color: "white",
    marginTop: "10px",
  };

  return (
    <button
      style={{
        ...baseStyle,
        ...(isLogout ? logoutStyle : {}),
      }}
      onClick={onClick}
    >
      {icon && <Image src={icon} alt="Icon" width={24} height={24} />}
      {children}
    </button>
  );
};
