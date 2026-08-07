// 📂 ไฟล์: src/services/mockStore.js
import { reactive, computed } from 'vue';

// ข้อมูลจำลอง (Mock Data)
// 🔥 สำคัญ: ชื่อ fullName ต้องตรงกับใน Database (ตอนพยาบาลเลือกส่ง) เป๊ะๆ
const mockUsers = [
  {
    id: 101,
    prefix: 'นพ.',
    firstName: 'เก่งกาจ',
    lastName: 'รักษาดี',
    role: 'Doctor',
    email: 'kengkad@hospital.com',
    fullName: 'นพ. เก่งกาจ รักษาดี' // ✅ แก้ให้ตรงกับ DB (ไม่มีวงเล็บ)
  },
  {
    id: 102,
    prefix: 'พญ.',
    firstName: 'ใจดี',
    lastName: 'มีเมตตา',
    role: 'Doctor',
    email: 'jaidee@hospital.com',
    fullName: 'พญ. ใจดี มีเมตตา' // ✅ แก้ให้ตรงกับ DB
  },
  {
    id: 201,
    prefix: 'ภก.',
    firstName: 'สมชาย',
    lastName: 'จ่ายยาแม่น',
    role: 'Pharmacist',
    email: 'somchai@hospital.com',
    fullName: 'ภก. สมชาย จ่ายยาแม่น'
  },
  {
    id: 301,
    prefix: 'นาง',
    firstName: 'สมศรี',
    lastName: 'พยาบาล',
    role: 'Nurse',
    email: 'somsri@hospital.com',
    fullName: 'สมศรี พยาบาล'
  },
  {
    id: 999,
    prefix: 'Admin',
    firstName: 'System',
    lastName: 'Manager',
    role: 'Admin',
    email: 'admin@hospital.com',
    fullName: 'ผู้ดูแลระบบ (Admin)'
  },
];

// ตัวแปรกลาง (State)
const state = reactive({
  currentUser: mockUsers[0], // ค่าเริ่มต้น: ให้เป็นหมอคนแรกก่อน
});

// ฟังก์ชันเปลี่ยนคน (ใช้โดย Dashboard หรือ Sidebar)
const setUser = (user) => {
  state.currentUser = user;
  // บันทึกลง LocalStorage กัน Refresh แล้วหาย
  localStorage.setItem('mock_user_id', user.id);
  console.log("Mock Store: User switched to", user.fullName);
};

// ฟังก์ชันโหลดค่าเริ่มต้น (เรียกตอนเปิด App)
const initStore = () => {
  const savedId = localStorage.getItem('mock_user_id');
  if (savedId) {
    const found = mockUsers.find(u => u.id == savedId);
    if (found) {
        state.currentUser = found;
    }
  }
};

// ส่งออกให้หน้าอื่นใช้
export const useMockStore = () => {
  return {
    state,
    mockUsers,
    setUser,
    initStore,
    // Helper Functions เอาไว้เช็ค Role ง่ายๆ
    isDoctor: computed(() => state.currentUser?.role === 'Doctor'),
    isNurse: computed(() => state.currentUser?.role === 'Nurse'),
    isPharmacist: computed(() => state.currentUser?.role === 'Pharmacist'),
    isAdmin: computed(() => state.currentUser?.role === 'Admin')
  };
};
