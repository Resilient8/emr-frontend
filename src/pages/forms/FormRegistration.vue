<template>
  <q-page class="flex flex-center">
    <q-card square bordered class="q-pa-lg shadow-2" style="width: 360px  ;">

      <q-card-section>
        <div class="text-h6 text-center q-mb-lg">Get started</div>

        <q-form @submit="handleLogin">
          <q-input
            v-model="userId"
            label="User/Id"
            outlined
            lazy-rules
            :rules="[ val => val && val.length > 0 || 'Please enter your User/Id']"
          />

          <q-input
            v-model="password"
            label="Password"
            type="password"
            outlined
            lazy-rules
            :rules="[ val => val && val.length > 0 || 'Please enter your password']"
            class="q-mt-md"
          />

          <div class="text-center q-mt-lg">
            <q-btn label="Login" type="submit" color="primary" />
          </div>
        </q-form>
      </q-card-section>

      <q-card-section class="text-center q-pa-none">
        <p class="text-grey-7">ยังไม่ได้ลงทะเบียน? <a href="#">สร้างบัญชี</a></p>
      </q-card-section>

    </q-card>
  </q-page>
</template>

<script>
import { ref } from 'vue'

export default {
  setup () {
    const userId = ref('')
    const password = ref('')

    const handleLogin = () => {
      // ตรวจสอบข้อมูลการเข้าสู่ระบบที่นี่ (เช่น ส่งไปยัง API)
      console.log('User/Id:', userId.value)
      console.log('Password:', password.value)
    }

    return {
      userId,
      password,
      handleLogin
    }
  }
}
</script>

<style>
.q-field--outlined .q-field__control:before {
  border: 1px solid #c2c2c2; /* ปรับเส้นขอบ input */
}

.q-field--outlined .q-field__control {
  background-color: white; /* ปรับพื้นหลัง input */
}

.q-card {
  border-radius: 10px; /* หรือค่าอื่นๆ ตามที่คุณต้องการ */
}
</style>
