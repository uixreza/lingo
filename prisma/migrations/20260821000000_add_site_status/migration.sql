-- CreateTable
CREATE TABLE "site_status" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "shutdown" BOOLEAN NOT NULL DEFAULT false,
    "updating" BOOLEAN NOT NULL DEFAULT false,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "site_status_pkey" PRIMARY KEY ("id")
);

-- Insert default row
INSERT INTO "site_status" ("id", "shutdown", "updating", "updated_at") VALUES (1, false, false, CURRENT_TIMESTAMP);
