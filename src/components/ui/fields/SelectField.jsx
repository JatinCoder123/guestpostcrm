import { useMemo } from "react";
import { ChevronDown } from "lucide-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import useEditableField from "./hooks/useEditableField";

const normalizeValue = (value) => String(value ?? "").toLowerCase();

export default function SelectField(props) {
    const { field } = props;

    const {
        editing,
        editable,
        value,
        setValue,
        startEditing,
        cancelEditing,
        save,
    } = useEditableField(props);

    const options = useMemo(() => field?.options || [], [field?.options]);

    const selected = useMemo(() => {
        return (
            options.find(
                (option) => normalizeValue(option.value) === normalizeValue(value)
            ) || null
        );
    }, [options, value]);

    const badgeColor = (color) => {
        switch (color) {
            case "blue":
                return "bg-blue-100 text-blue-700";

            case "green":
                return "bg-green-100 text-green-700";

            case "yellow":
                return "bg-yellow-100 text-yellow-700";

            case "red":
                return "bg-red-100 text-red-700";

            case "purple":
                return "bg-purple-100 text-purple-700";

            case "gray":
            default:
                return "bg-gray-100 text-gray-700";
        }
    };

    if (editing) {
        const selectedValue = selected ? String(selected.value) : undefined;

        return (
            <Select
                value={selectedValue}
                defaultOpen
                onOpenChange={(open) => {
                    if (!open) save();
                }}
                onValueChange={(nextValue) => {
                    const option = options.find(
                        (item) => normalizeValue(item.value) === normalizeValue(nextValue)
                    );
                    const canonicalValue = option?.value ?? nextValue;

                    setValue(canonicalValue);
                    save(canonicalValue);
                }}
            >
                <SelectTrigger
                    autoFocus
                    className="h-8 border-blue-500 bg-white px-2 py-1"
                    onKeyDown={(event) => {
                        if (event.key === "Escape") cancelEditing();
                    }}
                >
                    <SelectValue placeholder="Select an option" />
                </SelectTrigger>
                <SelectContent onEscapeKeyDown={cancelEditing}>
                    {options.map((option) => (
                        <SelectItem
                            key={String(option.value)}
                            value={String(option.value)}
                        >
                            {option.label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        );
    }

    return (
        <div
            onDoubleClick={startEditing}
            className={`
                flex
                w-full
                items-center
                justify-between
                gap-2
                ${editable ? "cursor-pointer" : ""}
            `}
        >
            <span
                className={`
                    inline-flex
                    items-center
                    rounded-full
                    px-3
                    py-1
                    text-xs
                    font-medium
                    truncate
                    ${badgeColor(selected?.color)}
                `}
            >
                {selected?.label || "-"}
            </span>

            {editable && (
                <ChevronDown
                    size={14}
                    className="text-gray-400"
                />
            )}
        </div>
    );
}
