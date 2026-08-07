
<template>
  <q-page padding class="bg-gray-2">
    <div class="q-pa-md">
      <div class="text-h5 text-center q-mb-md title">
        ข้อมูลการรักษา
      </div>

      <q-card class="my-card">
        <q-card-section class="q-pa-lg">
          <div class="row q-col-gutter-sm">
            <div class="col-12">
              <q-select
                dense
                outlined
                v-model="newProcedure.service"
                label="บริการ"
                :options="serviceOptions"
                class="input-field"
                :disable="!isEditing"
              />
            </div>
            <div class="col-12 q-mt-sm">
              <q-select
                dense
                outlined
                v-model="newProcedure.diagnosis"
                label="การวินิจฉัย"
                :options="diagnosisOptions"
                class="input-field"
                use-input
                input-debounce="0"
                @filter="filterDiagnosis"
                :disable="!isEditing"
              />
            </div>
            <div class="col-12 q-mt-sm">
              <q-select
                dense
                outlined
                v-model="newProcedure.procedure"
                label="หัตถการ"
                :options="procedureOptions"
                class="input-field"
                use-input
                input-debounce="0"
                @filter="filterProcedure"
                :disable="!isEditing"
              />
            </div>
            <div class="col-12 q-mt-sm">
              <q-input
                dense
                outlined
                v-model="newProcedure.notes"
                label="บันทึกเพิ่มเติม"
                class="input-field"
                type="textarea"
                :disable="!isEditing"
              />
            </div>
          </div>
        </q-card-section>
        <q-card-actions align="center" class="q-pa-md">
          <q-btn
            v-if="!isEditing"
            flat
            label="แก้ไขข้อมูล"
            @click="isEditing = true"
            class="q-px-xl edit-button"
          />
          <q-btn
            v-if="isEditing"
            flat
            label="บันทึก"
            @click="saveProcedureData"
            class="q-px-xl save-button"
          />
          <q-btn
            v-if="isEditing"
            flat
            label="ยกเลิก"
            @click="cancelAdd"
            class="q-px-xl cancel-button"
          />
        </q-card-actions>
      </q-card>
    </div>
  </q-page>
</template>
<script>
import { reactive, ref } from "vue";
import { useRouter } from "vue-router";

export default {
  setup() {
    const router = useRouter();
    const isEditing = ref(false);

    const newProcedure = reactive({
      service: null,
      diagnosis: null,
      procedure: null,
      notes: "",
    });

    const serviceOptions = [
      "ตรวจรักษาพยาบาล",
      "ฝังเข็ม",
      "ตรวจร่างกาย",
      "เยี่ยมบ้าน",
      "กายภาพ",
      "นวดประคบแผนไทย",
      "อื่นๆ",
    ];

    const diagnosisOptions = ref([
      "Infections",
      "bacterial diseases",
      "อาหารเป็นพิษ",
      "ล่าไส้อักเสบในเด็ก AGE",
      "อุจจาระร่วง Diarrhea",
      "วัณโรค",
      "โรคเรื้อน (Leprosy)",
      "Syphilis",
      "โรคติดต่อทางเพศสัมพันธ์ STDs",
      "Viral infections",
      "Mycoses",
      "Protozoal diseases",
      "Helminthiases",
      "อีสุกอีใส",
      "เริม",
      "งูสวัด",
      "หูด",
      "ตาปลา",
      "โรคมือ เท้า ปาก",
      "เปื่อย",
      "AIDS",
      "ตาแดง",
      "รังแค (กลากที่ศีรษะ)",
      "กลาก",
      "เกลื้อน",
      "พยาธิล่าไส้",
      "เหา",
      "Neoplasms",
      "มะเร็ง",
      "Diseases of the blood and blood-forming organs",
      "ก้อนไขมัน",
      "เป็นพาหะธาลัสซีเมีย",
      "โลหิตจาง",
      "Endocrine, nutritional and metabolic diseases",
      "้อนไทรอยด์",
      "คอพอก",
      "เบาหวาน",
      "ทุพโภชนาการ",
      "Dyslipidaemia",
      "Mental and behavioural disorders",
      "เมาสุรา",
      "ติดบุหรี่",
      "จิตเภท",
      "ซึมเศร้า",
      "นอนไม่หลับ",
      "เกี่ยวกับจิตใจ",
      "Hyperventilation",
      "Mental retardation",
      "Diseases of the nervous system",
      "Epilepsy",
      "โรคลมชัก",
      "Parkinson's disease",
      "โรคไมเกรน",
      "ปวดศีรษะจากความเครียด",
      "Diseases of the eye and adnexa",
      "โรคทางตา",
      "Diseases of the ear and mastoid process",
      "โรคทางหู คอ จมูก",
      "Diseases of the circulatory system",
      "โรคหัวใจ",
      "เลือดออกในสมอง Cerebral infarction CVA",
      "เส้นเลือดขอดที่ขา",
      "ริดสีดวงทวาร",
      "Diseases of the respiratory system",
      "ริดสีดวงจมูก",
      "Diseases of the digestive system",
      "ระบบทางเดินอาหาร",
      "Diseases of the skin and subcutaneous tissue",
      "ทางผิวหนัง",
      "ผื่นแพ้",
      "Diseases of the musculoskeletal system and connective tissue",
      "โรคกระดูก",
      "ปวดกระดูกข้อ",
      "ข้อเสื่อม",
      "Diseases of the genitourinary system",
      "ระบบสืบพันธ์",
      "ทางเดินปัสสาวะ",
      "Pregnancy, childbirth and the puerperium",
      "Symptoms, signs and abnormal clinical and laboratory findings not",
      "อาการผิดปกติอื่นๆ",
      "Accident / สารพิษ",
    ]);

    const procedureOptions = ref([
      "เช็คความดัน",
      "ตรวจการได้ยิน",
      "remove wax/foreinbody",
      "dressing/suture/stitch off",
      "ekg 12 leads",
      "dtx /blood exam",
      "on IV",
      "ฉีดยาต่างๆ",
      "Aspiration",
      "refer",
      "oxygen therapy/พ่นยา",
      "CPR/Intubation",
      "ทำคลอด",
      "ทำรองเท้า/เฝือก กายอุปกรณ์",
      "ตรวจเต้านม",
      "ตรวจมะเร็งปากมดลูก",
      "Xray",
      "คัดกรองเครียด/ซึมเศร้า",
    ]);

    const filterDiagnosis = (val, update) => {
      if (val === "") {
        update(() => {
          diagnosisOptions.value = [
            "Infections",
            "bacterial diseases",
            "อาหารเป็นพิษ",
            "ล่าไส้อักเสบในเด็ก AGE",
            "อุจจาระร่วง Diarrhea",
            "วัณโรค",
            "โรคเรื้อน (Leprosy)",
            "Syphilis",
            "โรคติดต่อทางเพศสัมพันธ์ STDs",
            "Viral infections",
            "Mycoses",
            "Protozoal diseases",
            "Helminthiases",
            "อีสุกอีใส",
            "เริม",
            "งูสวัด",
            "หูด",
            "ตาปลา",
            "โรคมือ เท้า ปาก",
            "เปื่อย",
            "AIDS",
            "ตาแดง",
            "รังแค (กลากที่ศีรษะ)",
            "กลาก",
            "เกลื้อน",
            "พยาธิล่าไส้",
            "เหา",
            "Neoplasms",
            "มะเร็ง",
            "Diseases of the blood and blood-forming organs",
            "ก้อนไขมัน",
            "เป็นพาหะธาลัสซีเมีย",
            "โลหิตจาง",
            "Endocrine, nutritional and metabolic diseases",
            "้อนไทรอยด์",
            "คอพอก",
            "เบาหวาน",
            "ทุพโภชนาการ",
            "Dyslipidaemia",
            "Mental and behavioural disorders",
            "เมาสุรา",
            "ติดบุหรี่",
            "จิตเภท",
            "ซึมเศร้า",
            "นอนไม่หลับ",
            "เกี่ยวกับจิตใจ",
            "Hyperventilation",
            "Mental retardation",
            "Diseases of the nervous system",
            "Epilepsy",
            "โรคลมชัก",
            "Parkinson's disease",
            "โรคไมเกรน",
            "ปวดศีรษะจากความเครียด",
            "Diseases of the eye and adnexa",
            "โรคทางตา",
            "Diseases of the ear and mastoid process",
            "โรคทางหู คอ จมูก",
            "Diseases of the circulatory system",
            "โรคหัวใจ",
            "เลือดออกในสมอง Cerebral infarction CVA",
            "เส้นเลือดขอดที่ขา",
            "ริดสีดวงทวาร",
            "Diseases of the respiratory system",
            "ริดสีดวงจมูก",
            "Diseases of the digestive system",
            "ระบบทางเดินอาหาร",
            "Diseases of the skin and subcutaneous tissue",
            "ทางผิวหนัง",
            "ผื่นแพ้",
            "Diseases of the musculoskeletal system and connective tissue",
            "โรคกระดูก",
            "ปวดกระดูกข้อ",
            "ข้อเสื่อม",
            "Diseases of the genitourinary system",
            "ระบบสืบพันธ์",
            "ทางเดินปัสสาวะ",
            "Pregnancy, childbirth and the puerperium",
            "Symptoms, signs and abnormal clinical and laboratory findings not",
            "อาการผิดปกติอื่นๆ",
            "Accident / สารพิษ",
          ];
        });
        return;
      }
      update(() => {
        const needle = val.toLowerCase();
        diagnosisOptions.value = diagnosisOptions.value.filter((v) =>
          v.toLowerCase().includes(needle)
        );
      });
    };
    const filterProcedure = (val, update) => {
      if (val === "") {
        update(() => {
          procedureOptions.value = [
            "เช็คความดัน",
            "ตรวจการได้ยิน",
            "remove wax/foreinbody",
            "dressing/suture/stitch off",
            "ekg 12 leads",
            "dtx /blood exam",
            "on IV",
            "ฉีดยาต่างๆ",
            "Aspiration",
            "refer",
            "oxygen therapy/พ่นยา",
            "CPR/Intubation",
            "ทำคลอด",
            "ทำรองเท้า/เฝือก กายอุปกรณ์",
            "ตรวจเต้านม",
            "ตรวจมะเร็งปากมดลูก",
            "Xray",
            "คัดกรองเครียด/ซึมเศร้า",
          ];
        });
        return;
      }
      update(() => {
        const needle = val.toLowerCase();
        procedureOptions.value = procedureOptions.value.filter((v) =>
          v.toLowerCase().includes(needle)
        );
      });
    };

    const saveProcedureData = () => {
      // TODO: บันทึกข้อมูลการรักษาใหม่ลงใน database หรือ API
      console.log("บันทึกข้อมูลการรักษา:", newProcedure);

      // TODO: ปรับแต่งการ redirect และส่งข้อมูลการรักษาไปยังหน้าอื่นๆ ตามต้องการ
      router.push("/procedures-list");
    };

    const cancelAdd = () => {
      // ล้างข้อมูลใน form และกลับไปยังหน้า procedure list (หรือหน้าอื่นๆ ตามต้องการ)
      for (const key in newProcedure) {
        newProcedure[key] = "";
      }
      router.push("/procedures-list");
    };

    return {
      newProcedure,
      serviceOptions,
      diagnosisOptions,
      procedureOptions,
      filterDiagnosis,
      filterProcedure,
      saveProcedureData,
      cancelAdd,
      isEditing,
    };
  },
};
</script>

<style scoped>
.bg-gray-2 {
  background-color: #f0f0f0;
}

.title {
  font-weight: bold;
  border: 1px solid #ddd;
  padding: 10px;
  border-radius: 5px;
  background-color: white; /* เพิ่มสีพื้นหลังสีขาว */
}

.my-card {
  border-radius: 10px;
  box-shadow: 0px 2px 5px rgba(0, 0, 0, 0.1);
}

.input-field {
  background-color: white;
  border: none;
  border-bottom: 1px solid #bdbdbd;
  border-radius: 0px;
  padding: 8px 0px;
}

.input-field .q-field__control {
  height: 40px;
}

.input-field label {
  font-size: 14px;
  color: #757575;
}
/* ปุ่ม ยกเลิก (สีแดง) */
.cancel-button {
  background-color: white;
  color: #d32f2f; /* เปลี่ยนสีตัวอักษรเป็นสีแดง */
  border: 2px solid #d32f2f;
  border-radius: 5px;
  padding: 10px 20px;
  font-weight: 500;
  transition: all 0.3s ease;
}

/* ปุ่ม ยกเลิก (สีแดง) */
.cancel-button:hover {
  background-color: #ef5350;
  border-color: #ef5350;
  box-shadow: 0px 2px 4px rgba(211, 47, 47, 0.3);
  color: white; /* เพิ่มสีตัวอักษรเป็นสีขาวเมื่อ hover */
}

/* ปุ่ม บันทึก (สีเขียว) */
.save-button {
  background-color: white;
  color: #2e7d32; /* สีเขียว */
  border: 2px solid #2e7d32;
  border-radius: 5px;
  padding: 10px 20px;
  font-weight: 500;
  transition: all 0.3s ease;
}

/* ปุ่ม บันทึก (สีเขียว) */
.save-button:hover {
  background-color: #4caf50;
  border-color: #4caf50;
  box-shadow: 0px 2px 4px rgba(46, 125, 50, 0.3);
  color: white; /* เพิ่มสีตัวอักษรเป็นสีขาวเมื่อ hover */
}

.edit-button {
  background-color: white;
  color: #027be3; /* สีฟ้า */
  border: 2px solid #027be3;
  border-radius: 5px;
  padding: 10px 20px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.edit-button:hover {
  background-color: #2196f3;
  border-color: #2196f3;
  box-shadow: 0px 2px 4px rgba(2, 123, 227, 0.3);
  color: white;
}
.input-field.disabled {
  color: #000 !important;
}
</style>
