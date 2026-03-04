-- CreateEnum
CREATE TYPE "SanctionType" AS ENUM ('YELLOW_CARD', 'RED_CARD', 'SUSPENSION');

-- CreateTable
CREATE TABLE "Sanction" (
    "id" TEXT NOT NULL,
    "type" "SanctionType" NOT NULL,
    "games_suspended" INTEGER NOT NULL DEFAULT 0,
    "reason" TEXT,
    "served" BOOLEAN NOT NULL DEFAULT false,
    "applied_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "player_id" TEXT NOT NULL,
    "match_id" TEXT NOT NULL,

    CONSTRAINT "Sanction_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Sanction" ADD CONSTRAINT "Sanction_player_id_fkey" FOREIGN KEY ("player_id") REFERENCES "Player"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sanction" ADD CONSTRAINT "Sanction_match_id_fkey" FOREIGN KEY ("match_id") REFERENCES "Match"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
