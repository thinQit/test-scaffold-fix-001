import { PrismaClient, TaskPriority, TaskStatus } from '@prisma/client';
import bcryptjs from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  await prisma.authToken.deleteMany();
  await prisma.task.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcryptjs.hash('Password123!', 10);

  const userAlice = await prisma.user.create({
    data: {
      email: 'alice@example.com',
      passwordHash,
      displayName: 'Alice Johnson'
    }
  });

  const userBob = await prisma.user.create({
    data: {
      email: 'bob@example.com',
      passwordHash,
      displayName: 'Bob Smith'
    }
  });

  await prisma.task.createMany({
    data: [
      {
        ownerId: userAlice.id,
        title: 'Finish onboarding checklist',
        description: 'Complete profile setup and verify email.',
        status: TaskStatus.in_progress,
        priority: TaskPriority.high,
        dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)
      },
      {
        ownerId: userAlice.id,
        title: 'Plan weekly sprint',
        description: 'Review backlog and prioritize tasks for the week.',
        status: TaskStatus.todo,
        priority: TaskPriority.medium,
        dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000)
      },
      {
        ownerId: userAlice.id,
        title: 'Submit timesheet',
        description: 'Submit Friday timesheet for approval.',
        status: TaskStatus.done,
        priority: TaskPriority.low,
        dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
      },
      {
        ownerId: userBob.id,
        title: 'Update project roadmap',
        description: 'Align roadmap with Q2 goals.',
        status: TaskStatus.in_progress,
        priority: TaskPriority.high,
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
      },
      {
        ownerId: userBob.id,
        title: 'Refactor task filters',
        description: 'Improve search and filter performance.',
        status: TaskStatus.todo,
        priority: TaskPriority.medium,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      }
    ]
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
