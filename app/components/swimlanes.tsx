import { Task } from "@prisma/client";

import { SwimlaneLane } from "./swimlane-lane";

interface SwimlanesProps {
  todoTasks: Task[];
  inProgressTasks: Task[];
  doneTasks: Task[];
}

export function Swimlanes({
  todoTasks,
  inProgressTasks,
  doneTasks,
}: SwimlanesProps) {
  return (
    <div className="grid grid-cols-3 items-start gap-4">
      <SwimlaneLane title="Todo" color="bg-gray-50" tasks={todoTasks} />
      <SwimlaneLane
        title="In Progress"
        color="bg-blue-50"
        tasks={inProgressTasks}
      />
      <SwimlaneLane title="Done" color="bg-green-50" tasks={doneTasks} />
    </div>
  );
}
