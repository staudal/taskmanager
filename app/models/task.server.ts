import type { User, Task } from "@prisma/client";

import { prisma } from "~/db.server";

export function getTask({
  id,
  userId,
}: Pick<Task, "id"> & {
  userId: User["id"];
}) {
  return prisma.task.findFirst({
    select: { id: true, body: true, title: true, color: true, status: true },
    where: { id, userId },
  });
}

export function getTaskListItems({ userId }: { userId: User["id"] }) {
  return prisma.task.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
  });
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
      user: {
        connect: {
          id: userId,
        },
      },
    },
  });
}

export function updateTask({
  id,
  body,
  title,
  color,
  status,
  userId,
}: Pick<Task, "id" | "body" | "title" | "color" | "status"> & {
  userId: User["id"];
}) {
  return prisma.task.updateMany({
    where: { id, userId },
    data: { title, body, color, status, updatedAt: new Date() },
  });
}

export function deleteTask({
  id,
  userId,
}: Pick<Task, "id"> & { userId: User["id"] }) {
  return prisma.task.deleteMany({
    where: { id, userId },
  });
}

export function updateTaskStatus({
  id,
  userId,
  status,
}: Pick<Task, "id"> & {
  userId: User["id"];
  status: string;
}) {
  return prisma.task.updateMany({
    where: { id, userId },
    data: { status, updatedAt: new Date() },
  });
}
