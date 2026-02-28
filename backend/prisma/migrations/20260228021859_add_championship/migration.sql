-- CreateEnum
CREATE TYPE "ChampionshipStatus" AS ENUM ('DRAFT', 'OPEN', 'ONGOING', 'FINISHED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ChampionshipFormat" AS ENUM ('LEAGUE', 'CUP', 'MIXED');

-- CreateTable
CREATE TABLE "Championship" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "sport_type" TEXT NOT NULL,
    "format" "ChampionshipFormat" NOT NULL,
    "season" TEXT NOT NULL,
    "status" "ChampionshipStatus" NOT NULL DEFAULT 'DRAFT',
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "max_teams" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "organizer_id" TEXT NOT NULL,

    CONSTRAINT "Championship_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Championship" ADD CONSTRAINT "Championship_organizer_id_fkey" FOREIGN KEY ("organizer_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
