const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('password123', 10);

  // Create a default test user
  const user = await prisma.user.upsert({
    where: { email: 'test@example.com' },
    update: {},
    create: {
      email: 'test@example.com',
      passwordHash,
      name: 'Test Setup User',
      role: 'USER',
    },
  });

  console.log(`Upserted test user: ${user.email} with password: password123`);

  // Create some initial listings for this user
  const listings = [
    {
      title: 'Broken Floor Fan',
      description: 'The fan turns on but the blades do not spin. Motor makes a humming sound.',
      location: 'Helsinki',
      status: 'OPEN',
      authorId: user.id,
    },
    {
      title: 'Broken Winter Jacket Zipper',
      description: 'The main zipper on my winter coat is detached at the bottom. Needs replacement.',
      location: 'Espoo',
      status: 'OPEN',
      authorId: user.id,
    },
    {
      title: 'Broken Garden LED Light',
      description: 'Solar garden light stopped working. Battery seems fine, probably a wire issue.',
      location: 'Vantaa',
      status: 'OPEN',
      authorId: user.id,
    },
  ];

  for (const item of listings) {
    const listing = await prisma.listing.create({
      data: item,
    });
    console.log(`Created listing: ${listing.title}`);
  }

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
