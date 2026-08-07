<template>
  <q-page class="dashboard-background">

    <transition name="fade">
      <div v-if="loading" class="loading-overlay">
        <div class="loading-spinner"></div>
        <div class="loading-text q-mt-md">กำลังโหลดข้อมูล...</div>
      </div>
    </transition>

    <div class="q-pa-lg content-container">

      <q-card class="main-card glass-panel q-mb-lg">
        <q-card-section class="q-pb-none">
          <div class="row items-center justify-between wrap q-col-gutter-md">
            <div class="col-12 col-md-auto row items-center">
              <div class="icon-box-flat q-mr-md">
                <q-icon name="group" size="28px" color="white" />
              </div>
              <div>
                <div class="text-h5 text-weight-bold text-white leading-tight">ทะเบียนผู้ป่วย</div>
                <div class="text-caption text-cyan-3">Patient Management System</div>
              </div>
            </div>

            <div class="col-12 col-md-auto row q-gutter-x-md">
              <q-btn-toggle
                v-model="viewMode"
                @update:model-value="playNextNote"
                unelevated rounded
                class="glass-toggle"
                text-color="grey-5"
                toggle-color="cyan-4"
                toggle-text-color="black"
                :options="[{icon: 'grid_view', value: 'cards'}, {icon: 'view_list', value: 'table'}]"
              />
              <q-btn
                icon="person_add"
                label="เพิ่มผู้ป่วย"
                @click="() => { addPatient(); playNextNote(); }"
                class="action-btn-flat"
                unelevated no-caps rounded
              />
            </div>
          </div>
        </q-card-section>

        <q-card-section>
          <div class="filter-bar row items-center q-gutter-sm q-py-sm">
            <q-tabs
              v-model="statusFilter"
              dense
              class="text-grey-5 status-tabs"
              active-color="cyan-3"
              indicator-color="cyan-3"
              narrow-indicator
              @update:model-value="playNextNote"
            >
              <q-tab name="all" label="ทั้งหมด" />
              <q-tab name="treated" label="รักษาแล้ว" />
              <q-tab name="untreated" label="รอการรักษา" />
            </q-tabs>

            <q-space />

            <q-input
              dark dense outlined rounded
              v-model="searchQuery"
              placeholder="ค้นหา (ชื่อ, HN...)"
              class="search-input"
              color="cyan-3"
              @clear="playClearSound"
              clearable
            >
              <template v-slot:prepend><q-icon name="search" /></template>
            </q-input>

            <q-btn
              round flat
              :color="showAdvancedFilters ? 'cyan-3' : 'grey-5'"
              icon="tune"
              @click="showAdvancedFilters = !showAdvancedFilters"
            >
              <q-tooltip class="bg-black">ตัวกรองเพิ่มเติม</q-tooltip>
            </q-btn>
          </div>

          <q-slide-transition>
            <div v-show="showAdvancedFilters">
              <div class="q-pt-md">
                <div class="q-pa-md bg-dark-glass rounded-borders" style="background: rgba(0,0,0,0.2);">
                  <div class="row q-col-gutter-md">
                    <div class="col-12 col-sm-6 col-md-3">
                      <q-select dark dense outlined v-model="sortBy" :options="sortOptions" label="จัดเรียงตาม" emit-value map-options color="cyan-3" />
                    </div>
                    <div class="col-12 col-sm-6 col-md-3">
                      <q-select dark dense outlined v-model="selectedSex" :options="sexOptions" label="เพศ" emit-value map-options color="cyan-3" />
                    </div>
                    <div class="col-12 col-sm-6 col-md-3">
                      <q-select dark dense outlined v-model="hasUnderlyingDisease" :options="underlyingDiseaseOptions" label="โรคประจำตัว" emit-value map-options color="cyan-3" />
                    </div>
                    <div class="col-12 col-sm-6 col-md-3">
                      <q-select dark dense outlined v-model="selectedAgeRange" :options="ageRangeOptions" label="ช่วงอายุ" emit-value map-options color="cyan-3" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </q-slide-transition>

        </q-card-section>
      </q-card>

      <div v-if="!loading && paginatedPatients.length > 0">

        <div v-if="viewMode === 'cards'" class="row q-col-gutter-lg">
          <div v-for="(patient, index) in paginatedPatients" :key="`card-${patient.id}`" class="col-12 col-md-6 col-lg-4 col-xl-3 list-item-animation" :style="{ animationDelay: `${index * 0.05}s` }">

            <q-card class="patient-card glass-panel" @click="goToPatientRecord(patient)">
              <div class="card-content">
                <div class="row no-wrap items-center q-mb-md">

                  <div class="avatar-container-outer q-mr-md" style="position: relative;">
                    <div class="avatar-wrapper" @click.stop="openImagePreview(patient)">
                      <q-avatar size="64px" class="shadow-3">
                        <img v-if="patient.avatarUrl" :src="patient.avatarUrl" class="avatar-img">
                        <q-icon v-else :name="patient.sex === 'ชาย' ? 'face' : 'face_3'" :color="patient.sex === 'ชาย' ? 'blue-2' : 'pink-2'" size="40px" />
                      </q-avatar>
                      <div class="zoom-overlay"><q-icon name="zoom_in" color="white" /></div>
                    </div>
                    <q-badge v-if="patient.isNew" color="red-5" rounded class="new-badge-absolute shadow-2" style="position: absolute; top: -6px; right: -6px; z-index: 10;">NEW</q-badge>
                  </div>

                  <div class="col overflow-hidden">
                    <div class="text-h6 text-white ellipsis text-weight-bold">{{ patient.first_name }} {{ patient.last_name }}</div>
                    <div class="text-caption text-grey-4">{{ patient.prefix }} • {{ patient.age }} ปี</div>
                    <q-chip dense size="sm" class="q-mt-xs q-ml-none glass-chip" :color="patient.sex === 'ชาย' ? 'blue-9' : 'pink-9'" text-color="white">
                      HN: {{ patient.hn }}
                    </q-chip>
                  </div>

                  <div>
                    <q-btn flat round icon="edit" color="grey-5" size="sm" class="hover-white" @click.stop="editPatient(patient)" />
                  </div>
                </div>

                <q-separator dark class="opacity-20 q-mb-sm" />

                <div class="info-grid">
                  <div class="info-item">
                    <q-icon name="event" size="xs" color="cyan-3" class="q-mr-xs" />
                    <span class="text-grey-4">ล่าสุด:</span>
                    <span class="text-white q-ml-xs">{{ formatDate(patient.lastVisit) }}</span>
                  </div>
                  <div class="info-item">
                    <q-icon name="medical_services" size="xs" :color="patient.allergies !== 'ไม่มี' ? 'red-4' : 'green-4'" class="q-mr-xs" />
                    <span class="text-grey-4">แพ้ยา:</span>
                    <span class="text-white q-ml-xs ellipsis" :class="{'text-red-3': patient.allergies !== 'ไม่มี'}">{{ patient.allergies }}</span>
                  </div>
                </div>
              </div>
            </q-card>

          </div>
        </div>

        <div v-else-if="viewMode === 'table'" class="list-view-container">
          <div class="row q-px-md q-py-sm text-grey-5 text-uppercase text-caption text-weight-bold list-header">
            <div class="col-4">ข้อมูลผู้ป่วย</div>
            <div class="col-2 text-center">สถานะ</div>
            <div class="col-3">ประวัติการแพ้</div>
            <div class="col-2">ล่าสุดเมื่อ</div>
            <div class="col-1 text-right">จัดการ</div>
          </div>

          <div
            v-for="(patient, index) in paginatedPatients"
            :key="patient.id"
            class="list-row glass-panel q-mb-sm cursor-pointer list-item-animation"
            :style="{ animationDelay: `${index * 0.03}s` }"
            @click="goToPatientRecord(patient)"
          >
            <div class="row items-center q-pa-md">
              <div class="col-4 row items-center no-wrap">
                <div class="avatar-wrapper-mini q-mr-md" @click.stop="openImagePreview(patient)">
                  <q-avatar size="48px" class="shadow-2 bg-dark">
                    <img v-if="patient.avatarUrl" :src="patient.avatarUrl" class="avatar-img">
                    <q-icon v-else :name="patient.sex === 'ชาย' ? 'face' : 'face_3'" :color="patient.sex === 'ชาย' ? 'blue-4' : 'pink-3'" />
                  </q-avatar>
                  <q-badge v-if="patient.isNew" color="red-5" rounded floating class="mini-new-badge">N</q-badge>
                </div>
                <div>
                  <div class="text-body1 text-white text-weight-bold ellipsis">{{ patient.prefix }} {{ patient.first_name }} {{ patient.last_name }}</div>
                  <div class="text-caption text-cyan-2 row items-center">
                    <q-icon name="badge" size="10px" class="q-mr-xs" /> {{ patient.hn }}
                    <span class="q-mx-xs text-grey-6">|</span>
                    {{ patient.age }} ปี
                  </div>
                </div>
              </div>
              <div class="col-2 text-center">
                <q-chip dense outline :color="patient.sex === 'ชาย' ? 'blue-4' : 'pink-4'" class="glass-chip">
                  <q-icon :name="patient.sex === 'ชาย' ? 'male' : 'female'" size="14px" class="q-mr-xs" />{{ patient.sex }}
                </q-chip>
              </div>
              <div class="col-3">
                <div v-if="patient.allergies === 'ไม่มี'" class="text-grey-5 text-caption"><q-icon name="check_circle" color="green-5" class="q-mr-xs" /> สุขภาพปกติ</div>
                <div v-else class="text-red-3 text-weight-medium ellipsis"><q-icon name="warning" class="q-mr-xs" /> {{ patient.allergies }}</div>
              </div>
              <div class="col-2 text-grey-4 text-body2">{{ formatDate(patient.lastVisit) }}</div>
              <div class="col-1 row justify-end items-center no-wrap">
                <q-btn flat round dense icon="edit" color="grey-5" class="hover-icon" @click.stop="editPatient(patient)"><q-tooltip class="bg-black">แก้ไข</q-tooltip></q-btn>
                <q-btn flat round dense icon="delete_outline" color="grey-6" class="hover-icon-red" @click.stop="deletePatient(patient)"><q-tooltip class="bg-black">ลบ</q-tooltip></q-btn>
              </div>
            </div>
          </div>
        </div>

        <div class="row justify-center q-mt-xl">
          <q-pagination
            v-model="currentPage" :max="maxPages"
            direction-links
            color="cyan-3" active-color="cyan-6" active-text-color="white"
            class="glass-pagination"
            @update:model-value="playNextNote"
          />
        </div>

      </div>

      <div v-else-if="!loading" class="column items-center justify-center q-pa-xl text-grey-5">
        <q-icon name="person_search" size="80px" class="opacity-30 q-mb-md" />
        <div class="text-h6 opacity-80">ไม่พบข้อมูลผู้ป่วย</div>
        <div class="text-caption opacity-60">ลองเปลี่ยนคำค้นหาหรือตัวกรองดูนะครับ</div>
        <q-btn label="ล้างตัวกรอง" flat color="cyan-3" class="q-mt-md" @click="clearFilters" v-if="activeFilterCount > 0" />
      </div>

    </div>

    <q-dialog v-model="showImagePreview" backdrop-filter="blur(8px)">
      <q-card class="bg-transparent shadow-none no-shadow" style="min-width: 300px; max-width: 90vw;">
        <div class="column items-center relative-position">
          <q-img
            :src="currentImageSrc"
            class="rounded-borders shadow-20"
            style="max-height: 80vh; max-width: 100%; border: 4px solid rgba(255,255,255,0.1);"
            spinner-color="white"
          />
          <div class="text-white text-h5 q-mt-md text-weight-bold text-shadow">{{ currentImageName }}</div>
          <q-btn round color="white" text-color="black" icon="close" class="absolute-top-right q-ma-md shadow-10" v-close-popup style="top: -20px; right: -20px;" />
        </div>
      </q-card>
    </q-dialog>
    <!-- 👇👇👇 1. วางโค้ด Guide Modal ตรงนี้ 👇👇👇 -->
    <q-dialog v-model="showGuideModal" persistent backdrop-filter="blur(4px)">
      <q-card class="bg-dark text-white" style="width: 420px; max-width: 90vw; border: 1px solid rgba(34, 211, 238, 0.4); border-radius: 12px; box-shadow: 0 0 15px rgba(34, 211, 238, 0.2); overflow: hidden;">

        <!-- Header สไตล์เกม -->
        <q-card-section class="row items-center q-pb-sm bg-blue-grey-10" style="border-bottom: 1px solid rgba(255,255,255,0.05);">
          <div class="text-h6 text-cyan-3 font-weight-bold row items-center" style="font-family: 'Cinzel', serif; letter-spacing: 1px;">
            <q-icon name="sports_esports" size="sm" class="q-mr-sm" />
            FEATURES UNLOCK
          </div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup @click="markGuideAsSeen" color="grey-5" class="hover-icon-red" />
        </q-card-section>

        <!-- Content แบบสั้นๆ -->
        <q-card-section class="q-pa-lg">
          <div class="q-gutter-y-md text-body1 text-grey-3">
            <div class="row items-center">
              <q-icon name="add_circle" color="green-4" size="sm" class="q-mr-md"/>
              <span>สร้างประวัติผู้ป่วยใหม่</span>
            </div>
            <div class="row items-center">
              <q-icon name="pageview" color="orange-4" size="sm" class="q-mr-md"/>
              <span>คลิกที่การ์ดเพื่อดู <b>ประวัติ EMR</b> เต็มรูปแบบ</span>
            </div>
            <div class="row items-center">
              <q-icon name="dashboard_customize" color="purple-4" size="sm" class="q-mr-md"/>
              <span>สลับมุมมอง การ์ด / ตาราง</span>
            </div>
            <div class="row items-center">
              <q-icon name="filter_alt" color="cyan-4" size="sm" class="q-mr-md"/>
              <span>ค้นหาและกรองข้อมูล</span>
            </div>
            <div class="row items-center">
              <q-icon name="zoom_in" color="pink-4" size="sm" class="q-mr-md"/>
              <span>คลิกที่รูปโปรไฟล์เพื่อซูมรูป</span>
            </div>
          </div>
        </q-card-section>

        <!-- Footer -->
        <q-card-actions align="center" class="q-pa-md bg-blue-grey-10" style="border-top: 1px solid rgba(255,255,255,0.05);">
          <q-btn
            unelevated
            class="full-width text-weight-bold action-btn-flat"
            label="START"
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
import * as Tone from 'tone';
import { ref, computed, watch, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import axios from 'axios';

// --- Image Preview Logic ---
const showImagePreview = ref(false);
const currentImageSrc = ref('');
const currentImageName = ref('');

const openImagePreview = (patient) => {
  if (patient.avatarUrl) {
    currentImageSrc.value = patient.avatarUrl;
    currentImageName.value = `${patient.first_name} ${patient.last_name}`;
    showImagePreview.value = true;
    playNextNote();
  }
};

// --- Format Date Helper ---
const formatDate = (dateStr) => {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('th-TH', {
    year: '2-digit', month: 'short', day: 'numeric'
  });
};

// --- Tone.js ---
const meloSynth = new Tone.FMSynth({ harmonicity: 3.1, modulationIndex: 20, envelope: { attack: 0.001, decay: 0.1, sustain: 0.1, release: 0.8 }, modulationEnvelope: { attack: 0.01, decay: 0.5, sustain: 0, release: 0.8 } }).toDestination();
meloSynth.volume.value = -10;
const clearSoundSynth = new Tone.MetalSynth({ frequency: 800, envelope: { attack: 0.001, decay: 0.1, sustain: 0, release: 0.1 }, harmonicity: 5.1, modulationIndex: 15, resonance: 10000, octaves: 2 }).toDestination();
clearSoundSynth.volume.value = -6;
const noteSequence = [ { note: 'C4', duration: '16n' }, { note: 'E4', duration: '16n' } ];
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
const playClearSound = () => { if (Tone.context.state !== 'running') { Tone.context.resume(); } clearSoundSynth.triggerAttackRelease("C5", "32n"); };

// --- Setup ---
const viewMode = ref('cards');
const router = useRouter();
const $q = useQuasar();
const loading = ref(true);
const patientData = ref([]);

const showGuideModal = ref(false);
const markGuideAsSeen = () => {
    localStorage.setItem('hasSeenPatientGuide', 'true');
    showGuideModal.value = false;
    playNextNote();
};

const searchQuery = ref('');
const selectedSex = ref(null);
const selectedAgeRange = ref(null);
const hasUnderlyingDisease = ref(null);
const statusFilter = ref('all');
const showAdvancedFilters = ref(false);

const currentPage = ref(1);
const rowsPerPage = ref(12);

const sortBy = ref('lastVisit-desc');
const sortOptions = [ { label: 'มาล่าสุด (ใหม่ > เก่า)', value: 'lastVisit-desc' }, { label: 'มาล่าสุด (เก่า > ใหม่)', value: 'lastVisit-asc' }, { label: 'ชื่อ (ก-ฮ)', value: 'name-asc' }, { label: 'อายุ (น้อย-มาก)', value: 'age-asc' } ];
const sexOptions = [ { label: 'ทุกเพศ', value: null }, { label: 'ชาย', value: 'ชาย' }, { label: 'หญิง', value: 'หญิง' } ];
const ageRangeOptions = [ { label: 'ทุกช่วงอายุ', value: null }, { label: '0-10 ปี', value: '0-10' }, { label: '11-60 ปี', value: '11-60' }, { label: '60+ ปี', value: '61-200' } ];
const underlyingDiseaseOptions = [ { label: 'ทั้งหมด', value: null }, { label: 'มีโรคประจำตัว', value: true }, { label: 'สุขภาพแข็งแรง', value: false } ];

// --- Data Processing ---
const processedPatientData = computed(() => {
  if (!patientData.value) return [];
  return patientData.value.map((p, index) => {

    let realLastVisit = null;
    if (p.visits && p.visits.length > 0) {
        const sortedVisits = [...p.visits].sort((a, b) => new Date(b.visit_datetime) - new Date(a.visit_datetime));
        realLastVisit = sortedVisits[0].visit_datetime;
    }

    return {
      ...p,
      hn: p.patient_id || `HN${String(10001 + index).padStart(6, '0')}`,
      allergies: p.drug_allergies || p.allergies || 'ไม่มี',
      lastVisit: realLastVisit || p.created_at || new Date().toISOString(),
      sex: (['นาง', 'นางสาว', 'เด็กหญิง'].includes(p.prefix)) ? 'หญิง' : 'ชาย',
      age: p.birth_date ? new Date().getFullYear() - new Date(p.birth_date).getFullYear() : 0,
      hasUnderlyingDisease: !!p.underlying_disease && p.underlying_disease !== 'ไม่มี',
      isNew: (!p.visits || p.visits.length === 0),
      avatarUrl: p.avatar_url ? `https://emr-backend-api-8euv.onrender.com${p.avatar_url}` : null
    };
  });
});

const filteredPatientData = computed(() => {
  let data = processedPatientData.value;
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase();
    data = data.filter(p => (p.hn && p.hn.toLowerCase().includes(q)) || (p.first_name && p.first_name.toLowerCase().includes(q)) || (p.last_name && p.last_name.toLowerCase().includes(q)));
  }
  if (selectedSex.value) data = data.filter(p => p.sex === selectedSex.value);
  if (hasUnderlyingDisease.value !== null) data = data.filter(p => p.hasUnderlyingDisease === hasUnderlyingDisease.value);
  if (statusFilter.value === 'untreated') data = data.filter(p => p.isNew);
  if (statusFilter.value === 'treated') data = data.filter(p => !p.isNew);
  if (selectedAgeRange.value) {
      const [min, max] = selectedAgeRange.value.split('-').map(Number);
      data = data.filter(p => p.age >= min && p.age <= max);
  }
  return data;
});

const sortedData = computed(() => {
  const data = [...filteredPatientData.value];
  const [key, direction] = sortBy.value.split('-');
  data.sort((a, b) => {
    let valA = a[key], valB = b[key];
    if (key === 'name') { valA = a.first_name; valB = b.first_name; }
    if (key === 'lastVisit') { valA = new Date(a.lastVisit); valB = new Date(b.lastVisit); }
    if (valA < valB) return direction === 'asc' ? -1 : 1;
    if (valA > valB) return direction === 'asc' ? 1 : -1;
    return 0;
  });
  return data;
});

const maxPages = computed(() => Math.ceil(sortedData.value.length / rowsPerPage.value));
const paginatedPatients = computed(() => {
  const start = (currentPage.value - 1) * rowsPerPage.value;
  return sortedData.value.slice(start, start + rowsPerPage.value);
});
const activeFilterCount = computed(() => {
    return (searchQuery.value ? 1 : 0) + (selectedSex.value ? 1 : 0) + (statusFilter.value !== 'all' ? 1 : 0);
});

// --- Actions ---
const loadPatientData = async () => {
  loading.value = true;
  try {
    const res = await axios.get('https://emr-backend-api-8euv.onrender.com/api/patients/registry');
    patientData.value = Array.isArray(res.data) ? res.data : (res.data.result || []);
  } catch (error) {
    $q.notify({ type: 'negative', message: 'โหลดข้อมูลไม่สำเร็จ' });
  } finally {
    setTimeout(() => { loading.value = false; }, 800);
  }
};

const clearFilters = () => { searchQuery.value = ''; selectedSex.value = null; statusFilter.value = 'all'; };
const goToPatientRecord = (patient) => router.push({ name: 'PatientRecords', params: { id: patient.id } });
const addPatient = () => router.push({ name: 'AddPatient' });
const editPatient = (p) => router.push({ name: 'AddPatient', query: { id: p.id } });
const deletePatient = (p) => {
    $q.dialog({ title: 'ยืนยันลบ', message: `ลบข้อมูล ${p.first_name}?`, cancel: true, persistent: true, dark: true }).onOk(async () => {
        await axios.delete(`https://emr-backend-api-8euv.onrender.com/api/patients/${p.id}`);
        loadPatientData();
        $q.notify({ type: 'positive', message: 'ลบเรียบร้อย' });
    });
};

watch([searchQuery, statusFilter], () => currentPage.value = 1);
onMounted(() => {
    loadPatientData();

    // เช็กว่าเคยเห็นไกด์หน้านี้หรือยัง
    const hasSeenGuide = localStorage.getItem('hasSeenPatientGuide');
    if (!hasSeenGuide) {
        // หน่วงเวลา 1.2 วินาที รอให้ Loading หน้าเว็บหมุนเสร็จก่อนค่อยเด้งไกด์
        setTimeout(() => {
            showGuideModal.value = true;
        }, 1200);
    }
});
</script>

<style lang="scss" scoped>
@import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@300;400;600;700&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@700&display=swap');

/* --- Theme Variables & Mixins --- */
$dark-bg: #0f172a;
$glass-bg: rgba(30, 41, 59, 0.7);
$glass-border: 1px solid rgba(255, 255, 255, 0.08);
$accent-color: #22d3ee;

.dashboard-background {
  background-color: $dark-bg;
  font-family: 'Sarabun', sans-serif;
  color: #e2e8f0;
  min-height: 100vh;
  position: relative;
  overflow-x: hidden;
  &::before {
    content: ''; position: absolute; top: -20%; left: -10%; width: 50%; height: 50%;
    background: radial-gradient(circle, rgba(34, 211, 238, 0.15) 0%, transparent 60%);
    filter: blur(80px); pointer-events: none;
  }
}

.content-container { position: relative; z-index: 2; }

/* --- Components Styling --- */
.glass-panel {
  background: $glass-bg;
  backdrop-filter: blur(12px);
  border: $glass-border;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* 🔥 FIX: เปลี่ยนชื่อ class และลบ shadow ออก */
.icon-box-flat {
  width: 48px; height: 48px;
  background: linear-gradient(135deg, $accent-color, #0ea5e9);
  border-radius: 12px;
  display: flex; align-items: center; justify-content: center;
  box-shadow: none; /* ลบเงา */
}

/* 🔥 FIX: เปลี่ยนชื่อ class และลบ shadow ออก */
.action-btn-flat {
  background: linear-gradient(135deg, #22d3ee 0%, #0ea5e9 100%);
  color: white; font-weight: 600;
  box-shadow: none; /* ลบเงา */
  transition: transform 0.2s;
  &:hover { transform: translateY(-2px); box-shadow: none; }
}

.search-input {
  width: 250px;
  :deep(.q-field__control) { background: rgba(0,0,0,0.3) !important; border-radius: 50px; border: 1px solid rgba(255,255,255,0.1); }
  :deep(.q-field__control:hover) { border-color: $accent-color; }
}

/* --- Patient Card Styling --- */
.patient-card {
  height: 100%; cursor: pointer;
  display: flex; flex-direction: column;
  border-left: 3px solid transparent;
  &:hover {
    border-left-color: $accent-color;
    transform: translateY(-5px) scale(1.01);
    box-shadow: 0 15px 40px rgba(0,0,0,0.4);
    .zoom-overlay { opacity: 1; }
  }
}

.card-content { padding: 20px; }

/* Avatar Zoom Effect */
.avatar-container-outer { position: relative; display: inline-block; }
.avatar-wrapper { position: relative; cursor: pointer; border-radius: 50%; overflow: hidden; width: 64px; height: 64px; }
.avatar-img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.5s; }
.zoom-overlay {
  position: absolute; top: 0; left: 0; width: 100%; height: 100%;
  background: rgba(0,0,0,0.5);
  display: flex; align-items: center; justify-content: center;
  opacity: 0; transition: opacity 0.3s; border-radius: 50%;
}
.avatar-wrapper:hover .avatar-img { transform: scale(1.1); }
.new-badge-absolute { font-size: 10px; padding: 2px 6px; border: 1px solid rgba(255,255,255,0.2); }

/* --- LIST VIEW STYLING --- */
.list-view-container { margin-top: 10px; }
.list-header { border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 10px; margin-bottom: 10px; opacity: 0.7; }

.list-row {
  transition: all 0.2s ease-in-out;
  border: 1px solid transparent;
  &:hover {
    background: rgba(255,255,255,0.08);
    border-color: rgba(34, 211, 238, 0.3);
    transform: translateX(5px);
    box-shadow: 0 4px 15px rgba(0,0,0,0.3);
  }
}

.avatar-wrapper-mini { position: relative; cursor: zoom-in; transition: transform 0.2s; &:hover { transform: scale(1.15); z-index: 10; } }
.mini-new-badge { font-size: 8px; padding: 2px 4px; top: 0; right: -5px; }
.hover-icon { transition: color 0.2s; &:hover { color: #fff !important; } }
.hover-icon-red { transition: color 0.2s; &:hover { color: #ef4444 !important; } }
.glass-chip { background: rgba(255,255,255,0.1); backdrop-filter: blur(4px); border: 1px solid rgba(255,255,255,0.1); }

/* --- Loading --- */
.loading-overlay { position: fixed; inset: 0; background: $dark-bg; z-index: 9999; display: flex; flex-direction: column; align-items: center; justify-content: center; }
.loading-spinner { width: 50px; height: 50px; border: 3px solid rgba(34, 211, 238, 0.3); border-top-color: $accent-color; border-radius: 50%; animation: spin 1s linear infinite; }
.loading-text { font-family: 'Sarabun'; letter-spacing: 1px; color: $accent-color; animation: pulse 1.5s infinite; }

@keyframes spin { to { transform: rotate(360deg); } }
@keyframes pulse { 50% { opacity: 0.5; } }
@keyframes fadeInSlideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }

.list-item-animation {
  opacity: 0;
  animation: fadeInSlideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

.text-shadow { text-shadow: 0 2px 10px rgba(0,0,0,0.8); }
.opacity-20 { opacity: 0.2; }
</style>
