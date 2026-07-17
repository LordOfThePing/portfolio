"use client";

import { useId, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { restrictToParentElement, restrictToVerticalAxis } from "@dnd-kit/modifiers";
import { CSS } from "@dnd-kit/utilities";
import type { LinkItem } from "app/links-config";
import type { LinksConfig } from "app/lib/links-store";
import { ICON_META } from "app/links/icons";
import { LINK_COLORS, LINK_COLOR_KEYS } from "app/links/colors";
import IconPicker from "./icon-picker";
import { resetConfig, saveConfig, type SaveState } from "../actions";

const field =
  "w-full rounded-lg border border-black/10 dark:border-white/10 bg-white dark:bg-white/[0.04] px-3 py-2 text-[16px] sm:text-sm text-black dark:text-white placeholder:text-neutral-400 outline-none focus:border-[#47a3f3]";
const labelText =
  "text-[11px] uppercase tracking-wide text-neutral-500 dark:text-neutral-400";

/**
 * Rows carry a `uid` that is never saved. Link ids are user-editable and can be
 * empty or duplicated mid-edit, so they can't identify a row — the drag list and
 * React keys need something stable, or reordering would scramble which card is
 * expanded.
 */
type Row = { uid: string; link: LinkItem; isNew: boolean };

let uidCounter = 0;
const nextUid = () => `row-${++uidCounter}`;

function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // strip accents: "Diseño" -> "diseno"
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 32);
}

/** Shows the shareable /links/<id> path with a copy button. */
function DirectLink({ id }: { id: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      const url =
        typeof window !== "undefined"
          ? `${window.location.origin}/links/${id}`
          : `/links/${id}`;
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard blocked (no HTTPS / permissions): the path is still visible to copy by hand.
    }
  };

  return (
    <div className="flex items-center gap-2 mt-1">
      <code className="flex-1 min-w-0 truncate rounded-lg border border-black/10 dark:border-white/10 bg-black/[0.03] dark:bg-white/[0.05] px-2.5 py-1.5 text-[12px] text-neutral-600 dark:text-neutral-300">
        /links/{id}
      </code>
      <button
        type="button"
        onClick={copy}
        className="flex-none text-[12px] rounded-lg border border-black/10 dark:border-white/10 px-2.5 py-1.5 text-neutral-600 dark:text-neutral-300 hover:bg-black/[0.04] dark:hover:bg-white/[0.08] transition-colors"
      >
        {copied ? "Copied ✓" : "Copy"}
      </button>
    </div>
  );
}

function LinkCard({
  row,
  onChange,
  onRemove,
}: {
  row: Row;
  onChange: (patch: Partial<LinkItem>) => void;
  onRemove: () => void;
}) {
  const [open, setOpen] = useState(row.isNew);
  const fieldId = useId();
  const { link, isNew } = row;
  const Icon = ICON_META[link.icon]?.Icon ?? ICON_META.globe.Icon;

  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: row.uid });

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={[
        "rounded-xl border bg-black/[0.02] dark:bg-white/[0.03]",
        isDragging
          ? "border-[#47a3f3] shadow-lg opacity-90 z-10 relative"
          : "border-black/10 dark:border-white/10",
      ].join(" ")}
    >
      <div className="flex items-center gap-1 p-2">
        <button
          ref={setActivatorNodeRef}
          type="button"
          aria-label={`Reorder ${link.label || "link"}`}
          // touch-action:none stops the browser scrolling the page instead of
          // starting the drag on touch devices.
          style={{ touchAction: "none" }}
          className="flex-none grid place-items-center w-8 h-10 rounded-lg text-neutral-400 dark:text-neutral-500 hover:bg-black/[0.05] dark:hover:bg-white/[0.08] hover:text-neutral-700 dark:hover:text-neutral-200 cursor-grab active:cursor-grabbing transition-colors"
          {...attributes}
          {...listeners}
        >
          <svg width="10" height="16" viewBox="0 0 10 16" aria-hidden="true">
            <g fill="currentColor">
              <circle cx="2" cy="2" r="1.5" />
              <circle cx="8" cy="2" r="1.5" />
              <circle cx="2" cy="8" r="1.5" />
              <circle cx="8" cy="8" r="1.5" />
              <circle cx="2" cy="14" r="1.5" />
              <circle cx="8" cy="14" r="1.5" />
            </g>
          </svg>
        </button>

        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          className="flex items-center gap-3 flex-1 min-w-0 text-left rounded-lg px-2 py-2 hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition-colors"
        >
          <span className="flex-none grid place-items-center w-8 h-8 rounded-lg bg-black/[0.05] dark:bg-white/[0.08] text-black dark:text-white">
            <Icon />
          </span>
          <span className="flex flex-col min-w-0">
            <span className="text-sm text-black dark:text-white truncate">
              {link.label || <span className="text-neutral-400">Untitled link</span>}
            </span>
            <span className="text-[11px] text-neutral-500 dark:text-neutral-400 truncate">
              {link.enabled === false ? "hidden · " : ""}
              {link.featured ? "featured · " : ""}
              {link.href || "no URL"}
            </span>
          </span>
          <span
            className="flex-none text-neutral-400 text-xs px-1"
            aria-hidden="true"
          >
            {open ? "▲" : "▼"}
          </span>
        </button>
      </div>

      {open && (
        <div className="flex flex-col gap-3 px-4 pb-4 pt-1 border-t border-black/5 dark:border-white/5">
          <div className="flex flex-col gap-1">
            <label className={labelText} htmlFor={`${fieldId}-label`}>
              Label
            </label>
            <input
              id={`${fieldId}-label`}
              className={field}
              value={link.label}
              placeholder="GitHub"
              onChange={(event) => {
                const label = event.target.value;
                // Keep the id in sync only for brand-new links: changing an id
                // that already has clicks would restart its counter at zero.
                onChange(isNew ? { label, id: slugify(label) } : { label });
              }}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className={labelText} htmlFor={`${fieldId}-desc`}>
              Description (optional)
            </label>
            <input
              id={`${fieldId}-desc`}
              className={field}
              value={link.description ?? ""}
              placeholder="Proyectos y código fuente"
              onChange={(event) => onChange({ description: event.target.value })}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className={labelText} htmlFor={`${fieldId}-href`}>
              URL
            </label>
            <input
              id={`${fieldId}-href`}
              className={field}
              value={link.href}
              inputMode="url"
              autoCapitalize="none"
              autoCorrect="off"
              placeholder="https://github.com/LordOfThePing"
              onChange={(event) => onChange({ href: event.target.value })}
            />
          </div>

          <div className="flex flex-col gap-1">
            <span className={labelText}>Icon</span>
            <IconPicker value={link.icon} onChange={(icon) => onChange({ icon })} />
          </div>

          <div className="flex flex-col gap-1.5">
            <span className={labelText}>Icon color</span>
            <div className="flex flex-wrap gap-2">
              {LINK_COLOR_KEYS.map((key) => {
                const { label, fg } = LINK_COLORS[key];
                const active = (link.color ?? "default") === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => onChange({ color: key === "default" ? undefined : key })}
                    title={label}
                    aria-label={label}
                    aria-pressed={active}
                    className={[
                      "w-8 h-8 rounded-lg border grid place-items-center transition-transform",
                      active
                        ? "ring-2 ring-offset-1 ring-black/40 dark:ring-white/50 ring-offset-white dark:ring-offset-[#121212] scale-105"
                        : "hover:scale-105",
                      fg ? "" : "border-black/15 dark:border-white/20",
                    ].join(" ")}
                    style={
                      fg
                        ? { backgroundColor: `${fg}24`, color: fg, borderColor: `${fg}55` }
                        : undefined
                    }
                  >
                    {fg ? (
                      <span
                        className="w-3.5 h-3.5 rounded-full"
                        style={{ backgroundColor: fg }}
                      />
                    ) : (
                      <span className="text-[10px] text-neutral-500 dark:text-neutral-400">
                        —
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className={labelText} htmlFor={`${fieldId}-id`}>
              Button id {!isNew && "— changing this resets clicks & breaks shared links"}
            </label>
            <input
              id={`${fieldId}-id`}
              className={`${field} font-mono text-[13px]`}
              value={link.id}
              autoCapitalize="none"
              autoCorrect="off"
              onChange={(event) => onChange({ id: event.target.value })}
            />
            {link.id && <DirectLink id={link.id} />}
          </div>

          <div className="flex flex-wrap items-center gap-4 pt-1">
            <label className="flex items-center gap-2 text-sm text-neutral-700 dark:text-neutral-300">
              <input
                type="checkbox"
                checked={link.enabled !== false}
                onChange={(event) => onChange({ enabled: event.target.checked })}
                className="w-4 h-4 accent-[#47a3f3]"
              />
              Visible
            </label>
            <label className="flex items-center gap-2 text-sm text-neutral-700 dark:text-neutral-300">
              <input
                type="checkbox"
                checked={link.featured === true}
                onChange={(event) => onChange({ featured: event.target.checked })}
                className="w-4 h-4 accent-[#47a3f3]"
              />
              Featured
            </label>

            <button
              type="button"
              onClick={onRemove}
              className="ml-auto text-sm rounded-lg border border-red-500/30 text-red-600 dark:text-red-400 px-3 py-2 hover:bg-red-500/10 transition-colors"
            >
              Delete
            </button>
          </div>
        </div>
      )}
    </li>
  );
}

export default function ConfigEditor({
  initialConfig,
}: {
  initialConfig: LinksConfig;
}) {
  const router = useRouter();
  const [profile, setProfile] = useState(initialConfig.profile);
  const [rows, setRows] = useState<Row[]>(() =>
    initialConfig.links.map((link) => ({ uid: nextUid(), link, isNew: false })),
  );
  const [state, setState] = useState<SaveState>({});
  const [dirty, setDirty] = useState(false);
  const [pending, startTransition] = useTransition();

  const sensors = useSensors(
    // A small distance threshold means a tap still counts as a tap: the drag
    // only starts once the pointer actually moves.
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const touched = () => {
    setDirty(true);
    setState({});
  };

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return;
    setRows((current) => {
      const from = current.findIndex((row) => row.uid === active.id);
      const to = current.findIndex((row) => row.uid === over.id);
      if (from === -1 || to === -1) return current;
      return arrayMove(current, from, to);
    });
    touched();
  };

  const patchLink = (uid: string, patch: Partial<LinkItem>) => {
    setRows((current) =>
      current.map((row) =>
        row.uid === uid ? { ...row, link: { ...row.link, ...patch } } : row,
      ),
    );
    touched();
  };

  const removeLink = (uid: string) => {
    const row = rows.find((item) => item.uid === uid);
    const label = row?.link.label || "this link";
    if (!confirm(`Delete "${label}"? Its click stats stay in the dashboard.`)) return;
    setRows((current) => current.filter((item) => item.uid !== uid));
    touched();
  };

  const addLink = () => {
    setRows((current) => [
      ...current,
      {
        uid: nextUid(),
        isNew: true,
        link: { id: "", label: "", href: "", icon: "globe", enabled: true },
      },
    ]);
    touched();
  };

  const updateProfile = (patch: Partial<typeof profile>) => {
    setProfile((current) => ({ ...current, ...patch }));
    touched();
  };

  const finish = (result: SaveState) => {
    setState(result);
    if (!result.errors?.length) {
      setDirty(false);
      setRows((current) => current.map((row) => ({ ...row, isNew: false })));
      router.refresh();
    }
  };

  const save = () => {
    startTransition(async () => {
      finish(await saveConfig({ profile, links: rows.map((row) => row.link) }));
    });
  };

  const reset = () => {
    if (
      !confirm(
        "Reset to the defaults in links-config.ts? Your saved links will be replaced. Click stats are kept.",
      )
    )
      return;

    startTransition(async () => {
      const result = await resetConfig();
      setState(result);
      if (!result.errors?.length) {
        setDirty(false);
        router.refresh();
      }
    });
  };

  const saved = Boolean(state.savedAt) && !dirty;

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-xl font-medium text-black dark:text-white">
          Linktree config
        </h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
          Edits go live on <span className="font-mono">/links</span> as soon as
          you save.
        </p>
      </div>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-medium text-black dark:text-white">Profile</h2>

        <div className="flex flex-col gap-1">
          <label className={labelText} htmlFor="profile-name">
            Name
          </label>
          <input
            id="profile-name"
            className={field}
            value={profile.name}
            onChange={(event) => updateProfile({ name: event.target.value })}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className={labelText} htmlFor="profile-handle">
            Handle
          </label>
          <input
            id="profile-handle"
            className={field}
            value={profile.handle}
            placeholder="@pepeflynn"
            onChange={(event) => updateProfile({ handle: event.target.value })}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className={labelText} htmlFor="profile-bio">
            Bio
          </label>
          <textarea
            id="profile-bio"
            rows={3}
            className={`${field} resize-y`}
            value={profile.bio}
            onChange={(event) => updateProfile({ bio: event.target.value })}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className={labelText} htmlFor="profile-avatar">
            Avatar path or URL
          </label>
          <input
            id="profile-avatar"
            className={`${field} font-mono text-[13px]`}
            value={profile.avatar}
            autoCapitalize="none"
            autoCorrect="off"
            placeholder="/fotocv.jpg"
            onChange={(event) => updateProfile({ avatar: event.target.value })}
          />
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium text-black dark:text-white">
            Links{" "}
            <span className="text-neutral-500 dark:text-neutral-400 font-normal">
              ({rows.length})
            </span>
          </h2>
          <button
            type="button"
            onClick={addLink}
            className="text-sm rounded-lg border border-black/10 dark:border-white/10 px-3 py-2 text-black dark:text-white hover:bg-black/[0.04] dark:hover:bg-white/[0.08] transition-colors"
          >
            + Add link
          </button>
        </div>

        {rows.length === 0 ? (
          <p className="text-sm text-neutral-500 dark:text-neutral-400 rounded-xl border border-black/10 dark:border-white/10 p-4">
            No links yet. Add one, or reset to the defaults below.
          </p>
        ) : (
          <>
            <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
              Drag the handle to reorder. Order here is the order on /links.
            </p>
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              modifiers={[restrictToVerticalAxis, restrictToParentElement]}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={rows.map((row) => row.uid)}
                strategy={verticalListSortingStrategy}
              >
                <ul className="flex flex-col gap-2">
                  {rows.map((row) => (
                    <LinkCard
                      key={row.uid}
                      row={row}
                      onChange={(patch) => patchLink(row.uid, patch)}
                      onRemove={() => removeLink(row.uid)}
                    />
                  ))}
                </ul>
              </SortableContext>
            </DndContext>
          </>
        )}
      </section>

      {state.errors?.length ? (
        <ul className="flex flex-col gap-1 rounded-xl border border-red-500/40 bg-red-500/[0.06] p-4">
          {state.errors.map((error) => (
            <li key={error} className="text-sm text-red-600 dark:text-red-400">
              {error}
            </li>
          ))}
        </ul>
      ) : null}

      <div className="sticky bottom-0 flex items-center gap-3 py-4 bg-white dark:bg-[#121212] border-t border-black/10 dark:border-white/10">
        <button
          type="button"
          onClick={save}
          disabled={pending || !dirty}
          className="rounded-xl bg-black dark:bg-white text-white dark:text-black font-medium px-5 py-3 min-h-[48px] transition-opacity hover:opacity-85 active:scale-[0.98] disabled:opacity-40"
        >
          {pending ? "Saving…" : dirty ? "Save changes" : saved ? "Saved ✓" : "Saved"}
        </button>

        <a
          href="/links"
          target="_blank"
          rel="noreferrer"
          className="text-sm text-neutral-600 dark:text-neutral-300 underline underline-offset-4"
        >
          View /links
        </a>

        <button
          type="button"
          onClick={reset}
          disabled={pending}
          className="ml-auto text-sm text-neutral-500 dark:text-neutral-400 hover:text-red-600 dark:hover:text-red-400 transition-colors disabled:opacity-40"
        >
          Reset to defaults
        </button>
      </div>
    </div>
  );
}
