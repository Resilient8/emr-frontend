<template>
  <q-page>
    <div class="fixed-overlay flex flex-center">
      <canvas ref="canvasRef" class="metaballs-canvas"></canvas>

      <q-card class="register-card main-card">
        <q-card-section class="q-pa-lg">

          <div class="text-center q-mb-md">
            <div class="row items-center justify-center q-gutter-x-sm">
              <q-avatar size="42px" font-size="24px" color="primary" text-color="white" icon="o_person_add" />
              <div class="text-h5 text-weight-bold header-title">สร้างบัญชีใหม่</div>
            </div>
            <p class="welcome-text q-mt-xs text-caption" style="opacity: 0.7;">กรอกข้อมูลเพื่อเริ่มต้นใช้งานระบบ</p>
          </div>

          <q-form ref="myForm" @submit.prevent="handleRegister" class="q-gutter-y-sm">

            <div class="row q-col-gutter-sm">
              <div class="col-12 col-sm-3">
                <q-select dense dark outlined v-model="formData.prefix" :options="prefixOptions" label="คำนำหน้า" :rules="[val => !!val || 'ระบุ']" class="custom-q-input" @update:model-value="playNextNote" />
              </div>
              <div class="col-12 col-sm-4">
                <q-input dense dark outlined v-model="formData.firstName" label="ชื่อ" :rules="[val => !!val || 'ระบุชื่อ']" class="custom-q-input" @mouseenter="playNextNote" />
              </div>
              <div class="col-12 col-sm-5">
                <q-input dense dark outlined v-model="formData.lastName" label="นามสกุล" :rules="[val => !!val || 'ระบุนามสกุล']" class="custom-q-input" @mouseenter="playNextNote" />
              </div>
            </div>

            <div class="row q-col-gutter-sm">
              <div class="col-12 col-sm-7">
                <q-select
                  dense dark outlined v-model="formData.email" use-input hide-selected fill-input input-debounce="0"
                  :options="emailOptions" @filter="filterEmailFn" label="อีเมล"
                  :rules="[val => !!val || 'ระบุอีเมล', val => /.+@.+\..+/.test(val) || 'อีเมลไม่ถูกต้อง']"
                  class="custom-q-input" @mouseenter="playNextNote"
                  autocomplete="username"
                >
                  <template v-slot:no-option>
                    <q-item><q-item-section class="text-grey">พิมพ์เพื่อรับคำแนะนำ</q-item-section></q-item>
                  </template>
                </q-select>
              </div>
              <div class="col-12 col-sm-5">
                <q-input dense dark outlined v-model="formData.phone" label="เบอร์โทรศัพท์" mask="###-###-####" class="custom-q-input" @mouseenter="playNextNote" />
              </div>
            </div>

            <div class="row q-col-gutter-sm">
              <div class="col-12 col-sm-6">
                <q-input
                  dense dark outlined
                  v-model="formData.password"
                  label="รหัสผ่าน"
                  :type="isPwd1 ? 'password' : 'text'"
                  :rules="[val => val && val.length >= 6 || 'ขั้นต่ำ 6 ตัว']"
                  class="custom-q-input"
                  @mouseenter="playNextNote"
                  autocomplete="new-password"
                >
                  <template v-slot:append> <q-icon :name="isPwd1 ? 'o_visibility_off' : 'o_visibility'" class="cursor-pointer welcome-text" @click="isPwd1 = !isPwd1" size="xs"/> </template>
                </q-input>
              </div>
              <div class="col-12 col-sm-6">
                 <q-input
                  dense dark outlined
                  v-model="formData.confirmPassword"
                  label="ยืนยันรหัสผ่าน"
                  :type="isPwd2 ? 'password' : 'text'"
                  :rules="[val => val === formData.password || 'รหัสไม่ตรงกัน']"
                  class="custom-q-input"
                  @mouseenter="playNextNote"
                  autocomplete="new-password"
                >
                  <template v-slot:append> <q-icon :name="isPwd2 ? 'o_visibility_off' : 'o_visibility'" class="cursor-pointer welcome-text" @click="isPwd2 = !isPwd2" size="xs"/> </template>
                </q-input>
              </div>
            </div>

            <q-separator dark class="q-my-xs" style="opacity: 0.3;" />

            <div class="row q-col-gutter-sm">
              <div class="col-12" :class="formData.userType ? 'col-sm-4' : ''">
                <q-select dense dark outlined v-model="formData.userType" :options="userTypes" label="ประเภทผู้ใช้งาน" :rules="[val => !!val || 'เลือกประเภท']" class="custom-q-input" @update:model-value="playNextNote" />
              </div>

              <template v-if="formData.userType">
                <div class="col-12 col-sm-4">
                  <q-input
                    dense dark outlined
                    v-model="formData.licenseNumber"
                    label="เลขที่ใบประกอบฯ"
                    mask="##########"
                    :rules="[val => val.length <= 10 || 'ไม่เกิน 10 หลัก']"
                    hint="เช่น 567890 (เฉพาะตัวเลข)"
                    class="custom-q-input"
                    @mouseenter="playNextNote"
                  />
                  </div>

                <div class="col-12 col-sm-4">
                  <q-input
                    dense dark outlined
                    v-model="formData.workplace"
                    label="สถานที่ทำงาน"
                    :rules="[val => val.length <= 100 || 'ยาวเกินไป']"
                    hint="เช่น รพ.รามาธิบดี, คลินิกหมอสมชาย"
                    class="custom-q-input"
                    @mouseenter="playNextNote"
                  />
                </div>

                <div class="col-12 col-sm-6">
                  <q-select dense dark outlined v-model="formData.department" :options="departmentOptions" label="แผนก" class="custom-q-input" @update:model-value="playNextNote" />
                </div>
                <div class="col-12 col-sm-6">
                  <q-select dense dark outlined v-model="formData.position" :options="positionOptions" label="ตำแหน่ง" class="custom-q-input" @update:model-value="playNextNote" />
                </div>
              </template>
            </div>

            <div class="row items-center justify-start q-mt-sm">
               <q-checkbox dense v-model="acceptTerms" class="accept-terms-checkbox" size="sm" :rules="[val => val === true || 'ต้องยอมรับเงื่อนไข']" @click="playNextNote">
                  <span class="welcome-text text-caption" style="font-size: 0.85rem;">ยอมรับ <router-link to="#" class="link">เงื่อนไขการใช้งาน</router-link></span>
               </q-checkbox>
            </div>

            <div class="q-mt-sm">
              <q-btn label="ลงทะเบียน" type="submit" color="primary" class="full-width login-btn" unelevated rounded size="md" @click="playNextNote" @mouseenter="playNextNote" />
            </div>

          </q-form>
        </q-card-section>

        <q-card-section class="text-center q-pt-none q-pb-md">
          <div class="welcome-text text-caption">มีบัญชีแล้ว? <router-link to="/myemr-app/login" class="link text-weight-bold" @click="playNextNote">เข้าสู่ระบบ</router-link></div>
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>

<script setup>
import { reactive, ref, onMounted, onUnmounted, watch } from 'vue';
import { useQuasar } from 'quasar';
import { useRouter } from 'vue-router';
// ✅ Import ถูกต้องแล้ว
import AuthService from '../../services/auth.service.js';
import * as Tone from 'tone';

// ... (Script Logic เดิมของคุณถูกต้องแล้ว ไม่ต้องแก้ครับ) ...
// Tone.js Sound Engine
const meloSynth = new Tone.FMSynth({ harmonicity: 3.1, modulationIndex: 20, envelope: { attack: 0.001, decay: 0.1, sustain: 0.1, release: 0.8 }, modulationEnvelope: { attack: 0.01, decay: 0.5, sustain: 0, release: 0.8 }, }).toDestination(); meloSynth.volume.value = -10;
const clearSoundSynth = new Tone.MetalSynth({ frequency: 800, envelope: { attack: 0.001, decay: 0.1, sustain: 0, release: 0.1 }, harmonicity: 5.1, modulationIndex: 15, resonance: 10000, octaves: 2, }).toDestination(); clearSoundSynth.volume.value = -6;
const noteSequence = [{ note: 'C4', duration: '4n' }, { note: 'G4', duration: '4n' }, { note: 'A4', duration: '4n' }, { note: 'F4', duration: '4n' }];
const noteIndex = ref(0); const isSoundPlaying = ref(false);
const playNextNote = () => { if (isSoundPlaying.value) return; if (Tone.context.state !== 'running') Tone.context.resume(); isSoundPlaying.value = true; const { note, duration } = noteSequence[noteIndex.value]; if (note) meloSynth.triggerAttackRelease(note, duration); setTimeout(() => { isSoundPlaying.value = false; }, Tone.Time(duration).toMilliseconds()); noteIndex.value = (noteIndex.value + 1) % noteSequence.length; };
const playClearSound = () => { if (Tone.context.state !== 'running') Tone.context.resume(); clearSoundSynth.triggerAttackRelease("C5", "32n"); };

// Canvas Animation
const canvasRef = ref(null); let animationFrameId = null;
onMounted(() => {
    const savedData = localStorage.getItem('reg_temp_data');
    if (savedData) {
        const parsed = JSON.parse(savedData);
        Object.assign(formData, { ...parsed, password: '', confirmPassword: '' });
    }
    const canvas = canvasRef.value; if (!canvas) return; const ctx = canvas.getContext('2d'); let metaballs = []; const resizeCanvas = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }; class Metaball { constructor() { this.x = Math.random() * canvas.width; this.y = Math.random() * canvas.height; this.vx = (Math.random() - 0.5) * 1; this.vy = (Math.random() - 0.5) * 1; this.baseRadius = Math.random() * 30 + 20; this.currentRadius = this.baseRadius; this.flickerSpeed = Math.random() * 0.01 + 0.005; this.flickerPhase = Math.random() * Math.PI * 2; } update() { this.x += this.vx; this.y += this.vy; if (this.x > canvas.width + this.baseRadius || this.x < -this.baseRadius) this.vx *= -1; if (this.y > canvas.height + this.baseRadius || this.y < -this.baseRadius) this.vy *= -1; this.flickerPhase += this.flickerSpeed; const flickerAmount = Math.max(0, Math.sin(this.flickerPhase)) * this.baseRadius * 0.5; this.currentRadius = this.baseRadius + flickerAmount; } draw() { ctx.beginPath(); const gradient = ctx.createRadialGradient(this.x, this.y, 1, this.x, this.y, this.currentRadius); gradient.addColorStop(0, 'white'); gradient.addColorStop(1, 'rgba(255, 255, 255, 0)'); ctx.fillStyle = gradient; ctx.arc(this.x, this.y, this.currentRadius, 0, Math.PI * 2); ctx.fill(); } } const createMetaballs = () => { metaballs = []; for (let i = 0; i < 8; i++) metaballs.push(new Metaball()); }; const animate = () => { ctx.clearRect(0, 0, canvas.width, canvas.height); metaballs.forEach(ball => { ball.update(); ball.draw(); }); animationFrameId = requestAnimationFrame(animate); }; window.addEventListener('resize', () => { resizeCanvas(); createMetaballs(); }); resizeCanvas(); createMetaballs(); animate();
});
onUnmounted(() => { if (animationFrameId) cancelAnimationFrame(animationFrameId); });

const $q = useQuasar();
const router = useRouter();
const myForm = ref(null);
const isPwd1 = ref(true);
const isPwd2 = ref(true);
const acceptTerms = ref(false);

const formData = reactive({ prefix: null, firstName: '', lastName: '', email: '', phone: '', password: '', confirmPassword: '', userType: null, licenseNumber: '', workplace: '', department: null, position: null });
const userTypes = ['Doctor', 'Nurse', 'Pharmacist', 'Admin'];
const prefixOptions = ['นาย', 'นาง', 'นางสาว', 'นพ.', 'พญ.', 'ภก.', 'ภกญ.'];
const departmentOptions = ['อายุรกรรม', 'ศัลยกรรม', 'สูตินรีเวช', 'กุมารเวชกรรม', 'อื่นๆ'];
const positionOptions = ['แพทย์ประจำบ้าน', 'แพทย์เฉพาะทาง', 'พยาบาลวิชาชีพ', 'เภสัชกร', 'อื่นๆ'];

const emailOptions = ref([]);
const commonDomains = ['@gmail.com', '@hotmail.com', '@outlook.com', '@yahoo.com', '@icloud.com'];
const filterEmailFn = (val, update) => {
  update(() => {
    const needle = val.toLowerCase();
    if (needle === '' || needle.indexOf('@') === -1) {
        emailOptions.value = commonDomains.map(domain => needle + domain);
    } else {
        const [user, domain] = needle.split('@');
        if (domain) {
            emailOptions.value = commonDomains.filter(d => d.includes('@' + domain)).map(d => user + d);
        } else {
            emailOptions.value = commonDomains.map(d => user + d);
        }
    }
  });
};

watch(formData, (newVal) => {
    const { password, confirmPassword, ...dataToSave } = newVal;
    localStorage.setItem('reg_temp_data', JSON.stringify(dataToSave));
}, { deep: true });

const handleRegister = async () => {
    const success = await myForm.value.validate();
    if (!success) {
        $q.notify({ color: 'negative', icon: 'warning', message: 'กรุณากรอกข้อมูลให้ครบถ้วน', position: 'top-right' });
        playClearSound();
        return;
    }

    $q.loading.show({ message: 'กำลังเชื่อมต่อ Server...' });

    try {
        // ✅ ตรงนี้จะทำงานได้ ถ้า Restart Frontend Server
        const response = await AuthService.register(formData);
        console.log('API Response:', response.data);
        localStorage.removeItem('reg_temp_data');
        $q.loading.hide();
        $q.notify({ color: 'positive', icon: 'cloud_done', message: 'ลงทะเบียนสำเร็จ! เข้าสู่ระบบได้เลย', position: 'top-right' });
        playNextNote();
        router.push('/myemr-app/login');
    } catch (error) {
        $q.loading.hide();
        console.error('Registration Error:', error);
        const errorMessage = error.response?.data?.message || 'เกิดข้อผิดพลาดในการลงทะเบียน (Server Error)';
        $q.notify({ color: 'negative', icon: 'error', message: errorMessage, position: 'top-right' });
        playClearSound();
    } finally {
        $q.loading.hide();
    }
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

.fixed-overlay {
  position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
  z-index: 5000;
  background-color: transparent;
  overflow: hidden;
  pointer-events: none;
}

.metaballs-canvas {
  position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: 1;
  filter: blur(20px) contrast(30); pointer-events: none;
}

.register-card {
  position: relative; z-index: 2;
  width: 95vw; max-width: 850px; height: auto;
  pointer-events: auto;
  background-color: $card-bg-color; backdrop-filter: blur(5px);
  border-radius: 12px; border: 1px solid $border-light;
  box-shadow: 0 0 15px rgba($primary-color, 0.2);
  color: $text-light;
}

.header-title { color: #ffffff; text-shadow: 0 0 5px $primary-color; }
.welcome-text { color: $text-muted; }
.link { color: $primary-color; text-decoration: none; font-weight: 500; transition: color 0.3s; }
.link:hover { color: color.adjust($primary-color, $lightness: 10%); text-decoration: underline; }

:deep(.q-field--dense .q-field__control) { height: 40px; border-radius: 8px; }
:deep(.q-field--dense .q-field__label) { font-size: 0.9em; top: 8px; }
:deep(.q-field--outlined.q-field--dark .q-field__control) {
  background-color: rgba(38, 50, 56, 0.7) !important; border-color: rgba(0, 184, 255, 0.2) !important; color: #e0e0e0 !important;
  transition: border-color 0.3s, box-shadow 0.3s;
}
:deep(.q-field--outlined.q-field--dark.q-field--focused .q-field__control) {
  background-color: rgba(38, 50, 56, 0.9) !important; border-color: $primary-color !important; box-shadow: 0 0 10px rgba($primary-color, 0.6) !important;
}
:deep(.q-field--outlined.q-field--dark .q-field__native), :deep(.q-field--dark .q-field__label) { color: #e0e0e0 !important; }
:deep(.q-field--outlined.q-field--dark .q-field__prepend), :deep(.q-field--outlined.q-field--dark .q-field__append) { color: $primary-color !important; }

:deep(.q-menu.q-position-engine.q-menu--dark) { background-color: rgba(38, 50, 56, 0.9) !important; backdrop-filter: blur(8px) !important; border: 1px solid rgba($primary-color, 0.3) !important; }
:deep(.q-item) { color: #e0e0e0 !important; }
.q-btn { border-radius: 10px !important; font-weight: bold; }
</style>
