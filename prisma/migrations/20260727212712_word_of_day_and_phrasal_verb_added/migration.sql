-- AlterTable
ALTER TABLE "users" ALTER COLUMN "email" DROP NOT NULL,
ALTER COLUMN "date_of_birth" DROP NOT NULL;

-- CreateTable
CREATE TABLE "words_of_day" (
    "id" SERIAL NOT NULL,
    "word" VARCHAR(255) NOT NULL,
    "definition" TEXT NOT NULL,
    "example" TEXT NOT NULL,
    "partOfSpeech" VARCHAR(50),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "words_of_day_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "phrasal_verbs_of_day" (
    "id" SERIAL NOT NULL,
    "phrasalVerb" VARCHAR(255) NOT NULL,
    "definition" TEXT NOT NULL,
    "example" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "phrasal_verbs_of_day_pkey" PRIMARY KEY ("id")
);
