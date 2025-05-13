-- CreateTable
CREATE TABLE "TaskAccess" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "accessLevel" TEXT NOT NULL DEFAULT 'viewer',
    "grantedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "taskId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    CONSTRAINT "TaskAccess_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "TaskAccess_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "TaskAccess_taskId_userId_key" ON "TaskAccess"("taskId", "userId");
