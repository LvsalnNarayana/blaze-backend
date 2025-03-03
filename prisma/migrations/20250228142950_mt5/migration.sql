-- CreateTable
CREATE TABLE "mt5Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "mt5_account_number" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "mt5_server" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mt5Account_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "mt5Account_userId_mt5_account_number_key" ON "mt5Account"("userId", "mt5_account_number");
