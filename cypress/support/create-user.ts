import { installGlobals } from "@remix-run/node";
import { parse } from "cookie";

import { createUser } from "~/models/user.server";
import { createUserSession } from "~/session.server";

installGlobals();

async function createAndLogin(email: string, password: string) {
  if (!email || !password) {
    throw new Error("email and password required for login");
  }
  if (!email.endsWith("@example.com")) {
    throw new Error("All test emails must end in @example.com");
  }

  const user = await createUser(email, password);

  const response = await createUserSession({
    request: new Request("test://test"),
    userId: user.id,
    redirectTo: "/",
  });

  const cookieValue = response.headers.get("Set-Cookie");
  if (!cookieValue) {
    throw new Error("Cookie missing from createUserSession response");
  }
  const parsedCookie = parse(cookieValue);
  // we log it like this so our cypress command can parse it out and set it as
  // the cookie value.
  console.log(
    `
<cookie>
  ${parsedCookie.__session}
</cookie>
  `.trim(),
  );
}

createAndLogin(process.argv[2], process.argv[3]);
