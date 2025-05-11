import { Task } from "@prisma/client";
import { Link } from "@remix-run/react";

interface TaskItemProps {
  task: Task;
}

export function TaskItem({ task }: TaskItemProps) {
  return (
    <Link
      to={`/tasks/${task.id}`}
      key={task.id}
      className={`flex flex-col gap-4 rounded-lg border p-4 transition-all duration-200 hover:ring-1 ${task.color || "bg-white"}`}
    >
      <h2 className="font-bold">{task.title}</h2>
      <p className="text-sm text-gray-600">{task.body}</p>
    </Link>
  );
}
