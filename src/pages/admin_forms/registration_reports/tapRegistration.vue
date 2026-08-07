<template>
  <div class="q-pa-md">
    <q-list bordered separator class="q-mt-md">
      <q-item v-for="record in patientRecords" :key="record.id">
        <q-item-section avatar>
          <q-avatar>
            <img :src="record.imageUrl">
          </q-avatar>
        </q-item-section>

        <q-item-section>
          <q-item-label>{{ record.name }}</q-item-label>
          <q-item-label caption>แก้ไขล่าสุดเมื่อ {{ record.modifiedDate }}</q-item-label>
        </q-item-section>
      </q-item>
    </q-list>
  </div>
</template>

<script>
import { ref } from 'vue'; // ลบ computed ออก เนื่องจากไม่ได้ใช้แล้ว

export default {
  setup() {
    const patientRecords = ref([
      {
        id: 1,
        name: 'John Doe',
        imageUrl: 'https://via.placeholder.com/150', // Placeholder image
        modifiedDate: new Date().toLocaleDateString('en-US'), // วันที่ปัจจุบัน
      },
      {
        id: 2,
        name: 'Jane Smith',
        imageUrl: 'https://via.placeholder.com/150',
        modifiedDate: new Date().toLocaleDateString('en-US'), // วันที่ปัจจุบัน
      },
      {
        id: 3,
        name: 'Alice Johnson',
        imageUrl: 'https://via.placeholder.com/150',
        modifiedDate: new Date(Date.now() - (3 * 24 * 60 * 60 * 1000)).toLocaleDateString('en-US'), // แก้ไข 3 วันที่แล้ว
      },
      {
        id: 4,
        name: 'Bob Brown',
        imageUrl: 'https://via.placeholder.com/150',
        modifiedDate: new Date(Date.now() - (7 * 24 * 60 * 60 * 1000)).toLocaleDateString('en-US'), // แก้ไข 1 สัปดาห์ที่แล้ว
      },
      {
        id: 5,
        name: 'Eva Davis',
        imageUrl: 'https://via.placeholder.com/150',
        modifiedDate: new Date(Date.now() - (30 * 24 * 60 * 60 * 1000)).toLocaleDateString('en-US'), // แก้ไข 1 เดือนที่แล้ว
      }
    ]);

    return {
      patientRecords
    };
  }
};
</script>
