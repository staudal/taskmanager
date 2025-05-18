import type { User } from "@prisma/client";

import { prisma } from "~/db.server";

type AuditAction =
  | "login"
  | "signup"
  | "logout"
  | "password_reset"
  | "account_update";
type AuditStatus = "success" | "failure";

export async function createAuditLog({
  action,
  status,
  userId,
  ipAddress,
  userAgent,
  details,
}: {
  action: AuditAction;
  status: AuditStatus;
  userId?: User["id"];
  ipAddress?: string;
  userAgent?: string;
  details?: Record<string, unknown>;
}) {
  return prisma.auditLog.create({
    data: {
      action,
      status,
      userId,
      ipAddress,
      userAgent,
      details: details ? JSON.stringify(details) : null,
    },
  });
}

export async function logSuccessfulLogin(userId: User["id"], request: Request) {
  const ipAddress = getClientIp(request);
  const userAgent = request.headers.get("user-agent") || undefined;

  return createAuditLog({
    action: "login",
    status: "success",
    userId,
    ipAddress,
    userAgent,
  });
}

export async function logFailedLogin(
  email: string,
  reason: string,
  request: Request,
  userId?: User["id"],
) {
  const ipAddress = getClientIp(request);
  const userAgent = request.headers.get("user-agent") || undefined;

  return createAuditLog({
    action: "login",
    status: "failure",
    userId,
    ipAddress,
    userAgent,
    details: {
      email,
      reason,
    },
  });
}

export async function logSuccessfulSignup(
  userId: User["id"],
  email: string,
  request: Request,
) {
  const ipAddress = getClientIp(request);
  const userAgent = request.headers.get("user-agent") || undefined;

  return createAuditLog({
    action: "signup",
    status: "success",
    userId,
    ipAddress,
    userAgent,
    details: {
      email,
    },
  });
}

function getClientIp(request: Request): string | undefined {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    // Get the first IP if there are multiple
    return forwardedFor.split(",")[0].trim();
  }

  const realIp = request.headers.get("x-real-ip");
  if (realIp) {
    return realIp;
  }

  return undefined;
}

export async function getAuditLogsByUserId(userId: User["id"]) {
  return prisma.auditLog.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
}

export async function getAllAuditLogs(limit = 100, offset = 0) {
  return prisma.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
    skip: offset,
    include: {
      user: {
        select: {
          email: true,
        },
      },
    },
  });
}
