-- CreateEnum
CREATE TYPE "EntryType" AS ENUM ('TERMINOLOGY', 'FORMULA', 'CODE_SNIPPET', 'NOTE', 'REFERENCE');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "isAdmin" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cheatsheet_pages" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "topic" TEXT NOT NULL,
    "color" TEXT NOT NULL DEFAULT '#6366f1',
    "order" INTEGER NOT NULL DEFAULT 0,
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(6) NOT NULL,
    "authorId" TEXT NOT NULL,

    CONSTRAINT "cheatsheet_pages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cheatsheet_entries" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "type" "EntryType" NOT NULL DEFAULT 'TERMINOLOGY',
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "order" INTEGER NOT NULL DEFAULT 0,
    "isCodeSnippet" BOOLEAN NOT NULL DEFAULT false,
    "language" TEXT,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(6) NOT NULL,
    "pageId" TEXT NOT NULL,

    CONSTRAINT "cheatsheet_entries_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- AddForeignKey
ALTER TABLE "cheatsheet_pages" ADD CONSTRAINT "cheatsheet_pages_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cheatsheet_entries" ADD CONSTRAINT "cheatsheet_entries_pageId_fkey" FOREIGN KEY ("pageId") REFERENCES "cheatsheet_pages"("id") ON DELETE CASCADE ON UPDATE CASCADE;
