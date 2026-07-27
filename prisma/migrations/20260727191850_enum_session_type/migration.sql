/*
  Warnings:

  - You are about to drop the column `status` on the `sessions` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "SessionStatus" AS ENUM ('Pending', 'Approved', 'Canceled');

-- DropIndex
DROP INDEX "sessions_status_idx";

-- DropIndex
DROP INDEX "sessions_user_id_status_idx";

-- AlterTable
ALTER TABLE "sessions" DROP COLUMN "status",
ADD COLUMN     "session_status" "SessionStatus" NOT NULL DEFAULT 'Pending';

-- CreateIndex
CREATE INDEX "sessions_user_id_session_status_idx" ON "sessions"("user_id", "session_status");

-- CreateIndex
CREATE INDEX "sessions_session_status_idx" ON "sessions"("session_status");
