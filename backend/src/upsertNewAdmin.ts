import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email = 'admin@shreeneekanursery.in';
  const password = 'admin@shreeneekanursery';
  const passwordHash = await bcrypt.hash(password, 12);

  const admin = await prisma.user.upsert({
    where: { email },
    update: { passwordHash, role: 'ADMIN', status: 'ACTIVE' },
    create: {
      name: 'Shreeneeka Admin',
      email,
      phone: '+91 81231 91863',
      passwordHash,
      role: 'ADMIN',
      status: 'ACTIVE',
    },
  });

  console.log(`✅ SUCCESS! Updated Super Admin User in Supabase PostgreSQL: ${admin.email}`);
}

main()
  .catch((err) => {
    console.error('❌ Error updating admin:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
