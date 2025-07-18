import { PrismaClient } from '@prisma/client';
export const prisma = new PrismaClient();
if (process.env.NODE_ENV === 'development') {
  prisma.$connect()
    .then(() => console.log("Prisma connected"))
    .catch((err: Error) => console.error("Prisma connection error:", err));
}
export async function testConnection() {
  try {
    await prisma.$connect();
    console.log("✅ Database connected successfully");
    return { success: true, message: "Database connected successfully" };
  } catch (error) {
    console.error("❌ Database connection failed:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
export async function checkTables() {
  try {
    const tables = (await prisma.$queryRaw`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_type = 'BASE TABLE'
    `) as Array<{ table_name: string }>;
    return { success: true, tables: tables.map((t) => t.table_name) };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
export async function createTablesManually() {
  try {
    await prisma.$executeRaw`
      DO $$ BEGIN
        CREATE TYPE "GameType" AS ENUM ('AI', 'LOCAL', 'ONLINE_PRIVATE', 'ONLINE_PUBLIC');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;`;
    await prisma.$executeRaw`
      DO $$ BEGIN
        CREATE TYPE "GameStatus" AS ENUM ('WAITING', 'IN_PROGRESS', 'COMPLETED', 'ABANDONED');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;`;
    await prisma.$executeRaw`
      DO $$ BEGIN
        CREATE TYPE "AIDifficulty" AS ENUM ('EASY', 'MEDIUM', 'HARD', 'EXPERT');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `;
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "users" (
        "id" TEXT NOT NULL,
        "email" TEXT NOT NULL,
        "username" TEXT,
        "password" TEXT NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "users_pkey" PRIMARY KEY ("id")
      );
    `;
    await prisma.$executeRaw`
      DO $$ BEGIN
        ALTER TABLE "users" ADD CONSTRAINT "users_email_key" UNIQUE ("email");
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `;
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "games" (
        "id" TEXT NOT NULL,
        "type" "GameType" NOT NULL,
        "status" "GameStatus" NOT NULL DEFAULT 'WAITING',
        "board" TEXT NOT NULL DEFAULT '["","","","","","","","",""]',
        "currentPlayer" TEXT NOT NULL DEFAULT 'X',
        "winner" TEXT,
        "roomCode" TEXT,
        "aiDifficulty" "AIDifficulty",
        "player1Id" TEXT,
        "player2Id" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "games_pkey" PRIMARY KEY ("id")
      );
    `;
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "moves" (
        "id" TEXT NOT NULL,
        "gameId" TEXT NOT NULL,
        "playerId" TEXT,
        "position" INTEGER NOT NULL,
        "symbol" TEXT NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "moves_pkey" PRIMARY KEY ("id")
      );
    `;
    await prisma.$executeRaw`
      DO $$ BEGIN
        ALTER TABLE "games" ADD CONSTRAINT "games_player1Id_fkey" FOREIGN KEY ("player1Id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `;
    await prisma.$executeRaw`
      DO $$ BEGIN
        ALTER TABLE "games" ADD CONSTRAINT "games_player2Id_fkey" FOREIGN KEY ("player2Id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `;
    await prisma.$executeRaw`
      DO $$ BEGIN
        ALTER TABLE "moves" ADD CONSTRAINT "moves_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "games"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `;
    await prisma.$executeRaw`
      DO $$ BEGIN
        ALTER TABLE "moves" ADD CONSTRAINT "moves_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `;
    return { success: true, message: "Tables created successfully" };
  } catch (error) {
    console.error("Error creating tables:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
export async function getTableInfo() {
  try {
    const userCount = await prisma.user.count();
    const gameCount = await prisma.game.count();
    const moveCount = await prisma.move.count();
    return {
      success: true,
      counts: {
        users: userCount,
        games: gameCount,
        moves: moveCount,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
