import { prisma } from '@repo/db/client'
import bcrypt from "bcrypt";

async function main() {
  const alice = await prisma.user.upsert({
    where: { number: '9999999999' },
    update: {},
    create: {
      number: '9999999999',
      password: await bcrypt.hash('alice', 10),
      name: 'alice',
      balance: {
        create: {
            amount: 20000,
            locked: 0
        }
      },
      OnRampTransaction: {
        create: {
          startTime: new Date(),
          status: "Success",
          amount: 20000,
          token: "token__1",
          provider: "HDFC Bank",
          transactionType : "Deposit"
        },
      },
    },
  })
  const bob = await prisma.user.upsert({
    where: { number: '8888888888' },
    update: {},
    create: {
      number: '8888888888',
      password: await bcrypt.hash('bob', 10),
      name: 'bob',
      balance: {
        create: {
            amount: 2000,
            locked: 0
        }
      },
      OnRampTransaction: {
        create: {
          startTime: new Date(),
          status: "Failure",
          amount: 2000,
          token: "token__2",
          provider: "HDFC Bank",
          transactionType : "Deposit"
        },
      },
    },
  })
}
main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })