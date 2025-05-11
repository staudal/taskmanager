import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import invariant from "tiny-invariant";

import { PageTitle } from "~/components/page-title";
import { StatusActions } from "~/components/status-action";
import { TaskFooterButtons } from "~/components/task-footer-buttons";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { deleteTask, getTask, updateTaskStatus } from "~/models/task.server";
import { requireUserId } from "~/session.server";

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
  const userId = await requireUserId(request);
  invariant(params.taskId, "taskId not found");

  const task = await getTask({ id: params.taskId, userId });
  if (!task) {
    throw new Response("Not Found", { status: 404 });
  }
  return json({ task });
};

export const action = async ({ params, request }: ActionFunctionArgs) => {
  const userId = await requireUserId(request);
  invariant(params.taskId, "taskId not found");

  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "delete") {
    await deleteTask({ id: params.taskId, userId });
    return redirect("/tasks");
  }

  // Handle status update
  if (intent === "update-status") {
    const newStatus = formData.get("status");
    if (
      newStatus === "todo" ||
      newStatus === "in_progress" ||
      newStatus === "done"
    ) {
      await updateTaskStatus({ id: params.taskId, userId, status: newStatus });
      return redirect("/tasks");
    }
  }

  return null;
};

export default function TaskDetailsPage() {
  const data = useLoaderData<typeof loader>();
  const status = data.task.status;
  const taskId = data.task.id;

  return (
    <div className="flex flex-col gap-6">
      <PageTitle title="Task Details" backButton />

      <Card className={data.task.color || "bg-white"}>
        <CardHeader>
          <CardTitle>{data.task.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="whitespace-pre-wrap">{data.task.body}</p>
          <div className="mt-4">
            <span className="font-semibold">Status: </span>
            <span className="capitalize">{status.replace("_", " ")}</span>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col justify-between gap-2 md:flex-row">
          <StatusActions status={status} />
          <TaskFooterButtons taskId={taskId} />
        </CardFooter>
      </Card>
    </div>
  );
}
