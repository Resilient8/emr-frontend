<template>
  <q-page class="page-container">
    <div class="summary-column">
      <div v-if="loading" class="list-item-animation" style="animation-delay: 0.2s;">
        <q-card class="main-card" flat>
          <q-card-section>
            <q-skeleton type="text" height="40px" class="q-mb-md" />
            <q-separator dark spaced />
            <q-skeleton type="text" height="200px" class="q-mt-md" />
          </q-card-section>
        </q-card>
      </div>

      <div v-else-if="error" class="list-item-animation" style="animation-delay: 0.2s;">
        <q-card flat class="no-data-card main-card">
          <q-card-section class="text-center q-pa-xl">
            <q-icon name="o_error_outline" size="6em" class="placeholder-icon text-negative" />
            <div class="text-h5 welcome-text q-mt-md">เกิดข้อผิดพลาด</div>
            <p class="welcome-text">{{ error }}</p>
            <q-btn label="ลองอีกครั้ง" @click="fetchPatientData" class="primary-action-btn q-mt-md" icon="o_refresh" />
          </q-card-section>
        </q-card>
      </div>

      <PatientSummary v-if="!loading" class="list-item-animation" style="animation-delay: 0.2s;" />
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from "vue";
// (ลบ useRouter ออกเพราะ goBack ถูกลบแล้ว)
import PatientSummary from "./PatientSummary.vue"; // Ensure the path is correct

const loading = ref(true);
const error = ref(null);

// This function now only simulates a network delay.
// In the future, you can put your real API call back here.
const fetchPatientData = async () => {
  loading.value = true;
  error.value = null;
  // Simulate loading time
  await new Promise(resolve => setTimeout(resolve, 700));
  loading.value = false;
  // We don't need to fetch any data because PatientSummary has its own.
  // You can add your real fetch logic here later and handle potential errors.
};

// (ลบ goBack function ออก)

onMounted(fetchPatientData);
</script>

<style scoped lang="scss">
/* 🚀 FIX: แก้ไขคลาสนี้ครับ */
.page-container {
  padding: 24px;

  /* --- 🚀 โค้ดลายเส้นถูกลบออกแล้ว --- */
  background-color: #0d1a26; /* สีพื้นหลังหลัก */

  font-family: 'Sarabun', sans-serif;
  color: #e0e0e0;
}
/* 🚀 END FIX */

.summary-column {
  max-width: 1200px;
  margin: 0 auto;
}

/* (ลบ .patient-header-card, .header-icon, .header-title ออก) */

.welcome-text {
  color: #90a4ae;
}

.primary-action-btn {
  /* (ยังคงเก็บไว้เพราะ Error card ยังใช้) */
  border: 1px solid #00b8ff;
  color: #00b8ff;
  background: transparent;
  border-radius: 50%;
  transition: all 0.3s;
  &:hover {
    background-color: #00b8ff;
    color: white;
    box-shadow: 0 0 10px #00b8ff;
    transform: scale(1.1);
  }
}

.main-card {
  background-color: rgba(25, 38, 46, 0.6);
  backdrop-filter: blur(12px);
  border-radius: 16px;
  border: 1px solid transparent;
  border-image: linear-gradient(135deg, rgba(0, 184, 255, 0.3), rgba(38, 50, 56, 0.1)) 1;
  color: #e0e0e0;
}

.no-data-card {
  border: 2px dashed rgba(0, 184, 255, 0.2);
}
.placeholder-icon {
  color: rgba(0, 184, 255, 0.3);
}

.tooltip-glassy {
  background: rgba(38, 50, 56, 0.8);
  backdrop-filter: blur(5px);
  border: 1px solid rgba(0, 184, 255, 0.2);
  color: white;
}
</style>

<style lang="scss">
/* (ส่วนนี้เหมือนเดิม) */
.list-item-animation {
  opacity: 0;
  animation: floatUp 0.6s ease-out forwards;
}

@keyframes floatUp {
  from {
    opacity: 0;
    transform: translateY(30px) scale(0.98);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}
</style>
