"use client";

import { useMemo, useState } from "react";
import { ICON_META, type IconGroup } from "app/links/icons";
import { ICON_NAMES, type LinkIcon } from "app/links/icon-names";

const GROUPS: IconGroup[] = [
  "General",
  "Social",
  "Video & audio",
  "Writing",
  "Dev",
  "Design",
  "Money",
  "Gaming",
];

type Entry = { name: LinkIcon; haystack: string; group: IconGroup };

/** Built once for all pickers: name + keywords + group, lowercased for search. */
const ENTRIES: Entry[] = ICON_NAMES.map((name) => {
  const meta = ICON_META[name];
  return {
    name,
    group: meta.group,
    haystack: `${name} ${meta.keywords ?? ""} ${meta.group}`.toLowerCase(),
  };
});

export default function IconPicker({
  value,
  onChange,
}: {
  value: LinkIcon;
  onChange: (icon: LinkIcon) => void;
}) {
  const [query, setQuery] = useState("");
  const [group, setGroup] = useState<IconGroup | "All">("All");

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return ENTRIES.filter(
      (entry) =>
        (group === "All" || entry.group === group) &&
        (q === "" || entry.haystack.includes(q)),
    );
  }, [query, group]);

  const Selected = ICON_META[value]?.Icon ?? ICON_META.globe.Icon;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <span className="grid place-items-center w-9 h-9 flex-none rounded-lg border border-[#47a3f3] bg-[#47a3f3]/10 text-[#47a3f3]">
          <Selected />
        </span>
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={`Search ${ICON_NAMES.length} icons — try "cafe", "chess", "music"`}
          autoCapitalize="none"
          autoCorrect="off"
          className="w-full rounded-lg border border-black/10 dark:border-white/10 bg-white dark:bg-white/[0.04] px-3 py-2 text-[16px] sm:text-sm text-black dark:text-white placeholder:text-neutral-400 outline-none focus:border-[#47a3f3]"
        />
      </div>

      <div className="flex gap-1 overflow-x-auto pb-1 -mx-1 px-1">
        {(["All", ...GROUPS] as const).map((name) => (
          <button
            key={name}
            type="button"
            onClick={() => setGroup(name)}
            className={[
              "flex-none rounded-full px-2.5 py-1 text-[11px] border transition-colors",
              group === name
                ? "border-black dark:border-white bg-black dark:bg-white text-white dark:text-black"
                : "border-black/10 dark:border-white/10 text-neutral-600 dark:text-neutral-300 hover:bg-black/[0.04] dark:hover:bg-white/[0.08]",
            ].join(" ")}
          >
            {name}
          </button>
        ))}
      </div>

      {results.length === 0 ? (
        <p className="text-[13px] text-neutral-500 dark:text-neutral-400 py-3">
          No icon matches “{query}”.
        </p>
      ) : (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(40px,1fr))] gap-1.5 max-h-[184px] overflow-y-auto rounded-lg border border-black/5 dark:border-white/5 p-2">
          {results.map(({ name }) => {
            const { Icon } = ICON_META[name];
            const active = value === name;
            return (
              <button
                key={name}
                type="button"
                onClick={() => onChange(name)}
                title={name}
                aria-label={name}
                aria-pressed={active}
                className={[
                  "grid place-items-center aspect-square rounded-lg border transition-colors",
                  active
                    ? "border-[#47a3f3] bg-[#47a3f3]/10 text-[#47a3f3]"
                    : "border-transparent text-neutral-600 dark:text-neutral-300 hover:bg-black/[0.05] dark:hover:bg-white/[0.08]",
                ].join(" ")}
              >
                <Icon />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
