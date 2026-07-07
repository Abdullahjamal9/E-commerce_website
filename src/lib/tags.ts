import { prisma } from './db';

export async function getTags(): Promise<string[]> {
  const rows = await prisma.tag.findMany({ orderBy: { name: 'asc' } });
  return rows.map((r) => r.name);
}
