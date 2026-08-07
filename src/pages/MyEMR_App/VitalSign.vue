<template>
  <q-page padding class="bg-gray-2">

    <div class="q-pa-md">

      <div class="text-h5 text-center q-mb-md title">
        Vital Sign
      </div>

      <q-card class="my-card">
        <q-card-section class="q-pa-lg">
          <div class="row q-col-gutter-sm">
            <div class="col-6">
              <q-input
                dense
                outlined
                v-model="vitalSignData.date"
                label="วัน/เดือน/ปี"
                class="input-field"
                :disable="!isEditing"
                mask="##/##/####"
              />
              <q-input
                dense
                outlined
                v-model="vitalSignData.temperature"
                label="อุณหภูมิ"
                class="input-field q-mt-sm"
                :disable="!isEditing"
              />
              <q-input
                dense
                outlined
                v-model="vitalSignData.pulse"
                label="ชีพจร"
                class="input-field q-mt-sm"
                :disable="!isEditing"
              />
            </div>
            <div class="col-6">
              <q-input
                dense
                outlined
                v-model="vitalSignData.breathing"
                label="การหายใจ"
                class="input-field"
                :disable="!isEditing"
              />
              <q-input
                dense
                outlined
                v-model="vitalSignData.bloodPressure"
                label="ความดันโลหิต"
                class="input-field q-mt-sm"
                :disable="!isEditing"
              />
              <q-input
                dense
                outlined
                v-model="vitalSignData.height"
                label="ส่วนสูง"
                class="input-field q-mt-sm"
                :disable="!isEditing"
              />
            </div>
            <div class="col-6 q-mt-sm">
              <q-input
                dense
                outlined
                v-model="vitalSignData.weight"
                label="น้ำหนัก"
                class="input-field"
                :disable="!isEditing"
              />
              <q-input
                dense
                outlined
                v-model="vitalSignData.bmi"
                label="BMI"
                class="input-field q-mt-sm"
                :disable="!isEditing"
              />
              <q-input
                dense
                outlined
                v-model="vitalSignData.waist"
                label="รอบเอว"
                class="input-field q-mt-sm"
                :disable="!isEditing"
              />
            </div>
            <div class="col-12 q-mt-sm">
              <q-input
                dense
                outlined
                v-model="vitalSignData.symptoms"
                label="อาการหรือปัญหาที่ผู้ป่วยต้องมาพบแพทย์"
                class="input-field"
                type="textarea"
                :disable="!isEditing"
              />
            </div>
          </div>
        </q-card-section>
        <q-card-actions align="center" class="q-pa-md">
          <q-btn
            v-if="!isEditing"
            flat
            label="แก้ไขข้อมูล"
            @click="isEditing = true"
            class="q-px-xl edit-button"
          />

          <q-btn
            v-if="isEditing"
            flat
            label="ยกเลิก"
            @click="cancelEdit"
            class="q-px-xl cancel-button"
          />

          <q-btn
            v-if="isEditing"
            flat
            label="บันทึก"
            @click="saveVitalSignData"
            class="q-px-xl q-ml-sm save-button"
          />
        </q-card-actions>
      </q-card>
    </div>
  </q-page>
</template>

<script>
import { ref } from 'vue'

export default {
  setup() {
    const vitalSignData = ref({
      date: '01/01/2000',
      temperature: '36.5',
      pulse: '72',
      breathing: '18',
      bloodPressure: '120/80',
      height: '170',
      weight: '65',
      bmi: '22.5',
      waist: '80',
      symptoms: ''
    })
    const originalData = ref(null) // เก็บค่าข้อมูลเดิม
    const isEditing = ref(false)

    const saveVitalSignData = () => {
      // Mock การบันทึกข้อมูล
      alert('บันทึกข้อมูลแล้ว (mock)')
      // ปิดโหมดแก้ไข
      isEditing.value = false
    }

    const editVitalSignData = () => {
      // เก็บค่าข้อมูลเดิม
      originalData.value = { ...vitalSignData.value }
      // เปิดโหมดแก้ไข
      isEditing.value = true
    }

    const cancelEdit = () => {
      // คืนค่าข้อมูลเดิม
      vitalSignData.value = { ...originalData.value }
      // ปิดโหมดแก้ไข
      isEditing.value = false
    }

    return {
      vitalSignData,
      isEditing,
      saveVitalSignData,
      editVitalSignData,
      cancelEdit
    }
  }
}
</script>
<style scoped>
.bg-gray-2 {
  background-color: #f0f0f0;
}

.title {
  font-weight: bold;
  border: 1px solid #ddd;
  padding: 10px;
  border-radius: 5px;
  background-color: white; /* เพิ่มสีพื้นหลังสีขาว */
}

.my-card {
  border-radius: 10px;
  box-shadow: 0px 2px 5px rgba(0, 0, 0, 0.1);
}

.input-field {
  background-color: white;
  border: none;
  border-bottom: 1px solid #bdbdbd;
  border-radius: 0px;
  padding: 8px 0px;
}

.input-field .q-field__control {
  height: 40px;
}

.input-field label {
  font-size: 14px;
  color: #757575;
}
/* ปุ่ม ยกเลิก (สีแดง) */
.cancel-button {
  background-color: white;
  color: #d32f2f; /* เปลี่ยนสีตัวอักษรเป็นสีแดง */
  border: 2px solid #d32f2f;
  border-radius: 5px;
  padding: 10px 20px;
  font-weight: 500;
  transition: all 0.3s ease;
}

/* ปุ่ม ยกเลิก (สีแดง) */
.cancel-button:hover {
  background-color: #ef5350;
  border-color: #ef5350;
  box-shadow: 0px 2px 4px rgba(211, 47, 47, 0.3);
  color: white; /* เพิ่มสีตัวอักษรเป็นสีขาวเมื่อ hover */
}

/* ปุ่ม บันทึก (สีเขียว) */
.save-button {
  background-color: white;
  color: #2e7d32; /* สีเขียว */
  border: 2px solid #2e7d32;
  border-radius: 5px;
  padding: 10px 20px;
  font-weight: 500;
  transition: all 0.3s ease;
}

/* ปุ่ม บันทึก (สีเขียว) */
.save-button:hover {
  background-color: #4caf50;
  border-color: #4caf50;
  box-shadow: 0px 2px 4px rgba(46, 125, 50, 0.3);
  color: white; /* เพิ่มสีตัวอักษรเป็นสีขาวเมื่อ hover */
}

.edit-button {
  background-color: white;
  color: #027be3; /* สีฟ้า */
  border: 2px solid #027be3;
  border-radius: 5px;
  padding: 10px 20px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.edit-button:hover {
  background-color: #2196f3;
  border-color: #2196f3;
  box-shadow: 0px 2px 4px rgba(2, 123, 227, 0.3);
  color: white;
}
.input-field.disabled {
  color: #000 !important;
}
</style>
