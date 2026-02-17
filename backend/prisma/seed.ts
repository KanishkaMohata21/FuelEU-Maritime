import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('Seeding data...')

    const routes = [
        {
            route_id: 'R001',
            vesselType: 'Container',
            fuelType: 'HFO',
            year: 2024,
            ghg_intensity: 91.0,
            fuelConsumption: 5000,
            distance: 12000,
            totalEmissions: 4500,
            is_baseline: true, // One baseline as requested
        },
        {
            route_id: 'R002',
            vesselType: 'BulkCarrier',
            fuelType: 'LNG',
            year: 2024,
            ghg_intensity: 88.0,
            fuelConsumption: 4800,
            distance: 11500,
            totalEmissions: 4200,
        },
        {
            route_id: 'R003',
            vesselType: 'Tanker',
            fuelType: 'MGO',
            year: 2024,
            ghg_intensity: 93.5,
            fuelConsumption: 5100,
            distance: 12500,
            totalEmissions: 4700,
        },
        {
            route_id: 'R004',
            vesselType: 'RoRo',
            fuelType: 'HFO',
            year: 2025,
            ghg_intensity: 89.2,
            fuelConsumption: 4900,
            distance: 11800,
            totalEmissions: 4300,
        },
        {
            route_id: 'R005',
            vesselType: 'Container',
            fuelType: 'LNG',
            year: 2025,
            ghg_intensity: 90.5,
            fuelConsumption: 4950,
            distance: 11900,
            totalEmissions: 4400,
        },
    ]

    for (const route of routes) {
        const r = await prisma.route.upsert({
            where: { route_id: route.route_id },
            update: {},
            create: route,
        })
        console.log(`Created route with id: ${r.route_id}`)
    }

    console.log('Seeding finished.')
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
