-- AlterTable
ALTER TABLE "AdminUser" ADD COLUMN "resetToken" TEXT;
ALTER TABLE "AdminUser" ADD COLUMN "resetTokenExpiry" DATETIME;

-- CreateIndex
CREATE UNIQUE INDEX "AdminUser_resetToken_key" ON "AdminUser"("resetToken");
