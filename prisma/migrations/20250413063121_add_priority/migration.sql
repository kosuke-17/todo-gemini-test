-- CreateEnum
CREATE TYPE "Priority" AS ENUM ('NONE', 'LOW', 'MEDIUM', 'HIGH', 'URGENT');

-- AlterTable
ALTER TABLE "Todo" ADD COLUMN     "priority" "Priority" NOT NULL DEFAULT 'NONE';
