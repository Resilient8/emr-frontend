<template>
  <q-page padding>


    <q-card class="my-card">
      <q-scroll-area style="height: calc(100vh - 100px);">
        <div v-for="(yearData, index) in timelineData" :key="index" class="year-section">
          <h2 class="year-heading">{{ yearData.year }}</h2>
          <q-separator class="year-separator" />
          <q-timeline :layout="layout">
            <q-timeline-entry
              v-for="(event, eventIndex) in yearData.events"
              :key="eventIndex"
              :title="event.title"
              :subtitle="event.timestamp"
              :body="event.details"
              side="left"
              color="primary"
            />
          </q-timeline>
        </div>
      </q-scroll-area>
    </q-card>
  </q-page>
</template>

<script>
import { ref } from 'vue'

export default {
  setup() {
    const layout = ref('dense')
    const timelineData = ref([
      {
        year: 2024,
        events: [
          {
            title: 'อาการ',
            details: 'ไข้หวัดใหญ่',
            timestamp: 'Monday, August 12, 2024 at 4:25:31 PM'
          },
          {
            title: 'ประวัติผู้ป่วย',
            details: 'นายสมชาย  ใจดี',
            timestamp: 'Monday, August 12, 2024 at 4:25:31 PM'
          }
          // ... เพิ่มข้อมูลอื่นๆ ได้ตามต้องการ ...
        ]
      },
      {
        year: 2023,
        events: [
          {
            title: 'อาการ',
            details: 'ปวดหัวไมเกรน',
            timestamp: 'Wednesday, June 5, 2023 at 10:15:00 AM'
          }
          // ... เพิ่มข้อมูลอื่นๆ ได้ตามต้องการ ...
        ]
      }
      // ... เพิ่มข้อมูลปีอื่นๆ ได้ตามต้องการ ...
    ])

    return { layout, timelineData }
  }
}
</script>

<style scoped>
.my-card {
  width: 100%;
  border: 1px solid #ddd;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.active { /* เพิ่ม style สำหรับ active button */
  background-color: #2196F3;
  color: white;
}

.q-timeline {
  padding: 20px;
}

h2 {
  margin-left: 20px;
}

.year-section {
  margin-bottom: 20px;
}

.year-heading {
  color: #333;
  font-weight: bold;
  margin-bottom: 10px;
}

.year-separator {
  margin-left: 20px;
}

.q-timeline-entry {
  padding: 15px;
  background-color: #fff;
  border: 1px solid #eee;
  border-radius: 8px;
  margin-bottom: 10px;
}

.q-timeline-entry:last-child {
  margin-bottom: 0;
}

.q-timeline-entry__title {
  font-weight: bold;
}

/* เพิ่มเติม */
.q-timeline-entry__dot { /* จุด timeline */
  background-color: #2196F3; /* สีน้ำเงิน */
}

.q-timeline-entry__line { /* เส้น timeline */
  background-color: #eee; /* สีเทาอ่อน */
}

</style>
