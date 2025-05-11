import { Form } from "@remix-run/react";
import { ArrowLeft, ArrowRight } from "lucide-react";

import { Button } from "./ui/button";

export function StatusActions({ status }: { status: string }) {
  if (status === "todo") {
    return (
      <Form method="post">
        <input type="hidden" name="intent" value="update-status" />
        <input type="hidden" name="status" value="in_progress" />
        <Button
          type="submit"
          variant="outline"
          className="flex items-center gap-2"
        >
          <span>Move to In Progress</span>
          <ArrowRight size={16} />
        </Button>
      </Form>
    );
  }
  if (status === "in_progress") {
    return (
      <div className="flex gap-2">
        <Form method="post">
          <input type="hidden" name="intent" value="update-status" />
          <input type="hidden" name="status" value="todo" />
          <Button
            type="submit"
            variant="outline"
            className="flex items-center gap-2"
          >
            <ArrowLeft size={16} />
            <span>Move to Todo</span>
          </Button>
        </Form>
        <Form method="post">
          <input type="hidden" name="intent" value="update-status" />
          <input type="hidden" name="status" value="done" />
          <Button
            type="submit"
            variant="outline"
            className="flex items-center gap-2"
          >
            <span>Move to Done</span>
            <ArrowRight size={16} />
          </Button>
        </Form>
      </div>
    );
  }
  if (status === "done") {
    return (
      <Form method="post">
        <input type="hidden" name="intent" value="update-status" />
        <input type="hidden" name="status" value="in_progress" />
        <Button
          type="submit"
          variant="outline"
          className="flex items-center gap-2"
        >
          <ArrowLeft size={16} />
          <span>Move to In Progress</span>
        </Button>
      </Form>
    );
  }
  return null;
}
