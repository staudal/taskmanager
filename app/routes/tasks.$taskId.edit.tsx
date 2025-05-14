import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useActionData, useLoaderData } from "@remix-run/react";
import { useEffect, useRef, useState } from "react";
import invariant from "tiny-invariant";

import { PageTitle } from "~/components/page-title";
import { TaskForm } from "~/components/task-form";
import { getTask, updateTask } from "~/models/task.server";
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
  const title = formData.get("title");
  const body = formData.get("body");
  const color = formData.get("color")?.toString() || "bg-white";

  if (typeof title !== "string" || title.length === 0) {
    return json(
      { errors: { body: null, title: "Title is required", color: null } },
      { status: 400 },
    );
  }

  const task = await getTask({ id: params.taskId, userId });
  if (!task) {
    return json(
      { errors: { body: "Task not found", title: null } },
      { status: 404 },
    );
  }

  await updateTask({
    id: params.taskId,
    body: body?.toString() ?? "",
    title,
    color,
    userId,
    status: task.status,
  });

  // After updating, get the updated task
  const updatedTask = await getTask({ id: params.taskId, userId });

  // If for some reason the task wasn't updated or doesn't exist
  if (!updatedTask) {
    return json(
      { errors: { body: "Task not found", title: null } },
      { status: 404 },
    );
  }

  return redirect(`/tasks/${params.taskId}`);
};

export default function EditTaskPage() {
  const data = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const titleRef = useRef<HTMLInputElement>(null);
  const bodyRef = useRef<HTMLTextAreaElement>(null);
  const taskId = data.task.id;
  const [selectedColor, setSelectedColor] = useState(
    data.task.color || "bg-white",
  );

  useEffect(() => {
    if (actionData?.errors?.title) {
      titleRef.current?.focus();
    } else if (actionData?.errors?.body) {
      bodyRef.current?.focus();
    }
  }, [actionData]);

  return (
    <div className="flex flex-col gap-6">
      <PageTitle title="Edit Task" backButton taskId={taskId} />
      <TaskForm
        titleRef={titleRef}
        bodyRef={bodyRef}
        errors={actionData?.errors}
        initialTitle={data.task.title}
        initialBody={data.task.body || ""}
        selectedColor={selectedColor}
        setSelectedColor={setSelectedColor}
      />
    </div>
  );
}
