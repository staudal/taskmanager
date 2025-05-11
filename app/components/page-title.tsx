import { ArrowLeft } from "lucide-react";

import { Button } from "./ui/button";

export function PageTitle({
  title,
  backButton,
}: {
  title: string;
  backButton?: boolean;
}) {
  return (
    <div className="flex items-center gap-2">
      {backButton ? (
        <Button
          variant="ghost"
          size="icon"
          aria-label="Back"
          onClick={() => window.history.back()}
        >
          <ArrowLeft size={18} />
        </Button>
      ) : null}
      <h2 className="text-lg font-medium">{title}</h2>
    </div>
  );
}
