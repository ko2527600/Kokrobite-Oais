import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const models = Object.keys(prisma).filter(k => !k.startsWith('_') && !k.startsWith('$'))
  console.log('Tables in Prisma:', models)
  if (models.includes('driver') && models.includes('driverDelivery') && models.includes('driverRating')) {
    console.log('Verification SUCCESS: All new tables are present.')
  } else {
    console.log('Verification FAILED: Some tables are missing.')
  }
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect())
