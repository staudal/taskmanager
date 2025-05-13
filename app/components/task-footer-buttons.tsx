import { Form, Link } from "@remix-run/react";
import { Pencil, Share2, Trash } from "lucide-react";

import { Button } from "./ui/button";

interface TaskFooterButtonsProps {
  taskId: string;
  accessLevel?: string;
  canEdit?: boolean;
}

export function TaskFooterButtons({ taskId, accessLevel = "owner", canEdit = true }: TaskFooterButtonsProps) {
  // Only owner can edit, share and delete
  // Editor can edit but not share or delete
  // Viewer can only view
  const isOwner = accessLevel === "owner";
  
  return (
    <div className="flex gap-2">
      {canEdit && (
        <Button variant="outline" asChild>
          <Link to={`/tasks/${taskId}/edit`} className="flex items-center gap-2">
            <Pencil size={16} />
            <span>Edit</span>
          </Link>
        </Button>
      )}
      {isOwner && (
        <Button variant="outline" asChild>
          <Link to={`/tasks/${taskId}/share`} className="flex items-center gap-2">
            <Share2 size={16} />
            <span>Share</span>
          </Link>
        </Button>
      )}
      {isOwner && (
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
      )}
    </div>
  );
}
