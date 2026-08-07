<template>
  <q-page class="dashboard-background flex flex-center">
    <canvas ref="canvasRef" class="metaballs-canvas"></canvas>

    <q-card class="login-card main-card">
      <q-card-section class="q-pa-xl">
        <div class="text-center q-mb-xl">
          <q-avatar size="60px" font-size="32px" color="primary" text-color="white" icon="o_local_hospital" />
          <div class="text-h4 text-weight-bold q-mt-md header-title">เข้าสู่ระบบ</div>
          <p class="welcome-text q-mt-sm">ยินดีต้อนรับสู่ระบบจัดการคลินิก</p>
        </div>

        <q-form ref="myForm" @submit.prevent="handleLogin" class="q-gutter-y-md">
          <q-input
            dark outlined v-model="formData.username"
            label="อีเมล หรือ ชื่อผู้ใช้งาน"
            lazy-rules
            :rules="[ val => val && val.length > 0 || 'กรุณากรอกชื่อผู้ใช้งาน']"
            @mouseenter="playNextNote"
            class="custom-q-input"
            autocomplete="username"
          >
            <template v-slot:prepend>
              <q-icon name="person" color="primary" />
            </template>
          </q-input>

          <q-input
            dark outlined v-model="formData.password" label="รหัสผ่าน"
            :type="isPwd ? 'password' : 'text'"
            lazy-rules
            :rules="[ val => val && val.length > 0 || 'กรุณากรอกรหัสผ่าน']"
            @mouseenter="playNextNote"
            class="custom-q-input"
            autocomplete="current-password"
          >
            <template v-slot:prepend>
              <q-icon name="lock" color="primary" />
            </template>
            <template v-slot:append>
              <q-icon :name="isPwd ? 'o_visibility_off' : 'o_visibility'" class="cursor-pointer welcome-text" @click="isPwd = !isPwd; playNextNote();" />
            </template>
          </q-input>

          <div class="row items-center justify-between">
            <q-checkbox
              dark
              v-model="rememberMe"
              label="จำชื่อผู้ใช้"
              color="primary"
              @mouseenter="playNextNote"
            />
            <a href="#" class="link welcome-text" @click.prevent="playNextNote">ลืมรหัสผ่าน?</a>
          </div>

          <div>
            <q-btn
              label="เข้าสู่ระบบ" type="submit" color="primary" class="full-width login-btn"
              unelevated rounded size="lg" padding="12px"
              :loading="isLoading"
              @mouseenter="playNextNote"
            />
          </div>

          <!-- 🌟 ส่วนปุ่ม Demo (โหมดจำลอง) -->
          <div class="row items-center q-mt-lg q-mb-sm">
            <q-separator dark class="col" />
            <div class="col-auto welcome-text q-mx-md">โหมดจำลองสำหรับทดสอบ (Demo)</div>
            <q-separator dark class="col" />
          </div>

          <!-- 🌟 เริ่มส่วนปุ่ม Demo 4 บทบาท -->
          <div class="row q-col-gutter-md">
            <div class="col-6">
              <q-btn class="full-width demo-btn doctor-btn" unelevated rounded padding="10px" @click="() => { handleDemoLogin('doctor'); playNextNote(); }" @mouseenter="playNextNote">
                <q-icon name="medical_services" class="q-mr-sm" /> แพทย์
              </q-btn>
            </div>
            <div class="col-6">
              <q-btn class="full-width demo-btn nurse-btn" unelevated rounded padding="10px" @click="() => { handleDemoLogin('nurse'); playNextNote(); }" @mouseenter="playNextNote">
                <q-icon name="local_hospital" class="q-mr-sm" /> พยาบาล
              </q-btn>
            </div>
            <div class="col-6">
              <q-btn class="full-width demo-btn pharmacist-btn" unelevated rounded padding="10px" @click="() => { handleDemoLogin('pharmacist'); playNextNote(); }" @mouseenter="playNextNote">
                <q-icon name="medication" class="q-mr-sm" /> เภสัชกร
              </q-btn>
            </div>
            <div class="col-6">
              <q-btn class="full-width demo-btn admin-btn" unelevated rounded padding="10px" @click="() => { handleDemoLogin('admin'); playNextNote(); }" @mouseenter="playNextNote">
                <q-icon name="admin_panel_settings" class="q-mr-sm" /> แอดมิน
              </q-btn>
            </div>
          </div>
          <!-- 🌟 สิ้นสุดส่วนปุ่ม Demo -->

          <div class="row items-center q-my-lg">
            <q-separator dark class="col" /> <div class="col-auto welcome-text q-mx-md">หรือเข้าสู่ระบบด้วย</div> <q-separator dark class="col" />
          </div>

          <div>
            <q-btn
              class="full-width google-btn"
              unelevated rounded size="lg" padding="12px"
              @click="() => { handleGoogleLogin(); playNextNote(); }" @mouseenter="playNextNote"
            >
              <div class="row items-center justify-center">
                <img src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" alt="Google logo" class="google-logo">
                <span class="q-ml-sm welcome-text">เข้าสู่ระบบด้วย Google</span>
              </div>
            </q-btn>
          </div>
        </q-form>
      </q-card-section>

      <q-card-section class="text-center q-pb-lg">
        <div class="welcome-text">ยังไม่มีบัญชี? <router-link to="/myemr-app/user-registration" class="link text-weight-bold" @click="playNextNote">สร้างบัญชีที่นี่</router-link></div>
      </q-card-section>
    </q-card>
    <!-- 👇👇👇 วางโค้ด Guide Modal ตรงนี้ (ทับของเดิมในหน้า Login) 👇👇👇 -->
      <q-dialog v-model="showGuideModal" persistent backdrop-filter="blur(4px)">
        <q-card class="bg-dark text-white" style="width: 420px; max-width: 90vw; border: 1px solid rgba(0, 184, 255, 0.4); border-radius: 12px; box-shadow: 0 0 15px rgba(0, 184, 255, 0.2); overflow: hidden;">

          <!-- Header สไตล์เกม -->
          <q-card-section class="row items-center q-pb-sm bg-blue-grey-10" style="border-bottom: 1px solid rgba(255,255,255,0.05);">
            <div class="text-h6 text-primary font-weight-bold row items-center" style="font-family: 'Cinzel', serif; letter-spacing: 1px;">
              <q-icon name="videogame_asset" size="sm" class="q-mr-sm" />
              ROLE SELECTION
            </div>
            <q-space />
            <q-btn icon="close" flat round dense v-close-popup @click="markGuideAsSeen" color="grey-5" class="hover-icon-red" />
          </q-card-section>

          <!-- Content แบบสั้นๆ -->
          <q-card-section class="q-pa-lg">

            <!-- 🌟 เพิ่มคำอธิบายแบบ System Notice (สไตล์กล่องภารกิจในเกม) -->
            <div class="q-mb-lg q-pa-sm text-center text-cyan-2 rounded-borders text-caption" style="background: rgba(34, 211, 238, 0.05); border: 1px dashed rgba(34, 211, 238, 0.3); letter-spacing: 0.5px;">
              <q-icon name="lightbulb" class="q-mr-xs" size="xs" />
              เลือกล็อกอินตามบทบาท เพื่อทดสอบ Flow การส่งต่อคิวผู้ป่วย (State Machine)
            </div>

            <!-- List ตัวละคร (คงความเนี๊ยบไว้เหมือนเดิม) -->
            <div class="q-gutter-y-md text-body1 text-grey-4">

              <div class="row items-center">
                <q-icon name="admin_panel_settings" color="orange-4" size="md" class="q-mr-md"/>
                <div>
                  <span class="text-weight-bold text-white">Admin:</span> เข้าถึงได้ทุกเมนู
                  <q-badge color="orange-9" text-color="white" class="q-ml-sm text-weight-bold" style="letter-spacing: 0.5px;">RECOMMENDED</q-badge>
                </div>
              </div>

              <div class="row items-center">
                <q-icon name="local_hospital" color="pink-4" size="md" class="q-mr-md"/>
                <div><span class="text-weight-bold text-white">Nurse:</span> หน้าด่านซักประวัติ & ส่งคิว</div>
              </div>

              <div class="row items-center">
                <q-icon name="medical_services" color="primary" size="md" class="q-mr-md"/>
                <div><span class="text-weight-bold text-white">Doctor:</span> เรียกตรวจ วินิจฉัย & สั่งยา</div>
              </div>

              <div class="row items-center">
                <q-icon name="medication" color="green-4" size="md" class="q-mr-md"/>
                <div><span class="text-weight-bold text-white">Pharmacist:</span> ตรวจสอบ จัดยา & ปิดเคส</div>
              </div>

            </div>
          </q-card-section>

          <!-- Footer -->
          <q-card-actions align="center" class="q-pa-md bg-blue-grey-10" style="border-top: 1px solid rgba(255,255,255,0.05);">
            <q-btn
              unelevated
              color="primary"
              class="full-width text-weight-bold login-btn"
              label="START DEMO"
              @click="markGuideAsSeen"
              v-close-popup
              style="border-radius: 8px; font-size: 16px; letter-spacing: 2px;"
            />
          </q-card-actions>

        </q-card>
      </q-dialog>
      <!-- 👆👆👆 สิ้นสุด Guide Modal 👆👆👆 -->
  </q-page>
</template>

<script setup>
import { reactive, ref, onMounted, onUnmounted, nextTick } from 'vue';
import { useQuasar } from 'quasar';
import { useRouter } from 'vue-router';
import axios from 'axios';
import * as Tone from 'tone';

// 👇 1. Import Store
import { useAuthStore } from 'src/store/auth';

const $q = useQuasar();
const router = useRouter();
const authStore = useAuthStore();

// --- Tone.js Sound Engine ---
const meloSynth = new Tone.FMSynth({ harmonicity: 3.1, modulationIndex: 20, envelope: { attack: 0.001, decay: 0.1, sustain: 0.1, release: 0.8 }, modulationEnvelope: { attack: 0.01, decay: 0.5, sustain: 0, release: 0.8 }, }).toDestination();
meloSynth.volume.value = -10;

// เสียง Error
const clearSoundSynth = new Tone.MetalSynth({ frequency: 800, envelope: { attack: 0.001, decay: 0.1, sustain: 0, release: 0.1, }, harmonicity: 5.1, modulationIndex: 15, resonance: 10000, octaves: 2, }).toDestination();
clearSoundSynth.volume.value = -6;

const noteSequence = [ { note: 'C4', duration: '4n' }, { note: 'C4', duration: '4n' }, { note: 'G4', duration: '4n' }, { note: 'G4', duration: '4n' }, { note: 'A4', duration: '4n' }, { note: 'A4', duration: '4n' }, { note: 'G4', duration: '2n' }, { note: 'F4', duration: '4n' }, { note: 'F4', duration: '4n' }, { note: 'E4', duration: '4n' }, { note: 'E4', duration: '4n' }, { note: 'D4', duration: '4n' }, { note: 'D4', duration: '4n' }, { note: 'C4', duration: '2n' } ];
const noteIndex = ref(0);
const isSoundPlaying = ref(false);

const playNextNote = () => { if (isSoundPlaying.value) return; if (Tone.context.state !== 'running') { Tone.context.resume(); } isSoundPlaying.value = true; const { note, duration } = noteSequence[noteIndex.value]; if (note) { meloSynth.triggerAttackRelease(note, duration, Tone.now() + 0.1); } const delay = Tone.Time(duration).toMilliseconds(); setTimeout(() => { isSoundPlaying.value = false; }, delay); noteIndex.value = (noteIndex.value + 1) % noteSequence.length; };

const playClearSound = () => {
  if (Tone.context.state !== 'running') { Tone.context.resume(); }
  clearSoundSynth.triggerAttackRelease('C2', '8n', Tone.now());
};
// --- END Tone.js ---

// --- Canvas Animation ---
const canvasRef = ref(null);
let animationFrameId = null;
onMounted(() => {
    const canvas = canvasRef.value; if (!canvas) return; const ctx = canvas.getContext('2d'); let metaballs = [];
    const resizeCanvas = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    class Metaball { constructor() { this.x = Math.random() * canvas.width; this.y = Math.random() * canvas.height; this.vx = (Math.random() - 0.5) * 1; this.vy = (Math.random() - 0.5) * 1; this.baseRadius = Math.random() * 30 + 20; this.currentRadius = this.baseRadius; this.flickerSpeed = Math.random() * 0.01 + 0.005; this.flickerPhase = Math.random() * Math.PI * 2; } update() { this.x += this.vx; this.y += this.vy; if (this.x > canvas.width + this.baseRadius || this.x < -this.baseRadius) this.vx *= -1; if (this.y > canvas.height + this.baseRadius || this.y < -this.baseRadius) this.vy *= -1; this.flickerPhase += this.flickerSpeed; const flickerAmount = Math.max(0, Math.sin(this.flickerPhase)) * this.baseRadius * 0.5; this.currentRadius = this.baseRadius + flickerAmount; } draw() { ctx.beginPath(); const gradient = ctx.createRadialGradient(this.x, this.y, 1, this.x, this.y, this.currentRadius); gradient.addColorStop(0, 'white'); gradient.addColorStop(1, 'rgba(255, 255, 255, 0)'); ctx.fillStyle = gradient; ctx.arc(this.x, this.y, this.currentRadius, 0, Math.PI * 2); ctx.fill(); } }
    const createMetaballs = () => { metaballs = []; const ballCount = 8; for (let i = 0; i < ballCount; i++) { metaballs.push(new Metaball()); } };
    const animate = () => { ctx.clearRect(0, 0, canvas.width, canvas.height); metaballs.forEach(ball => { ball.update(); ball.draw(); }); animationFrameId = requestAnimationFrame(animate); };
    window.addEventListener('resize', () => { resizeCanvas(); createMetaballs(); });
    resizeCanvas(); createMetaballs(); animate();

    const savedUser = localStorage.getItem('rememberedUser');
    if (savedUser) {
      formData.username = savedUser;
      rememberMe.value = true;
    }
    const hasSeenGuide = localStorage.getItem('hasSeenLoginGuide');
    if (!hasSeenGuide) {
        // หน่วงเวลา 0.8 วินาที ให้ Animation พื้นหลังโหลดเสร็จก่อน แล้วค่อยให้ Modal เด้งขึ้นมาเท่ๆ
        setTimeout(() => {
            showGuideModal.value = true;
        }, 800);
    }
});
onUnmounted(() => { if (animationFrameId) { cancelAnimationFrame(animationFrameId); } });
// --- END Canvas Animation ---

const myForm = ref(null);
const isPwd = ref(true);
const isLoading = ref(false);
const rememberMe = ref(false);

const formData = reactive({
    username: '',
    password: ''
});

// 🌟 ตัวแปรควบคุม Guide Modal
const showGuideModal = ref(false);

// 🌟 ฟังก์ชันกดปิด Guide และบันทึกค่าลงเครื่อง
const markGuideAsSeen = () => {
    localStorage.setItem('hasSeenLoginGuide', 'true');
    showGuideModal.value = false;
    playNextNote(); // หยอดเสียง Effect นิดนึงตอนกดปุ่ม
};
// 🌟 ฟังก์ชัน Demo Login (Auto-Fill & Auto-Submit 4 บทบาท)
const handleDemoLogin = async (role) => {
    let roleNameTH = '';

    if (role === 'doctor') {
        formData.username = 'mmm@gmail.com';
        formData.password = '123456';
        roleNameTH = 'แพทย์';
    } else if (role === 'nurse') {
        formData.username = 'aaa@gmail.com';
        formData.password = '123456';
        roleNameTH = 'พยาบาล';
    } else if (role === 'pharmacist') {
        formData.username = 'bbb@gmail.com';
        formData.password = '123456';
        roleNameTH = 'เภสัชกร';
    } else if (role === 'admin') {
        formData.username = 'lum1@gmail.com';
        formData.password = '123456';
        roleNameTH = 'ผู้ดูแลระบบ';
    }

    // แจ้งเตือนเพื่อให้ผู้เทสรู้ว่าระบบกำลังทำงาน
    $q.notify({
        color: 'info',
        message: `กำลังจำลองการเข้าสู่ระบบบทบาท: ${roleNameTH}...`,
        position: 'top-right',
        timeout: 1000
    });

    // หน่วงเวลานิดหน่อยให้เนียนตา แล้วเรียกฟังก์ชันล็อกอินจริง
    setTimeout(async () => {
        await handleLogin();
    }, 500);
};

const handleLogin = async () => {
    // 1. Validate Form
    const success = await myForm.value.validate();

    if (success) {
        isLoading.value = true;
        $q.loading.show({ message: 'กำลังเข้าสู่ระบบ...' });

        try {
            // 2. Call API
            const response = await axios.post('https://emr-backend-api-8euv.onrender.com/api/auth/login', formData);

            // 🔥 IMPORTANT FIX: Check standard HTTP status
            if (response.status === 200) {
                const resData = response.data;
                console.log("Login Success:", resData);

                // 3. Update Store
                authStore.login(resData.user, resData.token || 'dummy-token');

                // 4. Remember Username
                if (rememberMe.value) {
                    localStorage.setItem('rememberedUser', formData.username);
                } else {
                    localStorage.removeItem('rememberedUser');
                }

                $q.loading.hide();

                // 5. Notify Success
                const userNameDisplay = resData.user.first_name || authStore.userName || 'ผู้ใช้งาน';
                $q.notify({
                    color: 'positive',
                    icon: 'verified_user',
                    message: `ยินดีต้อนรับ! คุณ ${userNameDisplay}`,
                    position: 'top-right'
                });

                playNextNote();

                // 🚀 6. Redirect Based on Role (แยกทางเดินตามบทบาท)
                const userEmail = resData.user.email;

                if (userEmail === 'mmm@gmail.com') {
                    // 👨‍⚕️ แพทย์ -> ไปหน้า Procedures List
                    router.push({ path: '/procedures-list' });

                } else if (userEmail === 'bbb@gmail.com') {
                    // 💊 เภสัชกร -> ไปหน้า Medicine List
                    router.push({ path: '/medicine-list' });

                } else if (userEmail === 'aaa@gmail.com' || userEmail === 'lum1@gmail.com') {
                    // 👩‍⚕️ พยาบาล & 🛠 แอดมิน -> ไปหน้า Patient List (Nurse Station)
                    router.push({ path: '/nurse/patient-list' });

                } else {
                    // 🛡 Default สำหรับ User อื่นๆ เผื่อไว้
                    router.push({ path: '/nurse/patient-list' });
                }

            } else {
                throw new Error(response.data?.message || 'Login failed');
            }

        } catch (error) {
            $q.loading.hide();
            console.error("Login Error:", error);

            const errorMessage = error.response?.data?.message || error.message || 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง';

            $q.notify({
                color: 'negative',
                icon: 'error',
                message: errorMessage,
                position: 'top-right'
            });

            playClearSound();
        } finally {
            isLoading.value = false;
        }
    }
};

const handleGoogleLogin = () => {
    $q.notify({ color: 'info', message: 'ฟังก์ชันนี้ยังไม่เปิดใช้งาน', position: 'top-right' });
    playNextNote();
};
</script>

<style scoped lang="scss">
@use "sass:color";

$primary-color: #00b8ff;
$dark-bg-color: #0d1a26;
$card-bg-color: rgba(38, 50, 56, 0.5);
$text-light: #e0e0e0;
$text-muted: #90a4ae;
$border-light: rgba(0, 184, 255, 0.2);

.dashboard-background {
  background-color: $dark-bg-color;
  font-family: 'Sarabun', sans-serif;
  color: $text-light;
  position: relative;
  overflow: hidden;
}

.metaballs-canvas {
  position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: 1; filter: blur(20px) contrast(30);
}

.login-card {
  position: relative; z-index: 2; width: 90vw; max-width: 480px;
  background-color: $card-bg-color; backdrop-filter: blur(5px);
  border-radius: 12px; border: 1px solid $border-light;
  box-shadow: 0 0 15px rgba($primary-color, 0.2);
  transition: all 0.3s ease; color: $text-light;
  animation: fadeInSlideUp 0.8s ease-out forwards;
}

@keyframes fadeInSlideUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.header-title { color: #ffffff; text-shadow: 0 0 5px $primary-color; }
.welcome-text { color: $text-muted; }
.link { color: $primary-color; text-decoration: none; font-weight: 500; transition: color 0.3s; }
.link:hover { color: color.adjust($primary-color, $lightness: 10%); text-decoration: underline; }

.google-btn {
  background-color: rgba(255, 255, 255, 0.1) !important; color: $text-light !important;
  border: 1px solid rgba($primary-color, 0.3); transition: all 0.3s ease;
  .google-logo { filter: invert(1); width: 20px; height: 20px; margin-right: 8px; }
}
.google-btn:hover { background-color: rgba(255, 255, 255, 0.2) !important; box-shadow: 0 4px 8px rgba($primary-color, 0.2); }

:deep(.q-field--outlined.q-field--dark .q-field__control) {
  background-color: rgba(38, 50, 56, 0.7) !important; border-color: rgba(0, 184, 255, 0.2) !important; color: #e0e0e0 !important;
  transition: border-color 0.3s, box-shadow 0.3s, background-color 0.3s; border-radius: 12px !important;
}
:deep(.q-field--outlined.q-field--dark .q-field__native), :deep(.q-field--outlined.q-field--dark .q-field__input) { color: #e0e0e0 !important; }
:deep(.q-field--outlined.q-field--dark .q-field__control:hover) { border-color: rgba($primary-color, 0.5) !important; box-shadow: 0 0 5px rgba($primary-color, 0.2) !important; }
:deep(.q-field--outlined.q-field--dark.q-field--focused .q-field__control) { background-color: rgba(38, 50, 56, 0.9) !important; border-color: $primary-color !important; box-shadow: 0 0 10px rgba($primary-color, 0.6) !important; }

.login-btn { border-radius: 12px !important; font-weight: bold; text-transform: none; transition: all 0.3s ease; }
.login-btn:hover { box-shadow: 0 4px 15px -4px $primary-color, 0 0 15px rgba($primary-color, 0.6); }

/* 🌟 สไตล์ปุ่ม Demo */
.demo-btn {
  background-color: rgba(38, 50, 56, 0.8) !important;
  color: $text-light !important;
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
  font-weight: bold;
}
.demo-btn:hover {
  transform: translateY(-2px);
}
.doctor-btn:hover {
  background-color: rgba(0, 184, 255, 0.2) !important;
  border-color: $primary-color;
  box-shadow: 0 4px 10px rgba(0, 184, 255, 0.2);
}
.nurse-btn:hover {
  background-color: rgba(255, 64, 129, 0.2) !important;
  border-color: #ff4081;
  box-shadow: 0 4px 10px rgba(255, 64, 129, 0.2);
}
/* 🌟 เพิ่มสีให้ เภสัชกร (สีเขียว) */
.pharmacist-btn:hover {
  background-color: rgba(76, 175, 80, 0.2) !important;
  border-color: #4caf50;
  box-shadow: 0 4px 10px rgba(76, 175, 80, 0.2);
}
/* 🌟 เพิ่มสีให้ แอดมิน (สีส้ม) */
.admin-btn:hover {
  background-color: rgba(255, 152, 0, 0.2) !important;
  border-color: #ff9800;
  box-shadow: 0 4px 10px rgba(255, 152, 0, 0.2);
}
/* 🌟 ลิ่มไม้อันสุดท้าย: แก้ปัญหาช่องกรอกข้อความสีขาวจาก Autofill ของเบราว์เซอร์ */
:deep(input:-webkit-autofill),
:deep(input:-webkit-autofill:hover),
:deep(input:-webkit-autofill:focus),
:deep(input:-webkit-autofill:active) {
  /* ใช้ box-shadow เททับสีขาวให้กลายเป็นสีมืด (ให้กลืนกับพื้นหลังการ์ด) */
  -webkit-box-shadow: 0 0 0 100px #263238 inset !important;

  /* บังคับให้สีตัวอักษรกลับมาเป็นสีสว่าง */
  -webkit-text-fill-color: #e0e0e0 !important;

  /* ป้องกันการกระพริบสีขาวตอนโหลด */
  transition: background-color 5000s ease-in-out 0s;
}
</style>
