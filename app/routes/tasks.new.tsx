import type { ActionFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useActionData } from "@remix-run/react";
import { useEffect, useRef, useState } from "react";

import { TaskForm } from "~/components/task-form";
import { createTask } from "~/models/task.server";
import { requireUserId } from "~/session.server";

export const action = async ({ request }: ActionFunctionArgs) => {
  const userId = await requireUserId(request);

  const formData = await request.formData();
  const title = formData.get("title");
  const body = formData.get("body")?.toString() || null;
  const color = formData.get("color")?.toString() || "bg-white";

  if (typeof title !== "string" || title.length === 0) {
    return json(
      { errors: { body: null, title: "Title is required", color: null } },
      { status: 400 },
    );
  }

  await createTask({ body, title, color, userId, status: "todo" });

  return redirect(`/tasks`);
};

export default function NewTaskPage() {
  const actionData = useActionData<typeof action>();
  const titleRef = useRef<HTMLInputElement>(null);
  const bodyRef = useRef<HTMLTextAreaElement>(null);
  const [selectedColor, setSelectedColor] = useState("bg-white");

  useEffect(() => {
    if (actionData?.errors?.title) {
      titleRef.current?.focus();
    } else if (actionData?.errors?.body) {
      bodyRef.current?.focus();
    }
  }, [actionData]);

  return (
    <TaskForm
      titleRef={titleRef}
      bodyRef={bodyRef}
      errors={actionData?.errors}
      selectedColor={selectedColor}
      setSelectedColor={setSelectedColor}
    />
  );
}
