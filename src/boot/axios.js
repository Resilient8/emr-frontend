import { boot } from 'quasar/wrappers'
import axios from 'axios'

// 🏠 โหมด Dev: IP Hotspot ของคุณ (คอมเมนต์เก็บไว้เผื่อกลับมาทดสอบในเครื่อง)
// const targetURL = 'http://172.20.10.2:3000';

// ☁️ โหมด Production: URL สำหรับใช้งานจริงบน Cloud (Render)
const targetURL = 'https://emr-backend-api-8euv.onrender.com';

const api = axios.create({
  baseURL: targetURL,
  withCredentials: true
})

// 🔥 เพิ่มส่วนนี้: เครื่องดักจับ Error (Interceptor)
api.interceptors.response.use(
  (response) => response, // ถ้าสำเร็จ ปล่อยผ่าน
  (error) => {
    // ถ้าพัง ให้ Alert ฟ้องทันที!
    const status = error.response ? error.response.status : 'Unknown';
    const msg = error.message;
    alert(`🚨 Error เกิดขึ้น! \nStatus: ${status}\nMessage: ${msg}`);

    return Promise.reject(error);
  }
);

export default boot(({ app }) => {
  app.config.globalProperties.$axios = axios
  app.config.globalProperties.$api = api

  // Alert ยืนยันการเชื่อมต่อ (เอาไว้เช็คความชัวร์)
  // alert(`กำลังเชื่อมไปที่: ${targetURL}`);
})

export { api }
