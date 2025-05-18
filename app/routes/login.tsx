import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  MetaFunction,
} from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useActionData, useSearchParams } from "@remix-run/react";
import { useEffect, useRef } from "react";

import AuthForm from "~/components/auth-form";
import { checkRateLimit } from "~/lib/rate-limiter";
import { logFailedLogin, logSuccessfulLogin } from "~/models/audit-log.server";
import { verifyLogin } from "~/models/user.server";
import { createUserSession, getUserId } from "~/session.server";
import { safeRedirect, validateEmail } from "~/utils";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const userId = await getUserId(request);
  if (userId) return redirect("/tasks");
  return json({});
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const rateLimitResponse = await checkRateLimit(request);
  if (rateLimitResponse) throw rateLimitResponse;

  const formData = await request.formData();
  const email = formData.get("email");
  const password = formData.get("password");
  const redirectTo = safeRedirect(formData.get("redirectTo"), "/tasks");

  if (!validateEmail(email)) {
    return json(
      { errors: { email: "Email is invalid", password: null } },
      { status: 400 },
    );
  }

  if (typeof password !== "string" || password.length === 0) {
    await logFailedLogin(email as string, "Password is required", request);
    return json(
      { errors: { email: null, password: "Password is required" } },
      { status: 400 },
    );
  }

  if (password.length < 8) {
    await logFailedLogin(email as string, "Password too short", request);
    return json(
      { errors: { email: null, password: "Password is too short" } },
      { status: 400 },
    );
  }

  const user = await verifyLogin(email as string, password);

  if (!user) {
    await logFailedLogin(email as string, "Invalid credentials", request);
    return json(
      { errors: { email: "Invalid email or password", password: null } },
      { status: 400 },
    );
  }

  // Log successful login
  await logSuccessfulLogin(user.id, request);

  return createUserSession({
    redirectTo,
    request,
    userId: user.id,
  });
};

export const meta: MetaFunction = () => [{ title: "Login" }];

export default function LoginPage() {
  const [searchParams] = useSearchParams();
  const actionData = useActionData<typeof action>();
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (actionData?.errors?.email) {
      emailRef.current?.focus();
    } else if (actionData?.errors?.password) {
      passwordRef.current?.focus();
    }
  }, [actionData]);

  return (
    <AuthForm
      title="Log in to your account"
      description="Log in and start managing your tasks"
      actionData={actionData}
      emailRef={emailRef}
      passwordRef={passwordRef}
      searchParams={searchParams}
      redirectTo="/join"
      submitButtonText="Log in"
      redirectLinkText="Create account"
    />
  );
}
