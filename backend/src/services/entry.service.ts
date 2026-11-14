import prisma from "../db/prisma.js";

// ---------- Types ----------
interface TransactionInput {
  amount: number;
  type: string;   // 'expense' | 'income'
  category: string;
  note?: string;
}

interface CreateEntryInput {
  title: string;
  content: string;
  userId: string;
  date?: string;
  mood?: string;
  location?: string;
  media?: string[];
  transactions?: TransactionInput[];
}

interface UpdateEntryInput {
  title?: string;
  content?: string;
  date?: string;
  mood?: string;
  location?: string;
  media?: string[];
  transactions?: TransactionInput[];
}

// ---------- Create ----------
export const createEntry = async (input: CreateEntryInput) => {
  const { title, content, userId, date, mood, location, media, transactions } = input;

  if (title.length > 100) {
    throw new Error("Title Too Long!");
  }

  return prisma.entry.create({
    data: {
      title,
      content,
      userId,
      date: date ? new Date(date) : new Date(),
      mood,
      location,
      media: media ?? [],
      transactions: transactions?.length
        ? {
            create: transactions.map((t) => ({
              amount: t.amount,
              type: t.type,
              category: t.category,
              note: t.note,
            })),
          }
        : undefined,
    },
    include: { transactions: true },
  });
};

// ---------- Read ----------
export const getUserEntries = async (userId: string) => {
  return prisma.entry.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: { transactions: true },
  });
};

// ---------- Update ----------
export const updateEntry = async (entryId: string, userId: string, input: UpdateEntryInput) => {
  // Verify the entry belongs to the user
  const existing = await prisma.entry.findUnique({ where: { id: entryId } });

  if (!existing || existing.userId !== userId) {
    throw new Error("Entry not found or unauthorized");
  }

  const { title, content, date, mood, location, media, transactions } = input;

  // Use a Prisma interactive transaction to update the entry and replace transactions atomically
  return prisma.$transaction(async (tx) => {
    // If new transactions array was provided, delete old ones and recreate
    if (transactions !== undefined) {
      await tx.transaction.deleteMany({ where: { entryId } });
    }

    return tx.entry.update({
      where: { id: entryId },
      data: {
        ...(title !== undefined && { title }),
        ...(content !== undefined && { content }),
        ...(date !== undefined && { date: new Date(date) }),
        ...(mood !== undefined && { mood }),
        ...(location !== undefined && { location }),
        ...(media !== undefined && { media }),
        ...(transactions !== undefined && {
          transactions: {
            create: transactions.map((t) => ({
              amount: t.amount,
              type: t.type,
              category: t.category,
              note: t.note,
            })),
          },
        }),
      },
      include: { transactions: true },
    });
  });
};

// ---------- Delete ----------
export const deleteEntry = async (entryId: string, userId: string) => {
  const existing = await prisma.entry.findUnique({ where: { id: entryId } });

  if (!existing || existing.userId !== userId) {
    throw new Error("Entry not found or unauthorized");
  }

  // Transactions are cascade-deleted automatically
  return prisma.entry.delete({
    where: { id: entryId },
  });
};