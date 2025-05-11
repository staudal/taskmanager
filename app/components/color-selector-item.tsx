import { RadioGroupItem } from "./ui/radio-group";

interface ColorSelectorItemProps {
  selectedColor: string;
  color: string;
}

export function ColorSelectorItem({
  color,
  selectedColor,
}: ColorSelectorItemProps) {
  return (
    <div className="flex h-full w-full flex-col items-center space-y-1">
      <RadioGroupItem value={color} id={color} className="sr-only" />
      <label
        htmlFor={color}
        className={`h-28 w-full cursor-pointer rounded-lg border-2 ${color} ${
          selectedColor === color ? "border-black" : "border-gray-200"
        }`}
      >
        <span className="sr-only">Color: {color.replace("bg-", "")}</span>
      </label>
    </div>
  );
}
