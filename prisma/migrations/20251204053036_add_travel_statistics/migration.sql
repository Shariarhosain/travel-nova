-- AlterTable
ALTER TABLE "user_statistics" ADD COLUMN     "cities_explored" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "continents_visited" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "countries_visited" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "total_trips" INTEGER NOT NULL DEFAULT 0;
