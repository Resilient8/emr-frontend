<template>
  <q-page class="page-background q-pa-md" padding>
    <!-- Main Container -->
    <div class="certificate-container">
      <!-- Header -->
      <div class="row items-center justify-between q-mb-md">
        <div class="col-auto">
          <div class="title-container">
            <div class="text-h4 text-weight-bolder header-title">
              <q-icon name="o_description" class="title-icon" />
              <span>ใบรับรองแพทย์</span>
            </div>
            <div class="title-underline-glow"></div>
          </div>
        </div>
        <div class="col-auto">
           <q-btn
              label="พิมพ์ใบรับรอง"
              icon="o_print"
              @click="printCertificate"
              class="primary-action-btn"
              unelevated
            />
        </div>
      </div>

      <!-- Certificate Form -->
      <q-card class="certificate-card" id="printable-area">
        <q-card-section>
          <div class="row justify-between q-mb-sm">
            <div class="col-6">
              <q-input dark dense outlined v-model="certificateData.volume" label="เล่มที่" />
            </div>
            <div class="col-5">
              <q-input dark dense outlined v-model="certificateData.number" label="เลขที่" />
            </div>
          </div>
        </q-card-section>

        <q-separator dark class="q-my-md" />

        <!-- Part 1: Patient Info -->
        <q-card-section>
          <div class="part-title">ส่วนที่ 1: ของผู้ขอรับใบรับรองสุขภาพ</div>
          <p class="q-mt-md">
            ข้าพเจ้า <q-input dark dense outlined v-model="certificateData.patientName" label="ชื่อ-นามสกุล ผู้ป่วย" class="inline-input" style="width: 300px;" />
            สถานที่อยู่ (ที่สามารถติดต่อได้) <q-input dark dense outlined v-model="certificateData.patientAddress" label="ที่อยู่" class="q-mt-sm" type="textarea" autogrow/>
          </p>
          <p>
            หมายเลขบัตรประชาชน <q-input dark dense outlined v-model="certificateData.patientId" label="หมายเลขบัตรประชาชน" class="inline-input" style="width: 250px;" />
          </p>
          <p class="q-mt-lg">
            ข้าพเจ้าขอรับรองว่าข้อความข้างต้นเป็นความจริง และได้แจ้งประวัติสุขภาพดังนี้
          </p>
          <div class="q-gutter-md q-mt-md">
            <q-checkbox dark v-model="certificateData.hasChronicDisease" label="โรคประจำตัว" />
            <q-input dark dense outlined v-if="certificateData.hasChronicDisease" v-model="certificateData.chronicDiseaseDetail" label="ระบุโรคประจำตัว" class="q-ml-lg q-mt-xs" />

            <q-checkbox dark v-model="certificateData.hasAccident" label="อุบัติเหตุ และ ผ่าตัด" />
            <q-input dark dense outlined v-if="certificateData.hasAccident" v-model="certificateData.accidentDetail" label="ระบุรายละเอียด" class="q-ml-lg q-mt-xs" />

            <q-checkbox dark v-model="certificateData.hasHospitalization" label="เคยเข้ารับการรักษาในโรงพยาบาล" />
            <q-input dark dense outlined v-if="certificateData.hasHospitalization" v-model="certificateData.hospitalizationDetail" label="ระบุรายละเอียด" class="q-ml-lg q-mt-xs" />

            <q-checkbox dark v-model="certificateData.hasOtherHistory" label="ประวัติอื่นที่สำคัญ" />
            <q-input dark dense outlined v-if="certificateData.hasOtherHistory" v-model="certificateData.otherHistoryDetail" label="ระบุรายละเอียด" class="q-ml-lg q-mt-xs" />
          </div>
        </q-card-section>

        <q-separator dark class="q-my-md" />

        <!-- Part 2: Doctor's Part -->
        <q-card-section>
          <div class="part-title">ส่วนที่ 2: ของแพทย์</div>
          <div class="row items-center q-mt-md">
            <div class="col-12 col-sm-6">
                <q-input dark dense outlined v-model="certificateData.examDate" label="วันที่ตรวจ" mask="date" :rules="['date']">
                    <template v-slot:append>
                        <q-icon name="event" class="cursor-pointer">
                        <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                            <q-date v-model="certificateData.examDate" dark borderless>
                            <div class="row items-center justify-end">
                                <q-btn v-close-popup label="Close" color="primary" flat />
                            </div>
                            </q-date>
                        </q-popup-proxy>
                        </q-icon>
                    </template>
                </q-input>
            </div>
          </div>
          <p class="q-mt-md">
            ข้าพเจ้า <q-input dark dense outlined v-model="certificateData.doctorName" label="ชื่อแพทย์" class="inline-input" style="width: 250px;" />
            ใบอนุญาตประกอบวิชาชีพเวชกรรมเลขที่ <q-input dark dense outlined v-model="certificateData.doctorLicense" label="เลขที่ใบอนุญาต" class="inline-input" style="width: 200px;" />
            สถานประกอบพยาบาล <q-input dark dense outlined v-model="certificateData.hospitalName" label="ชื่อสถานพยาบาล" class="inline-input" style="width: 300px;" />
          </p>
          <p>
            ได้ตรวจร่างกาย <span class="text-weight-bold">{{ certificateData.patientName }}</span> แล้วเมื่อวันที่ <span class="text-weight-bold">{{ certificateData.examDate || '...' }}</span> มีรายละเอียดดังนี้
          </p>
          <div class="row q-col-gutter-md q-mt-sm">
            <div class="col-6 col-sm-3"><q-input dark dense outlined v-model="certificateData.vitals.weight" label="น้ำหนัก" suffix="กก."/></div>
            <div class="col-6 col-sm-3"><q-input dark dense outlined v-model="certificateData.vitals.height" label="ส่วนสูง" suffix="ซม."/></div>
            <div class="col-6 col-sm-3"><q-input dark dense outlined v-model="certificateData.vitals.temperature" label="อุณหภูมิ" suffix="°C"/></div>
            <div class="col-6 col-sm-3"><q-input dark dense outlined v-model="certificateData.vitals.pulse" label="ชีพจร" suffix="ครั้ง/นาที"/></div>
            <div class="col-12 col-sm-6"><q-input dark dense outlined v-model="certificateData.vitals.bloodPressure" label="ความดันโลหิต" suffix="มม.ปรอท"/></div>
          </div>
          <q-input class="q-mt-md" dark dense outlined v-model="certificateData.otherVitals" label="สภาพร่างกายทั่วไปอื่น ๆ (ถ้ามี)" />

          <p class="q-mt-lg">ขอรับรองว่าบุคคลดังกล่าว:</p>
          <q-input dark v-model="certificateData.doctorOpinion" type="textarea" outlined label="ความเห็นแพทย์" class="q-mt-sm" autogrow/>

          <p class="q-mt-lg">สรุปความเห็นและข้อแนะนำของแพทย์:</p>
          <q-input dark v-model="certificateData.doctorRecommendation" type="textarea" outlined label="สรุปและข้อแนะนำ" class="q-mt-sm" autogrow/>
        </q-card-section>

        <!-- Signature -->
        <q-card-section class="q-mt-xl text-center">
            <div class="row justify-center">
                <div class="col-8 col-sm-5">
                    <div class="signature-box">
                        <q-input dark borderless v-model="certificateData.doctorSignature" label="ลายมือชื่อแพทย์ผู้ตรวจร่างกาย" input-style="text-align: center;"/>
                    </div>
                    <div class="text-center q-mt-sm">
                        ( {{ certificateData.doctorName || '..................................................' }} )
                    </div>
                    <div class="text-center">
                        แพทย์ผู้ตรวจร่างกาย
                    </div>
                </div>
            </div>
        </q-card-section>

      </q-card>
    </div>
  </q-page>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useQuasar } from 'quasar';

const $q = useQuasar();

// Mock patient data, in a real app this would come from a prop or API call
const patientData = {
  patientInfo: { name: 'นายสมชาย ใจดี', patientId: '1234567890123', gender: 'ชาย', age: 42, allergies: 'Penicillin', foodAllergies: 'ไม่มี', underlyingDisease: 'ความดันโลหิตสูง' },
  vitalSigns: { temperature: 36.8, pulse: 80, breathing: 18, bloodPressureSystolic: 130, bloodPressureDiastolic: 85, height: 170, weight: 65 },
};

// Reactive data model for the certificate form
const certificateData = reactive({
  volume: '1',
  number: '001',
  patientName: '',
  patientAddress: '123/45 หมู่ 6 ต.สุเทพ อ.เมือง จ.เชียงใหม่ 50200',
  patientId: '',
  hasChronicDisease: false,
  chronicDiseaseDetail: '',
  hasAccident: false,
  accidentDetail: '',
  hasHospitalization: false,
  hospitalizationDetail: '',
  hasOtherHistory: false,
  otherHistoryDetail: '',
  examDate: new Date().toISOString().substr(0, 10).replace(/-/g, '/'),
  doctorName: 'พญ.ใจดี มีเมตตา',
  doctorLicense: 'ว.12345',
  hospitalName: 'คลินิกสุขภาพดี',
  vitals: {
    weight: '',
    height: '',
    temperature: '',
    pulse: '',
    bloodPressure: '',
  },
  otherVitals: 'ร่างกายโดยทั่วไปแข็งแรงดี',
  doctorOpinion: 'ไม่เป็นผู้มีร่างกายทุพพลภาพ ไม่สมประกอบ หรือจิตฟั่นเฟือนไม่สมประกอบ และไม่ปรากฏอาการของโรคพิษสุราเรื้อรัง หรือติดยาเสพติดให้โทษ และไม่ปรากฏอาการและอาการแสดงของโรคเรื้อนในระยะติดต่อ หรือในระยะที่ปรากฏอาการเป็นที่รังเกียจแก่สังคม วัณโรคในระยะอันตราย',
  doctorRecommendation: 'ควรพักผ่อนให้เพียงพอและออกกำลังกายสม่ำเสมอ',
  doctorSignature: 'ใจดี มีเมตตา'
});

onMounted(() => {
  // Populate certificate with patient data when component is mounted
  if (patientData) {
    certificateData.patientName = patientData.patientInfo.name;
    certificateData.patientId = patientData.patientInfo.patientId;
    certificateData.vitals.weight = patientData.vitalSigns.weight;
    certificateData.vitals.height = patientData.vitalSigns.height;
    certificateData.vitals.temperature = patientData.vitalSigns.temperature;
    certificateData.vitals.pulse = patientData.vitalSigns.pulse;
    certificateData.vitals.bloodPressure = `${patientData.vitalSigns.bloodPressureSystolic}/${patientData.vitalSigns.bloodPressureDiastolic}`;

    // Pre-check chronic disease if data exists
    if (patientData.patientInfo.underlyingDisease && patientData.patientInfo.underlyingDisease !== 'ไม่มี') {
        certificateData.hasChronicDisease = true;
        certificateData.chronicDiseaseDetail = patientData.patientInfo.underlyingDisease;
    }
  }
});

// Function to print the certificate
const printCertificate = () => {
  $q.notify({
    message: 'กำลังเตรียมการพิมพ์...',
    icon: 'o_print',
    position: 'top',
    timeout: 1500,
  });
  // A short delay to allow notification to show
  setTimeout(() => {
    window.print();
  }, 500);
};

</script>

<style lang="scss" scoped>
// Import styles from your original component for consistency
.page-background {
  background-color: #0d1a26;
  font-family: 'Sarabun', sans-serif;
  color: #e0e0e0;
}

.certificate-container {
  max-width: 800px;
  margin: 0 auto;
}

// Title styles from your original component
.title-container {
  position: relative;
  padding-bottom: 12px;
}
.header-title {
  color: #ffffff;
  text-shadow: 0 0 8px rgba(0, 184, 255, 0.8);
  display: flex;
  align-items: center;
}
.title-icon {
  font-size: 2.2rem;
  color: #00d4ff;
  margin-right: 16px;
  text-shadow: 0 0 12px #00d4ff;
}
.title-underline-glow {
  position: absolute;
  bottom: 0;
  left: 0;
  height: 3px;
  width: 100%;
  background: #00d4ff;
  border-radius: 2px;
  box-shadow: 0 0 8px #00d4ff, 0 0 12px #00d4ff;
}

// Button style from your original component
.primary-action-btn {
  border: 1px solid #00b8ff;
  color: #00b8ff;
  background: transparent;
  transition: all 0.3s ease;
  &:hover {
    background-color: #00b8ff;
    color: white;
    box-shadow: 0 0 12px rgba(0, 184, 255, 0.7);
  }
}

// Certificate card styling
.certificate-card {
  background-color: rgba(38, 50, 56, 0.6);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  border: 1px solid rgba(0, 184, 255, 0.2);
  padding: 1rem 2rem;
  font-family: 'Sarabun', sans-serif;
}

.part-title {
  font-size: 1.2rem;
  font-weight: bold;
  color: #cce7ff;
  border-left: 4px solid #00b8ff;
  padding-left: 12px;
  margin-bottom: 1rem;
}

.inline-input {
  display: inline-block;
  vertical-align: middle;
  margin: 0 8px;
}

.signature-box {
    border-bottom: 1px dotted #90a4ae;
    padding-bottom: 4px;
    margin-bottom: 8px;
}

// Deep selectors for Quasar components
:deep(.q-field--outlined.q-field--dark .q-field__control) {
  background: rgba(0, 184, 255, 0.05) !important;
}
:deep(.q-field--dark .q-field__label) {
  color: #90a4ae !important;
}
:deep(.q-checkbox__label) {
  font-size: 1rem;
}
</style>

<style>
/* Print-specific styles */
@media print {
  /* Hide everything except the printable area */
  body * {
    visibility: hidden;
  }
  #printable-area, #printable-area * {
    visibility: visible;
  }
  #printable-area {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    margin: 0;
    padding: 0;
    border: none !important;
    box-shadow: none !important;
    background: white !important;
    color: black !important;
  }

  /* Ensure Quasar components print correctly */
  .q-page {
    padding: 0 !important;
  }
  .certificate-card {
    padding: 20px !important;
    border-radius: 0 !important;
  }
  .part-title {
    color: black !important;
    border-left-color: black !important;
  }

  /* Make inputs look like text on paper */
  .q-field__control, .q-field__native, .q-field__prefix, .q-field__suffix {
    color: black !important;
  }
  .q-field--outlined .q-field__control {
    border: none !important;
    padding: 0 !important;
  }
   .q-field__native {
    font-weight: bold;
  }
  .q-field__label {
    display: none;
  }
  .q-checkbox__inner {
    display: none; /* Hide checkbox, show label */
  }
  .q-checkbox__label {
    color: black !important;
  }
}
</style>
