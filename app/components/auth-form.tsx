import { Form, Link } from "@remix-run/react";

import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";

import Logo from "./logo";

interface ActionData {
  errors?: {
    email?: string | null;
    password?: string | null;
  };
}

interface AuthFormProps {
  title: string;
  description: string;
  actionData?: ActionData;
  emailRef: React.RefObject<HTMLInputElement>;
  passwordRef: React.RefObject<HTMLInputElement>;
  searchParams: URLSearchParams;
  redirectTo: string;
  submitButtonText: string;
  redirectLinkText: string;
}

export default function AuthForm({
  title,
  description,
  actionData,
  emailRef,
  passwordRef,
  searchParams,
  redirectTo,
  submitButtonText,
  redirectLinkText,
}: AuthFormProps) {
  return (
    <div>
      <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
        <div className="flex w-full max-w-sm flex-col gap-6">
          <Logo />
          <div className={"flex flex-col gap-6"}>
            <Card>
              <CardHeader className="text-center">
                <CardTitle className="text-xl">{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Form method="post">
                  <div className="grid gap-6">
                    <div className="grid gap-6">
                      <div className="grid gap-2">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="email">Email</Label>
                          {actionData?.errors?.email ? (
                            <Label className="text-red-700">
                              {actionData.errors.email}
                            </Label>
                          ) : null}
                        </div>
                        <Input
                          ref={emailRef}
                          id="email"
                          required
                          name="email"
                          type="email"
                          autoComplete="email"
                          placeholder="m@example.com"
                        />
                      </div>
                      <div className="grid gap-2">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="password">Password</Label>
                          {actionData?.errors?.password ? (
                            <Label className="text-red-700">
                              {actionData.errors.password}
                            </Label>
                          ) : null}
                        </div>
                        <Input
                          ref={passwordRef}
                          id="password"
                          name="password"
                          type="password"
                          required
                          autoComplete="current-password"
                        />
                      </div>
                      <Button type="submit" className="w-full">
                        {submitButtonText}
                      </Button>
                    </div>
                    <div className="text-center text-sm">
                      Already have an account?{" "}
                      <Link
                        className="underline underline-offset-4"
                        to={{
                          pathname: redirectTo,
                          search: searchParams.toString(),
                        }}
                      >
                        {redirectLinkText}
                      </Link>
                    </div>
                  </div>
                </Form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
