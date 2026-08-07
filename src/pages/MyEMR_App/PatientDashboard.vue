<template>
  <div class="q-pa-md">
    <div class="text-h5 q-mb-md">Dashboard ผู้ป่วยนอก</div>

    <div class="row q-gutter-md">
      <div class="col-md-3 col-sm-6 col-xs-12">
        <q-card flat bordered class="q-pa-md">
          <div class="text-h6">ผู้ป่วยนอกทั้งหมดวันนี้</div>
          <div class="text-weight-bold text-h4">{{ totalOutpatientsToday }}</div>
        </q-card>
      </div>
      <div class="col-md-3 col-sm-6 col-xs-12">
        <q-card flat bordered class="q-pa-md">
          <div class="text-h6">ผู้ป่วยใหม่วันนี้</div>
          <div class="text-weight-bold text-h4">{{ newOutpatientsToday }}</div>
        </q-card>
      </div>
      <div class="col-md-3 col-sm-6 col-xs-12">
        <q-card flat bordered class="q-pa-md">
          <div class="text-h6">ผู้ป่วยเฉลี่ยต่อวัน (สัปดาห์นี้)</div>
          <div class="text-weight-bold text-h4">{{ averageOutpatientsThisWeek }}</div>
        </q-card>
      </div>
        <div class="col-md-3 col-sm-6 col-xs-12">
        <q-card flat bordered class="q-pa-md">
          <div class="text-h6">ผู้ป่วยทั้งหมด</div>
          <div class="text-weight-bold text-h4">{{ totalOutpatients }}</div>
        </q-card>
      </div>
    </div>

    <div class="q-mt-md">
      <apexchart type="line" height="350" :options="chartOptionsMonthlyVisits" :series="seriesMonthlyVisits"></apexchart>
    </div>

    <div class="q-mt-md">
      <apexchart type="bar" height="350" :options="chartOptionsVisitsByDepartment" :series="seriesVisitsByDepartment"></apexchart>
    </div>

    <div class="q-mt-md">
      <apexchart type="pie" height="350" :options="chartOptionsTopDiagnoses" :series="seriesTopDiagnoses"></apexchart>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import VueApexCharts from "vue3-apexcharts";
import axios from 'axios';

export default {
  components: {
    apexchart: VueApexCharts
  },
  setup() {
    const totalOutpatientsToday = ref(0);
    const newOutpatientsToday = ref(0);
    const averageOutpatientsThisWeek = ref(0);
    const totalOutpatients = ref(0);
    const monthlyVisitsData = ref([]);
    const visitsByDepartmentData = ref([]);
    const topDiagnosesData = ref([]);

    const chartOptionsMonthlyVisits = ref({
      chart: {
        type: 'line'
      },
      xaxis: {
        categories: ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.']
      }
    });

    const chartOptionsVisitsByDepartment = ref({
      chart: {
        type: 'bar'
      },
      xaxis: {
        categories: ['อายุรกรรม', 'ศัลยกรรม', 'กุมารเวช', 'อื่นๆ']
      }
    });

    const chartOptionsTopDiagnoses = ref({
        chart: {
            type: 'pie'
        },
        labels: ['โรคหวัด', 'ความดัน', 'เบาหวาน', 'อื่นๆ']
    });


    const seriesMonthlyVisits = ref([{ name: 'จำนวนผู้ป่วย', data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] }]);
    const seriesVisitsByDepartment = ref([{ name: 'จำนวนผู้ป่วย', data: [0, 0, 0, 0] }]);
    const seriesTopDiagnoses = ref([0, 0, 0, 0]);

    onMounted(async () => {
      try {
        const res = await axios.get('https://emr-backend-api-8euv.onrender.com/api/dashboard'); // สร้าง API endpoint สำหรับ Dashboard
        totalOutpatientsToday.value = res.data.totalOutpatientsToday || 0;
        newOutpatientsToday.value = res.data.newOutpatientsToday || 0;
        averageOutpatientsThisWeek.value = res.data.averageOutpatientsThisWeek || 0;
        totalOutpatients.value = res.data.totalOutpatients || 0;
        monthlyVisitsData.value = res.data.monthlyVisits || [];
        visitsByDepartmentData.value = res.data.visitsByDepartment || [];
        topDiagnosesData.value = res.data.topDiagnoses || [];

          seriesMonthlyVisits.value = [{ name: 'จำนวนผู้ป่วย', data: monthlyVisitsData.value }];
          seriesVisitsByDepartment.value = [{ name: 'จำนวนผู้ป่วย', data: visitsByDepartmentData.value }];
          seriesTopDiagnoses.value = topDiagnosesData.value;

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      }
    });

    return {
      totalOutpatientsToday,
      newOutpatientsToday,
      averageOutpatientsThisWeek,
      totalOutpatients,
      chartOptionsMonthlyVisits,
      seriesMonthlyVisits,
      chartOptionsVisitsByDepartment,
      seriesVisitsByDepartment,
      chartOptionsTopDiagnoses,
      seriesTopDiagnoses
    };
  },
};
</script>
