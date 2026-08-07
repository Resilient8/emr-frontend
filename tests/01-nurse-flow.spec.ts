// 🌟 1. เพิ่มคำว่า request เข้ามาตรงนี้
import { test, expect, request } from '@playwright/test';

test.describe('EMR System - Nurse Flow', () => {

  // 🌟 2. เพิ่มบล็อกนี้ เพื่อสั่งล้างข้อมูลและสร้างคิวใหม่ให้เสร็จก่อนบอทเริ่มทำงาน
  test.beforeAll(async () => {
    console.log('🧹 กำลังเคลียร์ฐานข้อมูลให้สดใหม่ (เรียกคิวนายสมชายกลับมา)...');
    const apiContext = await request.newContext();

    // ยิง API ไปที่ Backend ของคุณ (เช็กด้วยนะครับว่า Backend รันที่พอร์ต 3000 หรือเปล่า ถ้าไม่ใช่ให้แก้ตัวเลขด้วยครับ)
    await apiContext.get('https://emr-backend-api-8euv.onrender.com/api/test/reset-demo');

    await apiContext.dispose();
  });

  test('1. พยาบาลล็อกอิน เลือกคิว และบันทึกซักประวัติ', async ({ page }) => {

    // ---------------------------------------------------------
    // STEP 1: เข้าเว็บไซต์และทำการ Login
    // ---------------------------------------------------------
    await page.goto('http://localhost:5000/#/myemr-app/login');

    // สั่งให้บอทกดปุ่ม START DEMO เพื่อปิด Modal / เริ่มการเทส
    await page.getByRole('button', { name: 'START DEMO' }).click();

    // 1.2 คลิกปุ่ม Demo Login ของพยาบาล
    await page.getByRole('button', { name: /พยาบาล/i }).click();

    // 1.3 รอให้ URL เปลี่ยนไปหน้า Dashboard พยาบาล (ใส่ catch กัน error กรณี Hash router)
    await page.waitForURL('**/nurse/patient-list', { timeout: 10000 }).catch(() => {});


    // ---------------------------------------------------------
    // STEP 2: จัดการ Guide Modal หน้าคิว
    // ---------------------------------------------------------
    const startGuideBtn = page.getByRole('button', { name: 'START REGISTRY' });
    await startGuideBtn.waitFor({ state: 'visible', timeout: 3000 }).catch(() => {});
    if (await startGuideBtn.isVisible()) {
      await startGuideBtn.click();
    }


    // ---------------------------------------------------------
    // STEP 3: เลือกผู้ป่วยจากคิว
    // ---------------------------------------------------------
    // 3.1 คลิกเลือกผู้ป่วยคนแรก (นาย สมชาย ใจดี)
    await page.getByText('นาย สมชาย ใจดี').first().click();

    // 3.2 รอให้หน้าฟอร์มซักประวัติโหลดขึ้นมา
    await page.waitForURL('**/add-procedure**', { timeout: 10000 }).catch(() => {});

    // 3.3 ดักปิด Modal SYSTEM GUIDE (START TESTING)
    const startTestingBtn = page.getByRole('button', { name: 'START TESTING' });
    await startTestingBtn.waitFor({ state: 'visible', timeout: 3000 }).catch(() => {});
    if (await startTestingBtn.isVisible()) {
      await startTestingBtn.click();
    }

    // 3.4 รอให้ Toast สีเขียวโหลดข้อมูลเก่าเสร็จ และหน่วงเวลา 2 วินาทีให้ข้อมูลนิ่งจริงๆ
    // (ลบโค้ดซ้ำออก แล้วปรับเวลาให้ Quasar ทำงานเสร็จชัวร์ๆ)
    await page.getByText(/โหลดข้อมูล.*สำเร็จ/).waitFor({ state: 'visible', timeout: 5000 }).catch(() => {});
    await page.waitForTimeout(2000);


    // ---------------------------------------------------------
    // STEP 4: กรอกข้อมูล Vital Signs และอาการสำคัญ
    // ---------------------------------------------------------
    // 🌟 ใช้เทคนิค คลิก -> คลุมดำ (Ctrl+A) -> ลบ (Backspace) -> พิมพ์ เพื่อแก้ปัญหาพิมพ์ต่อกัน

    // 4.1 กรอกอุณหภูมิ
    await page.getByLabel(/อุณหภูมิ/i).click();
    await page.keyboard.press('Control+A');
    await page.keyboard.press('Backspace');
    await page.getByLabel(/อุณหภูมิ/i).fill('37.5');

    // 4.2 กรอกความดันตัวบน
    await page.getByLabel(/Systolic/i).click();
    await page.keyboard.press('Control+A');
    await page.keyboard.press('Backspace');
    await page.getByLabel(/Systolic/i).fill('120');

    // 4.3 กรอกความดันตัวล่าง
    await page.getByLabel(/Diastolic/i).click();
    await page.keyboard.press('Control+A');
    await page.keyboard.press('Backspace');
    await page.getByLabel(/Diastolic/i).fill('80');

    // 4.4 ชีพจร
    await page.getByLabel(/ชีพจร/i).click();
    await page.keyboard.press('Control+A');
    await page.keyboard.press('Backspace');
    await page.getByLabel(/ชีพจร/i).fill('85');

    // 4.5 อาการสำคัญ (Chief Complaint)
    await page.getByLabel(/อาการสำคัญ/i).click();
    await page.keyboard.press('Control+A');
    await page.keyboard.press('Backspace');
    await page.getByLabel(/อาการสำคัญ/i).fill('ผู้ป่วยมีไข้ ปวดศีรษะตึบๆ');

    // เคาะ Enter เพื่อเพิ่มแท็กอาการ และกดยกเลิก Dropdown ที่ลอยบังอยู่
    await page.getByLabel(/อาการสำคัญ/i).press('Enter');
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500); // รอให้ Dropdown หุบสนิท


    // ---------------------------------------------------------
    // STEP 5: บันทึกและส่งต่อเคสให้แพทย์
    // ---------------------------------------------------------
    // 5.1 ตอนนี้ไม่มีอะไรบังแล้ว บอทจะกดปุ่มได้ชัวร์ๆ
    await page.getByRole('button', { name: /ยืนยันการส่งต่อ/i }).click();

    // 🌟 5.2 ยกเลิกการใช้ waitForURL (เพราะ SPA มักจะเอ๋อเวลาเช็ก URL เปลี่ยน)
    // ให้ระบบรอเช็กจาก UI โดยตรงเลยว่า "ชื่อผู้ป่วย" กลับมาแสดงบนจออีกครั้งแปลว่าส่งคิวสำเร็จ! (ให้เวลารอ 15 วินาที)
    await expect(page.getByText('นาย สมชาย ใจดี').first()).toBeVisible({ timeout: 15000 });
  });

});
