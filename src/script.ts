import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    const allLinks = await prisma.link.findMany();
}

main()
    .catch((e) => {
        throw e;
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
