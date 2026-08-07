import { test, expect } from '@playwright/test';

test.describe('EMR System - Doctor Flow', () => {

  test('2. แพทย์ล็อกอิน เลือกคิว ตรวจวินิจฉัย สั่งยา และปิดเคส', async ({ page }) => {

    // ---------------------------------------------------------
    // STEP 1: เข้าเว็บไซต์และทำการ Login
    // ---------------------------------------------------------
    await page.goto('http://localhost:5000/#/myemr-app/login');

    // ปิด Modal แนะนำหน้าแรก
    await page.getByRole('button', { name: 'START DEMO' }).click();

    // เลียนแบบหน้าพยาบาลเป๊ะๆ คลิกปุ่มเข้าสู่ระบบของแพทย์
    await page.getByRole('button', { name: /แพทย์|Doctor/i }).first().click();

    // รอให้เข้าหน้า Dashboard หมอสำเร็จ
    await expect(page.getByText(/รายการผู้ป่วย/i).first()).toBeVisible({ timeout: 15000 });


    // ---------------------------------------------------------
    // STEP 2: จัดการ Guide Modal หน้าคิว (Doctor Queue)
    // ---------------------------------------------------------
    // 2.1 หาปุ่ม "START TESTING" หน้าคิว และกดปิด (เหมือนของพยาบาล)
    const queueGuideBtn = page.getByRole('button', { name: 'START TESTING' });
    await queueGuideBtn.waitFor({ state: 'visible', timeout: 3000 }).catch(() => {});
    if (await queueGuideBtn.isVisible()) {
      await queueGuideBtn.click();
    }


    // ---------------------------------------------------------
    // STEP 3: เลือกผู้ป่วยจากคิว
    // ---------------------------------------------------------
    // 3.1 คลิกเลือกผู้ป่วยคนแรกสุด
    await page.locator('.patient-card').first().click();

    // 3.2 รอให้หน้าจอห้องตรวจโหลดขึ้นมา
    await expect(page.getByText('ห้องตรวจแพทย์')).toBeVisible({ timeout: 15000 });


    // ---------------------------------------------------------
    // STEP 4: ดักปิด Guide Modal หน้าตรวจวินิจฉัย (ลอกแบบพยาบาล)
    // ---------------------------------------------------------
    // 4.1 รอให้กล่อง "กำลังโหลดข้อมูล..." หายไปก่อน (ถ้ามี)
    await expect(page.getByText('กำลังโหลดข้อมูล...')).toBeHidden({ timeout: 10000 }).catch(() => {});

    // 4.2 ดักปุ่ม START TESTING หน้าตรวจ (ให้เวลา 5 วินาที เพราะหน้าเว็บมี setTimeout หน่วงไว้)
    const diagGuideBtn = page.getByRole('button', { name: 'START TESTING' }).last();
    await diagGuideBtn.waitFor({ state: 'visible', timeout: 5000 }).catch(() => {});
    if (await diagGuideBtn.isVisible()) {
      await diagGuideBtn.click();
    }

    // 4.3 🌟 เผื่อเวลาให้ Vue/Quasar หุบ Backdrop สีดำลงไปให้สนิท (สำคัญมาก ไม่งั้นมันจะบังปุ่มสั่งยา)
    await page.waitForTimeout(1500);


    // ---------------------------------------------------------
    // STEP 5: แถบ "การรักษา" (Diagnosis & Plan)
    // ---------------------------------------------------------
    // 5.1 กรอกการวินิจฉัย
    await page.getByLabel(/พิมพ์ชื่อโรค หรือรหัส ICD-10/i).click();
    await page.getByLabel(/พิมพ์ชื่อโรค หรือรหัส ICD-10/i).fill('J00');
    await page.waitForTimeout(500);
    await page.keyboard.press('Enter');
    await page.keyboard.press('Escape');

    // 5.2 กรอกแผนการรักษา (Plan)
    await page.getByLabel(/พิมพ์แผนการรักษา แล้วกด Enter/i).click();
    await page.getByLabel(/พิมพ์แผนการรักษา แล้วกด Enter/i).fill('Home (รับยากลับบ้าน)');
    await page.waitForTimeout(500);
    await page.keyboard.press('Enter');
    await page.keyboard.press('Escape');


    // ---------------------------------------------------------
    // STEP 6: แถบ "สั่งยา" (Medication)
    // ---------------------------------------------------------
    await page.getByRole('button', { name: /สั่งยา/i }).click();
    await page.waitForTimeout(500); // รอให้ Quasar สลับ Tab ให้เสร็จก่อน

    // 6.1 เลือกชื่อยา (ใช้สูตร ArrowDown เพื่อหยิบยาตัวแรกที่มีในฐานข้อมูลชัวร์ๆ)
    await page.getByLabel(/^ชื่อยา/i).click();
    await page.waitForTimeout(500);
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Enter');

    // 6.2 เลือกขนาด
    await page.getByLabel(/^ขนาด/i).click();
    await page.waitForTimeout(500);
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Enter');

    // 6.3 เลือกจำนวน
    await page.getByLabel(/^จำนวน/i).click();
    await page.waitForTimeout(500);
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Enter');

    // 6.4 เลือกวิธีใช้
    await page.getByLabel(/^วิธีใช้/i).click();
    await page.waitForTimeout(500);
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Enter');

    // เคลียร์เมนูที่อาจจะค้างอยู่
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500); // รอให้มั่นใจว่า Dropdown หายไปหมดแล้ว

    // 6.5 รอให้ปุ่มปลดล็อก (Enabled) แล้วค่อยกดเพิ่มรายการ
    await expect(page.getByRole('button', { name: 'เพิ่มรายการ' })).toBeEnabled({ timeout: 5000 });
    await page.getByRole('button', { name: 'เพิ่มรายการ' }).click();

    // 6.6 ส่งข้อมูลใบสั่งยา
    await page.getByRole('button', { name: 'ยืนยันใบสั่งยา' }).click();
    await page.waitForTimeout(1000);


    // ---------------------------------------------------------
    // STEP 7: เสร็จสิ้นและปิดเคสกลับหน้าจอหลัก
    // ---------------------------------------------------------
    await page.getByRole('button', { name: /เสร็จสิ้น/i }).click();

    // 🌟 เปลี่ยนจากคำว่า 'OK' ตรงๆ เป็น Regex เพื่อดักทั้งคำว่า OK หรือ ตกลง
    await page.getByRole('button', { name: /OK|ตกลง/i }).click();

    // ยืนยันว่าหน้าคิวโหลดกลับมาเสร็จสมบูรณ์
    await expect(page.getByText(/รายการผู้ป่วย/i).first()).toBeVisible({ timeout: 15000 });

  });

});
