การทำงานของระบบ ICP ปัจจุบันอยู่ภายใต้การดูแลของ สสส. และระบบทั้งหมดอยู่ภายใต้ลิขสิทธ์ของผู้พัฒนาและสสส. @copyright 2555
//----------------------------------------------
// Dockerfile
//----------------------------------------------
docker build -t dockerize-quasar .
docker run -it -p 8000:80 --rm dockerize-quasar
//----------------------------------------------
// docker-compose.yml
//----------------------------------------------
docker-compose up --build
//----------------------------------------------
// https://hub.docker.com/
//----------------------------------------------
image คือ quasar-icp110-www-mobile-admin-suser-not-chart-gpt-doc-quasar
YOUR_DOCKERHUB_NAME คือ somnuk999
Repositories คือ icp1

docker tag quasar-icp110-www-mobile-admin-suser-not-chart-gpt-doc-quasar somnuk999/icp1
docker push somnuk999/icp1
//------------------------------------------------
การ run โปรแกรมหลัก
npm run dev #package.json
การ run โปรแกรม ChartGPT
ืnode run chatgpt #package.json - chatgpt-backend
