-- CreateTable
CREATE TABLE "notebook_notes" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "local_id" VARCHAR(64) NOT NULL,
    "text" TEXT NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notebook_notes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "notebook_notes_user_id_local_id_key" ON "notebook_notes"("user_id", "local_id");

-- AddForeignKey
ALTER TABLE "notebook_notes" ADD CONSTRAINT "notebook_notes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;