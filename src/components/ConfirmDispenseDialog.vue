<template>
  <q-dialog ref="dialogRef" @hide="onDialogHide">
    <q-card class="q-dialog-plugin" style="width: 450px; border-radius: 12px;">

      <q-card-section class="row items-center q-pb-none">
        <q-avatar icon="o_help_outline" color="primary" text-color="white" />
        <span class="q-ml-md text-h6 text-weight-bold">ยืนยันการจ่ายยา</span>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>

      <q-card-section class="q-pt-md">
        <p>คุณต้องการยืนยันการจ่ายยาทั้งหมด และบันทึกข้อมูลใช่หรือไม่?</p>
      </q-card-section>

      <q-card-section class="q-pt-none">
        <div class="q-pa-sm bg-blue-1 text-blue-8" style="border-radius: 4px;">
          <div class="text-caption q-mb-xs">
            <q-icon name="o_info" class="q-mr-xs" />
            หากต้องการเอกสาร กรุณาดาวน์โหลดหรือพิมพ์ก่อนยืนยัน:
          </div>
          <q-btn-group flat>
            <q-btn
              label="ดาวน์โหลด"
              icon="o_download"
              flat
              dense
              no-caps
              color="primary"
              @click="onDownloadClick"
            />
            <q-btn
              label="พิมพ์"
              icon="o_print"
              flat
              dense
              no-caps
              color="primary"
              @click="onPrintClick"
            />
          </q-btn-group>
        </div>
      </q-card-section>

      <q-card-actions align="right" class="q-pa-md bg-grey-1">
        <q-btn label="ยกเลิก" flat no-caps color="grey-8" @click="onDialogCancel" />
        <q-btn label="ยืนยัน" unelevated no-caps color="positive" @click="onDialogOK" />
      </q-card-actions>

    </q-card>
  </q-dialog>
</template>

<script setup>
import { useDialogPluginComponent } from 'quasar'

// 4. รับฟังก์ชันมาจากหน้าหลักผ่าน props
const props = defineProps({
  onDownload: {
    type: Function,
    required: true
  },
  onPrint: {
    type: Function,
    required: true
  }
})

defineEmits([
  ...useDialogPluginComponent.emits
])

const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } = useDialogPluginComponent()

// 5. เมื่อกดปุ่มในนี้ ให้เรียกใช้ฟังก์ชันที่ส่งมาจากหน้าหลัก
const onDownloadClick = () => {
  props.onDownload()
}

const onPrintClick = () => {
  props.onPrint()
}
</script>
