export function TypingIndicator() {
  return (
    <div className="flex gap-1 py-1">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="inline-block h-1.5 w-1.5 rounded-full bg-muted-foreground"
          style={{ animation: `apz-bounce 1.1s ${i * 0.15}s infinite ease-in-out` }}
        />
      ))}
      <style>{`@keyframes apz-bounce {0%,80%,100%{transform:scale(.6);opacity:.4} 40%{transform:scale(1);opacity:1}}`}</style>
    </div>
  );
}
