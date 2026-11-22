import { useState } from "react";

interface PortraitAvatarProps {
  src?: string;
  name: string;
  sizeClass?: string;
}

export function PortraitAvatar({
  src,
  name,
  sizeClass = "h-14 w-14",
}: PortraitAvatarProps) {
  const [failed, setFailed] = useState(false);

  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

  if (!src || failed) {
    return (
      <div
        aria-label={name}
        className={`${sizeClass} flex shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-slate-100 font-display text-sm font-semibold text-slate-700`}
      >
        {initials || "OP"}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={`Portrait of ${name}`}
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className={`${sizeClass} shrink-0 rounded-lg border border-slate-200 object-cover bg-slate-100`}
    />
  );
}
