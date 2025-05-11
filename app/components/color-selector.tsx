import { ColorSelectorItem } from "./color-selector-item";
import { Label } from "./ui/label";
import { RadioGroup } from "./ui/radio-group";

export function ColorSelector({
  selectedColor,
  setSelectedColor,
}: {
  selectedColor: string;
  setSelectedColor: (color: string) => void;
}) {
  return (
    <div className="space-y-2">
      <Label>Color</Label>
      <RadioGroup
        defaultValue="bg-white"
        name="color"
        className="grid grid-cols-6 gap-2"
        value={selectedColor}
        onValueChange={setSelectedColor}
      >
        <ColorSelectorItem color="bg-white" selectedColor={selectedColor} />
        <ColorSelectorItem color="bg-red-100" selectedColor={selectedColor} />
        <ColorSelectorItem
          color="bg-yellow-100"
          selectedColor={selectedColor}
        />
        <ColorSelectorItem color="bg-green-100" selectedColor={selectedColor} />
        <ColorSelectorItem color="bg-blue-100" selectedColor={selectedColor} />
        <ColorSelectorItem
          color="bg-purple-100"
          selectedColor={selectedColor}
        />
      </RadioGroup>
    </div>
  );
}
