import { PrismaClient, Role, ProjectStatus } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { hash } from 'bcryptjs';
import { randomBytes } from 'node:crypto';

if (process.env.DEMO_MODE !== 'true') {
  throw new Error('Demo seed is only available with DEMO_MODE=true.');
}

const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });

const projects = [
  {
    slug: 'amber-residence', name: 'Amber Residence', city: 'Ahmedabad', locality: 'Prahlad Nagar',
    address: 'Fictional address, Prahlad Nagar, Ahmedabad',
    description: 'A calm, light-filled collection of fully furnished city homes. Every detail shown here is fictional and provided to demonstrate the FurniProp experience.',
    image: '/scenes/amber-standard.svg', imageLabel: 'Conceptual illustration', mediaSource: 'Original FurniProp demo illustration',
    possession: 'Ready to move · DEMO', amenities: ['Furnished living', 'Balcony', 'Secure entry', 'Covered parking'],
    units: [
      { slug: 'two-bedroom', name: '2 BHK Residence', bhk: 2, carpetAreaSqft: 1120, basePricePaise: 845000000n, availableUnits: 7,
        packages: [
          { name: 'Signature', tier: 'Signature', pricePaise: 14500000n, previewImage: '/scenes/amber-standard.svg', inclusions: ['Living room sofa and table', 'Two furnished bedrooms', 'Modular kitchen', 'Dining set'] },
          { name: 'Elevated', tier: 'Elevated', pricePaise: 24500000n, previewImage: '/scenes/amber-elevated.svg', inclusions: ['All Signature items', 'Premium fabric finishes', 'Accent lighting', 'Workspace furniture'] },
        ] },
      { slug: 'three-bedroom', name: '3 BHK Residence', bhk: 3, carpetAreaSqft: 1460, basePricePaise: 1090000000n, availableUnits: 3,
        packages: [{ name: 'Signature', tier: 'Signature', pricePaise: 19500000n, previewImage: '/scenes/amber-standard.svg', inclusions: ['Furnished living and dining', 'Three furnished bedrooms', 'Modular kitchen'] }] },
    ],
  },
  {
    slug: 'mira-courtyard', name: 'Mira Courtyard', city: 'Ahmedabad', locality: 'Bodakdev',
    address: 'Fictional address, Bodakdev, Ahmedabad',
    description: 'Thoughtfully furnished spaces around an imagined green courtyard. This is an illustrative project, not a real property offering.',
    image: '/scenes/mira-standard.svg', imageLabel: 'Conceptual illustration', mediaSource: 'Original FurniProp demo illustration',
    possession: 'Under construction · DEMO', amenities: ['Furnished lounge', 'Garden concept', 'Study corner', 'Covered parking'],
    units: [{ slug: 'three-bedroom', name: '3 BHK Courtyard Home', bhk: 3, carpetAreaSqft: 1580, basePricePaise: 1250000000n, availableUnits: 5,
      packages: [{ name: 'Curated', tier: 'Curated', pricePaise: 28000000n, previewImage: '/scenes/mira-standard.svg', inclusions: ['Furnished living and dining', 'Three bedrooms', 'Kitchen appliances', 'Study furniture'] }] }],
  },
  {
    slug: 'sora-skyline', name: 'Sora Skyline', city: 'Ahmedabad', locality: 'Thaltej',
    address: 'Fictional address, Thaltej, Ahmedabad',
    description: 'A fictional skyline address with considered finishes and complete furnishing. Images and prices are solely for product demonstration.',
    image: '/scenes/sora-standard.svg', imageLabel: 'Conceptual illustration', mediaSource: 'Original FurniProp demo illustration',
    possession: 'Ready to move · DEMO', amenities: ['Furnished interiors', 'Sky lounge concept', 'Balcony', 'Secure entry'],
    units: [{ slug: 'two-bedroom', name: '2 BHK Skyline Home', bhk: 2, carpetAreaSqft: 980, basePricePaise: 735000000n, availableUnits: 9,
      packages: [{ name: 'Essential', tier: 'Essential', pricePaise: 12000000n, previewImage: '/scenes/sora-standard.svg', inclusions: ['Furnished living area', 'Two bedrooms', 'Modular kitchen'] }] }],
  },
];

async function main() {
  const passwordHash = await hash(randomBytes(32).toString('hex'), 12);
  const amber = await db.organization.upsert({ where: { slug: 'demo-amber' }, create: { slug: 'demo-amber', name: 'Amber Studio · DEMO' }, update: {} });
  const mira = await db.organization.upsert({ where: { slug: 'demo-mira' }, create: { slug: 'demo-mira', name: 'Mira Collective · DEMO' }, update: {} });
  for (const [email, name, role, organizationId] of [
    ['buyer@demo.furniprop.local', 'Demo Buyer', Role.BUYER, null],
    ['developer@demo.furniprop.local', 'Demo Developer', Role.DEVELOPER, amber.id],
    ['other-developer@demo.furniprop.local', 'Other Demo Developer', Role.DEVELOPER, mira.id],
    ['admin@demo.furniprop.local', 'Demo Admin', Role.ADMIN, null],
  ] as const) {
    await db.user.upsert({ where: { email }, create: { email, name, role, organizationId, passwordHash, isDemo: true }, update: {} });
  }
  for (const [index, item] of projects.entries()) {
    const organizationId = index === 1 ? mira.id : amber.id;
    const existing = await db.project.findUnique({ where: { slug: item.slug } });
    if (existing) continue;
    await db.project.create({ data: {
      slug: item.slug, name: item.name, city: item.city, locality: item.locality, address: item.address,
      description: item.description, image: item.image, imageLabel: item.imageLabel, mediaSource: item.mediaSource,
      possession: item.possession, amenities: item.amenities, organizationId, isDemo: true,
      status: ProjectStatus.PUBLISHED, publishedAt: new Date(),
      unitTypes: { create: item.units.map(unit => ({ slug: unit.slug, name: unit.name, bhk: unit.bhk,
        carpetAreaSqft: unit.carpetAreaSqft, basePricePaise: unit.basePricePaise, availableUnits: unit.availableUnits,
        packages: { create: unit.packages.map(pkg => ({ ...pkg, previewLabel: 'Conceptual illustration · DEMO', approved: true })) },
      })) },
    } });
  }
  console.log('Seeded fictional DEMO projects and role accounts.');
}

main().finally(() => db.$disconnect());
