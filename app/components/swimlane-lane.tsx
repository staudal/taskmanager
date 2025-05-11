import { Task } from "@prisma/client";

import { TaskItem } from "./task-item";

interface SwimlaneLaneProps {
  title: string;
  color: string;
  tasks: Task[];
}

export function SwimlaneLane({ title, color, tasks }: SwimlaneLaneProps) {
  return (
    <div className={`flex flex-col gap-4 rounded-xl border p-4 ${color}`}>
      <h3 className="mb-2 text-center font-bold">{title}</h3>
      <div className="flex flex-col gap-2">
        {tasks.length > 0 ? (
          tasks.map((task) => <TaskItem key={task.id} task={task} />)
        ) : (
          <p className="text-center text-sm italic text-gray-400">
            No tasks yet
          </p>
        )}
      </div>
    </div>
  );
}
