// 📂 src/services/userStore.js
import { reactive, computed } from 'vue';
import AuthService from './AuthService';

const state = reactive({
  currentUser: AuthService.getCurrentUser()
});

export const useUserStore = () => {

  // ... (ฟังก์ชัน login, logout เดิม ปล่อยไว้) ...

  const login = async (credentials) => { /* ... */ };
  const logout = () => { /* ... */ };
  const loadUserFromStorage = () => { /* ... */ };

  // 🔥 [เพิ่มใหม่] ฟังก์ชันสำหรับ Auto Switch User (ไม่ต้องยิง API)
  const setUser = (userData) => {
    // 1. อัปเดต State ให้หน้าจอเปลี่ยน
    state.currentUser = userData;

    // 2. บันทึกลง LocalStorage (เพื่อให้กด Refresh แล้วไม่หาย)
    AuthService.saveUser(userData);

    // 3. (Optional) ถ้ามี Token ปลอมๆ ก็ set ไว้หน่อยกัน error
    localStorage.setItem('auth_token', 'dev-mock-token');
  };

  return {
    currentUser: computed(() => state.currentUser),
    login,
    logout,
    loadUserFromStorage,
    setUser // 👈 อย่าลืม export ออกไป
  };
};
