import { Link } from "@remix-run/react";
import { GalleryVerticalEnd } from "lucide-react";

export default function Logo() {
  return (
    <Link to="/" className="flex items-center gap-3 self-center font-medium">
      <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
        <GalleryVerticalEnd className="size-4" />
      </div>
      <span className="text-xl">Task Manager</span>
    </Link>
  );
}
