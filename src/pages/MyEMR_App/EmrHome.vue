<template>
  <q-page class="landing-page">
    <canvas ref="canvasRef" class="metaballs-canvas"></canvas>

    <div class="content-on-top">
      <div class="hero-section text-center text-white q-pa-xl">
        <div class="hero-content">
          <div class="text-h2 text-weight-bolder animated-gradient-text">
            EMR: The Future of Health Records
          </div>
          <div class="text-h6 q-mt-md text-weight-light">
            ปฏิวัติการจัดการข้อมูลสุขภาพสู่ระบบดิจิทัลที่ปลอดภัย, รวดเร็ว, และเข้าถึงได้ทุกที่ทุกเวลา
          </div>
          <div class="q-mt-xl">
            <q-btn
              label="เริ่มต้นใช้งาน"
              color="primary"
              text-color="white"
              size="lg"
              class="q-px-xl q-py-sm hero-btn primary-btn"
              to="/myemr-app/user-registration"
              unelevated
            />
            <q-btn
              label="เรียนรู้เพิ่มเติม"
              flat
              color="white"
              size="lg"
              class="q-ml-md q-px-xl q-py-sm hero-btn secondary-btn"
              to="/tutorial"
            />
          </div>
        </div>
      </div>

      <div class="stats-section row justify-center q-pa-lg">
        <div class="col-12 col-md-3 text-center stat-item">
          <q-icon name="o_person" size="48px"/>
          <div class="stat-number-light">{{ animatedStats.patients.toLocaleString() }}+</div>
          <div class="stat-label-light">ผู้ป่วยในระบบ</div>
        </div>
        <div class="col-12 col-md-3 text-center stat-item">
          <q-icon name="o_medical_services" size="48px"/>
          <div class="stat-number-light">{{ animatedStats.records }}+</div>
          <div class="stat-label-light">เวชระเบียน</div>
        </div>
        <div class="col-12 col-md-3 text-center stat-item">
          <q-icon name="o_verified_user" size="48px"/>
          <div class="stat-number-light">{{ animatedStats.security }}%</div>
          <div class="stat-label-light">ความปลอดภัยข้อมูล</div>
        </div>
      </div>

      <div class="features-section q-pa-xl">
        <div class="text-h4 text-center text-white text-weight-bold q-mb-xl">คุณสมบัติหลักของเรา</div>
        <div class="row q-col-gutter-lg justify-center">
          <div class="col-12 col-md-4" v-for="(feature, index) in features" :key="index">
            <q-card flat class="feature-card" ref="featureCards">
              <q-card-section class="text-center">
                <q-avatar size="72px" font-size="48px" color="primary" text-color="white" :icon="feature.icon" />
                <div class="text-h6 q-mt-md">{{ feature.title }}</div>
                <p class="q-mt-sm text-blue-grey-3">{{ feature.text }}</p>
              </q-card-section>
            </q-card>
          </div>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted } from 'vue';

// --- Canvas Animation (Metaballs/Fireflies) ---
const canvasRef = ref(null);
let animationFrameId = null;
// The metaballs logic remains the same as it's a great effect.
onMounted(() => {
  const canvas = canvasRef.value;
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let metaballs = [];

  const resizeCanvas = () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  };

  class Metaball {
    constructor() {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      this.vx = (Math.random() - 0.5) * 1;
      this.vy = (Math.random() - 0.5) * 1;
      this.baseRadius = Math.random() * 30 + 20;
      this.currentRadius = this.baseRadius;
      this.flickerSpeed = Math.random() * 0.01 + 0.005;
      this.flickerPhase = Math.random() * Math.PI * 2;
    }
    update() {
      this.x += this.vx;
      this.y += this.vy;
      if (this.x > canvas.width + this.baseRadius || this.x < -this.baseRadius) this.vx *= -1;
      if (this.y > canvas.height + this.baseRadius || this.y < -this.baseRadius) this.vy *= -1;
      this.flickerPhase += this.flickerSpeed;
      const flickerAmount = Math.max(0, Math.sin(this.flickerPhase)) * this.baseRadius * 0.5;
      this.currentRadius = this.baseRadius + flickerAmount;
    }
    draw() {
      ctx.beginPath();
      const gradient = ctx.createRadialGradient(this.x, this.y, 1, this.x, this.y, this.currentRadius);
      gradient.addColorStop(0, 'white');
      gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = gradient;
      ctx.arc(this.x, this.y, this.currentRadius, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  const createMetaballs = () => {
    metaballs = [];
    const ballCount = 8;
    for (let i = 0; i < ballCount; i++) {
      metaballs.push(new Metaball());
    }
  };

  const animate = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    metaballs.forEach(ball => {
      ball.update();
      ball.draw();
    });
    animationFrameId = requestAnimationFrame(animate);
  };

  window.addEventListener('resize', () => {
    resizeCanvas();
    createMetaballs();
  });

  resizeCanvas();
  createMetaballs();
  animate();
});

onUnmounted(() => {
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
  }
});

// --- Animated Statistics ---
const animatedStats = reactive({ patients: 0, records: 0, security: 0 });
const animateValue = (obj, key, start, end, duration) => { let startTimestamp = null; const step = (timestamp) => { if (!startTimestamp) startTimestamp = timestamp; const progress = Math.min((timestamp - startTimestamp) / duration, 1); obj[key] = Math.floor(progress * (end - start) + start); if (progress < 1) { window.requestAnimationFrame(step); } }; window.requestAnimationFrame(step); };
onMounted(() => { animateValue(animatedStats, 'patients', 0, 1500, 2000); animateValue(animatedStats, 'records', 0, 10000, 2000); animateValue(animatedStats, 'security', 0, 100, 2000); });

// --- Features Data ---
const features = ref([
  { icon: 'o_history_edu', title: 'บันทึกข้อมูลครบวงจร', text: 'บันทึกประวัติการรักษา, สัญญาณชีพ, อาการ, การวินิจฉัย, และการสั่งยา ทั้งหมดในที่เดียว' },
  { icon: 'o_cloud_sync', title: 'เข้าถึงได้ทุกที่', text: 'ข้อมูลทั้งหมดถูกจัดเก็บบนคลาวด์ที่ปลอดภัย ให้คุณและทีมแพทย์เข้าถึงข้อมูลได้จากทุกอุปกรณ์' },
  { icon: 'o_analytics', title: 'วิเคราะห์และแสดงผล', text: 'มีระบบแดชบอร์ดสรุปข้อมูลสุขภาพ ช่วยให้เห็นภาพรวมและแนวโน้มการรักษาได้ดียิ่งขึ้น' },
]);

// --- Scroll Animation for Feature Cards ---
const featureCards = ref([]);
onMounted(() => {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  featureCards.value.forEach(card => {
    if (card && card.$el) {
      observer.observe(card.$el);
    }
  });
});

</script>

<style scoped>
/* Define a primary color variable */
:root {
  --primary-color: #00b8ff;
}

.landing-page {
  position: relative;
  background-color: #0d1a26;
  overflow-x: hidden; /* Prevent horizontal scroll */
}

.metaballs-canvas {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
  filter: blur(20px) contrast(30);
}

.content-on-top {
  position: relative;
  z-index: 2;
  background-color: transparent;
  mix-blend-mode: difference;
}

.hero-section {
  min-height: 70vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.hero-content {
  color: white;
}

/* Animated Gradient for Hero Title */
.animated-gradient-text {
  background: linear-gradient(45deg, #ffffff, #87cefa, #00b8ff);
  background-size: 200% 200%;
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: gradient-animation 5s ease infinite;
}

@keyframes gradient-animation {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

/* Enhanced Buttons */
.hero-btn {
  border-radius: 8px;
  font-weight: bold;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}
.hero-btn:hover {
  transform: translateY(-3px);
}
.primary-btn {
  background-color: var(--primary-color) !important;
}
.primary-btn:hover {
  box-shadow: 0 5px 20px rgba(0, 184, 255, 0.4);
}
.secondary-btn {
  border: 1px solid white;
}
.secondary-btn:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

/* Stats Section */
.stats-section {
  background-color: rgba(255, 255, 255, 0.05);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(5px);
}

/* **FIX**: Added glowing animation for stat icons */
@keyframes icon-glow {
  0% {
    text-shadow: 0 0 4px rgba(0, 184, 255, 0.4);
  }
  50% {
    text-shadow: 0 0 16px rgba(0, 184, 255, 0.8);
  }
  100% {
    text-shadow: 0 0 4px rgba(0, 184, 255, 0.4);
  }
}

.stat-item .q-icon {
  color: var(--primary-color) !important;
  transition: transform 0.3s ease, text-shadow 0.3s ease;
  animation: icon-glow 3s ease-in-out infinite; /* Apply animation */
}

.stat-item:hover .q-icon {
  transform: scale(1.1);
  /* Make glow more intense on hover */
  text-shadow: 0 0 12px var(--primary-color), 0 0 25px var(--primary-color);
  animation-play-state: paused; /* Pause the animation on hover for a static, intense glow */
}

.stat-number-light, .stat-label-light, .features-section .text-white {
  color: white !important;
}

/* Features Section */
.features-section {
  background-color: #0d1a26;
}
.feature-card {
  background-color: rgba(38, 50, 56, 0.5) !important;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  transition: transform 0.3s ease, border-color 0.3s ease;
  height: 100%;
  /* For scroll animation */
  opacity: 0;
  transform: translateY(40px);
}
.feature-card.is-visible {
  opacity: 1;
  transform: translateY(0px);
  transition: opacity 0.6s ease-out, transform 0.6s ease-out;
}
.feature-card:hover {
  transform: translateY(-10px);
  border-color: var(--primary-color);
}
.feature-card .q-avatar {
  background-color: var(--primary-color) !important;
  color: white !important;
}
.feature-card .text-h6 {
  color: white;
}
</style>
