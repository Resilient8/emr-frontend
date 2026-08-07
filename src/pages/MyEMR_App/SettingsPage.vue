<template>
  <q-page padding class="settings-page">
    <div class="q-pa-md main-container">

      <div class="text-h4 q-mb-lg">ตั้งค่า (Settings)</div>

      <q-list class="settings-list">

        <q-item clickable v-ripple class="setting-item">
          <q-item-section avatar>
            <q-icon name="o_account_circle" />
          </q-item-section>
          <q-item-section>
            <q-item-label>บัญชี (Accounts)</q-item-label>
            <q-item-label caption>Your accounts, email, sync, work</q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-icon name="chevron_right" />
          </q-item-section>
        </q-item>

        <q-item clickable v-ripple class="setting-item">
          <q-item-section avatar>
            <q-icon name="o_palette" />
          </q-item-section>
          <q-item-section>
            <q-item-label>สี (Colors)</q-item-label>
            <q-item-label caption>Accent color, transparency effects</q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-icon name="chevron_right" />
          </q-item-section>
        </q-item>

        <q-item clickable v-ripple class="setting-item">
          <q-item-section avatar>
            <q-icon name="o_dark_mode" />
          </q-item-section>
          <q-item-section>
            <q-item-label>ธีม (Themes)</q-item-label>
            <q-item-label caption>Install, create, manage</q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-icon name="chevron_right" />
          </q-item-section>
        </q-item>

         <q-item clickable v-ripple class="setting-item">
          <q-item-section avatar>
            <q-icon name="o_font_download" />
          </q-item-section>
          <q-item-section>
            <q-item-label>ฟอนต์ (Fonts)</q-item-label>
            <q-item-label caption>Install, manage</q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-icon name="chevron_right" />
          </q-item-section>
        </q-item>

        <q-item clickable v-ripple class="setting-item">
          <q-item-section avatar>
            <q-icon name="o_app_registration" />
          </q-item-section>
          <q-item-section>
            <q-item-label>แอป (Apps)</q-item-label>
            <q-item-label caption>Uninstall, defaults, optional features</q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-icon name="chevron_right" />
          </q-item-section>
        </q-item>

      </q-list>

    </div>
  </q-page>
</template>

<script setup>
import { ref } from 'vue';
import { useQuasar } from 'quasar';

const $q = useQuasar();

</script>

<style scoped>
/* พื้นหลังหน้าทั้งหมด */
.settings-page {
  background-color: #1B1B1B; /* << สีใหม่ตามรูปภาพ */
}

.main-container {
  max-width: 900px;
  margin: 0 auto;
}

/* สีหัวข้อหลัก "ตั้งค่า (Settings)" */
.main-container .text-h4 {
  color: #E0E0E0;
}

.settings-list {
  margin-top: 16px;
}

/* กล่องของแต่ละรายการตั้งค่า */
.setting-item {
  padding: 20px 16px;
  border-radius: 8px;
  margin-bottom: 8px;
  transition: background-color 0.3s;
  background-color: #2A2A2A; /* << ปรับสีให้เข้มขึ้นเล็กน้อยเพื่อให้เข้ากับพื้นหลังใหม่ */
  border: 1px solid #3C3C3C;
}

.setting-item:hover {
  background-color: #3C3C3C;
}

/* สีของไอคอน */
.setting-item .q-item__section--avatar .q-icon {
  color: #8AB4F8; /* สีฟ้า Accent */
}

/* สีของข้อความหลัก */
.setting-item .q-item__label {
  font-size: 1rem;
  color: #F5F5F5; /* สีขาวนวล */
}

/* สีของข้อความรอง (caption) */
.setting-item .q-item__label--caption {
  color: #9E9E9E;
}

/* สีของลูกศรด้านขวา */
.setting-item .q-item__section--side .q-icon {
  color: #757575;
}
</style>
