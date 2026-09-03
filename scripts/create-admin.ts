import { createClient } from '@supabase/supabase-js';

/**
 * Script an toàn để khởi tạo hoặc nâng cấp tài khoản Admin sản xuất.
 * Yêu cầu khai báo SUPABASE_SERVICE_ROLE_KEY trong môi trường server.
 * 
 * Sử dụng:
 * ADMIN_EMAIL=admin@nhacotiec.vn ADMIN_PASSWORD=StrongPassword123! npx tsx scripts/create-admin.ts
 */
async function createAdminUser() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!supabaseUrl || !serviceRoleKey) {
    console.error('❌ Lỗi: Thiếu NEXT_PUBLIC_SUPABASE_URL hoặc SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
  }

  if (!adminEmail || !adminPassword) {
    console.error('❌ Lỗi: Vui lòng cung cấp ADMIN_EMAIL và ADMIN_PASSWORD qua biến môi trường.');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });

  console.log(`⏳ Đang tạo tài khoản Admin cho email: ${adminEmail}...`);

  const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
    email: adminEmail,
    password: adminPassword,
    email_confirm: true,
  });

  let userId = authUser?.user?.id;

  if (authError) {
    if (authError.message.includes('already registered')) {
      console.log('⚠️ Tài khoản Auth đã tồn tại, tiến hành nâng cấp vai trò ADMIN...');
      const { data: existingUsers } = await supabase.auth.admin.listUsers();
      const user = existingUsers.users.find((u) => u.email === adminEmail);
      if (user) userId = user.id;
    } else {
      console.error('❌ Lỗi khi khởi tạo tài khoản Auth:', authError.message);
      process.exit(1);
    }
  }

  if (!userId) {
    console.error('❌ Không tìm thấy User ID');
    process.exit(1);
  }

  const { error: dbError } = await supabase
    .from('users')
    .upsert({
      id: userId,
      email: adminEmail,
      full_name: 'System Administrator',
      role: 'ADMIN',
      is_active: true,
      updated_at: new Date().toISOString(),
    });

  if (dbError) {
    console.error('❌ Lỗi khi cập nhật bảng users:', dbError.message);
    process.exit(1);
  }

  console.log(`✅ Đã khởi tạo thành công tài khoản Admin: ${adminEmail} (ID: ${userId})`);
}

createAdminUser().catch(console.error);
