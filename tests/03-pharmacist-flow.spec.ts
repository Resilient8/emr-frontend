import { test, expect } from '@playwright/test';

test.describe('EMR System - Pharmacist Flow', () => {

  test('3. เภสัชกรล็อกอิน เลือกคิว จ่ายยา และตัดสต๊อก', async ({ page }) => {

    // ---------------------------------------------------------
    // STEP 1: เข้าเว็บไซต์และแฮ็ก LocalStorage ปิดไกด์ทั้ง 2 หน้า
    // ---------------------------------------------------------
    await page.goto('http://localhost:5000/#/myemr-app/login');

    // 🌟 ยัด LocalStorage ปิด Guide ทั้งหน้าคิวและหน้าจ่ายยา
    await page.evaluate(() => {
      localStorage.setItem('hasSeenPharmacistQueueGuide', 'true');
      localStorage.setItem('hasSeenDispenseGuide', 'true');
    });

    // ปิด Modal แนะนำหน้าแรก และกดล็อกอินบทบาทเภสัชกร
    await page.getByRole('button', { name: 'START DEMO' }).click();

    // ดักปุ่มคำว่า "เภสัช" หรือ "Pharmacist"
    await page.getByRole('button', { name: /เภสัช|Pharmacist/i }).first().click();

    // รอจนกว่าจะโหลดเข้าหน้า Dashboard สำเร็จ
    await expect(page.getByText(/Pharmacy Dashboard/i).first()).toBeVisible({ timeout: 15000 });


    // ---------------------------------------------------------
    // STEP 2: รอโหลดคิว และเลือกผู้ป่วย
    // ---------------------------------------------------------
    // รอให้ Overlay Loading หายไปก่อน ค่อยกดการ์ดคนไข้
    await expect(page.getByText('กำลังโหลดข้อมูล...')).toBeHidden({ timeout: 15000 }).catch(() => {});

    // กดการ์ดคิวแรกสุด
    await page.locator('.patient-card').first().click();

    // รอให้เข้าสู่หน้าห้องจ่ายยา
    await expect(page.getByText('ห้องจ่ายยา')).toBeVisible({ timeout: 15000 });


    // ---------------------------------------------------------
    // STEP 3: รอให้ข้อมูลยาทั้งหมดโหลดเสร็จสมบูรณ์
    // ---------------------------------------------------------
    // ดักจับ Loader ทั้ง 2 แบบของคุณ
    await expect(page.getByText('กำลังเตรียมข้อมูลยา...')).toBeHidden({ timeout: 15000 }).catch(() => {});
    await expect(page.getByText('กำลังโหลดข้อมูล...')).toBeHidden({ timeout: 10000 }).catch(() => {});

    // หน่วงเวลาให้ Quasar เรนเดอร์ Checkbox เสร็จ
    await page.waitForTimeout(1000);


    // ---------------------------------------------------------
    // STEP 4: ติ๊ก "จ่ายยา" (Check) ยาทุกรายการที่หมอสั่ง
    // ---------------------------------------------------------
    // 🌟 ท่าไม้ตาย: กวาดหา Checkbox ทั้งหมดในหน้า แล้วสั่งติ๊กถูกทีละอัน
    const checkboxes = page.getByRole('checkbox');
    const count = await checkboxes.count();

    for (let i = 0; i < count; i++) {
      // ใช้ .check() แทน .click() เพราะ Playwright จะฉลาดพอที่จะไม่ติ๊กซ้ำถ้ามันถูกติ๊กอยู่แล้ว
      await checkboxes.nth(i).check();
      await page.waitForTimeout(300); // หน่วงรอดู Effect ยาขีดฆ่า + เสียงติ๊กของคุณ
    }


    // ---------------------------------------------------------
    // STEP 5: ยืนยันการจ่ายยาและตัดสต๊อก
    // ---------------------------------------------------------
    // 5.1 กดปุ่ม "ยืนยัน" มุมขวาบน (เช็กว่าปุ่มปลดล็อกแล้ว)
    const confirmBtn = page.getByRole('button', { name: 'ยืนยัน', exact: true }).first();
    await expect(confirmBtn).toBeEnabled({ timeout: 5000 });
    await confirmBtn.click();

    // 5.2 🌟 ดัก Popup ยืนยันของ Quasar (มันถามซ้ำอีกรอบ ให้กด "ยืนยัน" ในกล่อง Dialog)
    await page.locator('.q-dialog').getByRole('button', { name: 'ยืนยัน' }).click();


    // ---------------------------------------------------------
    // STEP 6: ดัก Dialog "เสร็จสิ้น" และกลับหน้าคิว
    // ---------------------------------------------------------
    // พอกดยืนยันเสร็จ รอโหลดแป๊บนึง แล้วจะมีหน้าต่าง "เสร็จสิ้น" โผล่มาให้กด "ตกลง"
    await page.getByRole('button', { name: 'ตกลง' }).click();

    // เช็กให้ชัวร์ว่าเด้งกลับมาหน้า Pharmacy Dashboard เรียบร้อย เป็นอันจบ Flow โรงพยาบาล!
    await expect(page.getByText(/Pharmacy Dashboard/i).first()).toBeVisible({ timeout: 15000 });

  });

});
