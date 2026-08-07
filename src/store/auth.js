import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useAuthStore = defineStore('auth', () => {
  // =========================================================
  // 1. State: เก็บข้อมูลผู้ใช้และ Token
  // =========================================================

  // พยายามดึงข้อมูลจาก localStorage เพื่อให้ข้อมูลไม่หายเมื่อ Refresh หน้าจอ
  const user = ref(JSON.parse(localStorage.getItem('user')) || null);
  const token = ref(localStorage.getItem('token') || null);

  // =========================================================
  // 2. Getters: ประมวลผลข้อมูลใน Store ไปใช้งาน
  // =========================================================

  // ตรวจสอบว่าล็อกอินอยู่หรือไม่
  const isAuthenticated = computed(() => !!token.value);

  // ดึงชื่อเต็มของผู้ใช้งาน (คำนำหน้า + ชื่อ + นามสกุล)
  const userName = computed(() => {
    if (!user.value) return 'ผู้ใช้งาน';
    const prefix = user.value.prefix || '';
    const firstName = user.value.first_name || '';
    const lastName = user.value.last_name || '';
    const fullName = `${prefix}${firstName} ${lastName}`.trim();
    return fullName || 'ผู้ใช้งาน';
  });

  // ดึงระดับสิทธิ์การใช้งาน (Role)
  const userRole = computed(() => user.value?.role || 'staff');

  // 🔥 [แก้ไขจุดสำคัญ] Getter สำหรับดึง ID ผู้ใช้งานแบบรองรับหลายรูปแบบ
  // เพื่อป้องกันปัญหา ID กลายเป็น null ตอนส่งไป Backend
  const userId = computed(() => {
    if (!user.value) return null;

    // พยายามหา ID จากทุกชื่อฟิลด์ที่เป็นไปได้ (user_id, id, หรือ ID)
    const id = user.value.user_id || user.value.id || user.value.ID;

    // ใส่ Log เพื่อ Debug ดูที่หน้าจอ Browser Console (F12)
    if (!id) {
      console.warn("⚠️ AuthStore: ไม่พบ ID ใน Object User!", user.value);
    }

    return id || null;
  });

  // =========================================================
  // 3. Actions: ฟังก์ชันจัดการข้อมูล (Login, Logout)
  // =========================================================

  /**
   * ฟังก์ชัน Login: รับข้อมูลจาก API มาบันทึกลง Store และ LocalStorage
   */
  const login = (userData, userToken) => {
    user.value = userData;
    token.value = userToken;
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', userToken);
    console.log('✅ AuthStore: Login successful for ID ->', userId.value);
  };

  /**
   * ฟังก์ชัน setUser: สำหรับการเปลี่ยน User แบบแมนนวล (Dev Mode)
   */
  const setUser = (userData) => {
    user.value = userData;

    // หากไม่มี Token ให้สร้าง Token จำลองเพื่อให้ระบบทำงานต่อได้
    if (!token.value) {
      const mockToken = 'mock-dev-token-' + Date.now();
      token.value = mockToken;
      localStorage.setItem('token', mockToken);
    }

    localStorage.setItem('user', JSON.stringify(userData));
    console.log('✅ AuthStore: Set User Completed ->', userData.role);
  };

  /**
   * ฟังก์ชัน Logout: ล้างข้อมูลทั้งหมดออกจาก Store และ LocalStorage
   */
  const logout = () => {
    user.value = null;
    token.value = null;
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    console.log('🚪 AuthStore: Logged out');
  };

  // ส่งค่าออกไปให้ Component อื่นๆ เรียกใช้งาน
  return {
    user,
    token,
    isAuthenticated,
    userName,
    userRole,
    userId,
    login,
    logout,
    setUser
  };
});
