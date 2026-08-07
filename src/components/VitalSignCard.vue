<template>
  <q-card class="my-card text-center col-12"> <q-card-section class="bg-grey-2">
      <q-icon name="fa-solid fa-heart-pulse" size="56px" color="red-8" />
    </q-card-section>

    <q-card-section class="bg-grey-2">
      <div class="text-h6 text-red-8">Vital Signs</div>
      <div class="text-subtitle2">อาการ</div>
      <div v-if="temperature">อุณหภูมิ: {{ temperature }}</div>
      <div v-if="pulse">ชีพจร: {{ pulse }}</div>
    </q-card-section>
  </q-card>
</template>

<script>
export default {
  props: {
    temperature: {
      type: String,
      required: true
    },
    pulse: {
      type: String,
      required: true
    }
  }
}
</script>
