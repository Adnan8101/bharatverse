-- CreateTable
CREATE TABLE "public"."StoreCoupon" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "discountType" TEXT NOT NULL DEFAULT 'percentage',
    "discountValue" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "maxDiscountAmount" DOUBLE PRECISION,
    "minOrderAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "forNewUser" BOOLEAN NOT NULL DEFAULT false,
    "forMember" BOOLEAN NOT NULL DEFAULT false,
    "usageLimit" INTEGER,
    "usedCount" INTEGER NOT NULL DEFAULT 0,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "storeId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "adminNote" TEXT,
    "reviewedBy" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StoreCoupon_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."StoreToStoreConversation" (
    "id" TEXT NOT NULL,
    "store1Id" TEXT NOT NULL,
    "store2Id" TEXT NOT NULL,
    "lastMessage" TEXT,
    "lastMessageAt" TIMESTAMP(3),
    "unreadByStore1" BOOLEAN NOT NULL DEFAULT false,
    "unreadByStore2" BOOLEAN NOT NULL DEFAULT false,
    "unreadByAdmin" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StoreToStoreConversation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."StoreToStoreMessage" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "messageType" TEXT NOT NULL DEFAULT 'text',
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StoreToStoreMessage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "StoreCoupon_code_key" ON "public"."StoreCoupon"("code");

-- CreateIndex
CREATE INDEX "StoreCoupon_storeId_idx" ON "public"."StoreCoupon"("storeId");

-- CreateIndex
CREATE INDEX "StoreCoupon_status_idx" ON "public"."StoreCoupon"("status");

-- CreateIndex
CREATE INDEX "StoreToStoreConversation_store1Id_idx" ON "public"."StoreToStoreConversation"("store1Id");

-- CreateIndex
CREATE INDEX "StoreToStoreConversation_store2Id_idx" ON "public"."StoreToStoreConversation"("store2Id");

-- CreateIndex
CREATE UNIQUE INDEX "StoreToStoreConversation_store1Id_store2Id_key" ON "public"."StoreToStoreConversation"("store1Id", "store2Id");

-- CreateIndex
CREATE INDEX "StoreToStoreMessage_conversationId_createdAt_idx" ON "public"."StoreToStoreMessage"("conversationId", "createdAt");

-- AddForeignKey
ALTER TABLE "public"."StoreCoupon" ADD CONSTRAINT "StoreCoupon_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "public"."Store"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."StoreToStoreConversation" ADD CONSTRAINT "StoreToStoreConversation_store1Id_fkey" FOREIGN KEY ("store1Id") REFERENCES "public"."Store"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."StoreToStoreConversation" ADD CONSTRAINT "StoreToStoreConversation_store2Id_fkey" FOREIGN KEY ("store2Id") REFERENCES "public"."Store"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."StoreToStoreMessage" ADD CONSTRAINT "StoreToStoreMessage_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "public"."StoreToStoreConversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."StoreToStoreMessage" ADD CONSTRAINT "StoreToStoreMessage_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "public"."Store"("id") ON DELETE CASCADE ON UPDATE CASCADE;
