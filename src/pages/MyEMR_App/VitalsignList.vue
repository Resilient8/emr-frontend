<template>
  <div class="q-pa-md">
    <div class="text-h5 text-center q-mb-md title">
        อาการ
      </div>
    <q-list bordered separator class="q-mt-md">

      <q-item class="header-row">
        <q-item-section>
          <q-item-label>Vital Sign</q-item-label>
        </q-item-section>
        <q-item-section side>
          <q-item-label>Last Modified</q-item-label>
        </q-item-section>
        <q-item-section side>
          <q-item-label>Actions</q-item-label>
        </q-item-section>
      </q-item>

      <q-item
        v-for="(record, index) in vitalSignRecords"
        :key="index"
        clickable
        @click="goToVitalSignRecord(record)"
      >
        <q-item-section>
          <q-item-label class="text-weight-bold">{{ record.label }}</q-item-label>
        </q-item-section>

        <q-item-section side>
          <q-item-label caption class="last-modified">{{ record.modifiedDate }}</q-item-label>
        </q-item-section>

        <q-item-section side>
          <div class="row">
            <q-btn icon="edit" @click.stop="editVitalSign(record)" flat round dense color="primary" />
            <q-btn icon="delete" @click.stop="deleteVitalSign(record)" flat round dense color="negative" />
          </div>
        </q-item-section>
      </q-item>
    </q-list>
    <router-link to="/myemr-app/add-vital-sign">
      <q-btn label="Add Vital Sign" color="primary" class="q-mt-md" />
    </router-link>

  </div>
</template>
<script>
import { ref, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useQuasar } from 'quasar';

export default {
  setup() {

    const vitalSignRecords = ref([
      {
        label: 'ปวดหัว',
        modifiedDate: 'Jul 17, 2024'
      },
      {
        label: 'ตัวร้อน',
        modifiedDate: 'Jul 15, 2024'
      }

    ]);


    const route = useRoute();
    const router = useRouter();
    const $q = useQuasar();
    const newVitalSign = ref(null);

    // สร้าง key สำหรับบังคับ re-render
    const rerenderKey = ref(0);

    onMounted(() => {
      if (route.query.newVitalSign) {
        newVitalSign.value = JSON.parse(route.query.newVitalSign);
        vitalSignRecords.value.unshift(newVitalSign.value);
        rerenderKey.value++;
      }
    });

    // watch route.query เพื่ออัพเดท rerenderKey
    watch(() => route.query, () => {
      rerenderKey.value++;
    });

    const goToVitalSignRecord = (record) => {
      // TODO: Implement navigation to vital sign record page
      router.push('/myemr-app/vital-sign/:label');
      console.log("Go to vital sign record:", record);
    };

    const addVitalSign = () => {
      // TODO: Implement add vital sign logic
      console.log("Add vital sign clicked");
    };

    const editVitalSign = (record) => {
      // TODO: Implement edit vital sign logic
      console.log("Edit vital sign clicked:", record);
    };

    const deleteVitalSign = (record) => {
      $q.dialog({
        title: 'Confirm',
        message: `Are you sure you want to delete ${record.label}?`,
        cancel: true,
        persistent: true
      }).onOk(() => {
        // TODO: Implement delete vital sign logic
        vitalSignRecords.value = vitalSignRecords.value.filter(r => r.label !== record.label);
        $q.notify({
          type: 'positive',
          message: 'Vital sign deleted successfully'
        });
      });
    };

    return {
      vitalSignRecords,
      rerenderKey,
      goToVitalSignRecord,
      addVitalSign,
      editVitalSign,
      deleteVitalSign
    };
  }
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
