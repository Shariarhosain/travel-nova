/*
  Warnings:

  - You are about to drop the column `email_notifications_posts` on the `notification_settings` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "notification_settings" DROP COLUMN "email_notifications_posts";
