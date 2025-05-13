import type { User, Task } from "@prisma/client";

import { prisma } from "~/db.server";

export async function getTask({
  id,
  userId,
}: Pick<Task, "id"> & {
  userId: User["id"];
}) {
  const ownedTask = await prisma.task.findFirst({
    where: { id, userId },
  });

  if (ownedTask) return ownedTask;

  const sharedTask = await prisma.task.findFirst({
    where: {
      id,
      accessUsers: {
        some: {
          userId,
        },
      },
    },
  });

  return sharedTask;
}

export async function getTaskListItems({ userId }: { userId: User["id"] }) {
  const ownedTasks = await prisma.task.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
  });

  const sharedTasks = await prisma.task.findMany({
    where: {
      accessUsers: {
        some: {
          userId,
        },
      },
    },
    include: {
      accessUsers: {
        where: {
          userId,
        },
        select: {
          accessLevel: true,
        },
      },
      user: {
        select: {
          email: true,
        },
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  // Transform shared tasks to include access level
  const formattedSharedTasks = sharedTasks.map((task) => ({
    ...task,
    accessLevel: task.accessUsers[0]?.accessLevel || "viewer",
  }));

  return {
    ownedTasks,
    sharedTasks: formattedSharedTasks,
  };
}

export function createTask({
  body,
  title,
  color,
  userId,
  status = "todo",
}: Pick<Task, "body" | "title" | "color" | "status"> & {
  userId: User["id"];
}) {
  return prisma.task.create({
    data: {
      title,
      body,
      color,
      status,
      userId,
    },
  });
}

export async function updateTask({
  id,
  body,
  title,
  color,
  status,
  userId,
}: Pick<Task, "id" | "body" | "title" | "color" | "status"> & {
  userId: User["id"];
}) {
  const isOwner = await prisma.task.findFirst({
    where: { id, userId },
    select: { id: true },
  });

  if (isOwner) {
    return prisma.task.updateMany({
      where: { id, userId },
      data: { title, body, color, status, updatedAt: new Date() },
    });
  }

  // Check if the user has editor
  const userAccess = await prisma.taskAccess.findFirst({
    where: {
      taskId: id,
      userId,
      accessLevel: "editor",
    },
  });

  if (userAccess) {
    return prisma.task.update({
      where: { id },
      data: { title, body, color, status, updatedAt: new Date() },
    });
  }

  throw new Error("Insufficient permissions to update this task");
}

export async function deleteTask({
  id,
  userId,
}: Pick<Task, "id"> & { userId: User["id"] }) {
  return prisma.task.deleteMany({
    where: { id, userId },
  });

  throw new Error("Insufficient permissions to delete this task");
}

export async function updateTaskStatus({
  id,
  userId,
  status,
}: Pick<Task, "id"> & {
  userId: User["id"];
  status: string;
}) {
  const isOwner = await prisma.task.findFirst({
    where: { id, userId },
    select: { id: true },
  });

  if (isOwner) {
    return prisma.task.updateMany({
      where: { id, userId },
      data: { status, updatedAt: new Date() },
    });
  }

  const userAccess = await prisma.taskAccess.findFirst({
    where: {
      taskId: id,
      userId,
      accessLevel: "editor",
    },
  });

  if (userAccess) {
    return prisma.task.update({
      where: { id },
      data: { status, updatedAt: new Date() },
    });
  }

  throw new Error("Insufficient permissions to update this task status");
}

export async function shareTaskWithUser({
  taskId,
  ownerId,
  targetUserId,
  accessLevel,
}: {
  taskId: Task["id"];
  ownerId: User["id"];
  targetUserId: User["id"];
  accessLevel: string;
}) {
  if (ownerId === targetUserId) {
    throw new Error("Cannot share a task with yourself");
  }

  const task = await prisma.task.findUnique({
    where: { id: taskId, userId: ownerId },
  });

  // This will throw an error if the person sharing it is not the owner of the task
  if (!task) {
    throw new Error("Task not found");
  }

  const targetUser = await prisma.user.findUnique({
    where: { id: targetUserId },
  });

  if (!targetUser) {
    throw new Error("Target user not found");
  }

  const targetUserAccess = await prisma.taskAccess.findUnique({
    where: {
      taskId_userId: {
        taskId,
        userId: targetUserId,
      },
    },
  });

  if (targetUserAccess) {
    return prisma.taskAccess.update({
      where: {
        id: targetUserAccess.id,
      },
      data: {
        accessLevel,
        grantedAt: new Date(),
      },
    });
  }

  // Create a new access entry
  return prisma.taskAccess.create({
    data: {
      accessLevel,
      task: {
        connect: { id: taskId },
      },
      user: {
        connect: { id: targetUserId },
      },
    },
  });
}

export async function removeTaskAccess({
  taskId,
  ownerId,
  targetUserId,
}: {
  taskId: Task["id"];
  ownerId: User["id"];
  targetUserId: User["id"];
}) {
  const task = await prisma.task.findFirst({
    where: { id: taskId, userId: ownerId },
  });

  if (!task) {
    throw new Error("Task not found");
  }

  return prisma.taskAccess.deleteMany({
    where: {
      taskId,
      userId: targetUserId,
    },
  });
}

export async function getTaskAccessUsers({
  taskId,
  userId,
}: {
  taskId: Task["id"];
  userId: User["id"];
}) {
  const task = await prisma.task.findFirst({
    where: { id: taskId, userId },
  });

  if (!task) {
    throw new Error("Task not found");
  }

  return prisma.taskAccess.findMany({
    where: {
      taskId,
    },
    include: {
      user: {
        select: {
          id: true,
          email: true,
        },
      },
    },
  });
}

export async function getAccessLevelToTask(
  taskId: Task["id"],
  userId: User["id"],
) {
  const isOwner = await prisma.task.findFirst({
    where: {
      id: taskId,
      userId,
    },
    select: { id: true },
  });

  if (isOwner) {
    return "owner";
  }

  const access = await prisma.taskAccess.findFirst({
    where: {
      taskId,
      userId,
    },
  });

  if (!access) {
    throw new Error("You don't have access to this task");
  }

  return access.accessLevel;
}
