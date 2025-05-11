import { Form, Link } from "@remix-run/react";
import { Pencil, Trash } from "lucide-react";

import { Button } from "./ui/button";

interface TaskFooterButtonsProps {
  taskId: string;
}

export function TaskFooterButtons({ taskId }: TaskFooterButtonsProps) {
  return (
    <div className="flex gap-2">
      <Button variant="outline" asChild>
        <Link to={`/tasks/${taskId}/edit`} className="flex items-center gap-2">
          <Pencil size={16} />
          <span>Edit</span>
        </Link>
      </Button>
      <Form method="post">
        <input type="hidden" name="intent" value="delete" />
        <Button
          type="submit"
          variant="destructive"
          className="flex items-center gap-2"
        >
          <Trash size={16} />
          <span>Delete Task</span>
        </Button>
      </Form>
    </div>
  );
}
