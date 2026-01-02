-- AlterTable
ALTER TABLE "activity_logs" RENAME COLUMN "userId" TO "user_id";
ALTER TABLE "activity_logs" RENAME COLUMN "ipAddress" TO "ip_address";
ALTER TABLE "activity_logs" RENAME COLUMN "userAgent" TO "user_agent";
ALTER TABLE "activity_logs" RENAME COLUMN "createdAt" TO "created_at";

-- DropIndex
DROP INDEX IF EXISTS "activity_logs_userId_idx";
DROP INDEX IF EXISTS "activity_logs_action_idx";

-- CreateIndex
CREATE INDEX "activity_logs_user_id_created_at_idx" ON "activity_logs"("user_id", "created_at");
