import { Search } from "lucide-react";

export function SearchConversations({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="px-3 pb-2">
      <div className="flex items-center gap-2 rounded-lg bg-muted px-2.5 py-1.5">
        <Search size={14} className="text-muted-foreground" />
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Search chats"
          className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground"
        />
      </div>
    </div>
  );
}
