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
                <q-icon name="local_pharmacy" size="28px" color="white" />
              </div>
              <div>
                <div class="text-h5 text-weight-bold text-white leading-tight">Pharmacy Dashboard</div>
                <div class="text-caption text-teal-3">ระบบบริหารจัดการคิวจ่ายยา</div>
              </div>
            </div>

            <div class="col-12 col-md-auto row q-gutter-x-md">
              <q-btn-toggle
                v-model="viewMode"
                unelevated rounded
                class="glass-toggle"
                text-color="grey-5"
                toggle-color="teal-4"
                toggle-text-color="black"
                :options="[{icon: 'grid_view', value: 'cards'}, {icon: 'view_list', value: 'table'}]"
              />
              <q-btn
                icon="refresh"
                label="รีเฟรช"
                @click="manualRefresh"
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
              active-color="teal-3"
              indicator-color="teal-3"
              narrow-indicator
            >
              <q-tab :name="null" label="ทั้งหมด" />
  <q-tab name="กำลังรับยา" label="กำลังรับยา" /> <q-tab name="รอรับยา" label="รอรับยา" />       <q-tab name="จ่ายยาแล้ว" label="จ่ายยาแล้ว" />
            </q-tabs>

            <q-space />

            <q-select
                dark dense outlined rounded
                v-model="selectedDate"
                :options="dateOptions"
                label="ประจำวันที่"
                class="search-input q-mr-sm"
                color="teal-3"
                style="width: 260px;"
                emit-value
                map-options
                popup-content-class="glass-menu"
                @update:model-value="handleDateSelect"
            >
                <template v-slot:selected>
                    <div class="row items-center">
                        <q-icon name="event" size="xs" class="q-mr-xs text-teal-3"/>
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
                                <q-badge color="teal-9" text-color="teal-2" rounded label="มีข้อมูล" />
                            </q-item-section>
                        </template>
                        <template v-else>
                            <q-item-section avatar>
                                <q-icon name="edit_calendar" color="teal-3" />
                            </q-item-section>
                            <q-item-section>
                                <q-item-label class="text-teal-3 text-weight-bold">เลือกวันที่อื่น / ปฏิทิน</q-item-label>
                            </q-item-section>
                        </template>
                    </q-item>
                </template>
            </q-select>

            <q-input
              dark dense outlined rounded
              v-model="searchQuery"
              placeholder="ค้นหา (ชื่อ, HN...)"
              class="search-input"
              color="teal-3"
              clearable
            >
              <template v-slot:prepend><q-icon name="search" /></template>
            </q-input>
          </div>
        </q-card-section>
      </q-card>

      <div v-if="!loading && paginatedPatients.length > 0">

        <div v-if="viewMode === 'cards'" class="row q-col-gutter-lg">
          <div v-for="(patient, index) in paginatedPatients" :key="patient.id" class="col-12 col-md-6 col-lg-4 col-xl-3 list-item-animation" :style="{ animationDelay: `${index * 0.05}s` }">
            <q-card class="patient-card glass-panel" @click="openDispenseHandler(patient)">
              <div class="card-content">
                <div class="row no-wrap items-center q-mb-md">
                  <div class="avatar-container-outer q-mr-md">
                    <div class="avatar-wrapper" @click.stop="openImagePreview(patient.avatarUrl)">
                      <q-avatar size="64px" class="shadow-3">
                        <img v-if="patient.avatarUrl" :src="patient.avatarUrl" class="avatar-img">
                        <q-icon v-else name="person" color="grey-4" class="bg-blue-grey-9" />
                      </q-avatar>
                      <div class="zoom-overlay"><q-icon name="zoom_in" color="white" size="24px"/></div>
                    </div>
                    <q-badge v-if="patient.visits.length > 1" color="orange-7" rounded class="new-badge-absolute shadow-2" style="position: absolute; top: -6px; right: -6px; z-index: 10;">{{ patient.visits.length }}</q-badge>
                  </div>
                  <div class="col overflow-hidden">
                    <div class="text-h6 text-white ellipsis text-weight-bold">{{ patient.patientName }}</div>
                    <div class="text-caption text-grey-4">HN: {{ patient.patientId }}</div>
                    <q-chip dense size="sm" class="q-mt-xs q-ml-none glass-chip" :class="getStatusChipClass(patient.status)">
                      {{ patient.status }}
                    </q-chip>
                  </div>
                  <div><q-btn flat round icon="chevron_right" color="grey-5" size="md" class="hover-white" /></div>
                </div>
                <q-separator dark class="opacity-20 q-mb-sm" />
                <div class="info-grid">
                  <div class="info-item">
                    <q-icon name="access_time" size="xs" color="teal-3" class="q-mr-xs" />
                    <span class="text-grey-4">เวลา:</span>
                    <span class="text-white q-ml-xs font-mono">{{ formatTime(patient.latestTime) }}</span>
                  </div>
                  <div class="info-item">
                    <q-icon name="format_list_bulleted" size="xs" color="orange-4" class="q-mr-xs" />
                    <span class="text-grey-4">รายการยา:</span>
                    <span class="text-white q-ml-xs text-weight-bold">{{ patient.totalPrescriptions }}</span>
                  </div>
                </div>
              </div>
            </q-card>
          </div>
        </div>

        <div v-else-if="viewMode === 'table'" class="list-view-container">
          <div class="row q-px-md q-py-sm text-grey-5 text-uppercase text-caption text-weight-bold list-header">
            <div class="col-4">ข้อมูลผู้ป่วย</div>
            <div class="col-2 text-center">เวลาส่งมา</div>
            <div class="col-2 text-center">จำนวนยา</div>
            <div class="col-3 text-center">สถานะ</div>
            <div class="col-1 text-right">จัดการ</div>
          </div>
          <div
            v-for="(patient, index) in paginatedPatients"
            :key="patient.id"
            class="list-row glass-panel q-mb-sm cursor-pointer list-item-animation"
            :style="{ animationDelay: `${index * 0.03}s` }"
            @click="openDispenseHandler(patient)"
          >
            <div class="row items-center q-pa-md">
              <div class="col-4 row items-center no-wrap">
                <div class="avatar-wrapper-mini q-mr-md" @click.stop="openImagePreview(patient.avatarUrl)">
                  <q-avatar size="48px" class="shadow-2 bg-dark">
                    <img v-if="patient.avatarUrl" :src="patient.avatarUrl" class="avatar-img">
                    <q-icon v-else name="person" color="grey-4" />
                  </q-avatar>
                  <q-badge v-if="patient.visits.length > 1" color="orange-7" rounded floating class="mini-new-badge">{{ patient.visits.length }}</q-badge>
                </div>
                <div>
                  <div class="text-body1 text-white text-weight-bold ellipsis">{{ patient.patientName }}</div>
                  <div class="text-caption text-teal-2 row items-center">
                    <q-icon name="badge" size="10px" class="q-mr-xs" /> {{ patient.patientId }}
                  </div>
                </div>
              </div>
              <div class="col-2 text-center text-grey-4 text-body2 font-mono">{{ formatTime(patient.latestTime) }}</div>
              <div class="col-2 text-center"><q-badge color="teal-9" text-color="teal-2" :label="patient.totalPrescriptions" class="text-weight-bold q-px-sm" /></div>
              <div class="col-3 text-center"><q-chip dense :class="getStatusChipClass(patient.status)" size="sm" class="glass-chip">{{ patient.status }}</q-chip></div>
              <div class="col-1 row justify-end items-center no-wrap">
                <q-btn flat round dense icon="arrow_forward" color="grey-5" class="hover-icon"><q-tooltip class="bg-black">ดำเนินการ</q-tooltip></q-btn>
              </div>
            </div>
          </div>
        </div>

        <div class="row justify-center q-mt-xl">
          <q-pagination
            v-model="currentPage" :max="maxPages"
            direction-links
            color="teal-3" active-color="teal-6" active-text-color="white"
            class="glass-pagination"
          />
        </div>

      </div>

      <div v-else-if="!loading" class="column items-center justify-center q-pa-xl text-grey-5">
        <q-icon name="assignment_turned_in" size="80px" class="opacity-30 q-mb-md" />
        <div class="text-h6 opacity-80">ไม่พบรายการค้างจ่ายยา</div>
        <div class="text-caption opacity-60">สำหรับวันที่ {{ selectedDateLabel }}</div>
      </div>

    </div>

    <q-dialog v-model="showVisitSelector" backdrop-filter="blur(4px)" transition-show="scale" transition-hide="scale">
      <q-card class="glass-panel" style="min-width: 350px; max-width: 500px; width: 100%;">

        <div class="row items-center justify-between q-pa-md bg-white-5" style="border-bottom: 1px solid rgba(255,255,255,0.05);">
          <div class="text-subtitle1 text-white text-weight-bold row items-center">
             <q-icon name="history" class="q-mr-sm text-teal-3"/>
             เลือกรายการที่ต้องการ
          </div>
          <q-btn dense flat round icon="close" color="grey-4" v-close-popup class="hover-rotate"/>
        </div>

        <q-card-section class="q-pa-sm">
          <div class="text-caption text-grey-5 q-mb-sm q-px-sm">คนไข้: <span class="text-white">{{ selectedPatient?.patientName }}</span></div>

          <q-list class="q-gutter-y-sm">
            <q-item
              v-for="(visit, index) in selectedPatient?.visits"
              :key="visit.visit_id"
              clickable v-ripple
              @click="goToDispensePage(visit.visit_id)"
              class="visit-item-card"
            >
              <q-item-section avatar>
                <q-avatar color="teal-9" text-color="teal-2" size="sm" font-size="12px" class="text-weight-bold">
                    {{ index + 1 }}
                </q-avatar>
              </q-item-section>

              <q-item-section>
                <q-item-label class="text-white text-weight-bold">เวลา {{ formatTime(visit.time) }}</q-item-label>
                <q-item-label caption class="text-grey-4">ยา: <span class="text-teal-3">{{ visit.prescriptionCount }} รายการ</span></q-item-label>
              </q-item-section>

              <q-item-section side>
                  <q-chip :class="getStatusChipClass(visit.status)" size="sm" class="glass-chip no-shadow">{{ visit.status }}</q-chip>
              </q-item-section>

              <q-item-section side>
                <q-icon name="chevron_right" color="grey-6" />
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
                color="teal-6"
                dark
                class="no-shadow bg-transparent"
                :events="checkCalendarEvent"
                event-color="green-4"
            />
            <div class="row justify-end q-pa-sm">
                <q-btn flat label="ยกเลิก" color="grey-4" v-close-popup />
                <q-btn flat label="ตกลง" color="teal-3" text-color="black" class="bg-teal-3" @click="confirmCalendarDate" />
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
      <q-card class="bg-dark text-white" style="width: 450px; max-width: 90vw; border: 1px solid rgba(20, 184, 166, 0.4); border-radius: 12px; box-shadow: 0 0 15px rgba(20, 184, 166, 0.2); overflow: hidden;">

        <!-- Header สไตล์เกม -->
        <q-card-section class="row items-center q-pb-sm bg-blue-grey-10" style="border-bottom: 1px solid rgba(255,255,255,0.05);">
          <div class="text-h6 text-teal-3 font-weight-bold row items-center" style="font-family: 'Cinzel', serif; letter-spacing: 1px;">
            <q-icon name="medication" size="sm" class="q-mr-sm" />
            SYSTEM GUIDE
          </div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup @click="markGuideAsSeen" color="grey-5" class="hover-icon-red" />
        </q-card-section>

        <!-- Content จัดเลย์เอาต์ใหม่ให้อ่านง่าย -->
        <q-card-section class="q-pa-lg">

          <!-- System Notice -->
          <div class="q-mb-lg q-pa-sm text-center text-teal-2 rounded-borders text-caption shadow-1" style="background: rgba(20, 184, 166, 0.08); border: 1px solid rgba(20, 184, 166, 0.2); letter-spacing: 0.5px;">
            <q-icon name="lightbulb" class="q-mr-xs" size="xs" />
            แดชบอร์ดเภสัชกร: จัดการคิวรับยาและตัดสต๊อกอัตโนมัติ
          </div>

          <!-- Checklist -->
          <div class="q-gutter-y-lg text-body1 text-grey-3 q-mt-sm">

            <!-- Item 1 -->
            <div class="row items-start no-wrap">
              <q-avatar size="42px" color="orange-10" text-color="orange-4" class="q-mr-md shadow-2 q-mt-xs">
                <q-icon name="event_available" size="22px"/>
              </q-avatar>
              <div class="col">
                <div class="text-white text-weight-bold" style="font-size: 1.05rem; line-height: 1.3;">Smart Dropdown วันที่</div>
                <div class="text-caption text-grey-5 q-mt-xs" style="line-height: 1.4;">ทดสอบเลือกวันที่ (ระบบจะแสดงจุดสีเขียว หากวันนั้นมีคิวรอรับยา)</div>
              </div>
            </div>

            <!-- Item 2 -->
            <div class="row items-start no-wrap">
              <q-avatar size="42px" color="pink-10" text-color="pink-4" class="q-mr-md shadow-2 q-mt-xs">
                <q-icon name="filter_list" size="22px"/>
              </q-avatar>
              <div class="col">
                <div class="text-white text-weight-bold" style="font-size: 1.05rem; line-height: 1.3;">กรองคิวผู้ป่วย</div>
                <div class="text-caption text-grey-5 q-mt-xs" style="line-height: 1.4;">คลิกปุ่มสถานะด้านบน เพื่อแยกดูคิวรอรับยา หรือคิวที่จ่ายยาแล้ว</div>
              </div>
            </div>

            <!-- Item 3 -->
            <div class="row items-start no-wrap">
              <q-avatar size="42px" color="blue-10" text-color="blue-4" class="q-mr-md shadow-2 q-mt-xs">
                <q-icon name="touch_app" size="22px"/>
              </q-avatar>
              <div class="col">
                <div class="text-white text-weight-bold" style="font-size: 1.05rem; line-height: 1.3;">ตรวจสอบใบสั่งยา</div>
                <div class="text-caption text-grey-5 q-mt-xs" style="line-height: 1.4;">คลิกที่การ์ดผู้ป่วยในคิว เพื่อดูรายละเอียดใบสั่งยาและดำเนินการจ่ายยา</div>
              </div>
            </div>

          </div>
        </q-card-section>

        <!-- Footer -->
        <q-card-actions align="center" class="q-pa-md bg-blue-grey-10" style="border-top: 1px solid rgba(255,255,255,0.05);">
          <q-btn
            unelevated class="full-width text-weight-bold" color="teal-6" text-color="black"
            label="START TESTING" @click="markGuideAsSeen" v-close-popup
            style="border-radius: 8px; font-size: 16px; letter-spacing: 2px;"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
    <!-- 👆👆👆 สิ้นสุด Guide Modal 👆👆👆 -->

  </q-page>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useQuasar, date } from 'quasar'
import axios from 'axios'

const $q = useQuasar()
const router = useRouter()
const route = useRoute()

// Data Variables
const rawQueue = ref([])
const loading = ref(true)
const searchQuery = ref('')
const statusFilter = ref(null)
const viewMode = ref('cards')
const currentPage = ref(1)
const rowsPerPage = ref(12)
const showVisitSelector = ref(false)
const selectedPatient = ref(null)

// --- Image Preview ---
const showImageDialog = ref(false)
const previewImageUrl = ref('')
const openImagePreview = (url) => { if (url) { previewImageUrl.value = url; showImageDialog.value = true; } }

// 👇👇👇 2. วางตัวแปรควบคุม Guide ตรงนี้ 👇👇👇
const showGuideModal = ref(false);
const markGuideAsSeen = () => {
    localStorage.setItem('hasSeenPharmacistQueueGuide', 'true');
    showGuideModal.value = false;
};
// 👆👆👆 สิ้นสุดตัวแปร Guide 👆👆👆

// --- Date & Calendar ---
const selectedDate = ref(null)
const dateOptions = ref([])
const showCalendarDialog = ref(false)
const tempSelectedDate = ref(null)
const activeDatesSet = ref(new Set())

const thaiDateLocale = {
  days: 'อาทิตย์_จันทร์_อังคาร_พุธ_พฤหัสบดี_ศุกร์_เสาร์'.split('_'),
  daysShort: 'อา._จ._อ._พ._พฤ._ศ._ส.'.split('_'),
  months: 'มกราคม_กุมภาพันธ์_มีนาคม_เมษายน_พฤษภาคม_มิถุนายน_กรกฎาคม_สิงหาคม_กันยายน_ตุลาคม_พฤศจิกายน_ธันวาคม'.split('_'),
  monthsShort: 'ม.ค._ก.พ._มี.ค._เม.ย._พ.ค._มิ.ย._ก.ค._ส.ค._ก.ย._ต.ค._พ.ย._ธ.ค.'.split('_')
};

// Fetch Active Dates
const fetchActiveDates = async () => {
    try {
        const res = await axios.get('https://emr-backend-api-8euv.onrender.com/api/pharmacist/active-dates')
        if (Array.isArray(res.data)) {
            activeDatesSet.value = new Set(res.data.map(d => date.formatDate(d, 'YYYY-MM-DD')))
        }
    } catch (error) {
        console.warn('Error fetching active dates:', error)
    }
}

const checkCalendarEvent = (dateStr) => {
    const formatted = dateStr.replace(/\//g, '-')
    return activeDatesSet.value.has(formatted)
}

const generateDateOptions = () => {
    const opts = []
    const today = new Date()
    for (let i = 0; i < 7; i++) {
        const d = date.subtractFromDate(today, { days: i })
        const dateVal = date.formatDate(d, 'YYYY-MM-DD')
        const isRealData = activeDatesSet.value.has(dateVal);
        let labelText = date.formatDate(d, 'D MMM YYYY', thaiDateLocale)
        if (i === 0) labelText += ' (วันนี้)'
        else if (i === 1) labelText += ' (เมื่อวาน)'
        opts.push({
            label: labelText, subLabel: isRealData ? 'คลิกเพื่อดูรายการ' : 'ไม่มีรายการบันทึก',
            value: dateVal, hasData: isRealData
        })
    }
    opts.push({ label: 'เลือกวันที่อื่น...', value: 'custom', hasData: false })
    dateOptions.value = opts
}

const handleDateSelect = (val) => {
    if (val === 'custom') {
        tempSelectedDate.value = selectedDate.value
        showCalendarDialog.value = true
        nextTick(() => { })
    } else {
        manualRefresh() // กดเลือกวันใหม่ ให้โหลดแบบขึ้น Loading ปกติ
    }
}

const confirmCalendarDate = () => {
    if (!tempSelectedDate.value) return;
    selectedDate.value = tempSelectedDate.value
    showCalendarDialog.value = false

    const exists = dateOptions.value.find(o => o.value === selectedDate.value)
    if (!exists) {
        const d = new Date(selectedDate.value)
        const isRealData = activeDatesSet.value.has(selectedDate.value);
        dateOptions.value.unshift({
            label: date.formatDate(d, 'D MMM YYYY', thaiDateLocale) + ' (เลือกเอง)',
            subLabel: 'จากการเลือกปฏิทิน',
            value: selectedDate.value,
            hasData: isRealData
        })
    }
    manualRefresh()
}

const initializePage = async () => {
    if (route.query.date) selectedDate.value = route.query.date;
    else selectedDate.value = date.formatDate(new Date(), 'YYYY-MM-DD');

    await fetchActiveDates();
    generateDateOptions();
    // โหลดครั้งแรก ให้แสดง Loading
    loadQueue(false);
}

const mapStatusForPharmacist = (dbStatus) => {
    if (dbStatus === 'กำลังรับยา') return 'กำลังรับยา';
    if (dbStatus === 'รักษาเสร็จสิ้น') return 'รอรับยา';
    if (dbStatus === 'จ่ายยาแล้ว') return 'จ่ายยาแล้ว';
    return dbStatus || 'รอรับยา';
}

// 🔥 [แก้ไข] เพิ่ม Parameter isBackground = true (ค่าเริ่มต้นเป็น true ถ้าไม่ส่งมา)
const loadQueue = async (isBackground = false) => {
    if (!selectedDate.value || selectedDate.value === 'custom') return

    // ถ้าไม่ใช่ Background load (เช่น กดปุ่ม, เลือกวันใหม่) ให้โชว์ Loading
    if (!isBackground) loading.value = true

    try {
        const res = await axios.get('https://emr-backend-api-8euv.onrender.com/api/pharmacist/queue', { params: { date: selectedDate.value } })
        rawQueue.value = res.data.map(item => ({ ...item, status: mapStatusForPharmacist(item.status) }));
    } catch (error) {
        if (!isBackground) $q.notify({ type: 'negative', message: 'โหลดข้อมูลไม่สำเร็จ' })
    } finally {
        if (!isBackground) setTimeout(() => { loading.value = false; }, 600);
    }
}

// ฟังก์ชันสำหรับปุ่ม Refresh (บังคับโชว์ Loading)
const manualRefresh = () => {
    loadQueue(false); // ส่ง false เพื่อบอกว่า "ไม่ใช่ background" -> ให้โชว์ Loading
}

const groupedQueue = computed(() => {
    const groups = {}
    rawQueue.value.forEach(visit => {
        const pid = visit.patient_id
        if (!groups[pid]) {
            let finalAvatarUrl = null;
            if (visit.avatarUrl || visit.avatar_url) {
                 let cleanPath = (visit.avatarUrl || visit.avatar_url).replace(/\\/g, '/');
                 if (cleanPath.includes('localhost:5000')) cleanPath = cleanPath.replace('localhost:5000', 'localhost:3000');
                 if (cleanPath.startsWith('http')) finalAvatarUrl = cleanPath;
                 else finalAvatarUrl = `https://emr-backend-api-8euv.onrender.com${cleanPath.startsWith('/') ? '' : '/'}${cleanPath}`;
                 finalAvatarUrl += `?t=${Date.now()}`;
            }
            groups[pid] = { id: pid, patientId: pid, patientName: visit.patientName, avatarUrl: finalAvatarUrl, visits: [] }
        }
        groups[pid].visits.push(visit)
    })
    return Object.values(groups).map(p => {
        const latestVisit = p.visits.reduce((prev, curr) => (new Date(curr.time) > new Date(prev.time) ? curr : prev), p.visits[0]);
        const hasInProgress = p.visits.some(v => v.status === 'กำลังรับยา');
        const hasPending = p.visits.some(v => v.status === 'รอรับยา');
        let finalStatus = 'จ่ายยาแล้ว';
        if (hasInProgress) finalStatus = 'กำลังรับยา'; else if (hasPending) finalStatus = 'รอรับยา';
        const totalMeds = p.visits.reduce((sum, v) => sum + (v.prescriptionCount || 0), 0);
        return { ...p, visit_id: latestVisit.visit_id, status: finalStatus, latestTime: latestVisit.time, totalPrescriptions: totalMeds }
    })
})

const filteredQueue = computed(() => {
    let data = groupedQueue.value
    if (statusFilter.value) data = data.filter(p => p.status === statusFilter.value)
    if (searchQuery.value) {
        const q = searchQuery.value.toLowerCase()
        data = data.filter(p => p.patientName.toLowerCase().includes(q) || p.patientId.toLowerCase().includes(q))
    }
    return data
})

const maxPages = computed(() => Math.ceil(filteredQueue.value.length / rowsPerPage.value))
const paginatedPatients = computed(() => {
    const start = (currentPage.value - 1) * rowsPerPage.value
    return filteredQueue.value.slice(start, start + rowsPerPage.value)
})

const openDispenseHandler = (patient) => {
    if (patient.visits.length > 1) { selectedPatient.value = patient; showVisitSelector.value = true; }
    else { goToDispensePage(patient.visit_id) }
}
const goToDispensePage = (visitId) => { router.push({ name: 'PatientMedicine', params: { visitId }, query: { visitId } }) }
const formatTime = (t) => { if (!t) return '-'; if (typeof t === 'string' && t.includes(':')) return t; const d = new Date(t); if (isNaN(d.getTime())) return '-'; return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`; }

const selectedDateLabel = computed(() => {
    if (!selectedDate.value) return '-';
    if (selectedDate.value === 'custom') return 'เลือกวันที่...';
    const d = new Date(selectedDate.value);
    if (isNaN(d.getTime())) return selectedDate.value;
    return date.formatDate(d, 'D MMM YYYY', thaiDateLocale);
})

const getStatusChipClass = (status) => {
    if (status === 'กำลังรับยา') return 'text-orange-3 bg-orange-9';
    if (status === 'รอรับยา') return 'text-purple-3 bg-purple-9';
    return 'text-green-3 bg-green-9';
}

onMounted(() => {
    initializePage();
    // 🔥 [แก้ไข] ส่ง true เพื่อบอกว่าเป็น background polling (ไม่โชว์ loading overlay)
    setInterval(() => loadQueue(true), 30000);
    // 👇👇👇 3. เพิ่มโค้ดเช็ก Guide Modal ตรงนี้ 👇👇👇
    const hasSeenGuide = localStorage.getItem('hasSeenPharmacistQueueGuide');
    if (!hasSeenGuide) {
        setTimeout(() => {
            showGuideModal.value = true;
        }, 1000);
    }
    // 👆👆👆 สิ้นสุดโค้ดเช็ก Guide 👆👆👆
})
</script>

<style lang="scss" scoped>
@import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@300;400;600;700&display=swap');

/* --- Theme Variables --- */
$dark-bg: #0f172a;
$glass-bg: rgba(30, 41, 59, 0.7);
$glass-border: 1px solid rgba(255, 255, 255, 0.08);
$accent-color: #14b8a6; /* Teal-500 */

.status-dot { width: 10px; height: 10px; border-radius: 50%; box-shadow: 0 0 5px rgba(0,0,0,0.5); }
.list-row-hover:hover { background: rgba(20, 184, 166, 0.15) !important; cursor: pointer; }
.glass-btn { background: rgba(0,0,0,0.5) !important; backdrop-filter: blur(4px); }
.bg-white-5 { background: rgba(255,255,255,0.05); }

/* 🔥 CSS สำหรับ Popup รายการ Visit ใหม่ (สวย + ไม่มี Scroll มั่ว) */
.visit-item-card {
    border-radius: 12px;
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.05);
    transition: all 0.2s;
    &:hover {
        background: rgba(20, 184, 166, 0.1);
        border-color: rgba(20, 184, 166, 0.3);
        transform: translateX(5px);
    }
}
.hover-rotate:hover { transform: rotate(90deg); transition: transform 0.3s; color: white !important; }

.dashboard-background {
  background-color: $dark-bg;
  font-family: 'Sarabun', sans-serif;
  color: #e2e8f0;
  min-height: 100vh;
  position: relative;
  overflow-x: hidden;
  &::before {
    content: ''; position: absolute; top: -20%; right: -10%; width: 50%; height: 50%;
    background: radial-gradient(circle, rgba(20, 184, 166, 0.15) 0%, transparent 60%);
    filter: blur(80px); pointer-events: none;
  }
}

/* 🔥🔥🔥 แก้ไขตรงนี้ครับ 🔥🔥🔥
   กำหนดขนาดสูงสุด (max-width) และใช้ margin: auto เพื่อจัดกลาง
*/
.content-container {
  position: relative;
  z-index: 2;
  width: 100%;
  max-width: 1440px; /* กำหนดความกว้างที่ต้องการ (เช่น 1200px หรือ 1440px) */
  margin-left: auto; /* ดันขอบซ้าย */
  margin-right: auto; /* ดันขอบขวา */
}

/* Components */
.glass-panel {
  background: $glass-bg; backdrop-filter: blur(12px); border: $glass-border;
  border-radius: 16px; box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.icon-box-flat {
  width: 48px; height: 48px; background: linear-gradient(135deg, $accent-color, #0d9488);
  border-radius: 12px; display: flex; align-items: center; justify-content: center;
}
.action-btn-flat {
  background: linear-gradient(135deg, #14b8a6 0%, #0d9488 100%);
  color: white; font-weight: 600; transition: transform 0.2s;
  &:hover { transform: translateY(-2px); }
}
.search-input {
  :deep(.q-field__control) { background: rgba(0,0,0,0.3) !important; border-radius: 50px; border: 1px solid rgba(255,255,255,0.1); }
  :deep(.q-field__control:hover) { border-color: $accent-color; }
}
.glass-menu { background: rgba(15, 23, 42, 0.95) !important; backdrop-filter: blur(10px); border: $glass-border; }

/* Patient Card */
.patient-card {
  height: 100%; cursor: pointer; display: flex; flex-direction: column; border-left: 3px solid transparent;
  &:hover {
    border-left-color: $accent-color; transform: translateY(-5px) scale(1.01);
    box-shadow: 0 15px 40px rgba(0,0,0,0.4); .zoom-overlay { opacity: 1; }
  }
}
.card-content { padding: 20px; }
.avatar-container-outer { position: relative; display: inline-block; }
.avatar-wrapper { position: relative; cursor: pointer; border-radius: 50%; overflow: hidden; width: 64px; height: 64px; }
.avatar-img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.5s; }
.zoom-overlay {
  position: absolute; top: 0; left: 0; width: 100%; height: 100%;
  background: rgba(20, 184, 166, 0.6); display: flex; align-items: center; justify-content: center;
  opacity: 0; transition: opacity 0.3s; border-radius: 50%;
}
.avatar-wrapper:hover .avatar-img { transform: scale(1.1); }
.new-badge-absolute { font-size: 10px; padding: 2px 6px; border: 1px solid rgba(255,255,255,0.2); }

.info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
.info-item { background: rgba(255,255,255,0.03); border-radius: 8px; padding: 6px 10px; display: flex; align-items: center; }

/* List View */
.list-view-container { margin-top: 10px; }
.list-header { border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 10px; margin-bottom: 10px; opacity: 0.7; }
.list-row {
  transition: all 0.2s ease-in-out; border: 1px solid transparent;
  &:hover { background: rgba(255,255,255,0.08); border-color: rgba(20, 184, 166, 0.3); transform: translateX(5px); box-shadow: 0 4px 15px rgba(0,0,0,0.3); }
}
.avatar-wrapper-mini { position: relative; cursor: zoom-in; transition: transform 0.2s; &:hover { transform: scale(1.15); z-index: 10; } }
.mini-new-badge { font-size: 8px; padding: 2px 4px; top: 0; right: -5px; }
.hover-icon { transition: color 0.2s; &:hover { color: #fff !important; } }
.glass-chip { background: rgba(255,255,255,0.1); backdrop-filter: blur(4px); border: 1px solid rgba(255,255,255,0.1); }

/* Loading */
.loading-overlay { position: fixed; inset: 0; background: $dark-bg; z-index: 9999; display: flex; flex-direction: column; align-items: center; justify-content: center; }
.loading-spinner { width: 50px; height: 50px; border: 3px solid rgba(20, 184, 166, 0.3); border-top-color: $accent-color; border-radius: 50%; animation: spin 1s linear infinite; }
.loading-text { font-family: 'Sarabun'; letter-spacing: 1px; color: $accent-color; animation: pulse 1.5s infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
@keyframes pulse { 50% { opacity: 0.5; } }
@keyframes fadeInSlideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
.list-item-animation { opacity: 0; animation: fadeInSlideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
.font-mono { font-family: monospace; }
.opacity-20 { opacity: 0.2; }
</style>
