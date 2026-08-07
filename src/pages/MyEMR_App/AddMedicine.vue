<template>
  <q-page padding class="bg-gray-2">
    <div class="q-pa-md">
      <div class="text-h5 text-center q-mb-md title">
        เพิ่มข้อมูลยา
      </div>

      <q-card class="my-card">
        <q-card-section class="q-pa-lg">
          <div class="row q-col-gutter-sm">
            <div class="col-12">
              <q-input
                dense
                outlined
                v-model="newMedicine.name"
                label="ชื่อยา"
                class="input-field"
              />
            </div>
            <div class="col-6 q-mt-sm">
              <q-input
                dense
                outlined
                v-model="newMedicine.quantity"
                label="ปริมาณ"
                class="input-field"
              />
            </div>
            <div class="col-6 q-mt-sm">
              <q-input
                dense
                outlined
                v-model="newMedicine.unit"
                label="หน่วย"
                class="input-field"
              />
            </div>
            <div class="col-12 q-mt-sm">
              <q-input
                dense
                outlined
                v-model="newMedicine.usage"
                label="วิธีใช้"
                class="input-field"
                type="textarea"
              />
            </div>
            <div class="col-12 q-mt-sm">
              <q-input
                dense
                outlined
                v-model="newMedicine.notes"
                label="คำแนะนำ"
                class="input-field"
                type="textarea"
              />
            </div>
          </div>
        </q-card-section>
        <q-card-actions align="center" class="q-pa-md">
          <q-btn
            flat
            label="บันทึก"
            @click="saveMedicineData"
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
import { reactive } from 'vue'
import { useRouter } from 'vue-router'

export default {
  setup() {
    const router = useRouter()

    const  
 newMedicine = reactive({
      name: '',
      quantity: '',
      unit: '',
      usage: '',
      notes: ''
    })

    const saveMedicineData = () => {
      // TODO: บันทึกข้อมูลยาใหม่ลงใน database หรือ API
      console.log('บันทึกข้อมูลยา:', newMedicine)

      // TODO:  ปรับแต่งการ redirect และส่งข้อมูลยาไปยังหน้าอื่นๆ ตามต้องการ
      router.push('/medicine-list')
    }

    const cancelAdd = () => {
      // ล้างข้อมูลใน form และกลับไปยังหน้า medicine list (หรือหน้าอื่นๆ ตามต้องการ)
      for (const key in newMedicine) {
        newMedicine[key] = ''
      }
      router.push('/medicine-list')
    }

    return {
      newMedicine,
      saveMedicineData,
      cancelAdd
    }
  }
}
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
