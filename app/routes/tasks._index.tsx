import { LoaderFunctionArgs } from "@remix-run/node";
import { json, useLoaderData, Link } from "@remix-run/react";
import { useState } from "react";

import { Swimlanes } from "~/components/swimlanes";
import { getTaskListItems } from "~/models/task.server";
import { requireUserId } from "~/session.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const userId = await requireUserId(request);
  const { ownedTasks, sharedTasks } = await getTaskListItems({ userId });
  return json({ ownedTasks, sharedTasks });
};

export default function TasksIndexPage() {
  const data = useLoaderData<typeof loader>();
  const [showSharedTasks, setShowSharedTasks] = useState(false);

  // Process owned tasks
  const ownedTasks = data.ownedTasks.map((task) => ({
    ...task,
    createdAt: new Date(task.createdAt),
    updatedAt: new Date(task.updatedAt),
    isShared: false,
  }));

  // Process shared tasks
  const sharedTasks = data.sharedTasks.map((task) => ({
    ...task,
    createdAt: new Date(task.createdAt),
    updatedAt: new Date(task.updatedAt),
  }));

  // Select which tasks to display based on the active tab
  const tasks = showSharedTasks ? sharedTasks : ownedTasks;

  const todoTasks = tasks.filter((task) => task.status === "todo");
  const inProgressTasks = tasks.filter((task) => task.status === "in_progress");
  const doneTasks = tasks.filter((task) => task.status === "done");

  return (
    <div className="flex flex-col gap-4">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex space-x-4">
          <button
            onClick={() => setShowSharedTasks(false)}
            className={`rounded px-4 py-2 ${
              !showSharedTasks
                ? "bg-blue-500 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            My Tasks
          </button>
          <button
            onClick={() => setShowSharedTasks(true)}
            className={`rounded px-4 py-2 ${
              showSharedTasks
                ? "bg-blue-500 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            Shared With Me ({sharedTasks.length})
          </button>
        </div>
        <Link
          to="/tasks/new"
          className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 focus:bg-blue-400"
        >
          New Task
        </Link>
      </div>

      <div className="flex flex-col gap-6">
        {showSharedTasks && sharedTasks.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-gray-500">
              No tasks have been shared with you yet.
            </p>
          </div>
        ) : (
          <>
            <p className="text-center text-sm italic text-gray-400">
              Click on one of the tasks to view its details
            </p>
            <Swimlanes
              todoTasks={todoTasks}
              inProgressTasks={inProgressTasks}
              doneTasks={doneTasks}
            />
          </>
        )}
      </div>
    </div>
  );
}
