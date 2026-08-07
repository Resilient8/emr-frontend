<template>
  <q-page padding class="bg-gray-2">
    <div class="q-pa-md">
      <div class="text-h5 text-center q-mb-md title">
        เพิ่มอาการ
      </div>

      <q-card class="my-card">
        <q-card-section class="q-pa-lg">
          <div class="row q-col-gutter-sm">
            <div class="col-6">
              <q-input
                dense
                outlined
                v-model="newVitalSign.temperature"
                label="อุณหภูมิ (°C)"
                class="input-field"
                type="number"
                step="0.1"
              />
              <q-input
                dense
                outlined
                v-model="newVitalSign.pulse"
                label="ชีพจร (ครั้ง/นาที)"
                class="input-field q-mt-sm"
                type="number"
              />
              <q-input
                dense
                outlined
                v-model="newVitalSign.breathing"
                label="การหายใจ (ครั้ง/นาที)"
                class="input-field q-mt-sm"
                type="number"
              />
            </div>
            <div class="col-6">
              <q-input
                dense
                outlined
                v-model="newVitalSign.bloodPressureSystolic"
                label="ความดันโลหิต (Systolic)"
                class="input-field"
                type="number"
              />
              <q-input
                dense
                outlined
                v-model="newVitalSign.bloodPressureDiastolic"
                label="ความดันโลหิต (Diastolic)"
                class="input-field q-mt-sm"
                type="number"
              />
              <q-input
                dense
                outlined
                v-model.number="newVitalSign.height"
                label="ส่วนสูง (ซม.)"
                class="input-field q-mt-sm"
                type="number"
                @update:model-value="calculateBMI"
              />
              <q-input
                dense
                outlined
                v-model.number="newVitalSign.weight"
                label="น้ำหนัก (กก.)"
                class="input-field q-mt-sm"
                type="number"
                step="0.1"
                @update:model-value="calculateBMI"
              />
              <q-input
                dense
                outlined
                v-model="newVitalSign.bmi"
                label="BMI"
                class="input-field q-mt-sm"
                readonly
              />
            </div>
            <div class="col-12 q-mt-sm">
              <q-input
                dense
                outlined
                v-model="newVitalSign.symptoms"
                label="อาการหรือปัญหาที่ผู้ป่วยต้องมาพบแพทย์"
                class="input-field"
                type="textarea"
                autogrow
              />
            </div>
            <div class="col-12 q-mt-sm">
              <q-input
                dense
                outlined
                v-model="newVitalSign.medications"
                label="ยาที่ใช้ปัจจุบัน (ถ้าเกี่ยวข้อง)"
                class="input-field"
                type="textarea"
                autogrow
              />
            </div>
            <div class="col-12 q-mt-sm">
              <q-input
                dense
                outlined
                v-model="newVitalSign.allergies"
                label="ประวัติการแพ้ยา/อาหาร"
                class="input-field"
                type="textarea"
                autogrow
              />
            </div>
          </div>
        </q-card-section>
        <q-card-actions align="center" class="q-pa-md">
          <q-btn
            flat
            label="บันทึก"
            @click="saveVitalSignData"
            class="q-px-xl save-button"
          />
          <q-btn
            flat
            label="ยกเลิก"
            @click="cancelAdd"
            class="q-px-xl cancel-button"
          />
        </q-card-actions>
      </q-card>
    </div>
  </q-page>
</template>

<script>
import { reactive, computed } from 'vue';
import { useRouter } from 'vue-router';

export default {
  setup() {
    const router = useRouter();

    const newVitalSign = reactive({
      temperature: '',
      pulse: '',
      breathing: '',
      bloodPressureSystolic: '',
      bloodPressureDiastolic: '',
      height: '',
      weight: '',
      bmi: '',
      symptoms: '',
      medications: '',
      allergies: '',
      timestamp: null,
    });

    const calculateBMI = () => {
      if (newVitalSign.height && newVitalSign.weight) {
        const heightInMeter = newVitalSign.height / 100;
        const bmi = newVitalSign.weight / (heightInMeter * heightInMeter);
        newVitalSign.bmi = bmi.toFixed(2); // คำนวณ BMI และกำหนดค่าให้ newVitalSign.bmi
      } else {
        newVitalSign.bmi = ''; // ถ้าไม่มีข้อมูล ให้ค่าว่าง
      }
    };


    const saveVitalSignData = () => {
      newVitalSign.timestamp = new Date().toISOString();
      console.log('บันทึกข้อมูลอาการ:', newVitalSign);

      router.push({
        name: 'VitalSignList',
        query: {
          newVitalSign: JSON.stringify({
            label: newVitalSign.symptoms,
            modifiedDate: new Date().toLocaleDateString('en-US'),
          }),
        },
      });
    };

    const cancelAdd = () => {
      for (const key in newVitalSign) {
        newVitalSign[key] = '';
      }
      router.push('/myemr-app/vitalsignlist');
    };

    return {
      newVitalSign,
      saveVitalSignData,
      cancelAdd,
      calculateBMI
    };
  },
};
</script>

<style scoped>
/* CSS from Patient History */
.bg-gray-2 {
  background-color: #f0f0f0;
}

.title {
  font-weight: bold;
  border: 1px solid #ddd;
  padding: 10px;
  border-radius: 5px;
  background-color: white;
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
  color: #d32f2f;
  border: 2px solid #d32f2f;
  border-radius: 5px;
  padding: 10px 20px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.cancel-button:hover {
  background-color: #ef5350;
  border-color: #ef5350;
  box-shadow: 0px 2px 4px rgba(211, 47, 47, 0.3);
  color: white;
}

/* ปุ่ม บันทึก (สีเขียว) */
.save-button {
  background-color: white;
  color: #2e7d32;
  border: 2px solid #2e7d32;
  border-radius: 5px;
  padding: 10px 20px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.save-button:hover {
  background-color: #4caf50;
  border-color: #4caf50;
  box-shadow: 0px 2px 4px rgba(46, 125, 50, 0.3);
  color: white;
}
</style>
