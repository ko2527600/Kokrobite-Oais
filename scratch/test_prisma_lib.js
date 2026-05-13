import prisma from '../server/lib/prisma.js';

async function test() {
  try {
    console.log('Testing connection...');
    const users = await prisma.user.findMany({ take: 1 });
    console.log('Success! Found users:', users);
    
    const customers = await prisma.customer.findMany({ take: 1 });
    console.log('Success! Found customers:', customers);
  } catch (err) {
    console.error('Error during test:', err);
  } finally {
    process.exit(0);
  }
}

test();
