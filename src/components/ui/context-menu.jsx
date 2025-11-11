import {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubTrigger,
  ContextMenuSubContent,
  ContextMenuCheckboxItem,
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
} from "./ContextMenu";

export default function ExampleContextMenu() {
  const [checked, setChecked] = React.useState(true);
  const [theme, setTheme] = React.useState("light");

  return (
    <ContextMenu>
      <ContextMenuTrigger className="w-64 h-32 border flex items-center justify-center">
        Right-click here 👇
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem onSelect={() => alert("New File")}>
          New File
        </ContextMenuItem>
        <ContextMenuItem onSelect={() => alert("Open...")}>
          Open...
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuSub>
          <ContextMenuSubTrigger>Share →</ContextMenuSubTrigger>
          <ContextMenuSubContent>
            <ContextMenuItem>Email</ContextMenuItem>
            <ContextMenuItem>Twitter</ContextMenuItem>
          </ContextMenuSubContent>
        </ContextMenuSub>
        <ContextMenuSeparator />
        <ContextMenuCheckboxItem checked={checked} onCheckedChange={setChecked}>
          Show Status Bar
        </ContextMenuCheckboxItem>
        <ContextMenuSeparator />
        <ContextMenuLabel>Theme</ContextMenuLabel>
        <ContextMenuRadioGroup value={theme} onValueChange={setTheme}>
          <ContextMenuRadioItem value="light">Light</ContextMenuRadioItem>
          <ContextMenuRadioItem value="dark">Dark</ContextMenuRadioItem>
        </ContextMenuRadioGroup>
      </ContextMenuContent>
    </ContextMenu>
  );
}
