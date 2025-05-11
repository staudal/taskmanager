import { Form } from "@remix-run/react";
import type { RefObject } from "react";

import { ColorSelector } from "./color-selector";
import { FooterButtons } from "./footer-buttons";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";

interface TaskFormProps {
  method?: "post" | "get";
  titleRef: RefObject<HTMLInputElement>;
  bodyRef: RefObject<HTMLTextAreaElement>;
  errors?: {
    title?: string | null;
    body?: string | null;
    color?: string | null;
  };
  initialTitle?: string;
  initialBody?: string;
  selectedColor: string;
  setSelectedColor: (color: string) => void;
}

export function TaskForm({
  method = "post",
  titleRef,
  bodyRef,
  errors,
  initialTitle = "",
  initialBody = "",
  selectedColor,
  setSelectedColor,
}: TaskFormProps) {
  return (
    <Form method={method} className="flex w-full flex-col gap-4">
      <div className="space-y-2">
        <div className="flex flex-row items-center justify-between gap-2 leading-none">
          <Label htmlFor="title">Title</Label>
          {errors?.title ? (
            <Label className="text-red-700" id="title-error">
              {errors.title}
            </Label>
          ) : null}
        </div>
        <Input
          ref={titleRef}
          id="title"
          name="title"
          defaultValue={initialTitle}
          aria-invalid={errors?.title ? true : undefined}
          aria-errormessage={errors?.title ? "title-error" : undefined}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="body">Body</Label>
        <Textarea
          ref={bodyRef}
          id="body"
          name="body"
          rows={8}
          defaultValue={initialBody}
          aria-invalid={errors?.body ? true : undefined}
          aria-errormessage={errors?.body ? "body-error" : undefined}
        />
        {errors?.body ? (
          <div className="pt-1 text-sm text-red-700" id="body-error">
            {errors.body}
          </div>
        ) : null}
      </div>

      <ColorSelector
        selectedColor={selectedColor}
        setSelectedColor={setSelectedColor}
      />

      <FooterButtons />
    </Form>
  );
}
