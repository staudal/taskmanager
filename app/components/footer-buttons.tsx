import { Link } from "@remix-run/react";
import { X, Save } from "lucide-react";

import { Button } from "./ui/button";

export function FooterButtons() {
  return (
    <div className="flex justify-end gap-2">
      <Button variant="outline" type="button" asChild>
        <Link className="flex items-center gap-2" to="/tasks">
          <X size={16} />
          <span>Cancel</span>
        </Link>
      </Button>
      <Button type="submit">
        <span>Save</span>
        <Save size={16} />
      </Button>
    </div>
  );
}
