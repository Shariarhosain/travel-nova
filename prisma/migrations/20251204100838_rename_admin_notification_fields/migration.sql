/*
  Warnings:

  - You are about to drop the column `admin_notification` on the `notification_settings` table. All the data in the column will be lost.
  - You are about to drop the column `security_alerts` on the `notification_settings` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "notification_settings" DROP COLUMN "admin_notification",
DROP COLUMN "security_alerts",
ADD COLUMN     "admin_admin_notification" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "admin_security_alerts" BOOLEAN NOT NULL DEFAULT true;
