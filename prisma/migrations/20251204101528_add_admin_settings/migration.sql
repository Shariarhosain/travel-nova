-- CreateTable
CREATE TABLE "admin_settings" (
    "id" TEXT NOT NULL,
    "user_account_id" TEXT NOT NULL,
    "admin_auto_approve_posts" BOOLEAN NOT NULL DEFAULT false,
    "admin_storage_management" BOOLEAN NOT NULL DEFAULT false,
    "admin_new_registrations" BOOLEAN NOT NULL DEFAULT true,
    "admin_email_verification" BOOLEAN NOT NULL DEFAULT true,
    "admin_banned_users" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "admin_settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "admin_settings_user_account_id_key" ON "admin_settings"("user_account_id");

-- AddForeignKey
ALTER TABLE "admin_settings" ADD CONSTRAINT "admin_settings_user_account_id_fkey" FOREIGN KEY ("user_account_id") REFERENCES "user_account"("id") ON DELETE CASCADE ON UPDATE CASCADE;
