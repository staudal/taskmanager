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
import {
  deleteTask,
  getAccessLevelToTask,
  getTask,
  updateTaskStatus,
} from "~/models/task.server";
import { requireUserId } from "~/session.server";

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
  const userId = await requireUserId(request);
  invariant(params.taskId, "taskId not found");

  const task = await getTask({ id: params.taskId, userId });
  if (!task) {
    throw new Response("Not Found", { status: 404 });
  }

  const accessLevel = await getAccessLevelToTask(task.id, userId);

  return json({ task, accessLevel });
};

export const action = async ({ params, request }: ActionFunctionArgs) => {
  const userId = await requireUserId(request);
  invariant(params.taskId, "taskId not found");

  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "delete") {
    try {
      await deleteTask({ id: params.taskId, userId });
      return redirect("/tasks");
    } catch {
      return json(
        { error: "An error occurred while deleting the task" },
        { status: 403 },
      );
    }
  }

  // Handle status update
  if (intent === "update-status") {
    const newStatus = formData.get("status");
    if (
      newStatus === "todo" ||
      newStatus === "in_progress" ||
      newStatus === "done"
    ) {
      try {
        await updateTaskStatus({
          id: params.taskId,
          userId,
          status: newStatus,
        });
        return redirect("/tasks");
      } catch {
        return json(
          { error: "An error occurred while updating the task status" },
          { status: 403 },
        );
      }
    }
  }

  return null;
};

export default function TaskDetailsPage() {
  const data = useLoaderData<typeof loader>();
  const status = data.task.status;
  const taskId = data.task.id;
  const accessLevel = data.accessLevel;

  return (
    <div className="flex flex-col gap-6">
      <PageTitle title="Task Details" backButton />

      <Card className={data.task.color || "bg-white"}>
        <CardHeader>
          <CardTitle>{data.task.title}</CardTitle>
          <div className="text-sm text-gray-500">
            Access level: <span className="capitalize">{accessLevel}</span>
          </div>
        </CardHeader>
        <CardContent>
          <p className="whitespace-pre-wrap">{data.task.body}</p>
          <div className="mt-4">
            <span className="font-semibold">Status: </span>
            <span className="capitalize">{status.replace("_", " ")}</span>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col justify-between gap-2 md:flex-row">
          {accessLevel === "owner" || accessLevel === "editor" ? (
            <>
              <StatusActions status={status} />
              <TaskFooterButtons taskId={taskId} accessLevel={accessLevel} />
            </>
          ) : null}
        </CardFooter>
      </Card>
    </div>
  );
}
