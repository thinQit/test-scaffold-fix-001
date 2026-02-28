import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  await prisma.lead.deleteMany();
  await prisma.feature.deleteMany();
  await prisma.pricingTier.deleteMany();

  const adminEmail = 'admin@datapulse.com';
  const existingAdmin = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (!existingAdmin) {
    const passwordHash = await bcrypt.hash('admin123', 10);
    await prisma.user.create({
      data: {
        email: adminEmail,
        name: 'DataPulse Admin',
        passwordHash,
        role: 'admin'
      }
    });
  }

  const features = [
    {
      id: 'f1',
      title: 'Real-time dashboards',
      description: 'Live metrics with auto-refresh and proactive monitoring.',
      icon: 'chart-line'
    },
    {
      id: 'f2',
      title: 'Custom alerts',
      description: 'Get notified when KPIs move outside expected ranges.',
      icon: 'bell'
    },
    {
      id: 'f3',
      title: 'Easy integrations',
      description: 'Connect the tools you already use in minutes.',
      icon: 'plug'
    }
  ];

  for (const feature of features) {
    await prisma.feature.create({ data: feature });
  }

  const pricingTiers = [
    {
      id: 'basic',
      name: 'Basic',
      priceMonthly: 29,
      features: JSON.stringify(['Dashboards', 'Email support']),
      ctaText: 'Start 14-day trial'
    },
    {
      id: 'pro',
      name: 'Pro',
      priceMonthly: 99,
      features: JSON.stringify(['All Basic features', 'Custom alerts', 'Priority support']),
      ctaText: 'Start 14-day trial'
    }
  ];

  for (const tier of pricingTiers) {
    await prisma.pricingTier.create({ data: tier });
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
