import * as LucideIcons from "lucide-react";

export default function Icon({
    name,
    size = 20,
    color,
    strokeWidth = 2,
    className = "",
    fallback = null,
    ...props
}) {
    const LucideIcon = LucideIcons[name];
    console.log("NAME", name)

    if (!LucideIcon) {
        console.warn(`Lucide icon "${name}" not found.`);
        return fallback;
    }

    return (
        <LucideIcon
            size={size}
            color={color}
            strokeWidth={strokeWidth}
            className={className}
            {...props}
        />
    );
}