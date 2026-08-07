<template>
  <q-page padding class="bg-gray-2">
    <div class="q-pa-md">
      <div class="text-h5 text-center q-mb-md title">
        Patient History
      </div>

      <q-card class="my-card">
        <q-card-section class="q-pa-lg">
          <div class="row q-col-gutter-sm">
            <div class="col-6">
              <q-input
                dense
                outlined
                v-model="patient.prefix"
                label="คำนำหน้า"
                class="input-field"
                :disable="!isEditing"
              />
              <q-input
                dense
                outlined
                v-model="patient.firstName"
                label="ชื่อ"
                class="input-field q-mt-sm"
                :disable="!isEditing"
              />
              <q-input
                dense
                outlined
                v-model="patient.lastName"
                label="นามสกุล"
                class="input-field q-mt-sm"
                :disable="!isEditing"
              />
            </div>
            <div class="col-6">
              <q-input
                dense
                outlined
                v-model="patient.patientId"
                label="เลขประจำตัว"
                class="input-field"
                :disable="!isEditing"
              />
              <q-input
                dense
                outlined
                v-model="patient.birthDate"
                label="วันเกิด"
                class="input-field q-mt-sm"
                mask="####-##-##"
                :rules="[val => isValidDate(val) || 'รูปแบบวันที่ไม่ถูกต้อง']"
                :disable="!isEditing"
              >
                <template v-slot:append>
                  <q-icon name="event" class="cursor-pointer">
                    <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                      <q-date
                        v-model="patient.birthDate"
                        mask="YYYY-MM-DD"
                      />
                    </q-popup-proxy>
                  </q-icon>
                </template>
              </q-input>
              <q-input
                dense
                outlined
                v-model="patient.age"
                label="อายุ"
                class="input-field q-mt-sm"
                type="number"
                :disable="!isEditing"
              />
            </div>
            <div class="col-12 q-mt-sm">
              <q-input
                dense
                outlined
                v-model="patient.address"
                label="ที่อยู่"
                class="input-field"
                type="textarea"
                :disable="!isEditing"
              />
            </div>
            <div class="col-12 q-mt-sm">
              <q-input
                dense
                outlined
                v-model="patient.allergies"
                label="โรคประจำตัว/แพ้ยา/อาหาร"
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
            @click="savePatientData"
            class="q-px-xl q-ml-sm save-button"
          />

        </q-card-actions>
      </q-card>
    </div>
  </q-page>
</template>

<script lang="js">
import { ref, onMounted, reactive, nextTick } from 'vue';
import axios from "axios";
import { useRoute } from 'vue-router';
import { useQuasar } from 'quasar';

export default {
  setup() {
    const route = useRoute();
    const $q = useQuasar();
    const isLoading = ref(true);
    const originalData = reactive({}); // เปลี่ยน originalData เป็น reactive
    const isEditing = ref(false);

    const patient = reactive({
      id: null,
      prefix: "",
      firstName: "",
      lastName: "",
      patientId: "",
      birthDate: "",
      bloodGroup: "",
      age: null,
      address: "",
      allergies: "",
      attitude: "",
      visit_date: null, // เพิ่มฟิลด์ visit_date
      // ... other fields from your API response ...
    });


    onMounted(async () => {
      isLoading.value = true; // แสดง loading state ก่อนดึงข้อมูล
      try {
        await nextTick();
        const patientId = route.params.id;
        const res = await axios.get(`https://emr-backend-api-8euv.onrender.com/api/patients/${patientId}`);

        // กำหนดค่าให้กับ patient
        for (const key in res.data.result) {
          patient[key] = res.data.result[key];
        }

        // กำหนดค่าเริ่มต้นให้กับ originalData หลังจากดึงข้อมูล patient เสร็จแล้ว
        Object.assign(originalData, { ...patient });

      } catch (error) {
        console.error("Error fetching patient data:", error);
        $q.notify({
          type: 'negative',
          message: 'เกิดข้อผิดพลาดในการดึงข้อมูลผู้ป่วย'
        });
      } finally {
        isLoading.value = false; // ซ่อน loading state เมื่อดึงข้อมูลเสร็จ
      }
    });


    const savePatientData = async () => {
      isLoading.value = true; // แสดง loading state
      try {
        const patientId = route.params.id;

        // แปลงรูปแบบวันที่ของ visit_date ก่อนบันทึก
        const formattedVisitDate = new Date(patient.visit_date).toISOString().split('T')[0];
        patient.visit_date = formattedVisitDate;

        await axios.put(`https://emr-backend-api-8euv.onrender.com/api/patients/${patientId}`, patient);
        $q.notify({
          type: 'positive',
          message: 'บันทึกข้อมูลผู้ป่วยเรียบร้อยแล้ว'
        });
        // อัพเดต originalData
        Object.assign(originalData, { ...patient });
      } catch (error) {
        console.error("Error updating patient data:", error);
        $q.notify({
          type: 'negative',
          message: 'เกิดข้อผิดพลาดในการบันทึกข้อมูลผู้ป่วย'
        });
      } finally {
        isLoading.value = false; // ซ่อน loading state
        isEditing.value = false;
      }
    };

    const editPatientData = () => {
      $q.dialog({
        title: 'ยืนยันการแก้ไข',
        message: 'คุณต้องการบันทึกการแก้ไขข้อมูลผู้ป่วยหรือไม่',
        cancel: true,
        persistent: true
      }).onOk(async () => {
        await savePatientData();
      });
    };

    const cancelEdit = () => {
      for (const key in originalData) {
        patient[key] = originalData[key];
      }
      isEditing.value = false;
    };


    const formatBirthDate = (value) => {
      if (value) {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(value).toLocaleDateString('th-TH', options);
      }
      return '';
    };

    const isValidDate = (val) => {
      return /^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/.test(val);
    }


    return {
      isLoading,
      isEditing,
      savePatientData,
      editPatientData,
      cancelEdit,
      formatBirthDate,
      patient,
      isValidDate
    };
  }
};
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
</style>ห
