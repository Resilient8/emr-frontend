<template>
  <q-page padding class="bg-gray-2">
    <div class="q-pa-md">
      <div class="text-h5 text-center q-mb-md title">
        ฟอร์มการรักษาของผู้ป่วย: {{ patientName }}
      </div>

      <q-list bordered separator class="q-mt-md">
        <q-item class="header-row">
          <q-item-section>
            <q-item-label>วันที่เข้ารับการรักษา</q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-item-label>ประเภทการรักษา</q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-item-label>พยาบาลผู้บันทึก</q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-item-label>Actions</q-item-label>
          </q-item-section>
        </q-item>

        <q-item
          v-for="record in sortedRecords"
          :key="record.id"
          clickable
          @click="goToMedicalForm(record.id)"
        >
          <q-item-section>
            <q-item-label class="text-weight-bold">{{ record.treatmentDate }}</q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-item-label>{{ record.treatmentType }}</q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-item-label>{{ record.nurseName }}</q-item-label>
          </q-item-section>
          <q-item-section side>
            <div class="row">
              <q-btn icon="edit" @click.stop="editMedicalForm(record.id)" flat round dense color="primary" />
              <q-btn icon="delete" @click.stop="deleteMedicalForm(record.id)" flat round dense color="negative" />
            </div>
          </q-item-section>
        </q-item>
        <q-item v-if="sortedRecords.length === 0">
          <q-item-section class="text-center">ไม่พบข้อมูลการรักษา</q-item-section>
        </q-item>
      </q-list>
      <router-link :to="`/myemr-app/add-medical-form/${patientId}`">
        <q-btn label="เพิ่มฟอร์มการรักษา" color="primary" class="q-mt-md" :disable="!patientId" />
      </router-link>
    </div>
  </q-page>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router'; // Import useRoute
import { useQuasar } from 'quasar';

export default {
  setup() {
    const router = useRouter();
    const route = useRoute(); // ประกาศ route
    const $q = useQuasar();

    const patientId = ref(null);
    const patientName = ref('');
    const medicalFormRecords = ref([
      { patientId: 1, id: 1, treatmentDate: '2024-07-17', treatmentType: 'ตรวจร่างกายทั่วไป', nurseName: 'สมศรี พยาบาล' },
      { patientId: 1, id: 2, treatmentDate: '2024-07-15', treatmentType: 'ฉีดวัคซีน', nurseName: 'สมใจ พยาบาล' },
      { patientId: 2, id: 3, treatmentDate: '2024-07-20', treatmentType: 'ให้ยา', nurseName: 'สมหมาย พยาบาล' },
      { patientId: 1, id: 4, treatmentDate: '2024-07-25', treatmentType: 'ทำแผล', nurseName: 'สมศรี พยาบาล' },
    ]);

    const patients = ref([
      { id: 1, name: 'สมชาย ใจดี' },
      { id: 2, name: 'สมหญิง จริงใจ' },
    ]);

    onMounted(() => {
        patientId.value = parseInt(route.params.patientId);
        if(isNaN(patientId.value)){
            router.push('/myemr-app/patient-list')
        }
        const patient = patients.value.find(p => p.id === patientId.value);
        if (patient) {
            patientName.value = patient.name;
        }
    });

    const filteredRecords = computed(() => {
        return medicalFormRecords.value.filter(record => record.patientId === patientId.value)
    })

    const sortedRecords = computed(() => {
      return [...filteredRecords.value].sort((a, b) => new Date(b.treatmentDate) - new Date(a.treatmentDate));
    });

    const goToMedicalForm = (formId) => {
      router.push(`/myemr-app/medical-form/${formId}`);
    };

    const editMedicalForm = (formId) => {
      router.push(`/myemr-app/edit-medical-form/${formId}`);
    };

    const deleteMedicalForm = (formId) => {
      $q.dialog({
        title: 'Confirm',
        message: `Are you sure you want to delete this record?`,
        cancel: true,
        persistent: true
      }).onOk(() => {
        medicalFormRecords.value = medicalFormRecords.value.filter(r => r.id !== formId);
        $q.notify({
          type: 'positive',
          message: 'Medical form deleted successfully'
        });
      });
    };

    return {
      patientId,
      patientName,
      sortedRecords,
      goToMedicalForm,
      editMedicalForm,
      deleteMedicalForm,
    };
  },
};
</script>

<style scoped>
/* CSS from Patient List */
.q-item {
  background-color: #f5f5f5;
  border-bottom: 1px solid #ddd;
  padding: 15px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.q-item:hover {
  background-color: #e0e0e0;
}

.q-item__label {
  font-size: 16px;
  color: #333;
}

.q-item__label--bold {
  font-weight: bold;
}

.last-modified {
  font-size: 14px;
  color: #777;
}

.header-row {
  background-color: #009688;
  color: white;
  font-weight: bold;
}

.header-row .q-item__section:first-child {
  margin-left: 75px;
}

.header-row .q-item__section:nth-child(2) {
  margin-left: 350px;
}
</style>
