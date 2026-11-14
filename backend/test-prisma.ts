import prisma from "./src/db/prisma.js";

async function main() {
  try {
    const user = await prisma.user.findUnique({
      where: { email: "demo@crest.app" },
    });
    console.log("User:", user);
  } catch (e) {
    console.error("Prisma Error:", e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
