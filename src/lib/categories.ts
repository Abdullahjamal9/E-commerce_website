import { prisma } from './db';

export async function getCategories(): Promise<string[]> {
  const rows = await prisma.category.findMany({ orderBy: { name: 'asc' } });
  return rows.map((r) => r.name);
}
