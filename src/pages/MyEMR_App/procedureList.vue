<template>
  <q-page padding class="dashboard-background">
    <div class="q-pa-md content-container">

      <div class="header-section glass-panel q-pa-md q-mb-lg row items-center justify-between list-item-animation" style="animation-delay: 0.1s;">
        <div class="row items-center no-wrap">
          <div class="icon-box-flat q-mr-md">
            <q-icon name="medical_services" size="32px" color="white" />
          </div>
          <div>
            <div class="text-h5 text-weight-bold text-white header-title">รายการผู้ป่วย (Doctor Queue)</div>
            <div class="text-caption text-cyan-3">ห้องตรวจแพทย์ - รายชื่อรอตรวจ</div>
          </div>
        </div>
        <q-btn flat no-caps class="text-grey-4 hover-text-cyan" @click="() => { toggleHistory(); playClickSound(); }">
           <q-icon name="history" size="sm" class="q-mr-sm" />
           ประวัติการตรวจ
        </q-btn>
      </div>

      <q-card class="glass-panel q-mb-lg list-item-animation" style="animation-delay: 0.2s;">
        <q-card-section>
          <div class="row items-center q-col-gutter-md">

            <div class="col-xs-12 col-sm">
                <q-select
                    dark dense outlined
                    v-model="selectedDate"
                    :options="dateOptions"
                    label="เลือกวันที่"
                    emit-value map-options
                    class="flat-input"
                    @popup-show="playFormFocusSound"
                    @update:model-value="handleDateSelect"
                >
                    <template v-slot:selected>
                        <div class="row items-center">
                            <q-icon name="event" class="q-mr-xs text-cyan-3"/>
                            {{ selectedDateLabel }}
                        </div>
                    </template>
                    <template v-slot:option="scope">
                        <q-item v-bind="scope.itemProps" class="list-row-hover">
                            <template v-if="scope.opt.value !== 'custom'">
                                <q-item-section avatar>
                                    <div :class="['status-dot', scope.opt.hasData ? 'bg-green-4' : 'bg-grey-7']"></div>
                                </q-item-section>
                                <q-item-section>
                                    <q-item-label class="text-white">{{ scope.opt.label }}</q-item-label>
                                    <q-item-label caption class="text-grey-5">{{ scope.opt.subLabel }}</q-item-label>
                                </q-item-section>
                                <q-item-section side v-if="scope.opt.hasData">
                                    <q-badge color="cyan-9" text-color="cyan-2" rounded label="มีคิว" />
                                </q-item-section>
                            </template>
                            <template v-else>
                                <q-item-section avatar><q-icon name="edit_calendar" color="cyan-3" /></q-item-section>
                                <q-item-section><q-item-label class="text-cyan-3 text-weight-bold">เลือกวันที่อื่น / ปฏิทิน</q-item-label></q-item-section>
                            </template>
                        </q-item>
                    </template>
                </q-select>
            </div>

            <div class="col-xs-12 col-sm">
              <q-input
                dark dense outlined
                v-model="searchQuery"
                placeholder="ค้นหาชื่อ, HN..."
                clearable
                class="flat-input"
                @clear="playRemoveSound"
                @focus="playFormFocusSound"
              >
                <template v-slot:prepend> <q-icon name="search" /> </template>
              </q-input>
            </div>

            <div class="col-xs-12 col-sm-auto">
              <div class="row items-center q-gutter-md no-wrap">
                <q-select
                  dark dense outlined
                  v-model="activeSortOption"
                  :options="sortOptions"
                  label="เรียงตาม"
                  emit-value map-options
                  class="flat-input"
                  style="min-width: 180px;"
                  @popup-show="playFormFocusSound"
                  @update:model-value="playClickSound"
                />
                <q-btn-toggle
                  v-model="viewMode"
                  unelevated rounded
                  class="glass-toggle"
                  text-color="grey-5"
                  toggle-color="cyan-4"
                  toggle-text-color="black"
                  :options="[{icon: 'view_list', value: 'table'}, {icon: 'grid_view', value: 'cards'}]"
                  @update:model-value="playClickSound"
                />
              </div>
            </div>
          </div>
        </q-card-section>

        <q-separator dark class="opacity-20" />

        <q-card-section>
            <div class="row items-center q-gutter-x-md q-gutter-y-sm">
                <div class="text-caption text-grey-4 q-mr-sm text-weight-medium">สถานะ:</div>
                <q-btn
                  v-for="option in statusFilterOptions"
                  :key="option.value || 'all'"
                  :label="`${option.label} (${option.count})`"
                  @click="() => { statusFilter = option.value; playClickSound(); }"
                  :class="['status-filter-btn', {'is-active': statusFilter === option.value}]"
                  unelevated no-caps rounded
                />
            </div>
        </q-card-section>
      </q-card>

      <q-inner-loading :showing="loading" dark label="กำลังโหลดคิวตรวจ..." label-class="text-cyan-3">
        <q-spinner-dots color="cyan-3" size="50px" />
      </q-inner-loading>

      <div v-if="!loading && groupedPatients.length > 0">

        <div v-if="viewMode === 'cards'" :key="`cards-${statusFilter}-${searchQuery}`" class="row q-col-gutter-lg items-stretch">
          <div v-for="(patient, index) in paginatedPatients" :key="`card-${patient.patientId}`" class="col-12 col-md-6 col-lg-4 list-item-animation" :style="{'animation-delay': `${index * 0.05}s`}">

            <q-card
              :class="['patient-card glass-panel', getStatusCardClass(patient.status)]"
              @click="() => { openVisitSelector(patient); playClickSound(); }"
            >
              <q-item class="q-pa-md">
                <q-item-section avatar>
                  <div class="avatar-wrapper" @click.stop="openImagePreview(patient.avatarUrl)">
                    <q-avatar size="64px" class="shadow-2">
                        <img v-if="patient.avatarUrl" :src="patient.avatarUrl" style="object-fit: cover;">
                        <q-icon v-else name="person" color="grey-4" class="bg-grey-9" />
                        <q-badge v-if="patient.visits.length > 1" color="orange-7" rounded floating class="shadow-1">{{ patient.visits.length }}</q-badge>
                    </q-avatar>
                    <div class="zoom-overlay"><q-icon name="zoom_in" color="white" size="24px"/></div>
                  </div>
                </q-item-section>
                <q-item-section>
                  <q-item-label class="text-weight-bold text-h6 ellipsis text-white">{{ patient.patientName }}</q-item-label>
                  <q-item-label caption class="text-cyan-3">ID: {{ patient.patientId }}</q-item-label>
                </q-item-section>
                <q-item-section side>
                    <q-chip :class="getStatusChipClass(patient.status)" size="sm" class="glass-chip">{{ translateStatusToThai(patient.status) }}</q-chip>
                </q-item-section>
              </q-item>

              <q-separator dark class="opacity-20" />

              <q-card-section class="col q-pt-sm q-pb-md">
                <div class="row items-start no-wrap q-mb-md">
                  <q-icon name="sick" size="xs" color="grey-5" class="q-mt-xs q-mr-sm" />
                  <div>
                    <div class="text-grey-6 text-caption">อาการสำคัญ</div>
                    <div class="text-body2 text-grey-3 ellipsis-2-lines">{{ patient.chiefComplaint }}</div>
                  </div>
                </div>
                <div class="row items-center no-wrap">
                  <q-icon name="schedule" size="xs" color="grey-5" class="q-mr-sm" />
                  <div>
                    <div class="text-grey-6 text-caption">เวลาส่งตัว</div>
                    <div class="text-body2 text-grey-3">{{ patient.arrivalTime }}</div>
                  </div>
                </div>
                <div class="row q-mt-sm q-gutter-x-sm" v-if="patient.visits[0]">
                    <q-badge color="orange-9" text-color="white" v-if="patient.visits[0].temperature">
                        <q-icon name="thermostat" class="q-mr-xs"/>{{ patient.visits[0].temperature }}
                    </q-badge>
                    <q-badge color="red-9" text-color="white" v-if="patient.visits[0].bp">
                        <q-icon name="speed" class="q-mr-xs"/>{{ patient.visits[0].bp }}
                    </q-badge>
                </div>
              </q-card-section>

              </q-card>
          </div>
        </div>

        <div v-else-if="viewMode === 'table'" class="list-view-container list-item-animation" style="animation-delay: 0.1s;">
           <div class="row q-px-md q-py-sm text-grey-5 text-uppercase text-caption text-weight-bold list-header">
            <div class="col-1 text-center">#</div>
            <div class="col-3">ผู้ป่วย</div>
            <div class="col-4">อาการ / สัญญาณชีพ</div>
            <div class="col-2 text-center">เวลา</div>
            <div class="col-2 text-center">สถานะ</div>
          </div>

          <div
            v-for="(patient, index) in paginatedPatients"
            :key="patient.patientId"
            class="list-row glass-panel q-mb-sm cursor-pointer list-item-animation"
            :style="{ animationDelay: `${index * 0.03}s` }"
            @click="openVisitSelector(patient)"
          >
              <div class="row items-center q-pa-md">
                <div class="col-1 text-center text-cyan-5">{{ index + 1 }}</div>
                <div class="col-3 row items-center no-wrap">
                  <div class="avatar-wrapper-mini q-mr-md" @click.stop="openImagePreview(patient.avatarUrl)">
                    <q-avatar size="44px" class="shadow-1 bg-dark">
                      <img v-if="patient.avatarUrl" :src="patient.avatarUrl">
                      <q-icon v-else name="person" class="text-grey-4" />
                       <q-badge v-if="patient.visits.length > 1" color="orange-8" :label="patient.visits.length" floating rounded class="mini-badge" />
                    </q-avatar>
                  </div>
                  <div>
                    <div class="text-body1 text-white text-weight-bold ellipsis">{{ patient.patientName }}</div>
                    <div class="text-caption text-cyan-3">HN: {{ patient.patientId }}</div>
                  </div>
                </div>
                <div class="col-4">
                   <div class="row items-start no-wrap">
                      <div class="ellipsis text-white text-body2">{{ patient.chiefComplaint }}</div>
                   </div>
                   <div class="row q-gutter-x-sm text-caption text-grey-5 q-mt-xs" v-if="patient.visits[0]">
                       <span v-if="patient.visits[0].temperature">T: {{patient.visits[0].temperature}}</span>
                       <span v-if="patient.visits[0].bp">BP: {{patient.visits[0].bp}}</span>
                   </div>
                </div>
                <div class="col-2 text-center">
                   <div class="text-grey-4 text-weight-medium">
                      {{ patient.arrivalTime }}
                   </div>
                </div>
                <div class="col-2 text-center">
                   <q-chip :class="getStatusChipClass(patient.status)" size="sm" class="glass-chip">{{ translateStatusToThai(patient.status) }}</q-chip>
                </div>
             </div>
          </div>
        </div>

      </div>

      <div v-else-if="!loading && paginatedPatients.length === 0" class="list-item-animation flex flex-center column q-pa-xl text-grey-5">
        <q-icon name="assignment_turned_in" size="80px" class="opacity-30 q-mb-md" />
        <div class="text-h6 opacity-80">ไม่มีคิวตรวจในช่วงเวลานี้</div>
        <div class="text-caption opacity-60">สำหรับวันที่ {{ selectedDateLabel }}</div>
        <q-btn flat color="cyan-3" class="q-mt-lg" label="รีเฟรช" icon="refresh" @click="() => { manualRefresh(); playClickSound(); }" />
      </div>

      <div v-if="maxPages > 1" class="row justify-center q-mt-lg list-item-animation" style="animation-delay: 0.4s;">
        <q-pagination v-model="currentPage" :max="maxPages" direction-links color="cyan-3" active-color="cyan-6" active-text-color="white" class="glass-pagination" @update:model-value="playClickSound" />
      </div>

    </div>

    <q-dialog v-model="showVisitSelector" persistent backdrop-filter="blur(4px)" transition-show="scale" transition-hide="scale">
      <q-card class="glass-panel dialog-card" style="width: 500px;">
        <div class="dialog-header row items-center justify-between q-pa-md bg-white-05">
          <div class="text-subtitle1 text-white text-weight-bold"><q-icon name="list_alt" class="q-mr-sm text-cyan-3"/>เลือกรายการ: {{ selectedPatientForDialog?.patientName }}</div>
          <q-btn dense flat round icon="close" v-close-popup color="grey-5" />
        </div>
        <q-card-section class="q-pa-none">
          <q-list separator dark>
            <q-item v-for="visit in selectedPatientForDialog?.visits" :key="visit.visit_id" clickable v-ripple @click="goToDiagnosis(visit)" v-close-popup class="visit-item">
              <q-item-section avatar>
                <q-avatar color="cyan-9" text-color="cyan-1" size="md">{{ visit.daily_visit_number || 'Q' }}</q-avatar>
              </q-item-section>
              <q-item-section>
                <q-item-label class="text-white">เวลา {{ formatTime(visit.visit_datetime) }} น.</q-item-label>
                <q-item-label caption class="text-grey-5">T: {{ visit.vitalSign?.temperature || '-' }}°C, BP: {{ visit.bp || '-' }}</q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-chip :class="getStatusChipClass(visit.status)" size="sm" class="glass-chip">
                  {{ translateStatusToThai(visit.status) }}
                </q-chip>
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>
      </q-card>
    </q-dialog>

    <q-dialog v-model="showCalendarDialog" backdrop-filter="blur(4px)">
        <q-card class="glass-panel">
            <q-date
                v-model="tempSelectedDate"
                mask="YYYY-MM-DD"
                color="cyan-6"
                dark
                class="no-shadow bg-transparent"
                :events="checkCalendarEvent"
                event-color="green-4"
            />
            <div class="row justify-end q-pa-sm">
                <q-btn flat label="ยกเลิก" color="grey-4" v-close-popup />
                <q-btn flat label="ตกลง" color="cyan-3" text-color="black" class="bg-cyan-3" @click="confirmCalendarDate" />
            </div>
        </q-card>
    </q-dialog>

    <q-dialog v-model="showImageDialog" backdrop-filter="blur(10px)">
      <div class="relative-position shadow-24" style="border-radius: 12px; overflow: hidden; max-width: 90vw; max-height: 90vh;">
         <img :src="previewImageUrl" style="display: block; max-width: 100%; max-height: 85vh; object-fit: contain;">
         <div class="absolute-top-right q-ma-sm">
            <q-btn round dense color="black" text-color="white" icon="close" v-close-popup class="glass-btn" />
         </div>
      </div>
    </q-dialog>
    <!-- 👇👇👇 1. วางโค้ด Guide Modal ตรงนี้ 👇👇👇 -->
    <q-dialog v-model="showGuideModal" persistent backdrop-filter="blur(4px)">
      <q-card class="bg-dark text-white" style="width: 420px; max-width: 90vw; border: 1px solid rgba(34, 211, 238, 0.4); border-radius: 12px; box-shadow: 0 0 15px rgba(34, 211, 238, 0.2); overflow: hidden;">

        <!-- Header สไตล์เกม -->
        <q-card-section class="row items-center q-pb-sm bg-blue-grey-10" style="border-bottom: 1px solid rgba(255,255,255,0.05);">
          <div class="text-h6 text-cyan-3 font-weight-bold row items-center" style="font-family: 'Cinzel', serif; letter-spacing: 1px;">
            <q-icon name="sports_esports" size="sm" class="q-mr-sm" />
            SYSTEM GUIDE
          </div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup @click="markGuideAsSeen" color="grey-5" class="hover-icon-red" />
        </q-card-section>

        <!-- Content แบบสั้นๆ -->
        <q-card-section class="q-pa-lg">

          <!-- System Notice -->
          <div class="q-mb-lg q-pa-sm text-center text-cyan-2 rounded-borders text-caption" style="background: rgba(34, 211, 238, 0.05); border: 1px dashed rgba(34, 211, 238, 0.3); letter-spacing: 0.5px;">
            <q-icon name="lightbulb" class="q-mr-xs" size="xs" />
            แดชบอร์ดแพทย์: จัดการคิวที่พยาบาลส่งต่อมา (State Machine)
          </div>

          <!-- Checklist -->
          <div class="q-gutter-y-md text-body1 text-grey-3">
            <div class="row items-start">
              <q-icon name="event_available" color="orange-4" size="sm" class="q-mr-md q-mt-xs"/>
              <div>
                <span class="text-white">ทดสอบ <b>Smart Dropdown</b> เลือกวันที่</span><br>
                <span class="text-caption text-grey-5">(ระบบจะขึ้นจุดสีเขียว ถ้าวันนั้นมีคิวตรวจ)</span>
              </div>
            </div>

            <div class="row items-center">
              <q-icon name="filter_list" color="pink-4" size="sm" class="q-mr-md"/>
              <div><span class="text-white">คลิกปุ่มสถานะด้านบน เพื่อ <b>กรองคิวผู้ป่วย</b></span></div>
            </div>

            <div class="row items-center">
              <q-icon name="touch_app" color="primary" size="sm" class="q-mr-md"/>
              <div><span class="text-white"><b>คลิกที่การ์ดผู้ป่วย</b> เพื่อเข้าสู่หน้าตรวจวินิจฉัย</span></div>
            </div>
          </div>
        </q-card-section>

        <!-- Footer -->
        <q-card-actions align="center" class="q-pa-md bg-blue-grey-10" style="border-top: 1px solid rgba(255,255,255,0.05);">
          <q-btn
            unelevated
            class="full-width text-weight-bold"
            color="cyan-6"
            text-color="black"
            label="START TESTING"
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
import { ref, computed, watch, onMounted, nextTick } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useQuasar, date } from 'quasar';
import axios from 'axios';
import { useAuthStore } from 'src/store/auth'; // 🔥 Import Store เพื่อเอา ID หมอ

// --- Setup & Refs ---
const router = useRouter();
const route = useRoute();
const $q = useQuasar();
const authStore = useAuthStore(); // 🔥 เรียกใช้ Store

const loading = ref(true);
const viewMode = ref('cards');
const patientQueue = ref([]);

// Filters & State
const searchQuery = ref('');
const statusFilter = ref(null);
const currentPage = ref(1);
const rowsPerPage = ref(9);
const activeSortOption = ref('time_asc'); // หมอควรเห็นคิวแรกๆ ก่อน

// --- Date & Calendar State ---
const selectedDate = ref(null);
const dateOptions = ref([]);
const showCalendarDialog = ref(false);
const tempSelectedDate = ref(null);
const activeDatesSet = ref(new Set());

// Dialog Refs
const showVisitSelector = ref(false);
const selectedPatientForDialog = ref(null);
const showImageDialog = ref(false);
const previewImageUrl = ref('');

// 👇👇👇 2. วางตัวแปรควบคุม Guide ตรงนี้ 👇👇👇
const showGuideModal = ref(false);
const markGuideAsSeen = () => {
    localStorage.setItem('hasSeenDoctorQueueGuide', 'true');
    showGuideModal.value = false;
    playClickSound(); // ถ้ามีฟังก์ชันเสียงก็เรียกใช้ได้เลย
};
// 👆👆👆 สิ้นสุดตัวแปร Guide 👆👆👆

// --- Options & Locale ---
const sortOptions = ref([
  { label: 'เวลาล่าสุด -> เก่าสุด', value: 'time_desc' },
  { label: 'เวลาเก่าสุด -> ล่าสุด', value: 'time_asc' },
  { label: 'ชื่อ ก -> ฮ', value: 'name_asc' },
]);

const statusOptions = ref([
  { label: 'ทั้งหมด', value: null },
  { label: 'รอตรวจ', value: 'รอพบแพทย์' },
  { label: 'กำลังตรวจ', value: 'กำลังรักษา' },
  { label: 'ตรวจเสร็จ', value: 'รักษาเสร็จสิ้น' },
]);

const thaiDateLocale = {
  days: 'อาทิตย์_จันทร์_อังคาร_พุธ_พฤหัสบดี_ศุกร์_เสาร์'.split('_'),
  daysShort: 'อา._จ._อ._พ._พฤ._ศ._ส.'.split('_'),
  months: 'มกราคม_กุมภาพันธ์_มีนาคม_เมษายน_พฤษภาคม_มิถุนายน_กรกฎาคม_สิงหาคม_กันยายน_ตุลาคม_พฤศจิกายน_ธันวาคม'.split('_'),
  monthsShort: 'ม.ค._ก.พ._มี.ค._เม.ย._พ.ค._มิ.ย._ก.ค._ส.ค._ก.ย._ต.ค._พ.ย._ธ.ค.'.split('_')
};

// --- Sound System (Placeholder) ---
const playClickSound = () => {};
const playRemoveSound = () => {};
const playFormFocusSound = () => {};

// --- Helper Functions ---
const translateStatusToThai = (s) => {
    // 1. กลุ่มรอตรวจ
    if(s === 'waiting_for_doctor' || s === 'รอพบแพทย์') return 'รอตรวจ';

    // 2. กลุ่มกำลังตรวจ
    if(s === 'in_progress' || s === 'กำลังรักษา') return 'กำลังตรวจ';

    // 3. 🔥 เหมาเข่ง! อะไรที่ไม่ใช่ 2 อันบน ให้แสดงว่า "ตรวจเสร็จ" ทั้งหมด
    return 'ตรวจเสร็จ';
};

const formatTime = (isoString) => {
    if (!isoString) return '-';
    return new Date(isoString).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });
}

const getStatusCardClass = (status) => {
  if (status === 'waiting_for_doctor' || status === 'รอพบแพทย์') return 'card-status-waiting';
  if (status === 'in_progress' || status === 'กำลังรักษา') return 'card-status-treating';

  // ✅ อะไรที่เหลือให้เป็นการ์ดสีเขียว
  return 'card-status-completed';
};

const getStatusChipClass = (status) => {
  const base = 'glass-chip';
  if (status === 'waiting_for_doctor' || status === 'รอพบแพทย์') return `${base} text-orange-4`;
  if (status === 'in_progress' || status === 'กำลังรักษา') return `${base} text-blue-4`;

  // ✅ อะไรที่เหลือให้เป็นสีเขียว (ตรวจเสร็จ)
  return `${base} text-green-4`;
};

const openImagePreview = (url) => {
    if (url) {
        previewImageUrl.value = url;
        showImageDialog.value = true;
    }
};

// --- Data Fetching Logic ---

// 🔥 Function: ดึงวันที่ที่มีคิว (ฉบับแก้บั๊ก Admin)
const fetchActiveDates = async () => {
    try {
        const params = {};

        // 🔥 แก้ตรงนี้: ดึง Role จาก user ด้วย
        const rawRole = authStore.role || authStore.user?.role;
        const userRole = rawRole ? rawRole.toLowerCase() : '';

        console.log(`🧐 Debug ActiveDates | Raw: "${rawRole}" | Lower: "${userRole}"`);

        // เช็คเงื่อนไข
        if (userRole !== 'admin') {
            console.log('🔒 Not Admin -> Filter by ID:', authStore.userId);
            params.doctor_id = authStore.userId;
        } else {
            console.log('🔓 Is Admin -> Show All Dates');
        }

        const res = await axios.get('https://emr-backend-api-8euv.onrender.com/api/doctors/active-dates', {
            params
        });

        if (Array.isArray(res.data)) {
            activeDatesSet.value = new Set(res.data.map(d => date.formatDate(d, 'YYYY-MM-DD')));
        }
    } catch (error) {
        console.warn('Error fetching active dates:', error);
    }
};

const checkCalendarEvent = (dateStr) => {
    const formatted = dateStr.replace(/\//g, '-');
    return activeDatesSet.value.has(formatted);
};

const generateDateOptions = () => {
    const opts = [];
    const today = new Date();
    for (let i = 0; i < 7; i++) {
        const d = date.subtractFromDate(today, { days: i });
        const dateVal = date.formatDate(d, 'YYYY-MM-DD');
        const isRealData = activeDatesSet.value.has(dateVal);
        let labelText = date.formatDate(d, 'D MMM YYYY', thaiDateLocale);
        if (i === 0) labelText += ' (วันนี้)';
        else if (i === 1) labelText += ' (เมื่อวาน)';

        opts.push({
            label: labelText,
            subLabel: isRealData ? 'มีคิวตรวจ' : 'ไม่มีคิวตรวจ',
            value: dateVal,
            hasData: isRealData
        });
    }
    opts.push({ label: 'เลือกวันที่อื่น...', value: 'custom', hasData: false });
    dateOptions.value = opts;
};

const handleDateSelect = (val) => {
    if (val === 'custom') {
        tempSelectedDate.value = selectedDate.value !== 'all' ? selectedDate.value : date.formatDate(new Date(), 'YYYY-MM-DD');
        showCalendarDialog.value = true;
        nextTick(() => { /* Trick UI */ });
    } else {
        manualRefresh();
    }
};

const confirmCalendarDate = () => {
    if (!tempSelectedDate.value) return;
    selectedDate.value = tempSelectedDate.value;
    showCalendarDialog.value = false;
    const exists = dateOptions.value.find(o => o.value === selectedDate.value);
    if (!exists) {
        const d = new Date(selectedDate.value);
        const isRealData = activeDatesSet.value.has(selectedDate.value);
        dateOptions.value.unshift({
            label: date.formatDate(d, 'D MMM YYYY', thaiDateLocale) + ' (เลือกเอง)',
            subLabel: 'จากการเลือกปฏิทิน',
            value: selectedDate.value,
            hasData: isRealData
        });
    }
    manualRefresh();
};

const selectedDateLabel = computed(() => {
    if (!selectedDate.value || selectedDate.value === 'all') return 'วันนี้ (หรือเลือกวัน)';
    if (selectedDate.value === 'custom') return 'เลือกวันที่...';
    const d = new Date(selectedDate.value);
    if (isNaN(d.getTime())) return selectedDate.value;
    return date.formatDate(d, 'D MMM YYYY', thaiDateLocale);
});

// 🔥 Function หลัก: ดึงคิวหมอ
const fetchDoctorQueue = async (isBackground = false) => {
  if (!selectedDate.value || selectedDate.value === 'custom') return;
  if (!isBackground) loading.value = true;

  try {
    const params = {};
    if (selectedDate.value && selectedDate.value !== 'all') {
        params.date = selectedDate.value;
    }

    // 1. Logic ดึง Role
    const rawRole = authStore.role || authStore.user?.role;
    const userRole = rawRole ? rawRole.toLowerCase() : '';
    console.log(`🧐 Debug Queue | Checking Role: "${userRole}"`);

    if (userRole !== 'admin') {
        params.doctor_id = authStore.userId;
    } else {
        console.log('🔓 Queue Filter: Admin Mode (Show All)');
    }

    const response = await axios.get('https://emr-backend-api-8euv.onrender.com/api/doctors/patient-queue', { params });

    if (!response.data || !Array.isArray(response.data)) {
        patientQueue.value = [];
        return;
    }

    // =========================================================
    // 🟢 FIX: บังคับอัปเดตปฏิทิน + รีเฟรช Dropdown
    // =========================================================
    if (response.data.length > 0 && selectedDate.value !== 'all') {
        const currentStr = selectedDate.value;
        if (!activeDatesSet.value.has(currentStr)) {
            console.log(`🟢 Force adding active date: ${currentStr}`);
            const newSet = new Set(activeDatesSet.value);
            newSet.add(currentStr);
            activeDatesSet.value = newSet;
            generateDateOptions();
        }
    }
    // =========================================================

    patientQueue.value = response.data.map(raw => {
        let symptomsList = '';
        if (Array.isArray(raw.symptoms)) {
             symptomsList = raw.symptoms.map(s => s.symptom?.symptom_name || s.symptom_name).filter(Boolean).join(', ');
        }
        const cc = symptomsList || raw.chief_complaint || raw.notes || '-';

        let rawAvatarPath = raw.avatar_url;
        let avatarUrl = null;
        if (rawAvatarPath) {
            let cleanPath = rawAvatarPath.replace(/\\/g, '/');
            if (!cleanPath.startsWith('/') && !cleanPath.startsWith('http')) cleanPath = '/' + cleanPath;
            avatarUrl = cleanPath.startsWith('http') ? cleanPath : `https://emr-backend-api-8euv.onrender.com${cleanPath}`;
             avatarUrl += `?t=${Date.now()}`;
        }

        const visitDate = new Date(raw.visit_datetime);
        const displayTime = selectedDate.value === 'all'
            ? visitDate.toLocaleString('th-TH', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
            : visitDate.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });

        return {
            ...raw,
            id: raw.visit_id,
            visit_id: raw.visit_id,
            patientName: raw.name || 'ไม่ระบุชื่อ',
            patientId: raw.patient_id_string || raw.patient_id || 'N/A',
            arrivalTime: displayTime,
            originalTime: raw.visit_datetime,
            chiefComplaint: cc,
            avatarUrl: avatarUrl,
            status: raw.status,
            age: raw.age || '-',
            temperature: raw.temperature || (raw.vitalSign?.temperature),
            pulse: raw.pulse || (raw.vitalSign?.pulse),
            bp: raw.bp || (raw.vitalSign ? `${raw.vitalSign.blood_pressure_systolic}/${raw.vitalSign.blood_pressure_diastolic}` : null)
        };
    });

   const totalVisits = response.data.length;
    const totalUniquePatients = groupedPatients.value.length;

    console.log(`✅ Updated frontend: Found ${totalUniquePatients} patients (Total ${totalVisits} visits).`);
  } catch (error) {
    console.error('Error fetching queue:', error);
  } finally {
    if (!isBackground) loading.value = false;
  }
};

const manualRefresh = () => {
    fetchDoctorQueue(false);
}

// --- Computed & Watchers ---

const groupedPatients = computed(() => {
    const groups = {};
    patientQueue.value.forEach(visit => {
        const pid = visit.patientId;
        if (!groups[pid]) {
            groups[pid] = { ...visit, visits: [] };
        }
        groups[pid].visits.push(visit);
    });

    let result = Object.values(groups);

    // 🔥 แก้ Logic การกรอง: เหมาเข่ง "ตรวจเสร็จ"
    if (statusFilter.value) {
        result = result.filter(p => p.visits.some(v => {
            const s = v.status;

            // 1. ถ้าเลือกดู "รอตรวจ"
            if (statusFilter.value === 'รอพบแพทย์') {
                return s === 'waiting_for_doctor' || s === 'รอพบแพทย์';
            }

            // 2. ถ้าเลือกดู "กำลังตรวจ"
            if (statusFilter.value === 'กำลังรักษา') {
                return s === 'in_progress' || s === 'กำลังรักษา';
            }

            // 3. 🔥 ถ้าเลือกดู "ตรวจเสร็จ" (completed)
            // ให้เอา "ทุกอย่าง" ที่ "ไม่ใช่" รอตรวจ และ "ไม่ใช่" กำลังตรวจ
            if (statusFilter.value === 'รักษาเสร็จสิ้น') {
                return s !== 'waiting_for_doctor' && s !== 'รอพบแพทย์' &&
                       s !== 'in_progress' && s !== 'กำลังรักษา';
            }

            return false;
        }));
    }

    if (searchQuery.value) {
        const q = searchQuery.value.toLowerCase();
        result = result.filter(p => p.patientName.toLowerCase().includes(q) || String(p.patientId).toLowerCase().includes(q));
    }

    result.sort((a, b) => {
        if (activeSortOption.value === 'time_desc') return new Date(b.originalTime) - new Date(a.originalTime);
        if (activeSortOption.value === 'time_asc') return new Date(a.originalTime) - new Date(b.originalTime);
        if (activeSortOption.value === 'name_asc') return a.patientName.localeCompare(b.patientName);
        return 0;
    });
    return result;
});

const maxPages = computed(() => Math.ceil(groupedPatients.value.length / rowsPerPage.value));
const paginatedPatients = computed(() => {
    const start = (currentPage.value - 1) * rowsPerPage.value;
    return groupedPatients.value.slice(start, start + rowsPerPage.value);
});

// 🔥 แก้การนับจำนวนปุ่ม Filter ให้สอดคล้องกับ Logic เหมาเข่ง
const statusFilterOptions = computed(() => {
    const counts = { 'รอพบแพทย์': 0, 'กำลังรักษา': 0, 'รักษาเสร็จสิ้น': 0 };

    // ใช้ patientQueue ตัวเต็มมานับ
    patientQueue.value.forEach(p => {
        const s = p.status;
        if (s === 'waiting_for_doctor' || s === 'รอพบแพทย์') {
            counts['รอพบแพทย์']++;
        } else if (s === 'in_progress' || s === 'กำลังรักษา') {
            counts['กำลังรักษา']++;
        } else {
            // 🔥 นับเข้ากอง "ตรวจเสร็จ" ทั้งหมด
            counts['รักษาเสร็จสิ้น']++;
        }
    });

    return statusOptions.value.map(opt => ({
        ...opt,
        count: opt.value === null
            ? groupedPatients.value.length
            : (counts[opt.value] || 0)
    }));
});

watch([searchQuery, statusFilter], () => { currentPage.value = 1; });

// --- Navigation ---

const openVisitSelector = (patientGroup) => {
    if (patientGroup.visits.length > 1) {
        selectedPatientForDialog.value = patientGroup;
        showVisitSelector.value = true;
    } else {
        goToDiagnosis(patientGroup.visits[0]);
    }
};

// 🔥 Action: ไปหน้าตรวจรักษา (DoctorDiagnosis)
const goToDiagnosis = (visitItem) => {
    if (!visitItem || !visitItem.visit_id) return;
    router.push({
        name: 'DoctorDiagnosis',
        query: {
            visitId: visitItem.visit_id,
            patientId: visitItem.patientId
        }
    });
};

const toggleHistory = () => {
    $q.notify({ message: 'ยังไม่เปิดใช้งาน (เลือก "ทั้งหมด" ในช่องวันที่แทน)', color: 'cyan-8', icon: 'info' });
};

// --- Initialization ---
const initializePage = async () => {
    if (route.query.date) selectedDate.value = route.query.date;
    else selectedDate.value = date.formatDate(new Date(), 'YYYY-MM-DD');

    await fetchActiveDates();
    generateDateOptions();
    fetchDoctorQueue(false);
}

onMounted(() => {
    initializePage();
    setInterval(() => fetchDoctorQueue(true), 30000); // Auto-refresh ทุก 30 วิ

    // 👇👇👇 3. เพิ่มโค้ดเช็ก Guide Modal ตรงนี้ 👇👇👇
    const hasSeenGuide = localStorage.getItem('hasSeenDoctorQueueGuide');
    if (!hasSeenGuide) {
        // หน่วงเวลา 1 วินาที ให้คิวโหลดเสร็จก่อนค่อยเด้ง
        setTimeout(() => {
            showGuideModal.value = true;
        }, 1000);
    }
    // 👆👆👆 สิ้นสุดโค้ดเช็ก Guide 👆👆👆
});
</script>

<style scoped lang="scss">
@import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@300;400;600;700&display=swap');

$dark-bg: #0f172a;
$glass-bg: rgba(30, 41, 59, 0.7);
$border: 1px solid rgba(255, 255, 255, 0.08);
$cyan: #22d3ee;

/* 🔥 CSS สำหรับ Dropdown อัจฉริยะ */
.status-dot { width: 10px; height: 10px; border-radius: 50%; box-shadow: 0 0 5px rgba(0,0,0,0.5); }
.list-row-hover:hover { background: rgba(34, 211, 238, 0.15) !important; cursor: pointer; }
.glass-menu { background: rgba(15, 23, 42, 0.95) !important; backdrop-filter: blur(10px); border: $border; }
.glass-btn { background: rgba(0,0,0,0.5) !important; backdrop-filter: blur(4px); }

/* --- CSS เดิม --- */
.dashboard-background { background: $dark-bg; font-family: 'Sarabun'; color: #e2e8f0; min-height: 100vh; }
.content-container { position: relative; z-index: 2; width: 100%; max-width: 1400px; margin: 0 auto; }
.glass-panel { background: $glass-bg; backdrop-filter: blur(12px); border: $border; border-radius: 16px; box-shadow: 0 8px 32px rgba(0,0,0,0.2); }
.icon-box-flat { width: 48px; height: 48px; background: linear-gradient(135deg, $cyan, #0ea5e9); border-radius: 12px; display: flex; align-items: center; justify-content: center; box-shadow: none; }
.status-filter-btn { color: #64748b; border: 1px solid rgba(255,255,255,0.1); background: rgba(255,255,255,0.05); &.is-active { background: $cyan; color: #0f172a; border-color: $cyan; box-shadow: none; font-weight: bold; } }
.hover-text-cyan:hover { color: $cyan !important; }
.flat-input :deep(.q-field__control) { background: rgba(0,0,0,0.2) !important; border-radius: 8px; border: 1px solid rgba(255,255,255,0.1); transition: border-color 0.3s; }
.flat-input :deep(.q-field__control:hover) { border-color: $cyan; }

/* Patient Card */
.patient-card {
  height: 100%; cursor: pointer; position: relative; overflow: hidden;
  border-left: 5px solid transparent;
  border-right: 1px solid rgba(255,255,255,0.05);
  border-top: 1px solid rgba(255,255,255,0.05);
  border-bottom: 1px solid rgba(255,255,255,0.05);
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  &:hover { transform: translateY(-5px); background: rgba(255,255,255,0.08); .zoom-overlay { opacity: 1; } }
  /* 🔥 สีสถานะสำหรับหน้าหมอ */
  &.card-status-waiting:hover { border-left-color: #f97316; box-shadow: 0 8px 25px rgba(249, 115, 22, 0.2); } /* สีส้ม */
  &.card-status-treating:hover { border-left-color: #3b82f6; box-shadow: 0 8px 25px rgba(59, 130, 246, 0.2); } /* สีฟ้า */
  &.card-status-completed:hover { border-left-color: #10b981; box-shadow: 0 8px 25px rgba(16, 185, 129, 0.2); } /* สีเขียว */
}

/* Avatar Zoom */
.avatar-wrapper { position: relative; cursor: zoom-in; overflow: hidden; width: 64px; height: 64px; border-radius: 50%; }
.avatar-wrapper-mini { position: relative; cursor: zoom-in; overflow: hidden; width: 44px; height: 44px; border-radius: 50%; }
.zoom-overlay { position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: rgba(34, 211, 238, 0.5); display: flex; align-items: center; justify-content: center; opacity: 0; transition: opacity 0.3s; border-radius: 50%; }
.avatar-wrapper:hover .img, .avatar-wrapper-mini:hover .img { transform: scale(1.1); }

.list-view-container { margin-top: 10px; }
.list-header { border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 10px; margin-bottom: 10px; opacity: 0.7; }
.list-row { transition: all 0.2s ease-in-out; border: 1px solid transparent; &:hover { background: rgba(255,255,255,0.08); border-color: rgba(34, 211, 238, 0.3); transform: translateX(5px); box-shadow: 0 4px 10px rgba(0,0,0,0.2); } }
.glass-chip { background: rgba(255,255,255,0.1); backdrop-filter: blur(4px); border: 1px solid rgba(255,255,255,0.1); }
.bg-white-05 { background: rgba(255,255,255,0.05); }
.opacity-20 { opacity: 0.2; } .opacity-30 { opacity: 0.3; }
.list-item-animation { opacity: 0; animation: fadeInSlideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
@keyframes fadeInSlideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
.dialog-card { background: #1e293b !important; border: $border; }
.visit-item { border-bottom: $border; &:hover { background: rgba(255,255,255,0.05); } }
.loading-overlay { position: fixed; inset: 0; background: rgba(15, 23, 42, 0.9); z-index: 9999; display: flex; flex-direction: column; align-items: center; justify-content: center; }
.loading-spinner { width: 60px; height: 60px; border: 4px solid rgba(34, 211, 238, 0.3); border-top-color: $cyan; border-radius: 50%; animation: spin 1s linear infinite; }
.loading-text { font-family: 'Sarabun'; letter-spacing: 1px; color: $cyan; animation: pulse 1.5s infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
@keyframes pulse { 50% { opacity: 0.5; } }
</style>
