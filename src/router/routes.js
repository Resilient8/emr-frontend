import MainLayout from "layouts/MainLayout.vue";
import IndexPage from "layouts/IndexPage.vue";
// หมายเหตุ: ผมได้ลบ import ทั้งหมดที่เกี่ยวกับไฟล์ .vue ที่เราได้ลบทิ้งไปแล้ว

// --- MyEMR_App Routes ---
// เราจะ import เฉพาะไฟล์ที่จำเป็นจริงๆ เพื่อความสะอาด
import MedicalCertificate from "pages/MyEMR_App/MedicalCertificate.vue";


const routes = [
  {
    path: "/",
    component: MainLayout,
    children: [
      {
        path: "", // ทำให้หน้าแรกเป็นหน้า EmrHome
        name: "Home",
        component: () => import('pages/MyEMR_App/EmrHome.vue')
      },
      // --- MyEMR_App Routes ---
      // ย้าย route ทั้งหมดของโปรเจกต์คุณมาไว้ใน children ของ MainLayout
      { path: "/patient-list", name: "PatientList", component: () => import("pages/MyEMR_App/PatientList.vue") },
      { path: '/myemr-app/login', name: 'Login', component: () => import('pages/MyEMR_App/LoginPage.vue') },
      { path: '/myemr-app/add-patient', name: 'AddPatient', component: () => import('pages/MyEMR_App/AddPatient.vue') },
      { path: '/myemr-app/patient-records/:id', name: 'PatientRecords', component: () => import('pages/MyEMR_App/PatientRecords.vue'), props: true },
      { path: '/myemr-app/patient-history/:id', name: 'PatientHistory', component: () => import('pages/MyEMR_App/PatientHistory.vue'), props: true },
      { path: '/myemr-app/vital-sign/:label', name: 'VitalSign', component: () => import('pages/MyEMR_App/VitalSign.vue') },
      { path: '/myemr-app/patient-summary', name: 'PatientSummary', component: () => import('pages/MyEMR_App/PatientSummary.vue') },
      { path: '/myemr-app/patient-timeline', name: 'PatientTimeline', component: () => import('pages/MyEMR_App/PatientTimeline.vue') },
      { path: '/myemr-app/vitalsignlist', name: 'VitalSignList', component: () => import('pages/MyEMR_App/VitalsignList.vue') },
      { path: '/myemr-app/add-vital-sign', name: 'AddVitalSign', component: () => import('pages/MyEMR_App/AddVitalSign.vue') },
      { path: '/myemr-app/user-registration', name: 'UserRegistration', component: () => import('pages/MyEMR_App/UserRegistration.vue') },
      { path: '/myemr-app/emr-home', name: 'EmrHome', component: () => import('pages/MyEMR_App/EmrHome.vue') },
      { path: '/medicine-list', name: 'MedicineList', component: () => import('pages/MyEMR_App/MedicineList.vue') },
      {
  path: '/patient-medicine/:visitId', // 👈 ต้องมีตัวรับค่าตรงนี้
  name: 'PatientMedicine',
  component: () => import('pages/MyEMR_App/PatientMedicine.vue')
},
      { path: '/add-medicine', name: 'AddMedicine', component: () => import('pages/MyEMR_App/AddMedicine.vue') },

      // 🔽🔽🔽 [!! ผม "แก้ไข" บรรทัดนี้ครับ !!] 🔽🔽🔽
      // (Path: "คงเดิม" ... เพื่อให้ URL /#/procedures-list ใช้งานได้)
      // (Name: "เปลี่ยน" ... เพื่อให้หน้าฟอร์ม เด้งกลับมาถูก)
      { path: '/procedures-list', name: 'DoctorPatientList', component: () => import('pages/MyEMR_App/procedureList.vue') },
      // 🔼🔼🔼 [!! สิ้นสุดการแก้ไข !!] 🔼🔼🔼

      { path: '/add-procedure', name: 'AddProcedure', component: () => import('pages/MyEMR_App/AddProcedure.vue') },
      { path: '/patient-procedure', name: 'PatientProcedure', component: () => import('pages/MyEMR_App/PatientProcedure.vue') },
      { path: '/patient-dashboard', name: 'PatientDashboard', component: () => import('pages/MyEMR_App/PatientDashboard.vue') },
      { path: '/medical-form/:patientId', name: 'MedicalFormList', component: () => import('pages/MyEMR_App/MedicalFormList.vue') },

      { path: '/doctor/diagnosis', name: 'DoctorDiagnosis', component: () => import('pages/MyEMR_App/DoctorDiagnosisPage.vue') },
      { path: '/tutorial', name: 'TutorialPage', component: () => import('pages/MyEMR_App/TutorialPage.vue') },
      { path: '/settings', name: 'SettingsPage', component: () => import('pages/MyEMR_App/SettingsPage.vue') },
      { path: '/myemr-app/medical-certificate/:recordId', name: 'MedicalCertificate', component: MedicalCertificate, props: true },
      {
        path: '/nurse/patient-list',
        name: 'NursePatientList',
        component: () => import('pages/MyEMR_App/NursePatientList.vue')
      },
      {
        path: '/dashboard',
        name: 'Dashboard',
        component: () => import('pages/MyEMR_App/DashboardPage.vue')
      },
      {
        path: '/nurse/record/:id',
        name: 'NurseRecord',
        component: () => import('pages/MyEMR_App/NurseRecordPage.vue'),
        props: true
      },
      {
        path: '/admin/master-data',
        name: 'AdminMasterData',
        component: () => import('pages/MyEMR_App/AdminMasterData.vue')
      },
      {
        path: '/admin/users',
        name: 'AdminUserPage',
        // ✅ ชี้ไปที่โฟลเดอร์ MyEMR_App ตามตัวอย่าง
        component: () => import('pages/MyEMR_App/AdminUserPage.vue')
      }

    ]
  },

  // Route สำหรับหน้าที่ไม่ต้องการ Layout (เช่น Login) จะอยู่นอก children
  // (ถ้ามีหน้า Login แยก สามารถเพิ่มตรงนี้ได้)


  // Always leave this as last one,
  // but you can also remove it
  {
    path: "/:catchAll(.*)*",
    component: () => import("pages/ErrorNotFound.vue"),
  },
];

export default routes;
