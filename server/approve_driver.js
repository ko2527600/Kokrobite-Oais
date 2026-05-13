import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function approve() {
  const driver = await prisma.driver.update({
    where: { phone: '+233201234567' },
    data: { isApproved: true }
  })
  console.log('Driver Approved:', driver.name)
}

approve()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
