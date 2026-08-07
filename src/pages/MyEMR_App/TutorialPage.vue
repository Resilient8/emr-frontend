<template>
  <q-page padding class="bg-grey-2">
    <div class="row justify-center q-pa-md">
      <div class="col-12 col-md-10 col-lg-8">

        <div class="text-h4 text-weight-bold text-primary text-center q-mb-md">
          เริ่มต้นใช้งานระบบ EMR
        </div>
        <div class="text-subtitle1 text-grey-7 text-center q-mb-xl">
          เรียนรู้วิธีการใช้งานฟังก์ชันหลักของระบบใน 4 ขั้นตอนง่ายๆ
        </div>

        <q-stepper
          v-model="step"
          ref="stepper"
          vertical
          color="primary"
          animated
          header-nav
          class="tutorial-stepper"
        >
          <q-step
            :name="1"
            title="ลงทะเบียนผู้ป่วยใหม่"
            icon="person_add"
            :done="step > 1"
          >
            <div class="text-body1 q-mb-md">
              เริ่มต้นด้วยการเพิ่มข้อมูลผู้ป่วยใหม่เข้าสู่ระบบ เพื่อสร้างเวชระเบียนกลางสำหรับติดตามการรักษา
            </div>
            <ul class="q-pl-lg">
              <li>ไปที่เมนู 'รายชื่อผู้ป่วย'</li>
              <li>คลิกปุ่ม 'เพิ่มผู้ป่วย'</li>
              <li>กรอกข้อมูลส่วนตัวที่จำเป็น เช่น ชื่อ, นามสกุล, วันเกิด, และข้อมูลติดต่อ</li>
            </ul>

            <q-stepper-navigation>
              <q-btn @click="step = 2" color="primary" label="ขั้นตอนถัดไป" />
            </q-stepper-navigation>
          </q-step>

          <q-step
            :name="2"
            title="บันทึกข้อมูลซักประวัติและสัญญาณชีพ"
            icon="monitor_heart"
            :done="step > 2"
          >
            <div class="text-body1 q-mb-md">
              บันทึกข้อมูลการซักประวัติและสัญญาณชีพของผู้ป่วยในแต่ละครั้งที่เข้ารับบริการ เพื่อให้แพทย์มีข้อมูลครบถ้วนที่สุด
            </div>
            <ul class="q-pl-lg">
              <li>ไปที่เมนู 'บันทึกข้อมูลการรักษา'</li>
              <li>ค้นหาและเลือกผู้ป่วยที่ต้องการ</li>
              <li>กรอกข้อมูลสัญญาณชีพ (อุณหภูมิ, ชีพจร, ความดัน)</li>
              <li>บันทึกอาการสำคัญ (Chief Complaint) และซักประวัติเพิ่มเติมตามระบบ (Review of Systems)</li>
            </ul>
            <q-stepper-navigation>
              <q-btn @click="step = 3" color="primary" label="ขั้นตอนถัดไป" />
              <q-btn flat @click="step = 1" color="primary" label="ย้อนกลับ" class="q-ml-sm" />
            </q-stepper-navigation>
          </q-step>

          <q-step
            :name="3"
            title="การวินิจฉัยและสั่งยาโดยแพทย์"
            icon="medical_services"
            :done="step > 3"
          >
            <div class="text-body1 q-mb-md">
              หลังจากพยาบาลซักประวัติเรียบร้อย แพทย์จะเข้าสู่หน้าจอวินิจฉัยเพื่อสรุปผล, วางแผนการรักษา, และสั่งยา
            </div>
            <ul class="q-pl-lg">
              <li>แพทย์เลือกเคสผู้ป่วยจากหน้า 'Doctor's Worklist'</li>
              <li>ตรวจสอบข้อมูลสัญญาณชีพและอาการทั้งหมด</li>
              <li>กรอกข้อมูลในส่วน 'การวินิจฉัย (Diagnosis)' และ 'แผนการรักษา (Plan)'</li>
              <li>เพิ่มรายการยาที่ต้องการสั่งจ่ายในส่วน 'การสั่งยา (Prescription)'</li>
            </ul>
            <q-stepper-navigation>
              <q-btn @click="step = 4" color="primary" label="ขั้นตอนถัดไป" />
              <q-btn flat @click="step = 2" color="primary" label="ย้อนกลับ" class="q-ml-sm" />
            </q-stepper-navigation>
          </q-step>

          <q-step
            :name="4"
            title="การดูประวัติการรักษา"
            icon="history"
          >
            <div class="text-body1 q-mb-md">
              สามารถย้อนดูประวัติการรักษาทั้งหมดของผู้ป่วยแต่ละรายได้ง่ายๆ เพื่อการรักษาที่ต่อเนื่องและมีประสิทธิภาพ
            </div>
            <ul class="q-pl-lg">
              <li>ค้นหาผู้ป่วยที่ต้องการ</li>
              <li>คลิกที่ปุ่ม 'ประวัติการบันทึก' หรือเข้าสู่หน้ารายละเอียดผู้ป่วย</li>
              <li>ระบบจะแสดงรายการการเข้ารับการรักษาในอดีตทั้งหมด</li>
            </ul>
            <q-stepper-navigation>
              <q-btn color="positive" @click="step = 1" label="เรียนรู้อีกครั้ง" />
              <q-btn flat @click="step = 3" color="primary" label="ย้อนกลับ" class="q-ml-sm" />
            </q-stepper-navigation>
          </q-step>
        </q-stepper>

        <div class="text-center q-mt-xl">
            <q-btn
                label="กลับไปหน้าหลัก"
                color="primary"
                icon="home"
                size="lg"
                to="/"
                unelevated
                class="q-px-xl"
            />
        </div>

      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref } from 'vue';

const step = ref(1);
</script>

<style scoped>
.tutorial-stepper {
  background-color: #ffffff;
  border-radius: 12px;
  border: 1px solid #e0e0e0;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
}

/* ทำให้เนื้อหาใน step อ่านง่ายขึ้น */
.q-stepper__content {
  padding-top: 16px;
}
.text-body1 {
  color: #555;
}
ul {
  line-height: 1.8;
}
</style>
