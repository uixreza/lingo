-- CreateEnum
CREATE TYPE "SessionMode" AS ENUM ('Online', 'InClass');

-- AlterTable
ALTER TABLE "sessions" ADD COLUMN "mode" "SessionMode" NOT NULL DEFAULT 'Online';

-- AlterTable
ALTER TABLE "SessionPrice" ADD COLUMN "in_class_extra" INTEGER NOT NULL DEFAULT 100;
