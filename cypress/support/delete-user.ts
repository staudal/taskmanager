import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { installGlobals } from "@remix-run/node";

import { prisma } from "~/db.server";

installGlobals();

async function deleteUser(email: string) {
  if (!email) {
    throw new Error("email required for login");
  }
  if (!email.endsWith("@example.com")) {
    throw new Error("All test emails must end in @example.com");
  }

  try {
    await prisma.user.delete({ where: { email } });
  } catch (error) {
    if (
      error instanceof PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      console.log("User not found, so no need to delete");
    } else {
      throw error;
    }
  } finally {
    await prisma.$disconnect();
  }
}

deleteUser(process.argv[2]);
