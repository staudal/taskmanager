import { MetaFunction, Outlet } from "@remix-run/react";

import { Header } from "~/components/header";
import { Separator } from "~/components/ui/separator";

export const meta: MetaFunction = () => [{ title: "Tasks" }];

export default function TasksPage() {
  return (
    <div className="container mx-auto flex flex-1 flex-col gap-4 p-8">
      <Header />
      <Separator />
      <Outlet />
    </div>
  );
}
