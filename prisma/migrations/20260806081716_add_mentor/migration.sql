-- CreateTable
CREATE TABLE "mentors" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "title" VARCHAR(200),
    "photoUrl" VARCHAR(500),
    "bio" TEXT,
    "certifications" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "experience" VARCHAR(500),
    "education" VARCHAR(500),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mentors_pkey" PRIMARY KEY ("id")
);
