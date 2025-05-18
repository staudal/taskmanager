import { useLocation, useNavigate } from "@remix-run/react";
import { ArrowLeft } from "lucide-react";

import { Button } from "./ui/button";

export function PageTitle({
  title,
  backButton,
  taskId,
}: {
  title: string;
  backButton?: boolean;
  taskId: string;
}) {
  const navigate = useNavigate();
  const pathname = useLocation().pathname;

  const handleClickBack = () => {
    if (pathname.includes("/edit") || pathname.includes("/share")) {
      navigate(`/tasks/${taskId}`);
    } else {
      navigate("/tasks");
    }
  };

  return (
    <div className="flex items-center gap-2">
      {backButton ? (
        <Button
          variant="ghost"
          size="icon"
          aria-label="Back"
          onClick={handleClickBack}
        >
          <ArrowLeft size={18} />
        </Button>
      ) : null}
      <h2 className="text-lg font-medium">{title}</h2>
    </div>
  );
}
