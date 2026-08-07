<template>
  <q-page class="dashboard-background flex flex-center">
    <div class="content-wrapper full-width q-pa-md" style="max-width: 900px;">

      <div class="header-section glass-panel q-pa-md q-mb-lg row items-center justify-between list-item-animation" style="animation-delay: 0.1s;">
        <div class="row items-center">
          <div class="icon-box q-mr-md">
            <q-icon name="person_add" size="28px" color="white" />
          </div>
          <div>
            <div class="text-h5 text-weight-bold text-white leading-tight">เพิ่มผู้ป่วยใหม่</div>
            <div class="text-caption text-cyan-3">Create New Patient Record</div>
          </div>
        </div>
         <q-btn flat round icon="arrow_back_ios_new" class="back-btn" @click="goBack" @mouseenter="playNextNote">
          <q-tooltip class="bg-black">กลับไปหน้ารายชื่อ</q-tooltip>
        </q-btn>
      </div>

      <q-card class="glass-panel q-pa-lg list-item-animation" style="animation-delay: 0.2s;">

        <q-form @submit="submitForm" class="q-gutter-y-md">

          <div class="row justify-center q-mb-xl relative-position">
            <div class="column items-center">
              <div class="avatar-wrapper" @click="$refs.fileInput.pickFiles()">

                <q-avatar size="140px" class="shadow-10 avatar-border flex flex-center overflow-hidden">
                  <img v-if="avatarPreview" :src="avatarPreview" style="object-fit: cover; width: 100%; height: 100%;">
                  <q-icon v-else name="add_a_photo" size="50px" color="blue-grey-3" />

                  <div class="avatar-overlay flex flex-center column">
                    <q-icon name="edit" color="white" size="30px" class="q-mb-xs" />
                    <div class="text-caption text-white text-weight-bold">เปลี่ยนรูป</div>
                  </div>
                </q-avatar>

                <q-btn
                  v-if="avatarPreview"
                  round dense
                  color="red-5"
                  icon="close"
                  size="sm"
                  class="remove-avatar-btn shadow-5"
                  @click.stop="avatarFile = null; avatarPreview = null"
                >
                  <q-tooltip>ลบรูปภาพ</q-tooltip>
                </q-btn>
              </div>

              <q-file
                ref="fileInput"
                v-model="avatarFile"
                accept=".jpg, .png, .jpeg"
                style="display: none"
                @update:model-value="handleFileUpload"
              />
              <div class="text-grey-5 q-mt-md text-caption text-center">
                คลิกที่รูปเพื่ออัปโหลด<br>(รองรับ JPG, PNG)
              </div>
            </div>
          </div>

          <div class="text-subtitle1 text-cyan-3 text-weight-bold q-mb-sm"><q-icon name="badge" class="q-mr-sm"/>ข้อมูลส่วนตัว</div>
          <div class="row q-col-gutter-md">
            <div class="col-12 col-sm-2">
              <q-select dark dense outlined v-model="prefix" label="คำนำหน้า" :options="prefixOptions" color="cyan-3" class="input-glow" :rules="[val => !!val || 'ระบุคำนำหน้า']" />
            </div>
            <div class="col-12 col-sm-5">
              <q-input dark dense outlined v-model="firstName" label="ชื่อจริง" color="cyan-3" class="input-glow" :rules="[val => !!val || 'ระบุชื่อจริง']">
                <template v-slot:prepend><q-icon name="person_outline" /></template>
              </q-input>
            </div>
            <div class="col-12 col-sm-5">
              <q-input dark dense outlined v-model="lastName" label="นามสกุล" color="cyan-3" class="input-glow" :rules="[val => !!val || 'ระบุนามสกุล']">
                <template v-slot:prepend><q-icon name="person_outline" /></template>
              </q-input>
            </div>
          </div>

          <div class="row q-col-gutter-md">
            <div class="col-12 col-sm-4">
              <q-input dark dense outlined v-model="patientId" label="เลขบัตรประชาชน (13 หลัก)" mask="#############" color="cyan-3" class="input-glow" :rules="[val => val && val.length === 13 || 'ต้องครบ 13 หลัก']">
                <template v-slot:prepend><q-icon name="fingerprint" /></template>
              </q-input>
            </div>
            <div class="col-12 col-sm-4">
              <q-input dark dense outlined v-model="birthDate" label="วันเกิด (วว/ดด/ปปปป)" mask="##/##/####" fill-mask color="cyan-3" class="input-glow" :rules="[val => !!val || 'ระบุวันเกิด']">
                <template v-slot:prepend><q-icon name="cake" /></template>
                <template v-slot:append>
                  <q-icon name="event" class="cursor-pointer">
                    <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                      <q-date v-model="birthDate" mask="DD/MM/YYYY" dark color="cyan-6"><div class="row justify-end"><q-btn v-close-popup label="ปิด" color="white" flat /></div></q-date>
                    </q-popup-proxy>
                  </q-icon>
                </template>
              </q-input>
            </div>
            <div class="col-12 col-sm-4">
              <q-input dark dense outlined :model-value="calculatedAge" label="อายุ (ปี)" readonly bg-color="rgba(255,255,255,0.05)" class="input-glow">
                <template v-slot:prepend><q-icon name="timelapse" /></template>
              </q-input>
            </div>
          </div>

          <div class="row q-mb-md">
            <div class="col-12">
              <q-input dark dense outlined type="textarea" v-model="address" label="ที่อยู่ปัจจุบัน" color="cyan-3" class="input-glow" rows="3">
                <template v-slot:prepend><q-icon name="home" /></template>
              </q-input>
            </div>
          </div>

          <div class="text-subtitle1 text-cyan-3 text-weight-bold q-mb-sm q-mt-lg"><q-icon name="medical_services" class="q-mr-sm"/>ข้อมูลสุขภาพ</div>
          <div class="row q-col-gutter-md">
            <div class="col-12 col-sm-6">
              <q-select
                ref="underlyingDiseasesSelect" dark dense outlined v-model="underlyingDiseases" label="โรคประจำตัว" :options="underlyingDiseaseOptions"
                multiple use-chips use-input new-value-mode="add-unique" color="cyan-3" class="input-glow"
                @new-value="(val, done) => createValue(val, done, masterUnderlyingDiseaseOptions, underlyingDiseases, newUnderlyingDiseases)"
                @filter="filterUnderlyingDiseases"
              >
                <template v-slot:prepend><q-icon name="coronavirus" /></template>
                <template v-slot:option="scope">
                  <q-item v-bind="scope.itemProps">
                    <q-item-section><q-item-label>{{ scope.opt }}</q-item-label></q-item-section>
                    <q-item-section side v-if="newUnderlyingDiseases.includes(scope.opt)"><q-badge label="New" color="cyan-7" /></q-item-section>
                  </q-item>
                </template>
              </q-select>
            </div>
            <div class="col-12 col-sm-6">
              <q-select dark dense outlined v-model="bloodGroup" label="กรุ๊ปเลือด" :options="bloodGroupOptions" color="cyan-3" class="input-glow" :rules="[val => !!val || 'ระบุเลือด']">
                <template v-slot:prepend><q-icon name="bloodtype" /></template>
              </q-select>
            </div>
          </div>

          <div class="row q-col-gutter-md">
            <div class="col-12 col-sm-6">
              <q-select
                ref="drugAllergiesSelect" dark dense outlined v-model="drugAllergies" label="ประวัติการแพ้ยา" :options="drugAllergyOptions"
                multiple use-chips use-input new-value-mode="add-unique" color="red-4" class="input-glow error-glow"
                @new-value="(val, done) => createValue(val, done, masterDrugAllergyOptions, drugAllergies, newDrugAllergies)"
                @filter="filterDrugAllergies"
              >
                <template v-slot:prepend><q-icon name="medication_liquid" color="red-4"/></template>
              </q-select>
            </div>
            <div class="col-12 col-sm-6">
              <q-select
                ref="foodAllergiesSelect" dark dense outlined v-model="foodAllergies" label="ประวัติการแพ้อาหาร" :options="foodAllergyOptions"
                multiple use-chips use-input new-value-mode="add-unique" color="orange-4" class="input-glow warning-glow"
                @new-value="(val, done) => createValue(val, done, masterFoodAllergyOptions, foodAllergies, newFoodAllergies)"
                @filter="filterFoodAllergies"
              >
                <template v-slot:prepend><q-icon name="restaurant" color="orange-4"/></template>
              </q-select>
            </div>
          </div>

          <q-separator class="q-my-lg bg-grey-8" />

          <div class="row justify-end q-gutter-md">
            <q-btn label="ยกเลิก" flat color="grey-5" class="cancel-btn" @click="goBack" />
            <q-btn label="บันทึกข้อมูล" type="submit" icon="save" class="save-btn-glow" unelevated no-caps @mouseenter="playNextNote"/>
          </div>

        </q-form>
      </q-card>
    </div>

    <q-dialog v-model="showCropper" persistent transition-show="scale" transition-hide="scale">
      <q-card class="bg-dark text-white" style="width: 600px; max-width: 90vw; border-radius: 16px;">
        <q-card-section>
          <div class="text-h6 text-cyan-3"><q-icon name="crop" class="q-mr-sm"/>ปรับขนาดรูปภาพ</div>
        </q-card-section>
        <q-card-section class="q-pa-none bg-black">
          <cropper ref="cropperRef" class="cropper" :src="cropperImg" :stencil-props="{ aspectRatio: 1/1 }" image-class="cropper-image" />
        </q-card-section>
        <q-card-actions align="right" class="q-pa-md">
          <q-btn flat label="ยกเลิก" color="grey" @click="onCropCancel" />
          <q-btn unelevated label="ใช้รูปนี้" color="cyan-6" icon="check" @click="onCropConfirm" />
        </q-card-actions>
      </q-card>
    </q-dialog>

  </q-page>
</template>

<script setup>
import * as Tone from 'tone';
import { ref, computed } from 'vue';
import axios from 'axios';
import { useQuasar } from 'quasar';
import { useRouter } from 'vue-router';
import { Cropper } from 'vue-advanced-cropper';
import 'vue-advanced-cropper/dist/style.css';

// --- Tone.js ---
const meloSynth = new Tone.FMSynth({ harmonicity: 3.1, modulationIndex: 20, envelope: { attack: 0.001, decay: 0.1, sustain: 0.1, release: 0.8 }, modulationEnvelope: { attack: 0.01, decay: 0.5, sustain: 0, release: 0.8 } }).toDestination();
meloSynth.volume.value = -10;
const noteSequence = [ { note: 'C4', duration: '8n' }, { note: 'E4', duration: '8n' }, { note: 'G4', duration: '8n' } ];
const noteIndex = ref(0);
const isSoundPlaying = ref(false);
const playNextNote = () => {
  if (isSoundPlaying.value) return;
  if (Tone.context.state !== 'running') { Tone.context.resume(); }
  isSoundPlaying.value = true;
  const { note, duration } = noteSequence[noteIndex.value];
  if (note) meloSynth.triggerAttackRelease(note, duration);
  setTimeout(() => { isSoundPlaying.value = false; }, 150);
  noteIndex.value = (noteIndex.value + 1) % noteSequence.length;
};

const $q = useQuasar();
const router = useRouter();

// Form Models
const prefix = ref(null);
const firstName = ref(null);
const lastName = ref(null);
const patientId = ref(null);
const birthDate = ref(null);
const address = ref(null);
const bloodGroup = ref(null);
const underlyingDiseases = ref([]);
const drugAllergies = ref([]);
const foodAllergies = ref([]);

// Image & Cropper
const avatarFile = ref(null);
const avatarPreview = ref(null);
const showCropper = ref(false);
const cropperImg = ref(null);
const cropperRef = ref(null);

// Select Refs
const underlyingDiseasesSelect = ref(null);
const drugAllergiesSelect = ref(null);
const foodAllergiesSelect = ref(null);

// Tracking New Items
const newUnderlyingDiseases = ref([]);
const newDrugAllergies = ref([]);
const newFoodAllergies = ref([]);

// Options
const prefixOptions = ['เด็กชาย', 'เด็กหญิง', 'นาย', 'นาง', 'นางสาว'];
const bloodGroupOptions = ['A', 'B', 'AB', 'O'];
const masterUnderlyingDiseaseOptions = ref(['ความดันโลหิตสูง', 'เบาหวาน', 'โรคหัวใจ', 'ไขมันในเลือดสูง', 'โรคไต', 'หอบหืด']);
const underlyingDiseaseOptions = ref([...masterUnderlyingDiseaseOptions.value]);
const masterDrugAllergyOptions = ref(['Penicillin', 'Aspirin', 'Sulfa', 'Ibuprofen', 'Codeine']);
const drugAllergyOptions = ref([...masterDrugAllergyOptions.value]);
const masterFoodAllergyOptions = ref(['อาหารทะเล', 'กุ้ง', 'ปู', 'ถั่วลิสง', 'นมวัว', 'ไข่']);
const foodAllergyOptions = ref([...masterFoodAllergyOptions.value]);

// Computed Age
const calculatedAge = computed(() => {
  if (birthDate.value && /^\d{2}\/\d{2}\/\d{4}$/.test(birthDate.value)) {
    try {
      const parts = birthDate.value.split('/');
      const birth = new Date(+parts[2], parts[1] - 1, +parts[0]);
      if (isNaN(birth.getTime())) return 0;
      const diff = Date.now() - birth.getTime();
      const age = Math.floor(diff / 31557600000);
      return age >= 0 ? age : 0;
    } catch (e) { return 0; }
  }
  return 0;
});

// Image Handlers
const handleFileUpload = (file) => {
  if (file) {
    cropperImg.value = URL.createObjectURL(file);
    showCropper.value = true;
  }
};

const onCropConfirm = () => {
  const { canvas } = cropperRef.value.getResult();
  if (canvas) {
    canvas.toBlob((blob) => {
      const newFile = new File([blob], "avatar_cropped.jpg", { type: "image/jpeg" });
      avatarFile.value = newFile;
      avatarPreview.value = URL.createObjectURL(blob);
      showCropper.value = false;
    }, 'image/jpeg');
  }
};
const onCropCancel = () => { avatarFile.value = null; showCropper.value = false; };

// Generic helpers for select with add new
const createValue = (val, done, master, current, newItemRef) => {
  if (val.length > 0) {
    if (!master.value.includes(val)) master.value.push(val);
    if (!newItemRef.value.includes(val)) newItemRef.value.push(val);
    done(val, 'add-unique');
  }
};

const filterFn = (val, update, master, current) => {
  update(() => {
    const needle = val.toLowerCase();
    current.value = master.value.filter(v => v.toLowerCase().indexOf(needle) > -1);
  });
};
const filterUnderlyingDiseases = (val, update) => filterFn(val, update, masterUnderlyingDiseaseOptions, underlyingDiseaseOptions);
const filterDrugAllergies = (val, update) => filterFn(val, update, masterDrugAllergyOptions, drugAllergyOptions);
const filterFoodAllergies = (val, update) => filterFn(val, update, masterFoodAllergyOptions, foodAllergyOptions);

// Submit
const submitForm = async () => {
  try {
    const formData = new FormData();
    formData.append('prefix', prefix.value || '');
    formData.append('first_name', firstName.value || '');
    formData.append('last_name', lastName.value || '');
    formData.append('patient_id', patientId.value || '');
    if (birthDate.value) formData.append('birth_date', birthDate.value.split('/').reverse().join('-'));
    formData.append('age', calculatedAge.value || 0);
    formData.append('address', address.value || '');
    formData.append('blood_group', bloodGroup.value || '');

    formData.append('underlying_disease', underlyingDiseases.value.join(', '));
    formData.append('drug_allergies', drugAllergies.value.join(', '));
    formData.append('food_allergies', foodAllergies.value.join(', '));

    if (avatarFile.value) formData.append('avatar', avatarFile.value);

    console.log('Submitting FormData...');
    const res = await axios.post('https://emr-backend-api-8euv.onrender.com/api/patients', formData);
    console.log('Patient created:', res.data);

    $q.notify({ type: 'positive', message: 'บันทึกสำเร็จ', icon: 'check_circle' });
    router.push('/patient-list');
  } catch (error) {
    console.error('Error adding patient:', error);
    $q.notify({ type: 'negative', message: 'บันทึกไม่สำเร็จ' });
  }
};

const goBack = () => router.go(-1);
</script>

<style scoped lang="scss">
@import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@300;400;600;700&display=swap');

$dark-bg: #0f172a;
$glass-bg: rgba(30, 41, 59, 0.7);
$border: 1px solid rgba(255,255,255,0.08);
$cyan: #22d3ee;

.dashboard-background { background-color: $dark-bg; font-family: 'Sarabun'; color: #e2e8f0; }

/* Glass Panel (Card Style) */
.glass-panel {
  background: $glass-bg;
  backdrop-filter: blur(12px);
  border: $border;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
}

/* Header */
.icon-box {
  width: 48px; height: 48px;
  background: linear-gradient(135deg, $cyan, #0ea5e9);
  border-radius: 12px;
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 4px 12px rgba(34, 211, 238, 0.4);
}
.back-btn { color: #94a3b8; &:hover { color: white; background: rgba(255,255,255,0.1); } }

/* 🚀 FIX: Avatar Center & Style */
.avatar-wrapper {
  position: relative; cursor: pointer; display: inline-block;
  transition: transform 0.3s;
  &:hover {
    transform: scale(1.05);
    .avatar-overlay { opacity: 1; }
    .avatar-border { border-color: $cyan; box-shadow: 0 0 20px rgba(34,211,238,0.4); }
  }
}
.avatar-border {
  border: 4px solid rgba(255,255,255,0.1);
  transition: all 0.3s;
  background-color: rgba(0,0,0,0.3);
}
/* Center content inside overlay */
.avatar-overlay {
  position: absolute; inset: 0;
  background: rgba(0,0,0,0.6);
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  opacity: 0; transition: opacity 0.3s; border-radius: 50%;
}
.remove-avatar-btn { position: absolute; top: 0; right: 0; z-index: 10; }

/* Input Glow Effects */
.input-glow {
  :deep(.q-field__control) {
    background: rgba(0,0,0,0.2) !important;
    border-radius: 8px;
    transition: all 0.3s;
  }
  :deep(.q-field__control:hover) { background: rgba(255,255,255,0.05) !important; border-color: rgba(255,255,255,0.3); }
  :deep(.q-field__control.text-cyan-3) { border-color: $cyan !important; box-shadow: 0 0 10px rgba(34,211,238,0.2); }
}
.error-glow :deep(.q-field__control.text-red-4) { border-color: #ef4444 !important; box-shadow: 0 0 10px rgba(239,68,68,0.2); }
.warning-glow :deep(.q-field__control.text-orange-4) { border-color: #f97316 !important; box-shadow: 0 0 10px rgba(249,115,22,0.2); }

/* Save Button */
.save-btn-glow {
  background: linear-gradient(135deg, $cyan 0%, #0ea5e9 100%);
  color: white; font-weight: 600; padding: 10px 24px; border-radius: 8px;
  box-shadow: 0 0 15px rgba(14, 165, 233, 0.4);
  transition: transform 0.2s;
  &:hover { transform: translateY(-2px); box-shadow: 0 0 25px rgba(14, 165, 233, 0.6); }
}
.cancel-btn { font-weight: 600; &:hover { color: white; background: rgba(255,255,255,0.1); border-radius: 8px; } }

/* Animation */
@keyframes fadeInSlideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
.list-item-animation { animation: fadeInSlideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) backwards; }
</style>
