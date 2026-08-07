<template>
  <div class="certificate-container bg-grey-3 flex flex-center">

    <div class="print-controls fixed-top-right q-ma-md z-max">
      <q-btn color="primary" icon="print" label="พิมพ์เอกสาร (Print)" @click="printDoc" class="shadow-3" />
      <q-btn flat round icon="close" color="grey-8" class="q-ml-sm" v-close-popup />
    </div>

    <div class="paper-a4 relative-position">

      <div class="watermark-logo">
        <q-icon name="local_hospital" />
      </div>

      <div class="content-padding column full-height">

        <div class="header-section text-center q-mb-lg">
          <div class="row items-center justify-center q-mb-sm">
            <q-icon name="local_hospital" color="primary" size="48px" class="q-mr-sm" />
            <div class="text-h4 text-weight-bold text-primary font-header">ใบรับรองแพทย์</div>
          </div>
          <div class="text-subtitle1 text-weight-medium">MEDICAL CERTIFICATE</div>
          <div class="text-caption text-grey-8">คลินิก สบายใจเฮลท์แคร์ (Sabuyjai Healthcare Clinic)</div>
          <div class="text-caption text-grey-8">123 ถนนสุขใจ ต.ในเมือง อ.เมือง จ.ขอนแก่น 40000 โทร. 043-123456</div>
        </div>

        <q-separator color="primary" size="2px" class="q-mb-lg" />

        <div class="body-section col-grow">

          <div class="row q-mb-md">
            <div class="col-12 text-right text-subtitle2">
              วันที่ตรวจ (Date): <span class="text-weight-bold">{{ formatDate(date) }}</span>
            </div>
          </div>

          <div class="info-group q-mb-lg">
            <div class="text-h6 text-weight-bold text-primary q-mb-sm section-title">ส่วนที่ 1: ข้อมูลผู้ป่วย (Patient Information)</div>
            <div class="row q-col-gutter-y-sm">
              <div class="col-12 text-body1">
                ข้าพเจ้า นายแพทย์/แพทย์หญิง <span class="dotted-line">{{ doctorName }}</span>
                ใบอนุญาตประกอบวิชาชีพเวชกรรมเลขที่ <span class="dotted-line" style="width: 150px;">{{ doctorLicense }}</span>
              </div>
              <div class="col-12 text-body1">
                ได้ทำการตรวจร่างกายของ <span class="dotted-line" style="width: 300px;">{{ patientName }}</span>
              </div>
              <div class="col-12 row">
                <div class="col-6 text-body1">เลขบัตรประชาชน/Passport No.: <span class="dotted-line">{{ patientIdCard || '-' }}</span></div>
                <div class="col-6 text-body1">อายุ (Age): <span class="dotted-line" style="width: 50px;">{{ patientAge }}</span> ปี</div>
              </div>
              <div class="col-12 text-body1">
                ที่อยู่ (Address): <span class="dotted-line full-width">{{ patientAddress || '-' }}</span>
              </div>
            </div>
          </div>

          <div class="info-group q-mb-lg">
             <div class="text-h6 text-weight-bold text-primary q-mb-sm section-title">ส่วนที่ 2: ผลการตรวจ (Diagnosis & Opinion)</div>
             <div class="row q-col-gutter-md">
               <div class="col-12">
                 <div class="vital-signs-box q-pa-sm bg-grey-1 rounded-borders border-grey">
                   <div class="row text-center">
                     <div class="col">
                       <div class="text-caption text-grey-7">น้ำหนัก (Weight)</div>
                       <div class="text-weight-bold">{{ vitals.weight || '-' }} kg</div>
                     </div>
                     <div class="col">
                       <div class="text-caption text-grey-7">ส่วนสูง (Height)</div>
                       <div class="text-weight-bold">{{ vitals.height || '-' }} cm</div>
                     </div>
                     <div class="col">
                       <div class="text-caption text-grey-7">อุณหภูมิ (Temp)</div>
                       <div class="text-weight-bold">{{ vitals.temperature || '-' }} °C</div>
                     </div>
                     <div class="col">
                       <div class="text-caption text-grey-7">ความดัน (BP)</div>
                       <div class="text-weight-bold">{{ vitals.bp || '-' }} mmHg</div>
                     </div>
                     <div class="col">
                       <div class="text-caption text-grey-7">ชีพจร (Pulse)</div>
                       <div class="text-weight-bold">{{ vitals.pulse || '-' }} bpm</div>
                     </div>
                   </div>
                 </div>
               </div>

               <div class="col-12 text-body1 q-mt-sm">
                 <strong>การวินิจฉัยโรค (Diagnosis):</strong>
                 <div class="dotted-area">{{ diagnosis || 'ตรวจสุขภาพทั่วไป (General Checkup)' }}</div>
               </div>

               <div class="col-12 text-body1">
                 <strong>ความเห็นแพทย์ (Doctor's Opinion):</strong>
                 <div class="dotted-area" style="min-height: 60px;">
                   {{ opinion || 'สุขภาพแข็งแรงสมบูรณ์ (Good Health)' }}
                   <br v-if="!opinion">
                 </div>
               </div>
             </div>
          </div>

          <div class="text-caption text-grey-6 q-mt-md">
            * ใบรับรองแพทย์นี้รับรองเฉพาะผลการตรวจ ณ วันที่และเวลาที่ระบุไว้ข้างต้นเท่านั้น
          </div>

        </div>

        <div class="footer-section q-mt-xl">
          <div class="row justify-end">
             <div class="col-5 text-center">
               <div class="signature-line q-mb-sm"></div>
               <div class="text-body1 text-weight-bold">({{ doctorName || '..........................................' }})</div>
               <div class="text-caption">แพทย์ผู้ตรวจ (Attending Physician)</div>
             </div>
          </div>

          <q-separator class="q-my-md" />
          <div class="row items-center justify-between">
            <div class="text-caption text-grey-5">System Generated by MyEMR</div>
            <div class="qr-code-box bg-white border-grey flex flex-center">QR Code</div>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  patientName: String,
  patientAge: [String, Number],
  patientAddress: String,
  patientIdCard: String,
  doctorName: { type: String, default: 'นพ. สมชาย ใจดี' }, // Mock ไว้ก่อน
  doctorLicense: { type: String, default: 'ว.12345' },     // Mock ไว้ก่อน
  date: { type: String, default: new Date().toISOString() },
  vitals: {
    type: Object,
    default: () => ({ weight: '', height: '', temperature: '', bp: '', pulse: '' })
  },
  diagnosis: String,
  opinion: String
});

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('th-TH', {
    year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
};

const printDoc = () => {
  window.print();
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@300;400;500;600;700&display=swap');

.certificate-container {
  font-family: 'Sarabun', sans-serif;
  color: #333;
}

/* ขนาดกระดาษ A4 */
.paper-a4 {
  width: 210mm;
  height: 297mm;
  background: white;
  box-shadow: 0 0 15px rgba(0,0,0,0.1);
  margin: 20px;
  overflow: hidden;
  border: 1px solid #e0e0e0;
}

.content-padding {
  padding: 25mm 20mm; /* ขอบกระดาษมาตรฐาน */
  position: relative;
  z-index: 2;
}

/* ลายน้ำ */
.watermark-logo {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  opacity: 0.05;
  z-index: 1;
  pointer-events: none;
}
.watermark-logo .q-icon {
  font-size: 150mm;
  color: #000;
}

/* Typography & Lines */
.font-header {
  letter-spacing: 1px;
}
.section-title {
  border-bottom: 2px solid #eee;
  padding-bottom: 4px;
}
.dotted-line {
  border-bottom: 1px dotted #999;
  display: inline-block;
  padding: 0 10px;
  color: #000;
  font-weight: 600;
  min-width: 50px;
  text-align: center;
}
.dotted-area {
  border: 1px dotted #ccc;
  background: #fafafa;
  padding: 10px;
  border-radius: 4px;
  min-height: 40px;
  margin-top: 5px;
}
.full-width { width: 100%; text-align: left; }

/* Signature */
.signature-line {
  border-bottom: 1px solid #333;
  width: 80%;
  margin: 0 auto;
  height: 50px; /* เว้นที่ให้เซ็น */
}

.qr-code-box {
  width: 60px;
  height: 60px;
  border: 1px solid #ddd;
  font-size: 10px;
  color: #aaa;
}
.border-grey { border: 1px solid #e0e0e0; }

/* Print Styles */
@media print {
  body * {
    visibility: hidden;
  }
  .print-controls {
    display: none !important;
  }
  .certificate-container, .certificate-container * {
    visibility: visible;
  }
  .certificate-container {
    position: absolute;
    left: 0;
    top: 0;
    margin: 0;
    padding: 0;
    background: white;
  }
  .paper-a4 {
    box-shadow: none;
    border: none;
    margin: 0;
    width: 100%;
    height: auto;
    page-break-after: always;
  }
}
</style>
