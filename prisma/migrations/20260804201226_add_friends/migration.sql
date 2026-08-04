-- CreateEnum
CREATE TYPE "FriendStatus" AS ENUM ('Pending', 'Accepted');

-- CreateTable
CREATE TABLE "friends" (
    "id" SERIAL NOT NULL,
    "sender_id" INTEGER NOT NULL,
    "receiver_id" INTEGER NOT NULL,
    "status" "FriendStatus" NOT NULL DEFAULT 'Pending',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "friends_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "friends_receiver_id_status_idx" ON "friends"("receiver_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "friends_sender_id_receiver_id_key" ON "friends"("sender_id", "receiver_id");

-- AddForeignKey
ALTER TABLE "friends" ADD CONSTRAINT "friends_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "friends" ADD CONSTRAINT "friends_receiver_id_fkey" FOREIGN KEY ("receiver_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
