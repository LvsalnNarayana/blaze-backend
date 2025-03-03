-- CreateTable
CREATE TABLE "Referral" (
    "id" TEXT NOT NULL,
    "referrerId" TEXT,
    "referredId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Referral_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ShareCode" (
    "id" TEXT NOT NULL,
    "shareCode" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ShareCode_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "referrer_idx" ON "Referral"("referrerId");

-- CreateIndex
CREATE INDEX "referred_idx" ON "Referral"("referredId");

-- CreateIndex
CREATE UNIQUE INDEX "ShareCode_shareCode_key" ON "ShareCode"("shareCode");

-- CreateIndex
CREATE UNIQUE INDEX "ShareCode_userId_key" ON "ShareCode"("userId");

-- CreateIndex
CREATE INDEX "user_id_idx" ON "ShareCode"("userId");
