<template>
  <q-page padding class="dashboard-background">
    <!-- REMOVED: Animated Aurora Background -->

    <div class="q-pa-md content-wrapper">

      <!-- Header Section -->
      <div class="header-section main-card q-pa-md q-mb-lg row items-center justify-between list-item-animation" style="animation-delay: 0.1s;">
        <div class="row items-center">
          <q-icon name="o_feed" size="lg" class="q-mr-md header-icon" />
          <div class="text-h5 text-weight-bold header-title">บันทึกข้อมูลการรักษาผู้ป่วย</div>
        </div>
        <q-btn flat round icon="history" class="header-action-btn" @click="toggleHistory" @mouseenter="playNextNote">
          <q-tooltip class="tooltip-glassy">ประวัติการบันทึก</q-tooltip>
        </q-btn>
      </div>

      <!-- Patient Selection Card -->
      <q-card class="main-card interactive-card q-mb-lg list-item-animation" style="animation-delay: 0.2s;">
        <q-card-section>
          <div class="section-header">
            <q-icon name="o_person_search" />
            <span>ข้อมูลผู้ป่วย</span>
          </div>
          <div class="row q-col-gutter-md">
            <div class="col-12 col-md-6">
              <q-select dark dense outlined v-model="selectedPatientIdObject" label="ค้นหาด้วย ID ผู้ป่วย" :options="patientIdOptions" use-input input-debounce="0" @filter="filterPatientId" @update:model-value="(newValue) => { handlePatientSelection(newValue); playNextNote(); }" @popup-show="playNextNote" @clear="playClearSound" clearable :disable="isPatientLoadedFromRoute">
                <template v-slot:no-option><q-item><q-item-section class="text-grey">ไม่พบข้อมูล</q-item-section></q-item></template>
              </q-select>
            </div>
            <div class="col-12 col-md-6">
              <q-select dark dense outlined v-model="selectedPatientNameObject" label="ค้นหาด้วยชื่อผู้ป่วย" :options="patientNameOptions" use-input input-debounce="0" @filter="filterPatientName" @update:model-value="(newValue) => { handlePatientSelection(newValue); playNextNote(); }" @popup-show="playNextNote" @clear="playClearSound" clearable :disable="isPatientLoadedFromRoute">
                <template v-slot:option="scope"><q-item v-bind="scope.itemProps"><q-item-section><q-item-label>{{ scope.opt.label }}</q-item-label><q-item-label caption>{{ scope.opt.value }}</q-item-label></q-item-section></q-item></template>
                <template v-slot:no-option><q-item><q-item-section class="text-grey">ไม่พบข้อมูล</q-item-section></q-item></template>
              </q-select>
            </div>
          </div>
          <q-slide-transition>
            <div v-if="patientInfo.id" class="patient-details-box q-pa-md q-mt-md">
              <div class="row items-center q-col-gutter-md">
                <div class="col-auto">
                  <q-avatar size="70px" color="primary" text-color="white" icon="o_person" class="patient-avatar" />
                </div>
                <div class="col">
                  <div class="text-h6 text-white">{{ patientInfo.name }} <span class="text-body1 welcome-text q-ml-sm">(ID: {{ patientInfo.patientId }})</span></div>
                  <div class="row items-center q-mt-xs welcome-text q-gutter-x-lg">
                    <div v-if="patientInfo.gender"><strong>เพศ:</strong> {{ patientInfo.gender }}</div>
                    <div v-if="patientInfo.age !== null"><strong>อายุ:</strong> {{ patientInfo.age }} ปี</div>
                  </div>
                </div>
                <div class="col-12 col-md-auto">
                  <div class="row items-center q-mt-md q-md-mt-none welcome-text q-gutter-x-lg justify-end">
                    <div><strong>โรคประจำตัว:</strong> <span :class="{'text-negative text-weight-bolder': patientInfo.underlyingDiseases !== 'ไม่มี'}">{{ patientInfo.underlyingDiseases }}</span></div>
                    <div><strong>การแพ้ยา:</strong> <span :class="{'text-negative text-weight-bolder': patientInfo.drugAllergies !== 'ไม่มี'}">{{ patientInfo.drugAllergies }}</span></div>
                  </div>
                </div>
              </div>
            </div>
          </q-slide-transition>
        </q-card-section>
      </q-card>

      <!-- Vital Signs Card -->
      <q-card class="main-card interactive-card q-mb-lg list-item-animation" style="animation-delay: 0.3s;" :class="{ 'form-disabled': isFormLocked }">
        <q-card-section>
            <div class="section-header">
                <q-icon name="monitor_heart" />
                <span>บันทึกสัญญาณชีพ (Vital Signs)</span>
            </div>
            <div class="row q-col-gutter-md q-mb-sm">
                <div class="col-6 col-md-3"><q-input dark dense outlined v-model.number="newVitalSign.temperature" label="อุณหภูมิ (°C)" type="number" step="0.1"><template v-slot:prepend><q-icon name="thermostat" /></template></q-input></div>
                <div class="col-6 col-md-3"><q-input dark dense outlined v-model.number="newVitalSign.pulse" label="ชีพจร (ครั้ง/นาที)" type="number"><template v-slot:prepend><q-icon name="favorite_border" /></template></q-input></div>
                <div class="col-6 col-md-3"><q-input dark dense outlined v-model.number="newVitalSign.breathing" label="การหายใจ (ครั้ง/นาที)" type="number"><template v-slot:prepend><q-icon name="air" /></template></q-input></div>
                <div class="col-6 col-md-3"><q-input dark dense outlined v-model.number="newVitalSign.oxygenSaturation" label="O2 Sat (%)" type="number"><template v-slot:prepend><q-icon name="o_bloodtype" /></template></q-input></div>
                <div class="col-6 col-md-3"><q-input dark dense outlined v-model.number="newVitalSign.bloodPressureSystolic" label="ความดัน (Systolic)" type="number"><template v-slot:prepend><q-icon name="o_arrow_upward" /></template></q-input></div>
                <div class="col-6 col-md-3"><q-input dark dense outlined v-model.number="newVitalSign.bloodPressureDiastolic" label="ความดัน (Diastolic)" type="number"><template v-slot:prepend><q-icon name="o_arrow_downward" /></template></q-input></div>
                <div class="col-6 col-md-3"><q-input dark dense outlined v-model.number="newVitalSign.height" label="ส่วนสูง (ซม.)" type="number" @update:model-value="calculateBMI"><template v-slot:prepend><q-icon name="o_height" /></template></q-input></div>
                <div class="col-6 col-md-3"><q-input dark dense outlined v-model.number="newVitalSign.weight" label="น้ำหนัก (กก.)" step="0.1" @update:model-value="calculateBMI"><template v-slot:prepend><q-icon name="o_scale" /></template></q-input></div>
                <div class="col-6 col-md-3"><q-input dark dense outlined v-model.number="newVitalSign.waist" label="รอบเอว (ซม.)" type="number"><template v-slot:prepend><q-icon name="o_straighten" /></template></q-input></div>
                <div class="col-6 col-md-3"><q-input dark dense outlined v-model="newVitalSign.bmi" label="BMI" readonly><template v-slot:prepend><q-icon name="o_fitness_center" /></template></q-input></div>
            </div>
            <div v-if="bmiInterpretation" class="q-mt-md">
              <q-banner inline-actions rounded-borders :class="bmiInterpretation.styleClass">
                <template v-slot:avatar><q-icon :name="bmiInterpretation.icon" size="md" /></template>
                <div class="text-weight-bold">{{ bmiInterpretation.title }}</div>
                <div>{{ bmiInterpretation.text }}</div>
              </q-banner>
            </div>
        </q-card-section>
      </q-card>

      <!-- History Card -->
      <q-card class="main-card interactive-card q-mb-lg list-item-animation" style="animation-delay: 0.4s;" :class="{ 'form-disabled': isFormLocked }">
        <q-card-section>
            <div class="section-header">
                <q-icon name="plagiarism" />
                <span>อาการและการซักประวัติ</span>
            </div>
            <div class="text-subtitle1 q-mt-md welcome-text">อาการสำคัญที่นำมา (Chief Complaint & Present Illness)</div>
            <div class="row q-col-gutter-sm q-mb-md">
                <div class="col-12"><q-input dark dense outlined v-model="chiefComplaint" label="อาการสำคัญ" /></div>
                <div class="col-12"><q-input dark dense outlined v-model="presentIllness" label="รายละเอียดอาการเพิ่มเติม" type="textarea" autogrow class="q-mt-sm"/></div>
            </div>
            <div class="text-subtitle1 q-mt-lg welcome-text">การซักประวัติเพิ่มเติมตามระบบ (Review of Systems)</div>
            <div class="row q-col-gutter-md q-mb-md">
                <div class="col-12 col-md-6"><q-select dark dense outlined v-model="reviewOfSystems.general" multiple :options="rosOptions.general" use-chips stack-label label="อาการทั่วไป (General)" @update:model-value="playNextNote" @popup-show="playNextNote"/></div>
                <div class="col-12 col-md-6"><q-select dark dense outlined v-model="reviewOfSystems.headAndNeck" multiple :options="rosOptions.headAndNeck" use-chips stack-label label="ศีรษะและลำคอ (Head & Neck)" @update:model-value="playNextNote" @popup-show="playNextNote"/></div>
                <div class="col-12 col-md-6"><q-select dark dense outlined v-model="reviewOfSystems.respiratory" multiple :options="rosOptions.respiratory" use-chips stack-label label="ระบบทางเดินหายใจ (Respiratory)" @update:model-value="playNextNote" @popup-show="playNextNote"/></div>
                <div class="col-12 col-md-6"><q-select dark dense outlined v-model="reviewOfSystems.cardiovascular" multiple :options="rosOptions.cardiovascular" use-chips stack-label label="ระบบหัวใจและหลอดเลือด (Cardiovascular)" @update:model-value="playNextNote" @popup-show="playNextNote"/></div>
                <div class="col-12 col-md-6"><q-select dark dense outlined v-model="reviewOfSystems.gastrointestinal" multiple :options="rosOptions.gastrointestinal" use-chips stack-label label="ระบบทางเดินอาหาร (Gastrointestinal)" @update:model-value="playNextNote" @popup-show="playNextNote"/></div>
                <div class="col-12 col-md-6"><q-select dark dense outlined v-model="reviewOfSystems.skin" multiple :options="rosOptions.skin" use-chips stack-label label="ระบบผิวหนัง (Dermatological)" @update:model-value="playNextNote" @popup-show="playNextNote"/></div>
            </div>
        </q-card-section>
      </q-card>

      <!-- Treatment & Referral Card -->
      <q-card class="main-card interactive-card q-mb-xl list-item-animation" style="animation-delay: 0.5s;" :class="{ 'form-disabled': isFormLocked }">
        <q-card-section>
            <div class="section-header">
                <q-icon name="medical_services" />
                <span>การรักษาและการส่งต่อ</span>
            </div>
            <div class="text-subtitle1 q-mt-md welcome-text">ข้อมูลการรักษา</div>
            <div class="row q-col-gutter-sm q-mb-md">
                <div class="col-12 col-md-4"><q-select dark dense outlined v-model="newProcedureItem.service" label="บริการ" :options="serviceOptions" class="q-mb-sm" @update:model-value="playNextNote" @popup-show="playNextNote"/></div>
                <div class="col-12 col-md-4"><q-select dark dense outlined v-model="newProcedureItem.procedure" label="หัตถการ" :options="procedureOptions" :disable="isProcedureDisabled" use-input input-debounce="0" @filter="filterProcedure" class="q-mb-sm" @update:model-value="playNextNote" @popup-show="playNextNote"/></div>
                <div class="col-12 col-md-4"><q-select dark dense outlined v-model="newProcedureItem.diagnosis" label="การวินิจฉัย" :options="diagnosisOptions" :disable="isProcedureDisabled" use-input input-debounce="0" @filter="filterDiagnosis" class="q-mb-sm" @update:model-value="playNextNote" @popup-show="playNextNote"/></div>
                <div class="col-12"><q-input dark dense outlined v-model="newProcedureItem.notes" label="บันทึกเพิ่มเติม" type="textarea" class="q-mb-sm"/></div>
                <div class="col-12 q-mt-sm row q-gutter-sm">
                <q-btn class="primary-action-btn" label="เพิ่มการรักษา" @click="addProcedure" :disable="!newProcedureItem.service" @mouseenter="playNextNote"/>
                <q-btn class="secondary-action-btn" outline label="ไม่รับการรักษา" @click="addDeclinedProcedure" @mouseenter="playNextNote"/>
                </div>
            </div>
            <div v-if="procedures.length > 0">
                <q-separator class="q-my-md" dark /><div class="text-subtitle1 welcome-text">รายการการรักษา</div>
                <q-list bordered separator class="themed-list">
                <q-item v-for="(procedure, index) in procedures" :key="index" @mouseenter="playNextNote">
                    <q-item-section>
                    <q-item-label>บริการ: {{ procedure.service }}</q-item-label>
                    <q-item-label caption>การวินิจฉัย: {{ procedure.diagnosis }}</q-item-label>
                    <q-item-label caption>หัตถการ: {{ procedure.procedure }}</q-item-label>
                    <q-item-label caption>บันทึก: {{ procedure.notes || '-' }}</q-item-label>
                    </q-item-section>
                    <q-item-section side>
                    <q-btn flat round icon="delete" color="red" @click="removeProcedure(index)" @mouseenter="playNextNote"/>
                    </q-item-section>
                </q-item>
                </q-list>
            </div>
            <q-separator class="q-my-lg" dark />
            <div class="text-subtitle1 welcome-text">การส่งต่อผู้ป่วย (Referral)</div>
            <q-btn-toggle
                v-model="referralChoice" unelevated toggle-color="primary" color="rgba(0, 184, 255, 0.1)" text-color="primary"
                :options="[{label: 'ไม่ส่งต่อ', value: 'no_referral'},{label: 'ส่งต่อ', value: 'refer'}]"
                class="q-mb-md"
                @update:model-value="playNextNote" @mouseenter="playNextNote"
            />
            <div v-if="referralChoice === 'refer'">
                <div class="row q-col-gutter-sm q-mb-md">
                <div class="col-12 col-md-6"><q-select dark dense outlined v-model="selectedDepartment" label="เลือกแผนก" :options="departmentOptions" clearable @update:model-value="playNextNote" @popup-show="playNextNote"/></div>
                <div class="col-12 col-md-6"><q-select dark dense outlined v-model="selectedDoctor" label="เลือกแพทย์" :options="filteredDoctorOptions" :disable="!selectedDepartment" clearable @update:model-value="playNextNote" @popup-show="playNextNote">
                    <template v-slot:no-option><q-item><q-item-section class="text-grey">กรุณาเลือกแผนกก่อน</q-item-section></q-item></template>
                </q-select></div>
                </div>
            </div>
            <div class="col-12"><q-input dark dense outlined v-model="referralNotes" label="หมายเหตุการส่งต่อ (ถ้ามี)" type="textarea" autogrow class="q-mt-sm"/></div>
        </q-card-section>
      </q-card>

    </div> <!-- End content-wrapper -->

    <!-- Sticky Footer for Actions -->
    <q-footer class="action-footer">
      <div class="row items-center justify-between q-pa-md">
        <div class="row items-center text-grey-7 welcome-text">
          <q-icon name="person" class="q-mr-sm" />
          <span class="text-subtitle2">ผู้บันทึก: {{ recordingNurse }}</span>
        </div>
        <q-btn class="save-btn" @click="saveProcedureData" label="บันทึกข้อมูลทั้งหมด" icon="save" @mouseenter="playNextNote" :disable="isFormLocked"/>
      </div>
    </q-footer>

  </q-page>
</template>

<script setup>
import * as Tone from 'tone';
import { reactive, ref, computed, onMounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { date } from 'quasar';
import axios from 'axios';

// --- Tone.js Sound Engine (No changes) ---
const meloSynth = new Tone.FMSynth({
    harmonicity: 3.1,
    modulationIndex: 20,
    envelope: { attack: 0.001, decay: 0.1, sustain: 0.1, release: 0.8 },
    modulationEnvelope: { attack: 0.01, decay: 0.5, sustain: 0, release: 0.8 },
}).toDestination();
meloSynth.volume.value = -10;

const clearSoundSynth = new Tone.MetalSynth({
  frequency: 800,
  envelope: { attack: 0.001, decay: 0.1, sustain: 0, release: 0.1, },
  harmonicity: 5.1,
  modulationIndex: 15,
  resonance: 10000,
  octaves: 2,
}).toDestination();
clearSoundSynth.volume.value = -6;

const noteSequence = [
  { note: 'C4', duration: '4n' }, { note: 'C4', duration: '4n' }, { note: 'G4', duration: '4n' }, { note: 'G4', duration: '4n' },
  { note: 'A4', duration: '4n' }, { note: 'A4', duration: '4n' }, { note: 'G4', duration: '2n' },
  { note: 'F4', duration: '4n' }, { note: 'F4', duration: '4n' }, { note: 'E4', duration: '4n' }, { note: 'E4', duration: '4n' },
  { note: 'D4', duration: '4n' }, { note: 'D4', duration: '4n' }, { note: 'C4', duration: '2n' },
];
const noteIndex = ref(0);
const isSoundPlaying = ref(false);

const playNextNote = () => {
  if (isSoundPlaying.value) return;
  if (Tone.context.state !== 'running') { Tone.context.resume(); }
  isSoundPlaying.value = true;
  const { note, duration } = noteSequence[noteIndex.value];
  if (note) { meloSynth.triggerAttackRelease(note, duration); }
  const delay = Tone.Time(duration).toMilliseconds();
  setTimeout(() => { isSoundPlaying.value = false; }, delay);
  noteIndex.value = (noteIndex.value + 1) % noteSequence.length;
};

const playClearSound = () => {
  if (Tone.context.state !== 'running') { Tone.context.resume(); }
  clearSoundSynth.triggerAttackRelease("C5", "32n");
};
// --- END Tone.js Sound Engine ---

const router = useRouter();
const route = useRoute();

const recordingNurse = ref('พยาบาล สมศรี สุขใจ');
const recordType = ref('walk_in');
const recordTimestamp = ref(Date.now());
const formData = reactive({ recordDateTime: computed(() => date.formatDate(recordTimestamp.value, 'DD/MM/YYYY HH:mm')), });

watch(recordType, (newType) => { if (newType === 'walk_in') { recordTimestamp.value = Date.now(); } });

const allPatients = ref([]);
const selectedPatientIdObject = ref(null);
const selectedPatientNameObject = ref(null);
const patientInfo = ref({ id: '', name: '', patientId: '', gender: '', age: null, drugAllergies: '', foodAllergies: '', underlyingDiseases: '' });
const patientIdOptions = ref([]);
const patientNameOptions = ref([]);
const masterPatientIdOptions = ref([]);
const masterPatientNameOptions = ref([]);

const isPatientLoadedFromRoute = computed(() => !!route.params.id);
const isFormLocked = computed(() => !patientInfo.value.id);

const newVitalSign = reactive({ temperature: null, pulse: null, breathing: null, bloodPressureSystolic: null, bloodPressureDiastolic: null, oxygenSaturation: null, waist: null, height: null, weight: null, bmi: '' });
const chiefComplaint = ref('');
const presentIllness = ref('');
const reviewOfSystems = ref({ general: [], headAndNeck: [], respiratory: [], cardiovascular: [], gastrointestinal: [], skin: [] });
const rosOptions = { general: ['มีไข้', 'หนาวสั่น', 'อ่อนเพลีย / ไม่มีแรง', 'เบื่ออาหาร', 'น้ำหนักลด', 'เหงื่อออกกลางคืน'], headAndNeck: ['ปวดศีรษะ', 'เวียนศีรษะ', 'เจ็บคอ', 'ต่อมน้ำเหลืองโต', 'ตาแดง/เคืองตา', 'มองเห็นผิดปกติ', 'หูอื้อ/ปวดหู', 'มีน้ำมูก/คัดจมูก'], respiratory: ['ไอ', 'ไอมีเสมหะ', 'หายใจลำบาก/หอบเหนื่อย', 'เจ็บหน้าอกเวลาหายใจ', 'ไอเป็นเลือด'], cardiovascular: ['เจ็บหน้าอก', 'ใจสั่น', 'บวม', 'นอนราบไม่ได้'], gastrointestinal: ['คลื่นไส้/อาเจียน', 'ปวดท้อง', 'ท้องเสีย', 'ท้องผูก', 'ถ่ายเป็นเลือด/ถ่ายดำ', 'ตัวเหลืองตาเหลือง'], skin: ['ผื่น', 'ตุ่มน้ำ', 'คัน', 'ผิวแห้ง'], };

const bmiInterpretation = computed(() => {
  const bmi = parseFloat(newVitalSign.bmi);
  if (!bmi || bmi <= 0) return null;
  if (bmi < 18.5) return { title: 'น้ำหนักน้อย / ผอม', text: 'ควรเพิ่มการบริโภคอาหารที่มีประโยชน์', styleClass: 'bmi-banner-underweight', icon: 'sentiment_dissatisfied' };
  if (bmi <= 24.9) return { title: 'น้ำหนักปกติ', text: 'อยู่ในเกณฑ์ดี', styleClass: 'bmi-banner-normal', icon: 'check_circle' };
  if (bmi <= 29.9) return { title: 'น้ำหนักเกิน (ท้วม)', text: 'ควรปรับพฤติกรรมการทานอาหารและเริ่มออกกำลังกาย', styleClass: 'bmi-banner-overweight', icon: 'warning' };
  if (bmi <= 35.0) return { title: 'อ้วนระดับ 1 (อันตราย)', text: 'เสี่ยงต่อการเกิดโรคร้ายแรง ควรปรับพฤติกรรม', styleClass: 'bmi-banner-obese1', icon: 'error' };
  return { title: 'อ้วนระดับ 2 (อันตรายมาก)', text: 'มีความเสี่ยงสูงต่อการเกิดโรคร้ายแรง ควรปรึกษาแพทย์', styleClass: 'bmi-banner-obese2', icon: 'dangerous' };
});

const procedures = ref([]);
const newProcedureItem = reactive({ service: null, procedure: null, diagnosis: null, notes: '' });
const serviceOptions = ["ตรวจรักษา", "กายภาพ", "-", "อื่นๆ"];
const originalDiagnosisOptions = ["ไข้หวัด", "ปวดหัว", "อื่นๆ"];
const diagnosisOptions = ref([...originalDiagnosisOptions]);
const originalProcedureOptions = ["วัดความดัน", "ให้คำแนะนำ", "อื่นๆ"];
const procedureOptions = ref([...originalProcedureOptions]);

const isProcedureDisabled = computed(() => newProcedureItem.service === '-');

const allDoctors = ref([{ id: 1, name: 'นพ. สมชาย ใจดี', department: 'อายุรกรรม' }, { id: 2, name: 'นพ. เก่งกาจ ชนะชัย', department: 'อายุรกรรม' }, { id: 3, name: 'พญ. สุดา รักษา', department: 'กุมารเวชกรรม' }, { id: 4, name: 'พญ. ยิ่งลักษณ์ อารี', department: 'กุมารเวชกรรม' }, { id: 5, name: 'นพ. วิชัย เชี่ยวชาญ', department: 'ศัลยกรรม' }]);
const referralChoice = ref('no_referral');
const selectedDepartment = ref(null);
const selectedDoctor = ref(null);
const referralNotes = ref('');

const departmentOptions = computed(() => [...new Set(allDoctors.value.map(d => d.department))]);
const filteredDoctorOptions = computed(() => !selectedDepartment.value ? [] : allDoctors.value.filter(doctor => doctor.department === selectedDepartment.value).map(doctor => doctor.name));

watch(referralChoice, (newChoice) => { if (newChoice === 'no_referral') { selectedDepartment.value = null; selectedDoctor.value = null; } });
watch(selectedDepartment, () => { selectedDoctor.value = null; });

const showHistory = ref(false);

const getGenderFromPrefix = (prefix) => {
  if (!prefix) return '-';
  if (['นาย', 'เด็กชาย'].includes(prefix)) return 'ชาย';
  if (['นาง', 'นางสาว', 'เด็กหญิง'].includes(prefix)) return 'หญิง';
  return '-';
};

const fetchAllPatients = async () => {
  try {
    const patientData = [
        { id: 1, prefix: 'นาย', firstName: 'สมศักดิ์', lastName: 'แข็งแรง', patientId: 'HN00123', age: 45, underlyingDiseases: 'ความดันโลหิตสูง', drugAllergies: 'ไม่มี', foodAllergies: 'ไม่มี' },
        { id: 2, prefix: 'นางสาว', firstName: 'สมศรี', lastName: 'สุขใจ', patientId: 'HN00456', age: 32, underlyingDiseases: 'ไม่มี', drugAllergies: 'Penicillin', foodAllergies: 'ไม่มี' },
        { id: 3, prefix: 'เด็กชาย', firstName: 'มานะ', lastName: 'อดทน', patientId: 'HN00789', age: 8, underlyingDiseases: 'ไม่มี', drugAllergies: 'ไม่มี', foodAllergies: 'ไม่มี' },
        { id: 4, prefix: 'นาง', firstName: 'สมบูรณ์', lastName: 'มั่งมี', patientId: 'HN00112', age: 60, underlyingDiseases: 'เบาหวาน', drugAllergies: 'ไม่มี', foodAllergies: 'ไม่มี' },
        { id: 5, prefix: 'นาย', firstName: 'วิชัย', lastName: 'ใจสู้', patientId: 'HN00258', age: 50, underlyingDiseases: 'ไม่มี', drugAllergies: 'ไม่มี', foodAllergies: 'ไม่มี' },
        { id: 8, prefix: 'นาย', firstName: 'เอกราช', lastName: 'ชาติไทย', patientId: 'HN00555', age: 28, underlyingDiseases: 'ไม่มี', drugAllergies: 'ไม่มี', foodAllergies: 'ไม่มี' },
    ];
    allPatients.value = patientData;
    masterPatientIdOptions.value = patientData.map(p => ({ label: p.patientId, value: p.patientId.toUpperCase() }));
    masterPatientNameOptions.value = patientData.map(p => ({ label: `${p.prefix || ''}${p.firstName} ${p.lastName}`, value: p.patientId.toUpperCase() }));
    patientIdOptions.value = [...masterPatientIdOptions.value];
    patientNameOptions.value = [...masterPatientNameOptions.value];
  } catch (error) { console.error('Error fetching all patients:', error); }
};

const handlePatientSelection = (selectedOption) => {
  if (!selectedOption) {
    patientInfo.value = { id: '', name: '', patientId: '', gender: '', age: null, drugAllergies: '', foodAllergies: '', underlyingDiseases: '' };
    selectedPatientIdObject.value = null;
    selectedPatientNameObject.value = null;
    return;
  }
  const newPatientId = selectedOption.value.toUpperCase();
  if (patientInfo.value.patientId && patientInfo.value.patientId.toUpperCase() === newPatientId) return;
  const foundPatient = allPatients.value.find(p => p.patientId.toUpperCase() === newPatientId);
  if (foundPatient) {
    patientInfo.value = { id: foundPatient.id, name: `${foundPatient.prefix || ''}${foundPatient.firstName} ${foundPatient.lastName}`, patientId: foundPatient.patientId, age: foundPatient.age, gender: getGenderFromPrefix(foundPatient.prefix), drugAllergies: foundPatient.drugAllergies || 'ไม่มี', foodAllergies: foundPatient.foodAllergies || 'ไม่มี', underlyingDiseases: foundPatient.underlyingDiseases || 'ไม่มี' };
    selectedPatientIdObject.value = { label: foundPatient.patientId, value: foundPatient.patientId.toUpperCase() };
    selectedPatientNameObject.value = { label: `${foundPatient.prefix || ''}${foundPatient.firstName} ${foundPatient.lastName}`, value: foundPatient.patientId.toUpperCase() };
  }
};

const loadPatientRecord = (patientId) => {
    const savedRecords = {
        '1': {
            vitalSigns: { temperature: 37.5, pulse: 88, breathing: 20, bloodPressureSystolic: 120, bloodPressureDiastolic: 80, oxygenSaturation: 98, waist: 80, height: 175, weight: 70, bmi: '22.86' },
            symptoms: { chiefComplaint: 'มีไข้, ไอ, เจ็บคอ', presentIllness: 'มีอาการมา 2 วัน', reviewOfSystems: { general: ['มีไข้'], respiratory: ['ไอ', 'ไอมีเสมหะ'] } },
        },
        '3': {
            vitalSigns: { temperature: 36.8, pulse: 100, breathing: 22, bloodPressureSystolic: 100, bloodPressureDiastolic: 60, oxygenSaturation: 99, waist: null, height: 120, weight: 25, bmi: '17.36' },
            symptoms: { chiefComplaint: 'หกล้ม, มีแผลถลอก', presentIllness: '', reviewOfSystems: { general: [], headAndNeck: [], respiratory: [], cardiovascular: [], gastrointestinal: [], skin: [] } },
        }
    };
    const record = savedRecords[patientId];
    if (record) {
        Object.assign(newVitalSign, record.vitalSigns);
        chiefComplaint.value = record.symptoms.chiefComplaint;
        presentIllness.value = record.symptoms.presentIllness;
        reviewOfSystems.value = { ...reviewOfSystems.value, ...record.symptoms.reviewOfSystems };
    }
};

onMounted(async () => {
  await fetchAllPatients();
  const patientIdFromRoute = route.params.id;
  if (patientIdFromRoute) {
    const foundPatient = allPatients.value.find(p => p.id == patientIdFromRoute);
    if (foundPatient) {
      handlePatientSelection({ value: foundPatient.patientId });
      loadPatientRecord(foundPatient.id);
    }
  }
});

const filterPatientId = (val, update) => { update(() => { patientIdOptions.value = !val ? masterPatientIdOptions.value : masterPatientIdOptions.value.filter(v => v.label.toLowerCase().includes(val.toLowerCase())); }); };
const filterPatientName = (val, update) => { update(() => { patientNameOptions.value = !val ? masterPatientNameOptions.value : masterPatientNameOptions.value.filter(v => v.label.toLowerCase().includes(val.toLowerCase())); }); };
const filterDiagnosis = (val, update) => { update(() => { diagnosisOptions.value = !val ? originalDiagnosisOptions : originalDiagnosisOptions.filter(v => v.toLowerCase().includes(val.toLowerCase())); }); };
const filterProcedure = (val, update) => { update(() => { procedureOptions.value = !val ? originalProcedureOptions : originalProcedureOptions.filter(v => v.toLowerCase().includes(val.toLowerCase())); }); };

const calculateBMI = () => { if (newVitalSign.height > 0 && newVitalSign.weight > 0) { newVitalSign.bmi = (newVitalSign.weight / ((newVitalSign.height / 100) ** 2)).toFixed(2); } else { newVitalSign.bmi = ''; } };

const addProcedure = () => { if (newProcedureItem.service) { if (newProcedureItem.service === '-') { newProcedureItem.procedure = '-'; newProcedureItem.diagnosis = '-'; } procedures.value.push({ ...newProcedureItem }); Object.assign(newProcedureItem, { service: null, procedure: null, diagnosis: null, notes: '' }); } };
const addDeclinedProcedure = () => { procedures.value.push({ service: 'ไม่รับการรักษา', procedure: '-', diagnosis: '-', notes: newProcedureItem.notes || 'ผู้ป่วยปฏิเสธการรับบริการ' }); Object.assign(newProcedureItem, { service: null, procedure: null, diagnosis: null, notes: '' }); };
const removeProcedure = (index) => { procedures.value.splice(index, 1); };

const saveProcedureData = () => {
  if (!patientInfo.value.id) return;
  const dataToSave = { patientId: patientInfo.value.id, recordType: recordType.value, recordDateTime: formData.recordDateTime, recordedBy: recordingNurse.value, symptoms: { chiefComplaint: chiefComplaint.value, presentIllness: presentIllness.value, reviewOfSystems: reviewOfSystems.value }, vitalSigns: { ...newVitalSign }, procedures: [...procedures.value], referral: { choice: referralChoice.value, department: selectedDepartment.value, doctor: selectedDoctor.value, notes: referralNotes.value } };
  console.log("Saving data:", dataToSave);
  router.push({ name: 'NursePatientList' });
};

const toggleHistory = () => { showHistory.value = !showHistory.value; };
</script>

<style scoped>
/* --- FONT & BASE --- */
.dashboard-background {
  /* MODIFIED: Changed background color back */
  background-color: #0d1a26;
  font-family: 'Sarabun', sans-serif;
  color: #e0e0e0;
}

.content-wrapper {
  position: relative;
  z-index: 2;
}

/* --- REMOVED: AURORA BACKGROUND --- */


/* --- HEADER --- */
.header-icon {
  color: #38bdf8;
  text-shadow: 0 0 12px #38bdf8;
}

.header-title {
  color: #ffffff;
  text-shadow: 0 0 8px rgba(56, 189, 248, 0.7);
}

.welcome-text {
  color: #94a3b8;
}

.header-action-btn {
  border: 1px solid rgba(56, 189, 248, 0.4);
  color: #94a3b8;
  border-radius: 50%;
  transition: all 0.3s ease;
}

.header-action-btn:hover {
  background-color: rgba(56, 189, 248, 0.2);
  color: white;
  box-shadow: 0 0 12px rgba(56, 189, 248, 0.5);
  transform: scale(1.1);
}

/* --- GLASSMORPHISM CARD --- */
.main-card {
  background-color: rgba(15, 23, 42, 0.6); /* Darker, less transparent base */
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-radius: 16px;
  border: 1px solid rgba(100, 116, 139, 0.3);
  color: #e0e0e0;
  transition: all 0.3s ease;
}

/* --- 3D TILT EFFECT --- */
.interactive-card {
  transform-style: preserve-3d;
}
.interactive-card:hover {
  border-color: rgba(56, 189, 248, 0.5);
  box-shadow: 0 10px 30px -5px rgba(0, 0, 0, 0.3);
}

/* --- SECTION HEADER --- */
.section-header {
  font-size: 1.25rem;
  font-weight: 600;
  color: #f1f5f9;
  padding-bottom: 12px;
  margin-bottom: 20px;
  border-bottom: 1px solid rgba(100, 116, 139, 0.3);
  display: flex;
  align-items: center;
}

.section-header .q-icon {
  font-size: 1.8rem;
  margin-right: 12px;
  color: #38bdf8;
}

/* --- PATIENT INFO --- */
.patient-avatar {
  border: 4px solid #38bdf8;
  box-shadow: 0 0 15px #38bdf8;
  display: flex;
  align-items: center;
  justify-content: center;
}

.patient-details-box {
  background-color: rgba(56, 189, 248, 0.05);
  border: 1px solid rgba(56, 189, 248, 0.2);
  border-radius: 12px;
}

/* --- FORM ELEMENTS --- */
:deep(.q-field--outlined.q-field--dark .q-field__control) {
  background: rgba(56, 189, 248, 0.05) !important;
  border-color: rgba(100, 116, 139, 0.5) !important;
  transition: all 0.3s ease;
}

:deep(.q-field--dark .q-field__label) {
  color: #94a3b8 !important;
}

:deep(.q-field--outlined.q-field--dark.q-field--focused .q-field__control) {
  background: rgba(56, 189, 248, 0.1) !important;
  border-color: #38bdf8 !important;
  box-shadow: 0 0 8px rgba(56, 189, 248, 0.4);
}

/* --- BMI BANNER STYLES --- */
.q-banner {
  background: transparent;
}

.bmi-banner-underweight {
  background-color: rgba(56, 189, 248, 0.15); /* blue */
  border: 1px solid rgba(56, 189, 248, 0.4);
  color: #bae6fd;
}
.bmi-banner-underweight :deep(.q-banner__avatar .q-icon) { color: #7dd3fc; }
.bmi-banner-underweight .text-weight-bold { color: #e0f2fe; }

.bmi-banner-normal {
  background-color: rgba(34, 197, 94, 0.15); /* green */
  border: 1px solid rgba(34, 197, 94, 0.4);
  color: #a7f3d0;
}
.bmi-banner-normal :deep(.q-banner__avatar .q-icon) { color: #4ade80; }
.bmi-banner-normal .text-weight-bold { color: #f0fdf4; }

.bmi-banner-overweight {
  background-color: rgba(234, 179, 8, 0.15); /* yellow */
  border: 1px solid rgba(234, 179, 8, 0.4);
  color: #fef08a;
}
.bmi-banner-overweight :deep(.q-banner__avatar .q-icon) { color: #facc15; }
.bmi-banner-overweight .text-weight-bold { color: #fefce8; }

.bmi-banner-obese1 {
  background-color: rgba(249, 115, 22, 0.15); /* orange */
  border: 1px solid rgba(249, 115, 22, 0.4);
  color: #fed7aa;
}
.bmi-banner-obese1 :deep(.q-banner__avatar .q-icon) { color: #fb923c; }
.bmi-banner-obese1 .text-weight-bold { color: #fff7ed; }

.bmi-banner-obese2 {
  background-color: rgba(239, 68, 68, 0.15); /* red */
  border: 1px solid rgba(239, 68, 68, 0.4);
  color: #fecaca;
}
.bmi-banner-obese2 :deep(.q-banner__avatar .q-icon) { color: #f87171; }
.bmi-banner-obese2 .text-weight-bold { color: #fef2f2; }


/* --- BUTTONS --- */
.primary-action-btn, .save-btn {
  border-radius: 8px;
  padding: 10px 20px;
  font-size: 1rem;
  font-weight: 600;
  color: white;
  transition: all 0.3s ease;
  transform: translateZ(20px); /* For 3D effect */
}

.primary-action-btn {
  background-color: #0ea5e9;
  box-shadow: 0 4px 15px -5px rgba(14, 165, 233, 0.5);
}
.primary-action-btn:hover {
  background-color: #38bdf8;
  box-shadow: 0 6px 20px -5px rgba(56, 189, 248, 0.6);
  transform: translateY(-2px) translateZ(20px);
}

.save-btn {
  background-color: #10b981;
  box-shadow: 0 4px 15px -5px rgba(16, 185, 129, 0.5);
  animation: pulse-green 2.5s infinite;
}
.save-btn:hover {
  background-color: #34d399;
  box-shadow: 0 6px 20px -5px rgba(52, 211, 153, 0.6);
  transform: translateY(-2px) translateZ(20px);
  animation-play-state: paused;
}

@keyframes pulse-green {
  0% { box-shadow: 0 4px 15px -5px rgba(16, 185, 129, 0.5); }
  50% { box-shadow: 0 4px 25px -2px rgba(16, 185, 129, 0.7); }
  100% { box-shadow: 0 4px 15px -5px rgba(16, 185, 129, 0.5); }
}

.secondary-action-btn {
  color: #94a3b8;
  font-weight: 600;
  font-size: 1rem;
  padding: 10px 20px;
  border: 1px solid rgba(100, 116, 139, 0.5);
  transition: all 0.3s ease;
}
.secondary-action-btn:hover {
  color: #38bdf8;
  background-color: rgba(56, 189, 248, 0.1);
  border-color: rgba(56, 189, 248, 0.4);
}

/* --- LISTS & FOOTER --- */
:deep(.q-list.themed-list) {
  background-color: rgba(56, 189, 248, 0.05);
  border: 1px solid rgba(56, 189, 248, 0.15);
  border-radius: 12px;
  overflow: hidden;
}

:deep(.q-list.themed-list .q-item):hover {
  background-color: rgba(56, 189, 248, 0.1) !important;
}

.tooltip-glassy {
  background: rgba(15, 23, 42, 0.7);
  backdrop-filter: blur(5px);
  border: 1px solid rgba(100, 116, 139, 0.3);
  color: white;
}

.action-footer {
  background: rgba(13, 26, 38, 0.8); /* Reverted to a slightly different dark color for contrast */
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border-top: 1px solid rgba(100, 116, 139, 0.3);
  position: sticky;
  bottom: 0;
  z-index: 10;
}

/* --- ANIMATIONS --- */
@keyframes fadeInSlideUp {
  from {
    opacity: 0;
    transform: translateY(25px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.list-item-animation {
  animation: fadeInSlideUp 0.6s cubic-bezier(0.25, 1, 0.5, 1) forwards;
  opacity: 0;
}

.form-disabled {
  opacity: 0.5;
  pointer-events: none;
  filter: grayscale(50%);
}
</style>
