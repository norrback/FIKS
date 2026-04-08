-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT,
    "role" TEXT NOT NULL DEFAULT 'USER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RepairerProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "serviceName" TEXT NOT NULL DEFAULT '',
    "bio" TEXT NOT NULL DEFAULT '',
    "serviceDescription" TEXT NOT NULL DEFAULT '',
    "expertise" TEXT NOT NULL DEFAULT '[]',
    "completedJobsCount" INTEGER NOT NULL DEFAULT 0,
    "ratingSum" INTEGER NOT NULL DEFAULT 0,
    "ratingCount" INTEGER NOT NULL DEFAULT 0,
    "servicePhotoUrl" TEXT,
    "servicePostalCode" TEXT NOT NULL DEFAULT '',
    "serviceLocationLabel" TEXT NOT NULL DEFAULT '',
    "serviceLatitude" DOUBLE PRECISION,
    "serviceLongitude" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RepairerProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RepairerCompletedJob" (
    "id" TEXT NOT NULL,
    "repairerProfileId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "itemSummary" TEXT NOT NULL DEFAULT '',
    "completedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ratingStars" INTEGER,
    "agreementSummary" TEXT NOT NULL DEFAULT '',
    "messagesSummary" TEXT NOT NULL DEFAULT '',
    "repairStoryNotes" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RepairerCompletedJob_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Listing" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "postalCode" TEXT NOT NULL DEFAULT '',
    "locationName" TEXT NOT NULL DEFAULT '',
    "location" TEXT,
    "mainCategory" TEXT NOT NULL DEFAULT '',
    "subCategory" TEXT NOT NULL DEFAULT '',
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "photoUrlsJson" TEXT NOT NULL DEFAULT '[]',
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "authorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Listing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RepairStory" (
    "id" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "repairerUserId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'APPLIED',
    "branchedFromId" TEXT,
    "agreedPriceCents" INTEGER,
    "escrowState" TEXT NOT NULL DEFAULT 'NONE',
    "agreedAt" TIMESTAMP(3),
    "jobCompletedAt" TIMESTAMP(3),
    "paidAt" TIMESTAMP(3),
    "closedReason" TEXT,
    "customerScore" INTEGER,
    "repairerScore" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RepairStory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ListingMessage" (
    "id" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ListingMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RepairStoryMessage" (
    "id" TEXT NOT NULL,
    "repairStoryId" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RepairStoryMessage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "RepairerProfile_userId_key" ON "RepairerProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "RepairerProfile_slug_key" ON "RepairerProfile"("slug");

-- CreateIndex
CREATE INDEX "RepairerCompletedJob_repairerProfileId_completedAt_idx" ON "RepairerCompletedJob"("repairerProfileId", "completedAt");

-- CreateIndex
CREATE INDEX "RepairStory_listingId_status_idx" ON "RepairStory"("listingId", "status");

-- CreateIndex
CREATE INDEX "RepairStory_repairerUserId_status_idx" ON "RepairStory"("repairerUserId", "status");

-- CreateIndex
CREATE INDEX "ListingMessage_listingId_createdAt_idx" ON "ListingMessage"("listingId", "createdAt");

-- CreateIndex
CREATE INDEX "RepairStoryMessage_repairStoryId_createdAt_idx" ON "RepairStoryMessage"("repairStoryId", "createdAt");

-- AddForeignKey
ALTER TABLE "RepairerProfile" ADD CONSTRAINT "RepairerProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RepairerCompletedJob" ADD CONSTRAINT "RepairerCompletedJob_repairerProfileId_fkey" FOREIGN KEY ("repairerProfileId") REFERENCES "RepairerProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Listing" ADD CONSTRAINT "Listing_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RepairStory" ADD CONSTRAINT "RepairStory_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RepairStory" ADD CONSTRAINT "RepairStory_repairerUserId_fkey" FOREIGN KEY ("repairerUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RepairStory" ADD CONSTRAINT "RepairStory_branchedFromId_fkey" FOREIGN KEY ("branchedFromId") REFERENCES "RepairStory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ListingMessage" ADD CONSTRAINT "ListingMessage_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ListingMessage" ADD CONSTRAINT "ListingMessage_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RepairStoryMessage" ADD CONSTRAINT "RepairStoryMessage_repairStoryId_fkey" FOREIGN KEY ("repairStoryId") REFERENCES "RepairStory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RepairStoryMessage" ADD CONSTRAINT "RepairStoryMessage_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
