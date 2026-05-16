-- CreateTable
CREATE TABLE "PPTJob" (
    "id" TEXT NOT NULL,
    "topic" TEXT NOT NULL,
    "grade" INTEGER NOT NULL,
    "slides" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "pptPath" TEXT,
    "cached" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PPTJob_pkey" PRIMARY KEY ("id")
);
