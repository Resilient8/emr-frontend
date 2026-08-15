# 🏥 EMR V2 (Electronic Medical Record System)

A modern, responsive full-stack Electronic Medical Record (EMR) application built to streamline clinical workflows for outpatient departments. 

This repository contains the **Frontend** client. 
👉 **[Click here for the Backend API Repository]([ใส่ลิงก์ GitHub Backend ของคุณที่นี่])**

---

## 🚀 Live Demo
Experience the application live:
- **Web Application:** [[ใส่ลิงก์เว็บไซต์ที่ Deploy เสร็จแล้วที่นี่]]([ใส่ลิงก์อีกรอบ])

**Test Accounts (Demo Credentials):**
| Role | Username | Password |
| :--- | :--- | :--- |
| **Admin** | admin@emr.com | password123 |
| **Doctor** | doctor@emr.com | password123 |
| **Nurse** | nurse@emr.com | password123 |
| **Pharmacist**| pharma@emr.com | password123 |

*(Note: The database features an Auto-Seed system that generates dummy patient queues daily for testing purposes.)*

---

## ✨ Project Overview
This project was developed to digitize and manage patient journeys within a clinic or hospital setting. It completely separates concerns between four main user roles, ensuring that each medical professional has access only to the tools and data they need.

### Key Features by Role:
*   🩺 **Doctor:** Diagnosis tools, ICD-10 coding, prescription management, and historical medical record tracking.
*   💉 **Nurse:** Patient registration, vital signs recording, and initial symptom assessment (Chief Complaints).
*   💊 **Pharmacist:** Real-time prescription queue, medication dispensing, and auto-stock deduction.
*   🛡️ **Admin:** Master data management (users, medicines, ICD-10), system monitoring, and settings.

---

## 🛠️ Technology Stack
**Frontend:**
*   [Vue.js 3](https://vuejs.org/) (Composition API)
*   [Quasar Framework](https://quasar.dev/) (UI Components & Layout)
*   [Pinia](https://pinia.vuejs.org/) (State Management)
*   [Vue Router](https://router.vuejs.org/)

**Backend (API) & Database:**
*   Node.js & Express.js
*   MySQL with Sequelize ORM
*   JWT Authentication

---

## 📸 Screenshots
*(💡 แนะนำให้เซฟภาพหน้าจอสวยๆ ของระบบ เช่น หน้า Dashboard หรือหน้าตรวจของหมอ มาใส่ไว้ในโฟลเดอร์โปรเจกต์ แล้วเปลี่ยนชื่อไฟล์ด้านล่างให้ตรงครับ)*

<details>
<summary>Click to view screenshots</summary>
<br>

**1. Doctor Diagnosis Dashboard**
![Doctor Dashboard](./screenshots/doctor-dashboard.png)

**2. Nurse Vital Signs Form**
![Nurse Vitals](./screenshots/nurse-vitals.png)

**3. Pharmacist Dispense System**
![Pharmacist Queue](./screenshots/pharmacist-queue.png)

</details>

---

## ⚙️ Getting Started (Local Development)

If you want to run this frontend project locally, follow these steps:

### Prerequisites
- Node.js (v18+ recommended)
- npm or yarn

### Installation
1. Clone the repository:
   ```bash
   git clone [ใส่ลิงก์ GitHub Frontend ของคุณ]
   cd [ชื่อโฟลเดอร์โปรเจกต์]
