import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const routeCount = await prisma.route.count();
    console.log(`Routes found: ${routeCount}`);

    if (routeCount > 0) {
        const firstRoute = await prisma.route.findFirst();
        console.log('Sample Route:', firstRoute);
    } else {
        console.log('No routes found. Seeding might be required.');
    }
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
