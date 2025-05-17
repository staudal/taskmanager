import { Form } from "@remix-run/react";
import { LogOutIcon } from "lucide-react";

import Logo from "./logo";
import { Button } from "./ui/button";

export function Header() {
  return (
    <div className="flex flex-row items-center justify-between gap-4">
      <Logo />
      <div className="flex flex-row items-center gap-4">
        <Form action="/logout" method="post">
          <Button
            variant={"secondary"}
            type="submit"
            className="flex items-center gap-2"
          >
            <LogOutIcon size={16} />
            <span>Log out</span>
          </Button>
        </Form>
      </div>
    </div>
  );
}
