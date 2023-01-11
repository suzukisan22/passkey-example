-- CreateTable
CREATE TABLE "Passkey" (
    "id" SERIAL NOT NULL,
    "credentialId" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "publicKey" TEXT NOT NULL,
    "transports" TEXT[],

    CONSTRAINT "Passkey_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Passkey" ADD CONSTRAINT "Passkey_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
