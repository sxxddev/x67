# x67secretme — inwCloud (DirectAdmin)

## อัปโหลดแล้ว Extract ใน nextjs/ แล้วทำ 2 อย่าง:

### A) Terminal — รันคำสั่งเดียว
source /home/in8lx67secre/nodevenv/domains/x67secretme.shop/nextjs/20/bin/activate
cd /home/in8lx67secre/domains/x67secretme.shop/nextjs
chmod +x setup.sh
./setup.sh

### B) Setup Node.js App — ADD VARIABLE (copy จาก .env)
NODE_ENV, DATABASE_URL, AUTH_SECRET, AUTH_URL, NEXTAUTH_URL, NEXTAUTH_SECRET

Startup: server.js | Mode: Production | RESTART

### .env
ถ้ามี .env อยู่แล้วบน server — อย่าลบ (setup ไม่ทับ)
ถ้าใหม่ — แก้ DATABASE_URL เป็น user/pass ของ in8lx67secre_shop

Site: https://x67secretme.shop
