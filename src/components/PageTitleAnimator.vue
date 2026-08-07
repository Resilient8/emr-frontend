<template>
  <transition name="fade">
    <div v-if="show" class="animator-container">
      <div class="content">
        <div class="ornament top"></div>
        <h1 class="title">{{ title }}</h1>
        <h2 class="subtitle">{{ subtitle }}</h2>
        <div class="ornament bottom"></div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { ref, onMounted } from 'vue';

// รับ props จากหน้าที่เรียกใช้
defineProps({
  title: {
    type: String,
    required: true,
  },
  subtitle: {
    type: String,
    default: '',
  },
});

const show = ref(false);

onMounted(() => {
  // เริ่มแสดงอนิเมชันเมื่อ component ถูก mount
  // ใช้ setTimeout เล็กน้อยเพื่อให้แน่ใจว่า DOM พร้อมสำหรับ transition
  setTimeout(() => {
    show.value = true;
  }, 100);

  // ตั้งเวลาเพื่อซ่อนอนิเมชันหลังจากแสดงผลไประยะหนึ่ง
  setTimeout(() => {
    show.value = false;
  }, 2800); // แสดงเป็นเวลา 2.8 วินาที
});
</script>

<style lang="scss" scoped>
/* ใช้ Google Font ที่มีลักษณะคล้ายๆ กัน (ถ้าต้องการ) */
@import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700&display=swap');

.animator-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: rgba(0, 0, 0, 0.5); /* พื้นหลัง затемнение */
  z-index: 9999;
  pointer-events: none; /* ทำให้คลิกทะลุได้ */
  font-family: 'Cinzel', serif; /* Font ที่ได้แรงบันดาลใจจากเกม */
}

.content {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  color: #e0e0e0;
  text-shadow: 0 0 10px rgba(0, 0, 0, 0.8);
}

.title {
  font-size: 4rem;
  font-weight: 700;
  letter-spacing: 0.2em;
  margin: 0;
  padding: 0 1rem;
  text-transform: uppercase;
  animation: slideInAndFade 1.2s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
}

.subtitle {
  font-size: 1.5rem;
  font-weight: 400;
  letter-spacing: 0.1em;
  margin-top: 0.5rem;
  text-transform: uppercase;
  animation: slideInAndFade 1.2s cubic-bezier(0.25, 0.46, 0.45, 0.94) 0.2s forwards;
  opacity: 0;
}

.ornament {
  width: 250px;
  height: 20px;
  position: relative;
  opacity: 0;
  animation: slideInAndFade 1.2s cubic-bezier(0.25, 0.46, 0.45, 0.94) 0.4s forwards;
}

.ornament::before,
.ornament::after {
  content: '';
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  background-color: #e0e0e0;
  box-shadow: 0 0 5px rgba(255, 255, 255, 0.5);
}

.ornament.top {
  margin-bottom: 1.5rem;
}
.ornament.bottom {
  margin-top: 1.5rem;
}

/* เส้นตกแต่งแบบง่ายๆ */
.ornament::before {
  width: 100%;
  height: 1px;
}
.ornament.top::before { top: 10px; }
.ornament.bottom::before { bottom: 10px; }

.ornament::after {
  width: 80%;
  height: 1px;
}
.ornament.top::after { top: 15px; }
.ornament.bottom::after { bottom: 15px; }


/* Animation Keyframes */
@keyframes slideInAndFade {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Vue Transition Classes */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.8s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
