<template>
  <q-page class="admin-bg">
    <div class="glass-container">

      <div class="header-section q-mb-md">
        <div class="row items-center justify-between">
          <div class="row items-center">
            <q-btn flat round icon="arrow_back" color="white" @click="$router.back()" class="q-mr-md"/>
            <div>
              <div class="text-h5 text-weight-bold text-white">จัดการข้อมูลหลัก (Master Data)</div>
              <div class="text-caption text-grey-4">ระบบจัดการทะเบียนยาและรหัสโรค</div>
            </div>
          </div>
          <div class="row items-center q-gutter-x-sm">
             <q-btn unelevated rounded color="primary" icon="add" :label="currentTab === 'medications' ? 'เพิ่มยาใหม่' : 'เพิ่มโรคใหม่'" @click="openAddDialog" />
          </div>
        </div>
      </div>

      <q-tabs
        v-model="currentTab"
        dense
        class="text-grey-5"
        active-color="accent"
        indicator-color="accent"
        align="left"
        narrow-indicator
      >
        <q-tab name="medications" label="ทะเบียนยา (Medications)" icon="medication" />
        <q-tab name="icd10" label="รหัสโรค (ICD-10)" icon="biotech" />
      </q-tabs>

      <q-separator dark class="q-mb-md opacity-20" />

      <q-tab-panels v-model="currentTab" animated class="bg-transparent">

        <q-tab-panel name="medications" class="q-pa-none">
          <q-table
            dark flat bordered
            :rows="medications"
            :columns="medicationColumns"
            row-key="id"
            :loading="isLoading"
            class="glass-table"
            :pagination="{ rowsPerPage: 10 }"
          >
            <template v-slot:top-right>
              <q-input
                borderless dense debounce="500"
                v-model="medFilter"
                placeholder="ค้นหาชื่อยา..."
                dark
              >
                <template v-slot:append><q-icon name="search" /></template>
              </q-input>
            </template>

            <template v-slot:body-cell-status="props">
              <q-td :props="props">
                <q-chip :color="props.row.is_active ? 'green-9' : 'red-9'" text-color="white" dense size="sm">
                  {{ props.row.is_active ? 'ใช้งาน' : 'ปิดใช้งาน' }}
                </q-chip>
              </q-td>
            </template>

            <template v-slot:body-cell-actions="props">
              <q-td :props="props" align="right">
                <q-btn flat round icon="edit" color="blue-4" size="sm" @click="openEditDialog(props.row)" />
                <q-btn flat round icon="delete" color="red-4" size="sm" @click="confirmDelete(props.row)" />
              </q-td>
            </template>
          </q-table>
        </q-tab-panel>

        <q-tab-panel name="icd10" class="q-pa-none">
          <q-table
            dark flat bordered
            :rows="icd10List"
            :columns="icd10Columns"
            row-key="code"
            :loading="isLoading"
            class="glass-table"
            :pagination="{ rowsPerPage: 10 }"
          >
            <template v-slot:top-right>
              <q-input
                borderless dense debounce="500"
                v-model="icdFilter"
                placeholder="ค้นหารหัส/ชื่อโรค..."
                dark
              >
                <template v-slot:append><q-icon name="search" /></template>
              </q-input>
            </template>

            <template v-slot:body-cell-actions="props">
              <q-td :props="props" align="right">
                <q-btn flat round icon="edit" color="blue-4" size="sm" @click="openEditDialog(props.row)" />
                <q-btn flat round icon="delete" color="red-4" size="sm" @click="confirmDelete(props.row)" />
              </q-td>
            </template>
          </q-table>
        </q-tab-panel>

      </q-tab-panels>

    </div>

    <q-dialog v-model="isMedDialogVisible" persistent>
      <q-card class="glass-dialog form-card">
        <q-card-section class="dialog-header">
          <div class="text-h6 text-white">{{ isEditMode ? 'แก้ไขข้อมูลยา' : 'เพิ่มยาใหม่' }}</div>
        </q-card-section>

        <q-card-section class="q-gutter-y-md">
          <div class="row q-col-gutter-md">
             <div class="col-6"><q-input dark outlined v-model="medForm.medication_code" label="รหัสยา (Code)" class="custom-input"/></div>
             <div class="col-6"><q-input dark outlined v-model="medForm.trade_name" label="ชื่อการค้า (Trade Name)" class="custom-input"/></div>
          </div>
          <q-input dark outlined v-model="medForm.generic_name" label="ชื่อสามัญ (Generic Name) *" :rules="[val => !!val || 'กรุณากรอกข้อมูล']" class="custom-input"/>

          <div class="row q-col-gutter-md">
             <div class="col-4"><q-input dark outlined v-model="medForm.dosage" label="ขนาด (Dosage)" class="custom-input"/></div>
             <div class="col-4"><q-input dark outlined v-model="medForm.unit" label="หน่วยนับ" class="custom-input"/></div>
             <div class="col-4"><q-input dark outlined v-model="medForm.price" label="ราคา" type="number" class="custom-input"/></div>
          </div>

          <q-input dark outlined v-model="medForm.stock_quantity" label="จำนวนสต็อก" type="number" class="custom-input"/>
          <q-input dark outlined v-model="medForm.instructions" label="วิธีใช้มาตรฐาน" type="textarea" rows="2" class="custom-input"/>

          <q-toggle v-model="medForm.is_active" label="เปิดใช้งาน (Active)" color="green" dark />
        </q-card-section>

        <q-card-actions align="right" class="bg-dark-translucent q-pa-md">
          <q-btn flat label="ยกเลิก" color="grey" v-close-popup />
          <q-btn unelevated label="บันทึก" color="primary" @click="saveMedication" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="isIcdDialogVisible" persistent>
      <q-card class="glass-dialog form-card">
        <q-card-section class="dialog-header">
          <div class="text-h6 text-white">{{ isEditMode ? 'แก้ไขรหัสโรค' : 'เพิ่มโรคใหม่' }}</div>
        </q-card-section>

        <q-card-section class="q-gutter-y-md">
          <q-input dark outlined v-model="icdForm.code" label="รหัสโรค (ICD-10 Code) *" :disable="isEditMode" :rules="[val => !!val || 'กรุณากรอกข้อมูล']" class="custom-input"/>
          <q-input dark outlined v-model="icdForm.name_th" label="ชื่อโรค (ไทย)" class="custom-input"/>
          <q-input dark outlined v-model="icdForm.name_en" label="ชื่อโรค (อังกฤษ)" class="custom-input"/>
          <q-input dark outlined v-model="icdForm.category" label="หมวดหมู่" class="custom-input"/>
          <q-toggle v-model="icdForm.is_active" label="เปิดใช้งาน (Active)" color="green" dark />
        </q-card-section>

        <q-card-actions align="right" class="bg-dark-translucent q-pa-md">
          <q-btn flat label="ยกเลิก" color="grey" v-close-popup />
          <q-btn unelevated label="บันทึก" color="primary" @click="saveICD10" />
        </q-card-actions>
      </q-card>
    </q-dialog>

  </q-page>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue';
import { useQuasar } from 'quasar';
import axios from 'axios';

const $q = useQuasar();
const currentTab = ref('medications');
const isLoading = ref(false);

// --- Medications Data ---
const medications = ref([]);
const medFilter = ref(''); // ใช้สำหรับรับค่า Search
const isMedDialogVisible = ref(false);
const medForm = reactive({ id: null, medication_code: '', generic_name: '', trade_name: '', dosage: '', unit: '', price: 0, stock_quantity: 0, instructions: '', is_active: true });

const medicationColumns = [
  { name: 'code', label: 'รหัสยา', field: 'medication_code', align: 'left', sortable: true },
  { name: 'name', label: 'ชื่อยา (Generic/Trade)', field: row => `${row.generic_name} ${row.trade_name ? '('+row.trade_name+')' : ''}`, align: 'left', sortable: true },
  { name: 'dosage', label: 'ขนาด', field: 'dosage', align: 'left' },
  { name: 'stock', label: 'คงเหลือ', field: 'stock_quantity', align: 'center', sortable: true },
  { name: 'unit', label: 'หน่วย', field: 'unit', align: 'left' },
  { name: 'price', label: 'ราคา', field: 'price', align: 'right', format: val => `${val} ฿` },
  { name: 'status', label: 'สถานะ', field: 'is_active', align: 'center' },
  { name: 'actions', label: 'จัดการ', align: 'right' }
];

// --- ICD-10 Data ---
const icd10List = ref([]);
const icdFilter = ref(''); // ใช้สำหรับรับค่า Search
const isIcdDialogVisible = ref(false);
const icdForm = reactive({ code: '', name_th: '', name_en: '', category: '', is_active: true });

const icd10Columns = [
  { name: 'code', label: 'รหัส (Code)', field: 'code', align: 'left', sortable: true },
  { name: 'name_th', label: 'ชื่อไทย', field: 'name_th', align: 'left', sortable: true },
  { name: 'name_en', label: 'ชื่ออังกฤษ', field: 'name_en', align: 'left', sortable: true },
  { name: 'category', label: 'หมวดหมู่', field: 'category', align: 'left' },
  { name: 'actions', label: 'จัดการ', align: 'right' }
];

const isEditMode = ref(false);

// --- API Functions (Updated for Server-Side Search) ---
const fetchMedications = async (searchVal = '') => {
  isLoading.value = true;
  try {
    // ส่ง parameter search ไปที่ Backend
    const res = await axios.get('https://emr-backend-api-8euv.onrender.com/api/medications', {
        params: { search: searchVal }
    });
    medications.value = res.data;
  } catch (error) {
    console.error(error);
    $q.notify({ type: 'negative', message: 'โหลดข้อมูลยาไม่สำเร็จ' });
  } finally { isLoading.value = false; }
};

const fetchICD10 = async (searchVal = '') => {
  isLoading.value = true;
  try {
    // ส่ง parameter search ไปที่ Backend (ICD-10 จะไปค้นในตารางหมื่นรายการ)
    const res = await axios.get('https://emr-backend-api-8euv.onrender.com/api/icd10', {
        params: { search: searchVal }
    });
    icd10List.value = res.data;
  } catch (error) {
    console.error(error);
    $q.notify({ type: 'negative', message: 'โหลดข้อมูล ICD-10 ไม่สำเร็จ' });
  } finally { isLoading.value = false; }
};

// --- Watchers for Search (Real-time Filtering) ---
watch(medFilter, (newVal) => {
    fetchMedications(newVal);
});

watch(icdFilter, (newVal) => {
    fetchICD10(newVal);
});

// --- Actions ---
const openAddDialog = () => {
  isEditMode.value = false;
  if (currentTab.value === 'medications') {
    Object.assign(medForm, { id: null, medication_code: '', generic_name: '', trade_name: '', dosage: '', unit: '', price: 0, stock_quantity: 0, instructions: '', is_active: true });
    isMedDialogVisible.value = true;
  } else {
    Object.assign(icdForm, { code: '', name_th: '', name_en: '', category: '', is_active: true });
    isIcdDialogVisible.value = true;
  }
};

const openEditDialog = (row) => {
  isEditMode.value = true;
  if (currentTab.value === 'medications') {
    Object.assign(medForm, row);
    isMedDialogVisible.value = true;
  } else {
    Object.assign(icdForm, row);
    isIcdDialogVisible.value = true;
  }
};

const confirmDelete = (row) => {
  $q.dialog({ title: 'ยืนยันการลบ', message: `ต้องการลบข้อมูล ${row.generic_name || row.code} ใช่หรือไม่?`, cancel: true, persistent: true })
    .onOk(async () => {
      try {
        const endpoint = currentTab.value === 'medications' ? `medications/${row.id}` : `icd10/${row.code}`;
        await axios.delete(`https://emr-backend-api-8euv.onrender.com/api/${endpoint}`);
        $q.notify({ type: 'positive', message: 'ลบข้อมูลเรียบร้อย' });
        // Refresh data using current filter
        currentTab.value === 'medications' ? fetchMedications(medFilter.value) : fetchICD10(icdFilter.value);
      } catch (error) {
        $q.notify({ type: 'negative', message: 'ลบไม่สำเร็จ (อาจมีการใช้งานอยู่)' });
      }
    });
};

const saveMedication = async () => {
  if (!medForm.generic_name) return $q.notify({type: 'warning', message: 'กรุณาระบุชื่อสามัญ'});
  try {
    if (isEditMode.value) {
      await axios.put(`https://emr-backend-api-8euv.onrender.com/api/medications/${medForm.id}`, medForm);
    } else {
      await axios.post('https://emr-backend-api-8euv.onrender.com/api/medications', medForm);
    }
    $q.notify({ type: 'positive', message: 'บันทึกข้อมูลเรียบร้อย' });
    isMedDialogVisible.value = false;
    fetchMedications(medFilter.value);
  } catch (error) {
    $q.notify({ type: 'negative', message: 'บันทึกไม่สำเร็จ' });
  }
};

const saveICD10 = async () => {
  if (!icdForm.code) return $q.notify({type: 'warning', message: 'กรุณาระบุรหัสโรค'});
  try {
    if (isEditMode.value) {
        await axios.put(`https://emr-backend-api-8euv.onrender.com/api/icd10/${icdForm.code}`, icdForm);
    } else {
        await axios.post('https://emr-backend-api-8euv.onrender.com/api/icd10', icdForm);
    }
    $q.notify({ type: 'positive', message: 'บันทึกข้อมูลเรียบร้อย' });
    isIcdDialogVisible.value = false;
    fetchICD10(icdFilter.value);
  } catch (error) {
    $q.notify({ type: 'negative', message: 'บันทึกไม่สำเร็จ (รหัสซ้ำหรือข้อมูลผิด)' });
  }
};

onMounted(() => {
  fetchMedications();
  fetchICD10();
});
</script>

<style scoped lang="scss">
$bg-dark: #0f172a;
$glass-border: 1px solid rgba(255, 255, 255, 0.1);

.admin-bg {
  background-color: $bg-dark;
  min-height: 100vh;
  padding: 24px;
}

.glass-container {
  max-width: 1400px;
  margin: 0 auto;
  background: rgba(30, 41, 59, 0.5);
  backdrop-filter: blur(12px);
  border: $glass-border;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.3);
}

.glass-table {
  background: transparent !important;

  :deep(thead tr th) {
    background: rgba(255, 255, 255, 0.05);
    font-weight: bold;
    color: #00e5ff;
  }
  :deep(tbody tr:hover) {
    background: rgba(255, 255, 255, 0.03);
  }
}

.glass-dialog {
  background: #1e293b;
  border: 1px solid rgba(255,255,255,0.1);
  min-width: 500px;
}

.dialog-header {
  background: linear-gradient(90deg, #3b82f6 0%, #2563eb 100%);
  padding: 16px;
}

.custom-input :deep(.q-field__control) {
  background: rgba(0,0,0,0.2) !important;
  border-radius: 8px;
}

.opacity-20 { opacity: 0.2; }
.bg-dark-translucent { background: rgba(0,0,0,0.2); }
</style>
