import { LoaderFunctionArgs } from "@remix-run/node";
import { json, useLoaderData } from "@remix-run/react";

import { Swimlanes } from "~/components/swimlanes";
import { getTaskListItems } from "~/models/task.server";
import { requireUserId } from "~/session.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const userId = await requireUserId(request);
  const taskListItems = await getTaskListItems({ userId });
  return json({ taskListItems });
};

export default function TasksIndexPage() {
  const data = useLoaderData<typeof loader>();

  const tasks = data.taskListItems.map((task) => ({
    ...task,
    createdAt: new Date(task.createdAt),
    updatedAt: new Date(task.updatedAt),
  }));

  const todoTasks = tasks.filter((task) => task.status === "todo");
  const inProgressTasks = tasks.filter((task) => task.status === "in_progress");
  const doneTasks = tasks.filter((task) => task.status === "done");

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-6">
        <p className="text-center text-sm italic text-gray-400">
          Click on one of the tasks to view its details
        </p>
        <Swimlanes
          todoTasks={todoTasks}
          inProgressTasks={inProgressTasks}
          doneTasks={doneTasks}
        />
      </div>
    </div>
  );
}
