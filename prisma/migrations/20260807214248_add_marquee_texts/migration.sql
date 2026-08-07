-- CreateTable
CREATE TABLE "marquee_texts" (
    "id" SERIAL NOT NULL,
    "text" VARCHAR(500) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "marquee_texts_pkey" PRIMARY KEY ("id")
);
