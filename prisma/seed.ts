import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { PrismaLibSql } from '@prisma/adapter-libsql';
import { PrismaClient } from '../src/generated/prisma/client';

const adapter = new PrismaLibSql({
  url: process.env.DATABASE_URL ?? 'file:./prisma/dev.db',
  authToken: process.env.DATABASE_AUTH_TOKEN
});
const prisma = new PrismaClient({ adapter });

const SEED_PRODUCTS = [
  {
    slug: 'aurora-x1',
    name: 'Aurora X1',
    tagline: 'Adaptive carbon sole',
    price: 28900,
    stock: 25,
    category: 'Shoes',
    tags: ['Men', 'New Arrivals', 'Luxury'],
    colors: [
      { name: 'Electric Blue', hex: '#3b82ff' },
      { name: 'Void Black', hex: '#0a0c14' },
      { name: 'Solar Gold', hex: '#f5c518' }
    ],
    sizes: ['40', '41', '42', '43', '44', '45'],
    images: ['/demo/shoe.png'],
    description:
      'A flagship silhouette engineered with an adaptive carbon sole and responsive neon-cushioned ride.'
  },
  {
    slug: 'nova-flux',
    name: 'Nova Flux',
    tagline: 'Zero-gravity foam',
    price: 21900,
    stock: 30,
    category: 'Shoes',
    tags: ['Women', 'Sports', 'New Arrivals'],
    colors: [
      { name: 'Neon Purple', hex: '#a855f7' },
      { name: 'Frost White', hex: '#e5e7eb' },
      { name: 'Electric Blue', hex: '#3b82ff' }
    ],
    sizes: ['36', '37', '38', '39', '40', '41'],
    images: ['/demo/shoe.png'],
    description: 'Featherlight zero-gravity foam tuned for explosive sprints and all-day comfort.'
  },
  {
    slug: 'eclipse-pro',
    name: 'Eclipse Pro',
    tagline: 'Tournament traction',
    price: 19900,
    stock: 18,
    category: 'Shoes',
    tags: ['Sports', 'Men'],
    colors: [
      { name: 'Void Black', hex: '#0a0c14' },
      { name: 'Solar Gold', hex: '#f5c518' }
    ],
    sizes: ['40', '41', '42', '43', '44'],
    images: ['/demo/shoe.png'],
    description:
      'Court-ready traction with a locked-in midfoot cage for elite multidirectional control.'
  },
  {
    slug: 'lumen-luxe',
    name: 'Lumen Luxe',
    tagline: 'Hand-finished leather',
    price: 45900,
    stock: 12,
    category: 'Shoes',
    tags: ['Luxury', 'Women'],
    colors: [
      { name: 'Solar Gold', hex: '#f5c518' },
      { name: 'Champagne', hex: '#d6c39a' },
      { name: 'Void Black', hex: '#0a0c14' }
    ],
    sizes: ['36', '37', '38', '39', '40'],
    images: ['/demo/shoe.png'],
    description: 'A couture statement piece in hand-finished leather with a gilded illuminated heel.'
  },
  {
    slug: 'pulse-runner',
    name: 'Pulse Runner',
    tagline: 'Energy-return plate',
    price: 17500,
    stock: 40,
    category: 'Shoes',
    tags: ['Sports', 'New Arrivals'],
    colors: [
      { name: 'Electric Blue', hex: '#3b82ff' },
      { name: 'Neon Purple', hex: '#a855f7' }
    ],
    sizes: ['38', '39', '40', '41', '42', '43', '44'],
    images: ['/demo/shoe.png'],
    description: 'A daily trainer with a propulsive energy-return plate for effortless tempo runs.'
  },
  {
    slug: 'vortex-air',
    name: 'Vortex Air',
    tagline: 'Visible air chamber',
    price: 24500,
    stock: 22,
    category: 'Shoes',
    tags: ['Men', 'Luxury'],
    colors: [
      { name: 'Frost White', hex: '#e5e7eb' },
      { name: 'Electric Blue', hex: '#3b82ff' },
      { name: 'Void Black', hex: '#0a0c14' }
    ],
    sizes: ['40', '41', '42', '43', '44', '45'],
    images: ['/demo/shoe.png'],
    description: 'A bold lifestyle build with a sculpted visible air chamber and iridescent overlays.'
  },
  {
    slug: 'seraph-glow',
    name: 'Seraph Glow',
    tagline: 'Reactive light weave',
    price: 32900,
    stock: 15,
    category: 'Shoes',
    tags: ['Women', 'Luxury', 'New Arrivals'],
    colors: [
      { name: 'Neon Purple', hex: '#a855f7' },
      { name: 'Solar Gold', hex: '#f5c518' }
    ],
    sizes: ['36', '37', '38', '39', '40', '41'],
    images: ['/demo/shoe.png'],
    description: 'A reactive light-weave upper that subtly shifts hue as you move through the city.'
  },
  {
    slug: 'titan-trail',
    name: 'Titan Trail',
    tagline: 'All-terrain grip',
    price: 20900,
    stock: 28,
    category: 'Shoes',
    tags: ['Sports', 'Men'],
    colors: [
      { name: 'Void Black', hex: '#0a0c14' },
      { name: 'Electric Blue', hex: '#3b82ff' }
    ],
    sizes: ['40', '41', '42', '43', '44', '45', '46'],
    images: ['/demo/shoe.png'],
    description: 'Rugged all-terrain grip with a weatherproof shell for the most demanding trails.'
  },
  {
    slug: 'mirage-knit',
    name: 'Mirage Knit',
    tagline: 'Seamless sock-fit',
    price: 15900,
    stock: 35,
    category: 'Shoes',
    tags: ['Women', 'New Arrivals'],
    colors: [
      { name: 'Frost White', hex: '#e5e7eb' },
      { name: 'Neon Purple', hex: '#a855f7' },
      { name: 'Electric Blue', hex: '#3b82ff' }
    ],
    sizes: ['36', '37', '38', '39', '40'],
    images: ['/demo/shoe.png'],
    description: 'A seamless sock-fit knit that hugs the foot with breathable, adaptive support.'
  },
  {
    slug: 'onyx-elite',
    name: 'Onyx Elite',
    tagline: 'Stealth carbon weave',
    price: 38900,
    stock: 10,
    category: 'Shoes',
    tags: ['Luxury', 'Men'],
    colors: [
      { name: 'Void Black', hex: '#0a0c14' },
      { name: 'Solar Gold', hex: '#f5c518' }
    ],
    sizes: ['40', '41', '42', '43', '44', '45'],
    images: ['/demo/shoe.png'],
    description: 'A stealth carbon-weave flagship with precision lacing and a feather-tuned ride.'
  }
];

const SEED_CATEGORIES = ['Shoes'];
const SEED_TAGS = ['Men', 'Women', 'Sports', 'Luxury', 'New Arrivals'];

async function main() {
  for (const name of SEED_CATEGORIES) {
    await prisma.category.upsert({ where: { name }, update: {}, create: { name } });
  }
  for (const name of SEED_TAGS) {
    await prisma.tag.upsert({ where: { name }, update: {}, create: { name } });
  }

  for (const product of SEED_PRODUCTS) {
    await prisma.product.upsert({
      where: { slug: product.slug },
      update: product,
      create: product
    });
  }

  const adminEmail = process.env.ADMIN_EMAIL ?? 'admin@aurashoes.com';
  const adminPassword = process.env.ADMIN_PASSWORD ?? 'ChangeThisPassword123!';
  const passwordHash = await bcrypt.hash(adminPassword, 10);

  await prisma.adminUser.upsert({
    where: { email: adminEmail },
    update: { passwordHash },
    create: { email: adminEmail, passwordHash }
  });

  await prisma.settings.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      storeName: 'AURA',
      bankName: 'Meezan Bank',
      bankAccountName: 'AURA Footwear',
      bankAccountNumber: '0123456789012',
      easypaisaNumber: '03001234567',
      codEnabled: true,
      bankTransferEnabled: true,
      contactPhone: '03001234567',
      whatsappNumber: '923001234567',
      contactEmail: adminEmail,
      address: 'Karachi, Pakistan'
    }
  });

  console.log(`Seeded ${SEED_PRODUCTS.length} products, admin user (${adminEmail}), and settings.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
