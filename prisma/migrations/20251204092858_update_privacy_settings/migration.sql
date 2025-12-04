/*
  Warnings:

  - You are about to drop the column `search_by_email` on the `user_account_settings` table. All the data in the column will be lost.
  - You are about to drop the column `search_by_username` on the `user_account_settings` table. All the data in the column will be lost.
  - You are about to drop the column `show_active` on the `user_account_settings` table. All the data in the column will be lost.
  - You are about to drop the column `show_followers` on the `user_account_settings` table. All the data in the column will be lost.
  - You are about to drop the column `suggest_account` on the `user_account_settings` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "user_account_settings" DROP COLUMN "search_by_email",
DROP COLUMN "search_by_username",
DROP COLUMN "show_active",
DROP COLUMN "show_followers",
DROP COLUMN "suggest_account",
ADD COLUMN     "discoverable_by_email" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "discoverable_by_username" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "show_activity_status" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "show_liked_posts" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "show_saved_posts" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "suggest_to_followers" BOOLEAN NOT NULL DEFAULT true;
