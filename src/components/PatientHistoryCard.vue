<template>
  <q-card class="my-card text-center col-12"> <q-card-section class="bg-grey-2">
      <q-icon name="fa-solid fa-book-medical" size="56px" color="green-5" />
    </q-card-section>

    <q-card-section class="bg-grey-2">
      <div class="text-h6 text-green-5">Patient History</div>
      <div class="text-subtitle2">ประวัติผู้ป่วย</div>
      <div v-if="patientName">{{ patientName }}</div>
      <div v-if="patientAge">อายุ: {{ patientAge }}</div>
      <div v-if="patientBloodGroup">กรุ๊ปเลือด: {{ patientBloodGroup }}</div>
    </q-card-section>
  </q-card>
</template>

<script>
export default {
  props: {
    patientName: {
      type: String,
      required: true
    },
    patientAge: {
      type: String,
      required: true
    },
    patientBloodGroup: {
      type: String,
      required: true
    }
  }
}
</script>
