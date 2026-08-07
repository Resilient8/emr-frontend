import { boot } from 'quasar/wrappers'
import VueApexCharts from 'vue3-apexcharts'

export default boot(({ app }) => {
  // ทำให้เราสามารถใช้ <apexchart> ใน template ได้
  app.use(VueApexCharts)
})
