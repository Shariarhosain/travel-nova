/*
  Warnings:

  - You are about to drop the column `admin_banned_users` on the `admin_settings` table. All the data in the column will be lost.
  - You are about to drop the column `admin_email_verification` on the `admin_settings` table. All the data in the column will be lost.
  - You are about to drop the column `admin_storage_management` on the `admin_settings` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "admin_settings" DROP COLUMN "admin_banned_users",
DROP COLUMN "admin_email_verification",
DROP COLUMN "admin_storage_management";
