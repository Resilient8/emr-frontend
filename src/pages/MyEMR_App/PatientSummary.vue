<template>
  <q-page class="rounded-page-wrapper">

    <div class="fixed-layout">

      <q-inner-loading :showing="loading" dark label="กำลังโหลดข้อมูล..." label-class="text-cyan-3">
        <q-spinner-dots color="cyan-3" size="60px" />
      </q-inner-loading>

      <div class="external-header">
        <q-btn
          class="back-button-glassy"
          no-caps rounded unelevated
          icon="arrow_back_ios_new"
          label="ย้อนกลับ"
          @click="() => router.go(-1)"
        />

        <div class="glassy-tab-group">
          <q-btn
            v-for="tab in ['summary', 'vitals', 'symptoms', 'treatment', 'medication']"
            :key="tab"
            class="tab-button-glassy"
            :class="{ 'is-active': currentMainTab === tab }"
            no-caps rounded unelevated
            :label="getTabLabel(tab)"
            @click="() => { currentMainTab = tab; playClickSound(); }"
          />
        </div>
      </div>

      <div v-if="!loading && patientData.patientId" class="layout-container-wrapper">
        <div class="layout-container">

          <div class="global-top-bar">
            <div class="patient-info-wrapper clickable" @click="openProfileDialog">
              <div class="avatar-ring">
                <q-avatar size="42px">
                  <img v-if="patientData.avatarUrl" :src="patientData.avatarUrl" style="object-fit: cover;">
                  <q-icon v-else :name="patientData.sex === 'ชาย' ? 'face' : 'face_3'" :color="patientData.sex === 'ชาย' ? 'blue-2' : 'pink-2'" />
                </q-avatar>
              </div>
              <div class="q-ml-md">
                <div class="text-subtitle1 text-white leading-tight text-weight-bold">{{ patientData.firstName }} {{ patientData.lastName }}</div>
                <div class="text-caption text-cyan-3">HN: {{ patientData.patientId }}</div>
              </div>
              <q-separator vertical dark spaced class="opacity-20 q-mx-lg gt-xs" />

              <div class="row items-center q-gutter-x-md gt-xs">
                <div class="row items-center"><q-icon name="cake" color="grey-5" class="q-mr-sm" /><span class="text-white">{{ patientData.age }} ปี</span></div>
                <div class="row items-center"><q-icon name="bloodtype" color="red-4" class="q-mr-sm" /><span class="text-white">{{ patientData.bloodGroup || '-' }}</span></div>
              </div>

              <q-space />

              <div class="row q-gutter-x-sm items-center">
                <div v-if="patientData.allergies && patientData.allergies !== 'ไม่มี'" class="alert-badge drug">
                  <q-icon name="warning" size="xs" />
                  <span class="badge-text">{{ patientData.allergies }}</span>
                  <q-tooltip>แพ้ยา: {{ patientData.allergies }}</q-tooltip>
                </div>
                <div v-if="patientData.foodAllergies && patientData.foodAllergies !== 'ไม่มี'" class="alert-badge food gt-sm">
                  <q-icon name="restaurant" size="xs" />
                  <span class="badge-text">{{ patientData.foodAllergies }}</span>
                  <q-tooltip>แพ้อาหาร: {{ patientData.foodAllergies }}</q-tooltip>
                </div>
                <div v-if="patientData.underlyingDisease && patientData.underlyingDisease !== 'ไม่มี'" class="alert-badge disease gt-sm">
                  <q-icon name="monitor_heart" size="xs" />
                  <span class="badge-text">{{ patientData.underlyingDisease }}</span>
                  <q-tooltip>โรคประจำตัว: {{ patientData.underlyingDisease }}</q-tooltip>
                </div>
              </div>
              <q-tooltip class="bg-black border-cyan">คลิกเพื่อดูข้อมูลส่วนตัว</q-tooltip>
            </div>
          </div>

          <div class="content-grid">

            <div class="left-panel">
              <div class="panel-header">
                <div class="text-subtitle1 text-white text-weight-bold"><q-icon name="history" class="q-mr-sm text-cyan-3"/>ประวัติการรักษา</div>
                <q-btn-dropdown flat dense round dropdown-icon="sort" color="grey-5">
                  <q-list class="bg-dark text-white">
                    <q-item clickable v-close-popup @click="sortOrder = 'desc'"><q-item-section>ใหม่ -> เก่า</q-item-section></q-item>
                    <q-item clickable v-close-popup @click="sortOrder = 'asc'"><q-item-section>เก่า -> ใหม่</q-item-section></q-item>
                  </q-list>
                </q-btn-dropdown>
              </div>
              <q-scroll-area class="fit" :thumb-style="{ width: '4px', borderRadius: '5px', background: '#22d3ee' }">
                <q-list class="history-list">
                  <q-item
                    v-for="visit in sortedTreatmentHistory" :key="visit.id"
                    clickable v-ripple
                    class="history-item"
                    :class="{ 'is-active': currentVisit && currentVisit.id === visit.id }"
                    @click="() => { currentVisit = visit; playClickSound(); }"
                  >
                    <div class="indicator-bar"></div>
                    <q-item-section>
                      <div class="text-weight-bold text-white ellipsis">{{ visit.mainDiagnosis }}</div>
                      <div class="text-caption text-grey-5">{{ formatDate(visit.visitDate) }}</div>
                    </q-item-section>
                    <q-item-section side><q-icon name="chevron_right" size="xs" color="grey-6" /></q-item-section>
                  </q-item>
                </q-list>
              </q-scroll-area>
            </div>

            <div class="right-panel">
              <div class="content-frame-wrapper">
                <transition name="fade" mode="out-in">

                  <q-card v-if="currentVisit" class="detail-card bg-transparent shadow-none" flat key="content">
                    <q-tab-panels v-model="currentMainTab" animated class="bg-transparent fit">

                      <q-tab-panel name="summary" class="q-pa-lg scroll">
                        <div class="text-h6 text-white q-mb-md flex items-center">
                          <q-icon name="dashboard" class="q-mr-sm text-yellow-4"/>สรุปการรักษา
                        </div>

                        <div class="row q-col-gutter-md q-mb-md">
                          <div class="col-12 col-md-8">
                            <div class="info-box h-full relative-position overflow-hidden">
                                <div class="absolute-right full-height" style="width: 150px; background: linear-gradient(90deg, transparent, rgba(34, 211, 238, 0.05));"></div>

                                <div class="box-label text-cyan-3 flex items-center">
                                  <q-icon name="local_hospital" class="q-mr-xs"/> การวินิจฉัยหลัก
                                </div>

                                <div v-if="currentVisit.diagnosesList && currentVisit.diagnosesList.length > 0">
                                   <div class="text-h4 text-weight-bold text-white q-mb-xs" style="line-height: 1.2;">
                                      {{ currentVisit.diagnosesList[0].code }}
                                      <span class="text-body1 text-grey-4" style="vertical-align: middle;">: {{ currentVisit.diagnosesList[0].name }}</span>
                                   </div>

                                   <div class="text-grey-4 text-subtitle2 q-mb-md">
                                     <q-icon name="sick" class="q-mr-xs text-orange-4"/> อาการ: <span class="text-white">{{ currentVisit.symptoms.chiefComplaint }}</span>
                                   </div>

                                   <div v-if="currentVisit.diagnosesList.length > 1">
                                      <q-separator dark class="q-my-sm opacity-20" />
                                      <div class="text-caption text-purple-3 q-mb-sm flex items-center">
                                        <q-icon name="format_list_bulleted" class="q-mr-xs"/> โรคร่วม / ภาวะแทรกซ้อน
                                      </div>
                                      <div class="row q-col-gutter-sm">
                                        <div v-for="(diag, idx) in currentVisit.diagnosesList.slice(1)" :key="idx" class="col-auto">
                                          <div class="comorbid-badge">
                                            <div class="code-tag">{{ diag.code }}</div>
                                            <div class="name-text">{{ diag.name }}</div>
                                          </div>
                                        </div>
                                      </div>
                                   </div>
                                </div>
                                <div v-else>
                                   <div class="text-h4 text-weight-bold text-white">-</div>
                                </div>
                            </div>
                          </div>

                          <div class="col-12 col-md-4">
                             <div class="info-box h-full flex column justify-center items-center text-center">
                                <div class="text-caption text-grey-5">วันที่เข้ารับการรักษา</div>
                                <div class="text-h5 text-white text-weight-bold">{{ formatDate(currentVisit.visitDate) }}</div>
                             </div>
                          </div>
                        </div>

                        <q-separator dark class="q-my-md opacity-20" />

                        <div class="text-subtitle1 text-white q-mb-sm">สัญญาณชีพเบื้องต้น</div>
                        <div class="row q-col-gutter-sm q-mb-md">
                           <div v-for="stat in currentVisit.vitalSigns.slice(0, 4)" :key="stat.label" class="col-6 col-md-3">
                              <div class="mini-vital-card">
                                 <q-icon :name="stat.icon" :color="stat.color" size="sm"/>
                                 <div>
                                   <div class="text-caption text-grey-5">{{ stat.label }}</div>
                                   <div class="text-weight-bold text-white">{{ stat.value }} <span style="font-size: 0.7em">{{ stat.unit }}</span></div>
                                 </div>
                              </div>
                           </div>
                        </div>

                        <div class="text-subtitle1 text-white q-mb-sm">รายการยาที่ได้รับ</div>
                         <div v-if="currentVisit.prescriptions && currentVisit.prescriptions.length > 0">
                            <div class="row q-col-gutter-sm">
                              <div v-for="(med, idx) in currentVisit.prescriptions" :key="idx" class="col-12 col-sm-6">
                                <div class="med-capsule">
                                  <q-icon name="pill" color="teal-3" class="q-mr-sm"/>
                                  <div class="ellipsis">{{ med.name }}</div>
                                  <q-space/>
                                  <div class="badge-qty">x{{ med.qty }}</div>
                                </div>
                              </div>
                            </div>
                         </div>
                         <div v-else class="text-grey-6 text-body2">ไม่มีการสั่งยา</div>
                      </q-tab-panel>

                      <q-tab-panel name="vitals" class="q-pa-lg scroll">
                        <div class="text-h6 text-white q-mb-md"><q-icon name="monitor_heart" class="q-mr-sm text-pink-4"/>สัญญาณชีพ</div>
                        <div class="vitals-grid">
                          <div v-for="stat in currentVisit.vitalSigns" :key="stat.label" class="vital-card">
                            <div class="vital-icon" :style="{ backgroundColor: `rgba(${getColorRGB(stat.color)}, 0.1)`, color: stat.color }">
                              <q-icon :name="stat.icon" />
                            </div>
                            <div class="vital-info">
                              <div class="vital-label">{{ stat.label }}</div>
                              <div class="vital-value">
                                {{ stat.value }} <span class="unit">{{ stat.unit }}</span>
                              </div>
                              <div class="vital-ref">ปกติ: {{ stat.ref }}</div>
                            </div>
                          </div>
                        </div>
                      </q-tab-panel>

                      <q-tab-panel name="symptoms" class="q-pa-lg scroll">
                        <div class="text-h6 text-white q-mb-md"><q-icon name="sick" class="q-mr-sm text-orange-4"/>อาการ</div>

                        <div class="info-box q-mb-md">
                          <div class="box-label text-orange-3">อาการสำคัญ (CC)</div>
                          <div class="box-content">{{ currentVisit.symptoms.chiefComplaint || '-' }}</div>
                        </div>

                        <div class="info-box q-mb-md">
                          <div class="box-label text-blue-3">ประวัติปัจจุบัน (PI)</div>
                          <div class="box-content text-grey-4">{{ currentVisit.symptoms.presentIllness || '-' }}</div>
                        </div>

                        <div v-if="currentVisit.symptoms.ros && currentVisit.symptoms.ros.length > 0">
                          <q-separator dark class="q-my-md opacity-20" />
                          <div class="text-subtitle1 text-white q-mb-sm flex items-center">
                            <q-icon name="assignment" class="q-mr-sm text-cyan-3"/>
                            การซักประวัติเพิ่มเติมตามระบบ (ROS)
                          </div>

                          <div class="row q-col-gutter-md">
                            <div v-for="(item, index) in currentVisit.symptoms.ros" :key="index" class="col-12 col-sm-6">
                              <div class="ros-box h-full">
                                <div class="ros-header">
                                  <div class="box-label text-cyan-3 no-margin">{{ item.label }}</div>
                                </div>
                                <div class="ros-content">
                                  <div v-if="parseRosItems(item.value).length > 0" class="capsule-wrapper">
                                    <div
                                      v-for="(symptom, sIndex) in parseRosItems(item.value).slice(0, 5)"
                                      :key="sIndex"
                                      class="ros-capsule"
                                    >
                                      {{ symptom }}
                                    </div>
                                    <div v-if="parseRosItems(item.value).length > 5" class="ros-capsule more">
                                      <q-tooltip>มีอีก {{ parseRosItems(item.value).length - 5 }} รายการ</q-tooltip>
                                      +{{ parseRosItems(item.value).length - 5 }}
                                    </div>
                                  </div>
                                  <div v-else class="text-grey-6 text-caption">-</div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </q-tab-panel>

                      <q-tab-panel name="treatment" class="q-pa-lg scroll">
                        <div class="text-h6 text-white q-mb-md"><q-icon name="medical_services" class="q-mr-sm text-green-4"/>การรักษา</div>

                        <div v-if="currentVisit.diagnosesList && currentVisit.diagnosesList.length > 0">

                          <div class="diagnosis-box main q-mb-md">
                            <div class="row items-center justify-between q-mb-xs">
                              <div class="box-label text-cyan-3 no-margin">การวินิจฉัยหลัก (Principal Diagnosis)</div>
                              <q-badge color="cyan-3" text-color="black" label="Main" />
                            </div>
                            <div class="diagnosis-text-large">
                              <span class="text-cyan-3 text-weight-bold q-mr-sm">{{ currentVisit.diagnosesList[0].code }}</span>
                              <span class="text-white">{{ currentVisit.diagnosesList[0].name }}</span>
                            </div>
                          </div>

                          <div v-if="currentVisit.diagnosesList.length > 1" class="q-mb-lg">
                            <div class="text-subtitle2 text-purple-3 q-mb-sm flex items-center">
                              <q-icon name="format_list_bulleted" class="q-mr-xs"/> โรคร่วม / ภาวะแทรกซ้อน (Co-morbidities)
                            </div>
                            <div class="secondary-diag-grid">
                              <div v-for="(diag, idx) in currentVisit.diagnosesList.slice(1)" :key="idx" class="sec-diag-card">
                                  <div class="sec-code">{{ diag.code }}</div>
                                  <div class="sec-name">{{ diag.name }}</div>
                              </div>
                            </div>
                          </div>

                        </div>
                        <div v-else class="diagnosis-box q-mb-lg">
                          <div class="box-label text-grey-5">การวินิจฉัยหลัก</div>
                          <div class="diagnosis-text text-grey-6">-</div>
                        </div>

                        <div v-if="currentVisit.procedures && currentVisit.procedures.length > 0" class="q-mb-lg">
                          <div class="text-subtitle2 text-grey-5 q-mb-sm">บริการและหัตถการ</div>
                          <div class="procedures-list">
                            <div v-for="(proc, index) in currentVisit.procedures" :key="index" class="procedure-item">
                              <q-icon name="check_circle" color="green-5" class="q-mr-sm" />
                              {{ proc.service }}
                            </div>
                          </div>
                        </div>

                        <div v-if="currentVisit.prescriptions && currentVisit.prescriptions.length > 0">
                           <div class="text-subtitle2 text-grey-5 q-mb-sm">ยาที่แพทย์สั่ง (Doctor's Orders)</div>
                           <div class="procedures-list">
                            <div v-for="(med, idx) in currentVisit.prescriptions" :key="idx" class="procedure-item" style="border-left: 3px solid #20b8a6;">
                              <q-icon name="medication" color="teal-4" class="q-mr-sm" />
                              <div class="column">
                                <div class="text-white">{{ med.name }} <span class="text-teal-3 text-caption">(x{{ med.qty }})</span></div>
                                <div class="text-grey-5 text-caption">{{ med.usage }}</div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </q-tab-panel>

<q-tab-panel name="medication" class="q-pa-lg scroll">
  <div class="text-h6 text-white q-mb-md flex items-center">
    <q-icon name="vaccines" class="q-mr-sm text-teal-4"/>ยาและเวชภัณฑ์
  </div>

  <div v-if="currentVisit.prescriptions && currentVisit.prescriptions.length > 0">
    <div class="column q-gutter-y-md">
      <div v-for="(med, idx) in currentVisit.prescriptions" :key="idx" class="med-card-modern-v2">

        <div class="med-left-section">
          <div class="accent-bar-v2"></div>
          <div class="med-icon-box-v2">
             <q-icon name="medication" size="32px" />
          </div>
        </div>

        <div class="med-content-v2">
           <div class="med-name-v2">{{ med.name }}</div>
           <div class="med-usage-wrapper-v2">
              <q-icon name="schedule" size="16px" class="q-mr-xs text-teal-3" />
              <div class="med-usage-text-v2">{{ med.usage || 'ไม่ระบุวิธีใช้' }}</div>
           </div>
        </div>

        <div class="med-right-section">
          <div class="med-qty-badge-v2">
             <span class="qty-num-v2">{{ med.qty }}</span>
             <span class="qty-label-v2">เม็ด</span>
          </div>
        </div>

      </div>
    </div>
  </div>

  <div v-else class="empty-state-small">
     <q-icon name="no_drugs" size="50px" color="grey-7"/>
     <div class="text-grey-6 q-mt-sm">ไม่มีรายการยาในครั้งนี้</div>
  </div>
</q-tab-panel>

                    </q-tab-panels>
                  </q-card>

                  <div v-else class="empty-state" key="empty">
                    <q-icon name="manage_search" size="80px" color="grey-8" />
                    <div class="text-h6 text-grey-6 q-mt-md">เลือกรายการทางซ้ายเพื่อดูรายละเอียด</div>
                  </div>
                </transition>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <q-dialog v-model="isProfileDialogVisible" backdrop-filter="blur(8px)">
      <q-card class="profile-dialog">
        <q-btn icon="close" flat round dense v-close-popup class="close-btn" />
        <q-card-section class="q-pa-lg">
          <div class="row no-wrap items-center">
            <div class="col">
              <div class="text-overline text-cyan-3">PATIENT PROFILE</div>
              <div class="text-h5 text-white text-weight-bold q-mb-xs">{{ patientData.title }} {{ patientData.firstName }} {{ patientData.lastName }}</div>
              <div class="text-subtitle1 text-grey-5">HN: <span class="text-white">{{ patientData.patientId }}</span></div>
            </div>
            <div class="avatar-edit-wrapper relative-position q-ml-md">
              <div class="avatar-zoom-wrapper" @click="isAvatarViewerVisible = true">
                <q-avatar size="110px" class="profile-avatar">
                  <img v-if="patientData.avatarUrl" :src="patientData.avatarUrl" style="object-fit: cover; width: 100%; height: 100%;">
                  <q-icon v-else :name="patientData.sex === 'ชาย' ? 'face' : 'face_3'" :color="patientData.sex === 'ชาย' ? 'blue-2' : 'pink-2'" />
                </q-avatar>
              </div>
              <q-btn round size="sm" color="cyan-3" text-color="dark" icon="edit" class="absolute-bottom-right shadow-5 edit-btn" @click="triggerFileSelect">
                <q-tooltip>เปลี่ยนรูปโปรไฟล์</q-tooltip>
              </q-btn>
              <input type="file" ref="fileInput" class="hidden" accept="image/*" @change="onFileSelect" />
            </div>
          </div>
          <q-separator dark class="q-my-lg opacity-10" />
          <div class="stats-grid">
            <div class="stat-box"><div class="label">อายุ</div><div class="value">{{ patientData.age }} <span class="unit">ปี</span></div></div>
            <div class="stat-box"><div class="label">กรุ๊ปเลือด</div><div class="value text-red-4">{{ patientData.bloodGroup || '-' }}</div></div>
            <div class="stat-box wide"><div class="label">ที่อยู่</div><div class="value small">{{ patientData.address || '-' }}</div></div>
          </div>
          <div class="row q-col-gutter-md q-mt-md">
            <div class="col-12 col-sm-6">
              <div class="alert-box warning h-full">
                <div class="head"><q-icon name="warning" class="q-mr-sm"/>แพ้ยา</div>
                <div class="body">{{ patientData.allergies || 'ไม่มี' }}</div>
              </div>
            </div>
            <div class="col-12 col-sm-6">
              <div class="alert-box info h-full">
                <div class="head"><q-icon name="restaurant" class="q-mr-sm"/>แพ้อาหาร</div>
                <div class="body">{{ patientData.foodAllergies || 'ไม่มี' }}</div>
              </div>
            </div>
             <div class="col-12">
              <div class="alert-box disease h-full">
                <div class="head"><q-icon name="monitor_heart" class="q-mr-sm"/>โรคประจำตัว</div>
                <div class="body">{{ patientData.underlyingDisease || 'ไม่มี' }}</div>
              </div>
            </div>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>

    <q-dialog v-model="isCropperVisible" persistent backdrop-filter="blur(4px)">
       <q-card style="width: 500px; max-width: 90vw; background: #1e293b; color: white;">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">ปรับแต่งรูปโปรไฟล์</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>
        <q-card-section>
          <cropper ref="cropperRef" class="cropper-container" :src="tempImage" :stencil-component="CircleStencil" :stencil-props="{ aspectRatio: 1/1 }" background-class="cropper-background" />
          <div class="text-caption text-grey-5 q-mt-sm text-center">ลากและย่อขยายเพื่อจัดตำแหน่งรูปภาพ</div>
        </q-card-section>
        <q-card-actions align="right" class="q-pa-md">
          <q-btn flat label="ยกเลิก" color="grey-5" v-close-popup />
          <q-btn unelevated rounded color="cyan-3" text-color="dark" label="บันทึกรูปภาพ" icon="save" @click="cropAndUpload" :loading="uploading"/>
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="isAvatarViewerVisible" backdrop-filter="blur(10px)">
      <div class="row items-center justify-center relative-position" style="width: 100vw; height: 100vh; pointer-events: none;" @click.self="isAvatarViewerVisible = false">
        <q-img v-if="patientData.avatarUrl" :src="patientData.avatarUrl" class="rounded-borders shadow-24" style="pointer-events: auto; max-width: 90vw; max-height: 90vh; min-width: 300px; width: auto; border: 4px solid rgba(255,255,255,0.1);" fit="contain" spinner-color="cyan-3" />
        <q-avatar v-else size="300px" color="primary" text-color="white" icon="person" style="pointer-events: auto;" />
        <q-btn round color="white" text-color="black" icon="close" size="lg" class="absolute-bottom q-mb-xl shadow-10" style="pointer-events: auto; bottom: 30px; left: 50%; transform: translateX(-50%);" v-close-popup />
      </div>
    </q-dialog>

  </q-page>
</template>
<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import axios from 'axios';
import { Cropper, CircleStencil } from 'vue-advanced-cropper';
import 'vue-advanced-cropper/dist/style.css';

const route = useRoute();
const router = useRouter();
const $q = useQuasar();

// State
const loading = ref(true);
const patientData = ref({});
const treatmentHistory = ref([]);
const currentVisit = ref(null);
const currentMainTab = ref('summary'); // 🔥 Default to Summary Tab
const sortOrder = ref('desc');
const isProfileDialogVisible = ref(false);
const isAvatarViewerVisible = ref(false);
const fileInput = ref(null);

// Cropper State
const isCropperVisible = ref(false);
const tempImage = ref(null);
const cropperRef = ref(null);
const uploading = ref(false);

const playClickSound = () => {};
const openProfileDialog = () => { isProfileDialogVisible.value = true; };
const triggerFileSelect = () => { fileInput.value.click(); };

const onFileSelect = (event) => {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    tempImage.value = e.target.result;
    isCropperVisible.value = true;
    event.target.value = '';
  };
  reader.readAsDataURL(file);
};

const cropAndUpload = () => {
  const { canvas } = cropperRef.value.getResult();
  if (!canvas) return;
  uploading.value = true;
  canvas.toBlob(async (blob) => {
    if (!blob) return;
    const formData = new FormData();
    formData.append('avatar', blob, 'avatar.jpg');
    try {
      const res = await axios.post(`https://emr-backend-api-8euv.onrender.com/api/patients/${route.params.id}/avatar`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.data && res.data.avatarUrl) {
         patientData.value.avatarUrl = `https://emr-backend-api-8euv.onrender.com${res.data.avatarUrl}?t=${Date.now()}`;
      }
      $q.notify({ type: 'positive', message: 'อัปเดตรูปโปรไฟล์สำเร็จ' });
      isCropperVisible.value = false;
    } catch (e) {
      console.error(e);
      $q.notify({ type: 'negative', message: 'อัปโหลดไม่สำเร็จ' });
    } finally {
      uploading.value = false;
    }
  }, 'image/jpeg');
};

const sortedTreatmentHistory = computed(() => {
  const sorted = [...treatmentHistory.value];
  sorted.sort((a, b) => sortOrder.value === 'asc' ? new Date(a.visitDate) - new Date(b.visitDate) : new Date(b.visitDate) - new Date(a.visitDate));
  return sorted;
});

const getTabLabel = (tab) => {
    switch(tab) {
        case 'summary': return 'สรุป';
        case 'vitals': return 'สัญญาณชีพ';
        case 'symptoms': return 'อาการ';
        case 'treatment': return 'การวินิจฉัย';
        case 'medication': return 'ยา';
        default: return tab;
    }
}

const formatDate = (dateStr) => dateStr ? new Date(dateStr).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' }) : '';
const getColorRGB = (c) => ({ red: '239, 68, 68', orange: '249, 115, 22', blue: '59, 130, 246', pink: '236, 72, 153', green: '34, 197, 94', grey: '156, 163, 175', teal: '20, 184, 166', purple: '168, 85, 247', indigo: '99, 102, 241', 'lime-9': '130, 193, 22' }[c] || '34, 211, 238');

const parseRosItems = (value) => {
  if (!value || value === '-') return [];
  if (Array.isArray(value)) return value;
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [value];
  } catch (e) {
    return value.replace(/[\[\]"]/g, '').split(',').map(s => s.trim()).filter(Boolean);
  }
};

const processPatientData = (raw) => {
  const getAge = (b) => { if(!b) return 0; const diff = Date.now() - new Date(b).getTime(); return Math.floor(diff / 31557600000); };
  return {
    ...raw,
    patientId: raw.patient_id,
    firstName: raw.first_name,
    lastName: raw.last_name,
    title: raw.prefix,
    nationalId: raw.national_id,
    age: getAge(raw.birth_date),
    sex: ['นาง','นางสาว','เด็กหญิง'].includes(raw.prefix) ? 'หญิง' : 'ชาย',
    bloodGroup: raw.blood_group,
    allergies: raw.drug_allergies,
    foodAllergies: raw.food_allergies,
    underlyingDisease: raw.underlying_disease,
    address: raw.address,
    avatarUrl: raw.avatar_url ? `https://emr-backend-api-8euv.onrender.com${raw.avatar_url}` : null
  };
};

// 🔥 แก้ไขฟังก์ชันนี้: ให้รองรับการดึง ICD-10 จากตารางใหม่ (visit_diagnoses)
// ------------------------------------------------------------------
// 📂 แก้ที่ไฟล์ Frontend (DoctorDiagnosisPage.vue)
// ------------------------------------------------------------------

// 📂 แก้ที่ไฟล์ Frontend: DoctorDiagnosisPage.vue

// ------------------------------------------------------------------
// 📂 ฟังก์ชัน processVisitData (Frontend) ฉบับสมบูรณ์
// ------------------------------------------------------------------

const processVisitData = (raw) => {
  // 0. ดึงข้อมูลย่อย (Vital Signs & PI)
  const vs = raw.vitalSign || raw.vitalSigns || raw.vital_signs || {};
  const pi = raw.present_illness || raw.PresentIllness || raw.pi || raw.notes || '-';

  // 1. จัดการ Chief Complaint (CC)
  let cc = '-';
  if (raw.symptoms?.chiefComplaints && Array.isArray(raw.symptoms.chiefComplaints)) {
      cc = raw.symptoms.chiefComplaints.map(c => c.name).join(', ');
  } else if (Array.isArray(raw.symptoms) && raw.symptoms.length > 0) {
    cc = raw.symptoms.map(s => s.symptom?.symptom_name || s.symptom_name).filter(Boolean).join(', ');
  } else if (raw.notes) {
    cc = raw.notes;
  }

  // 🔥 2. Logic การจัดการ Diagnosis (จุดสำคัญ)
  let mainDiagString = 'ไม่ระบุ'; // สำหรับโชว์ใน Sidebar (String)
  let diagnosesList = [];      // สำหรับโชว์ในหน้า Detail (Array)

  if (raw.icd10_diagnoses && Array.isArray(raw.icd10_diagnoses) && raw.icd10_diagnoses.length > 0) {

      // 2.1 เรียงลำดับจาก ID น้อย -> มาก (เพื่อให้ตัวแรกที่กรอก เป็นตัวหลักเสมอ)
      const sortedDiagnoses = [...raw.icd10_diagnoses].sort((a, b) => a.id - b.id);

      // 2.2 แปลงข้อมูลลง Array เพื่อเตรียมวนลูป
      diagnosesList = sortedDiagnoses.map(d => {
          if (d.icd10_detail) {
              const code = d.icd10_detail.code || '';
              // ดึงชื่ออังกฤษ ถ้าไม่มีเอาชื่อไทย
              const name = d.icd10_detail.name_en || d.icd10_detail.name_th || '';

              return {
                  code: code,
                  name: name,
                  full: `${code}: ${name}` // ไว้ใช้กรณีอยากโชว์เต็มๆ
              };
          }
          return null;
      }).filter(Boolean); // กรองค่า null ทิ้ง

      // 2.3 เซ็ตค่าที่จะโชว์ใน Sidebar (เอาแค่ตัวแรกตัวเดียว จะได้ไม่รก)
      if (diagnosesList.length > 0) {
          mainDiagString = diagnosesList[0].full;
      }
  }
  // Fallback: กรณีเป็นข้อมูลเก่าที่ไม่มี ICD-10
  else if (raw.diagnosis_note) {
      mainDiagString = raw.diagnosis_note;
      diagnosesList = [{ code: '', name: raw.diagnosis_note, full: raw.diagnosis_note }];
  }

  // 3. จัดการ Procedures (บริการ/หัตถการ)
  const proceduresSource = raw.visitProcedures || raw.procedures || [];

  // 4. จัดการ ROS (Review of Systems)
  const rosData = [
    { label: 'อาการทั่วไป', value: raw.ros_general },
    { label: 'ศีรษะและลำคอ', value: raw.ros_head_and_neck },
    { label: 'ระบบทางเดินหายใจ', value: raw.ros_respiratory },
    { label: 'ระบบหัวใจ/หลอดเลือด', value: raw.ros_cardiovascular },
    { label: 'ระบบทางเดินอาหาร', value: raw.ros_gastrointestinal },
    { label: 'ระบบผิวหนัง', value: raw.ros_skin }
  ].filter(item => item.value && item.value !== '-' && parseRosItems(item.value).length > 0);

  // 5. จัดการ Prescriptions (ยา)
  const prescriptionsData = (raw.prescriptions || []).map(p => ({
      name: p.product?.product_name || p.drug_name || 'ยาไม่ระบุชื่อ',
      qty: p.quantity || '-',
      usage: p.instruction || '-'
  }));

  // Return Formatted Object
  return {
    id: raw.visit_id,
    visitDate: raw.visit_datetime,

    // ✅ ส่งค่าออกไป 2 แบบ
    mainDiagnosis: mainDiagString, // แบบ String (สำหรับ Sidebar)
    diagnosesList: diagnosesList,  // แบบ Array (สำหรับหน้า Detail เอาไปแยก Main/Secondary)

    vitalSigns: [
      { label: 'ความดัน', value: (vs.blood_pressure_systolic && vs.blood_pressure_diastolic) ? `${vs.blood_pressure_systolic}/${vs.blood_pressure_diastolic}` : '-', unit: 'mmHg', icon: 'bloodtype', color: 'pink', ref: '< 120/80' },
      { label: 'ชีพจร', value: vs.pulse || '-', unit: 'bpm', icon: 'favorite', color: 'red', ref: '60-100' },
      { label: 'อุณหภูมิ', value: vs.temperature || '-', unit: '°C', icon: 'thermostat', color: 'orange', ref: '36.5-37.5' },
      { label: 'การหายใจ', value: vs.respiration || '-', unit: '/min', icon: 'air', color: 'blue', ref: '12-20' },
      { label: 'ออกซิเจน', value: vs.oxygen_saturation || '-', unit: '%', icon: 'water_drop', color: 'cyan', ref: '95-100' },
      { label: 'น้ำหนัก', value: vs.weight || '-', unit: 'kg', icon: 'monitor_weight', color: 'indigo', ref: '-' },
      { label: 'ส่วนสูง', value: vs.height || '-', unit: 'cm', icon: 'height', color: 'purple', ref: '-' },
      { label: 'BMI', value: vs.bmi || '-', unit: '', icon: 'calculate', color: 'teal', ref: '18.5-22.9' },
      { label: 'รอบเอว', value: vs.waist_circumference || '-', unit: 'cm', icon: 'straighten', color: 'lime-9', ref: '< 90(ช)/80(ญ)' }
    ],

    symptoms: {
      chiefComplaint: cc || '-',
      presentIllness: pi,
      ros: rosData
    },

    prescriptions: prescriptionsData,

    procedures: proceduresSource.flatMap(p => [
        p.service ? { service: p.service.service_name } : null,
        p.procedure ? { service: p.procedure.procedure_name } : null
      ]).filter(Boolean)
  };
};

const fetchData = async () => {
  loading.value = true;
  try {
    const res = await axios.get(`https://emr-backend-api-8euv.onrender.com/api/patients/${route.params.id}/record`);
    patientData.value = processPatientData(res.data.patient);
    treatmentHistory.value = res.data.visits.map(processVisitData);
    if(treatmentHistory.value.length > 0) currentVisit.value = sortedTreatmentHistory.value[0];
  } catch (e) { $q.notify({ type: 'negative', message: 'โหลดข้อมูลไม่สำเร็จ' }); }
  finally { loading.value = false; }
};

onMounted(fetchData);
</script>

<style scoped lang="scss">
@import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@300;400;600;700&display=swap');

$dark-bg: #0f172a;
$glass-bg: rgba(30, 41, 59, 0.6);
$border: 1px solid rgba(255,255,255,0.08);
$cyan: #22d3ee;

/* Main Layout */
.rounded-page-wrapper { background: #0f172a; font-family: 'Sarabun'; color: #e2e8f0; border-radius: 24px; margin: 16px; height: calc(100vh - 32px); overflow: hidden; box-shadow: 0 15px 50px rgba(0,0,0,0.5); border: $border; }
.fixed-layout { height: 100%; display: flex; flex-direction: column; overflow: hidden; }

/* Header & Nav */
.external-header { height: 60px; padding: 0 20px; display: flex; align-items: center; justify-content: space-between; background: rgba(15, 23, 42, 0.9); border-bottom: $border; }
.back-button-glassy { background: rgba(255,255,255,0.05); color: #94a3b8; border: $border; &:hover { background: rgba(255,255,255,0.1); color: white; } }
.glassy-tab-group { background: rgba(0,0,0,0.2); padding: 4px; border-radius: 50px; display: flex; gap: 8px; }
.tab-button-glassy { color: #64748b; width: 130px; justify-content: center; font-weight: 600; &.is-active { background: $cyan; color: #0f172a; box-shadow: 0 0 15px rgba(34,211,238,0.3); } }

/* Layout & Panels */
.layout-container-wrapper { flex: 1; padding: 16px; overflow: hidden; display: flex; }
.layout-container { flex: 1; display: flex; flex-direction: column; background: $glass-bg; backdrop-filter: blur(10px); border-radius: 16px; border: $border; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.3); }
.global-top-bar { height: 64px; border-bottom: $border; display: flex; align-items: center; padding: 0 24px; background: rgba(0,0,0,0.2); }
.content-grid { flex: 1; display: grid; grid-template-columns: 320px 1fr; overflow: hidden; }
.left-panel { border-right: $border; display: flex; flex-direction: column; background: rgba(0,0,0,0.1); }
.panel-header { height: 50px; padding: 0 16px; display: flex; align-items: center; justify-content: space-between; border-bottom: $border; background: rgba(255,255,255,0.02); }
.right-panel { padding: 20px; display: flex; flex-direction: column; overflow: hidden; position: relative; }
.content-frame-wrapper { flex: 1; display: flex; flex-direction: column; background: rgba(0, 0, 0, 0.2); border-radius: 20px; border: 1px solid rgba(255, 255, 255, 0.05); padding: 16px; overflow: hidden; box-shadow: inset 0 0 20px rgba(0,0,0,0.3); }

/* History List */
.history-list { padding: 10px; }
.history-item { border-radius: 8px; margin-bottom: 8px; transition: all 0.2s; position: relative; overflow: hidden; &:hover { background: rgba(255,255,255,0.05); } &.is-active { background: rgba(34,211,238,0.1); .indicator-bar { opacity: 1; } } }
.indicator-bar { position: absolute; left: 0; top: 0; bottom: 0; width: 4px; background: $cyan; opacity: 0; transition: opacity 0.2s; }
.detail-card { flex: 1; background: transparent; border-radius: 12px; overflow: hidden; }
.empty-state { height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; opacity: 0.5; }
.empty-state-small { text-align: center; padding: 40px; opacity: 0.7; }
.patient-info-wrapper { display: flex; align-items: center; cursor: pointer; width: 100%; &:hover { .text-h6 { color: $cyan; } } }
.avatar-ring { padding: 2px; border: 2px solid $cyan; border-radius: 50%; display: flex; }

/* Alert Badges */
.alert-badge {
  display: flex; align-items: center; justify-content: flex-start; padding: 0 12px;
  width: 85px; height: 28px; border-radius: 14px;
  font-size: 0.85rem; font-weight: 600; color: white; box-shadow: none;

  &.drug { background: #ef4444; }      /* สีแดง (แพ้ยา) */
  &.food { background: #f97316; }      /* สีส้ม (แพ้อาหาร) */
  &.disease { background: #9333ea; }   /* สีม่วง (โรคประจำตัว) */
}
.badge-text { flex: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-left: 6px; }

.opacity-20 { opacity: 0.2; } .h-full { height: 100%; } .no-margin { margin: 0; }

/* Profile Dialog */
.profile-dialog { width: 650px; background: #1e293b; color: white; border-radius: 16px; border: $border; }
.close-btn { position: absolute; top: 10px; right: 10px; color: #94a3b8; z-index: 10; }
.profile-avatar { overflow: hidden; border: 4px solid #1e293b; box-shadow: 0 0 0 2px $cyan, 0 0 20px rgba(34, 211, 238, 0.4); background-color: #334155; }
.stats-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.stat-box { background: rgba(0,0,0,0.2); padding: 12px; border-radius: 8px; border: $border; }
.stat-box .label { font-size: 0.8rem; color: #94a3b8; text-transform: uppercase; }
.stat-box .value { font-size: 1.2rem; font-weight: bold; color: white; }

/* Vitals (Capsule) */
.vitals-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 16px; }
.vital-card { border-radius: 50px; background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.08); padding: 12px 20px; display: flex; align-items: center; gap: 16px; transition: all 0.2s ease; min-height: 84px; box-sizing: border-box; &:hover { transform: translateY(-2px); background: rgba(255, 255, 255, 0.06); box-shadow: 0 4px 15px rgba(0,0,0,0.1); } }
.vital-icon { width: 50px; height: 50px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 24px; flex-shrink: 0; }
.vital-info { flex: 1; display: flex; flex-direction: column; justify-content: center; }
.vital-label { font-size: 0.85rem; color: #94a3b8; margin-bottom: 2px; font-weight: 600; }
.vital-value { font-size: 1.35rem; font-weight: bold; color: white; line-height: 1.2; }
.unit { font-size: 0.9rem; font-weight: normal; color: #94a3b8; margin-left: 4px; }
.vital-ref { font-size: 0.75rem; color: #64748b; margin-top: 2px; }

/* 🔥 Modern Medication Card Style V2 (Reworked Layout) */
.med-card-modern-v2 {
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(45, 212, 191, 0.2);
  border-radius: 16px;
  padding: 12px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
  position: relative;

  &:hover {
    background: rgba(45, 212, 191, 0.08);
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2), 0 0 0 1px rgba(45, 212, 191, 0.4);
    .med-icon-box-v2 {
      background: rgba(45, 212, 191, 0.25);
      color: #fff;
      transform: scale(1.05);
    }
  }
}

/* ส่วนซ้าย: แถบสี + ไอคอน */
.med-left-section {
  display: flex;
  align-items: center;
  margin-right: 16px;
  position: relative;
}

.accent-bar-v2 {
  position: absolute;
  left: -12px; /* ติดขอบซ้ายสุด */
  top: 50%;
  transform: translateY(-50%);
  width: 4px;
  height: 60%;
  background: #2dd4bf;
  border-radius: 0 4px 4px 0;
  opacity: 0.7;
}

.med-icon-box-v2 {
  width: 56px;
  height: 56px;
  border-radius: 14px;
  background: rgba(45, 212, 191, 0.15);
  color: #2dd4bf;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
  box-shadow: 0 4px 10px rgba(0,0,0,0.1);
}

/* ส่วนกลาง: ข้อมูลยา */
.med-content-v2 {
  flex: 1; /* ขยายเต็มพื้นที่ที่เหลือ */
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding-right: 16px; /* เว้นระยะจากส่วนขวา */
}

.med-name-v2 {
  font-size: 1.2rem;
  font-weight: bold;
  color: #f1f5f9;
  margin-bottom: 6px;
  line-height: 1.2;
}

.med-usage-wrapper-v2 {
  display: flex;
  align-items: center;
}

.med-usage-text-v2 {
  font-size: 0.95rem;
  color: #94a3b8;
  line-height: 1.4;
}

/* ส่วนขวา: จำนวน */
.med-right-section {
  display: flex;
  align-items: center;
}

.med-qty-badge-v2 {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: rgba(15, 23, 42, 0.8); /* พื้นหลังเข้มขึ้น */
  border: 1px solid rgba(45, 212, 191, 0.3);
  padding: 8px 16px;
  border-radius: 12px;
  min-width: 70px;
}

.qty-num-v2 {
  font-size: 1.4rem;
  font-weight: 800;
  color: #2dd4bf;
  line-height: 1;
}

.qty-label-v2 {
  font-size: 0.75rem;
  color: #64748b;
  margin-top: 2px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* Summary Page Elements */
.mini-vital-card { background: rgba(0,0,0,0.2); padding: 10px; border-radius: 12px; display: flex; align-items: center; gap: 10px; }
.med-capsule { background: rgba(45, 212, 191, 0.1); border: 1px solid rgba(45, 212, 191, 0.2); padding: 8px 12px; border-radius: 30px; display: flex; align-items: center; color: white; font-size: 0.95rem; }
.badge-qty { background: #2dd4bf; color: black; font-size: 0.75rem; font-weight: bold; padding: 2px 8px; border-radius: 10px; margin-left: 8px; }

/* ROS */
.ros-box { background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 16px; overflow: hidden; display: flex; flex-direction: column; height: 100%; transition: all 0.3s ease; &:hover { background: rgba(255, 255, 255, 0.06); border-color: rgba(34, 211, 238, 0.3); transform: translateY(-2px); box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2); } }
.ros-header { padding: 12px 16px; background: rgba(0, 0, 0, 0.2); border-bottom: 1px solid rgba(255, 255, 255, 0.05); }
.ros-content { padding: 12px 16px; flex: 1; }
.capsule-wrapper { display: flex; flex-wrap: wrap; gap: 8px; }
.ros-capsule { display: inline-flex; align-items: center; padding: 4px 12px; border-radius: 20px; font-size: 0.9rem; line-height: 1.4; background: rgba(34, 211, 238, 0.15); color: #a5f3fc; border: 1px solid rgba(34, 211, 238, 0.2); backdrop-filter: blur(4px); transition: background 0.2s; &:hover { background: rgba(34, 211, 238, 0.25); color: white; } &.more { background: rgba(255, 255, 255, 0.05); color: #94a3b8; border: 1px dashed rgba(255, 255, 255, 0.2); cursor: help; &:hover { background: rgba(255, 255, 255, 0.1); color: white; border-color: rgba(255, 255, 255, 0.4); } } }

/* Shared Info Box */
.info-box, .diagnosis-box { background: rgba(255,255,255,0.03); border: $border; border-radius: 12px; padding: 20px; }
.box-label { text-transform: uppercase; font-size: 0.85rem; font-weight: bold; margin-bottom: 8px; letter-spacing: 1px; }
.box-content, .diagnosis-text { font-size: 1.1rem; color: white; line-height: 1.5; }
.diagnosis-text { font-size: 1.5rem; font-weight: bold; color: $cyan; }
.procedure-item { background: rgba(0,0,0,0.2); padding: 12px; border-radius: 8px; margin-bottom: 8px; color: #e2e8f0; display: flex; align-items: center; }

/* Alert Box (Dialog) */
.alert-box { padding: 12px; border-radius: 8px; height: 100%; display: flex; flex-direction: column; .head { font-weight: bold; margin-bottom: 6px; display: flex; align-items: center; font-size: 1rem; } .body { font-size: 0.95rem; line-height: 1.4; flex: 1; } &.warning { background: rgba(239,68,68,0.1); color: #fca5a5; } &.info { background: rgba(249, 115, 22, 0.1); color: #fdba74; } &.disease { background: rgba(147, 51, 234, 0.1); color: #e9d5ff; } }

/* Cropper */
.cropper-container { height: 400px; background: #0f172a; }
.cropper-background { background: #0f172a; }

/* =========================================
   🔥 NEW & UPDATED STYLES (Diagnosis UI)
   ========================================= */

/* 1. Summary Tab: Comorbidities Badge (สีม่วง) */
.comorbid-badge {
  display: flex;
  align-items: center;
  background: rgba(168, 85, 247, 0.1); /* พื้นหลังม่วงจางๆ */
  border: 1px solid rgba(168, 85, 247, 0.3); /* เส้นขอบม่วง */
  border-radius: 8px;
  padding: 4px;
  transition: all 0.2s;

  &:hover {
    background: rgba(168, 85, 247, 0.2);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(168, 85, 247, 0.15);
  }
}
.code-tag {
  background: #a855f7; /* สีม่วงเข้ม */
  color: white;
  font-weight: bold;
  font-size: 0.8rem;
  padding: 2px 8px;
  border-radius: 6px;
  margin-right: 8px;
}
.name-text {
  color: #e9d5ff; /* สีม่วงอ่อน */
  font-size: 0.9rem;
  padding-right: 8px;
  font-weight: 500;
}

/* 2. Treatment Tab: Diagnosis Boxes */
.diagnosis-box.main {
  background: linear-gradient(135deg, rgba(34, 211, 238, 0.1) 0%, rgba(34, 211, 238, 0.02) 100%);
  border: 1px solid rgba(34, 211, 238, 0.3);
  box-shadow: 0 4px 20px rgba(34, 211, 238, 0.15);
}

.diagnosis-text-large {
  font-size: 1.6rem;
  line-height: 1.3;
}

/* 3. Treatment Tab: Secondary Diagnosis Grid */
.secondary-diag-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 12px;
}

.sec-diag-card {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(168, 85, 247, 0.2); /* สีม่วงอ่อน */
  border-left: 4px solid #a855f7; /* แถบสีม่วงด้านซ้าย */
  border-radius: 8px;
  padding: 12px 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  transition: transform 0.2s;

  &:hover {
    transform: translateX(4px);
    background: rgba(168, 85, 247, 0.1);
  }
}

.sec-code {
  font-weight: bold;
  font-size: 1.1rem;
  color: #d8b4fe; /* ม่วงอ่อน */
  min-width: 50px;
}

.sec-name {
  color: #e2e8f0;
  font-size: 1rem;
  line-height: 1.3;
}
</style>
