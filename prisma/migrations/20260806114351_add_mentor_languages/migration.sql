-- AlterTable
ALTER TABLE "mentors" ADD COLUMN     "languages" TEXT[] DEFAULT ARRAY[]::TEXT[];
