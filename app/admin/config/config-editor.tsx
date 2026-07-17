"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { LinkIcon, LinkItem } from "app/links-config";
import type { LinksConfig } from "app/lib/links-store";
import { ICONS } from "app/links/icons";
import { resetConfig, saveConfig, type SaveState } from "../actions";

const ICON_KEYS = Object.keys(ICONS) as LinkIcon[];

const field =
  "w-full rounded-lg border border-black/10 dark:border-white/10 bg-white dark:bg-white/[0.04] px-3 py-2 text-[16px] sm:text-sm text-black dark:text-white placeholder:text-neutral-400 outline-none focus:border-[#47a3f3]";
const labelText = "text-[11px] uppercase tracking-wide text-neutral-500 dark:text-neutral-400";
const iconBtn =
  "grid place-items-center w-9 h-9 rounded-lg border border-black/10 dark:border-white/10 text-neutral-600 dark:text-neutral-300 hover:bg-black/[0.04] dark:hover:bg-white/[0.08] disabled:opacity-30 disabled:cursor-not-allowed transition-colors";

/** Suggests an id from the label, but only for links that don't have stats yet. */
function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // strip accents: "Diseño" -> "diseno"
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 32);
}

function LinkCard({
  link,
  index,
  total,
  isNew,
  onChange,
  onMove,
  onRemove,
}: {
  link: LinkItem;
  index: number;
  total: number;
  isNew: boolean;
  onChange: (patch: Partial<LinkItem>) => void;
  onMove: (delta: number) => void;
  onRemove: () => void;
}) {
  const [open, setOpen] = useState(isNew);
  const Icon = ICONS[link.icon] ?? ICONS.globe;

  return (
    <li className="rounded-xl border border-black/10 dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.03]">
      <div className="flex items-center gap-2 p-2">
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
        </button>

        <div className="flex flex-none gap-1">
          <button
            type="button"
            onClick={() => onMove(-1)}
            disabled={index === 0}
            aria-label={`Move ${link.label || "link"} up`}
            className={iconBtn}
          >
            ↑
          </button>
          <button
            type="button"
            onClick={() => onMove(1)}
            disabled={index === total - 1}
            aria-label={`Move ${link.label || "link"} down`}
            className={iconBtn}
          >
            ↓
          </button>
        </div>
      </div>

      {open && (
        <div className="flex flex-col gap-3 px-4 pb-4 pt-1 border-t border-black/5 dark:border-white/5">
          <div className="flex flex-col gap-1">
            <label className={labelText} htmlFor={`label-${link.id}`}>
              Label
            </label>
            <input
              id={`label-${link.id}`}
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
            <label className={labelText} htmlFor={`desc-${link.id}`}>
              Description (optional)
            </label>
            <input
              id={`desc-${link.id}`}
              className={field}
              value={link.description ?? ""}
              placeholder="Projects and source code"
              onChange={(event) => onChange({ description: event.target.value })}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className={labelText} htmlFor={`href-${link.id}`}>
              URL
            </label>
            <input
              id={`href-${link.id}`}
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
            <div className="flex flex-wrap gap-2">
              {ICON_KEYS.map((key) => {
                const Option = ICONS[key];
                const active = link.icon === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => onChange({ icon: key })}
                    aria-label={key}
                    aria-pressed={active}
                    className={[
                      "grid place-items-center w-10 h-10 rounded-lg border transition-colors",
                      active
                        ? "border-[#47a3f3] bg-[#47a3f3]/10 text-[#47a3f3]"
                        : "border-black/10 dark:border-white/10 text-neutral-600 dark:text-neutral-300 hover:bg-black/[0.04] dark:hover:bg-white/[0.08]",
                    ].join(" ")}
                  >
                    <Option />
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className={labelText} htmlFor={`id-${link.id}`}>
              Stats id {!isNew && "— changing this resets its click count"}
            </label>
            <input
              id={`id-${link.id}`}
              className={`${field} font-mono text-[13px]`}
              value={link.id}
              autoCapitalize="none"
              autoCorrect="off"
              onChange={(event) => onChange({ id: event.target.value })}
            />
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
  const [config, setConfig] = useState<LinksConfig>(initialConfig);
  const [newIds, setNewIds] = useState<string[]>([]);
  const [state, setState] = useState<SaveState>({});
  const [dirty, setDirty] = useState(false);
  const [pending, startTransition] = useTransition();

  const update = (next: LinksConfig) => {
    setConfig(next);
    setDirty(true);
    setState({});
  };

  const patchLink = (index: number, patch: Partial<LinkItem>) => {
    const links = config.links.map((link, i) =>
      i === index ? { ...link, ...patch } : link,
    );
    update({ ...config, links });
  };

  const moveLink = (index: number, delta: number) => {
    const target = index + delta;
    if (target < 0 || target >= config.links.length) return;
    const links = [...config.links];
    [links[index], links[target]] = [links[target], links[index]];
    update({ ...config, links });
  };

  const removeLink = (index: number) => {
    const link = config.links[index];
    const label = link.label || "this link";
    if (!confirm(`Delete "${label}"? Its click stats stay in the dashboard.`)) return;
    update({ ...config, links: config.links.filter((_, i) => i !== index) });
  };

  const addLink = () => {
    const id = `link-${Date.now().toString(36)}`;
    const link: LinkItem = {
      id,
      label: "",
      href: "",
      icon: "globe",
      enabled: true,
    };
    setNewIds((ids) => [...ids, id]);
    update({ ...config, links: [...config.links, link] });
  };

  const save = () => {
    startTransition(async () => {
      const result = await saveConfig(config);
      setState(result);
      if (!result.errors?.length) {
        setDirty(false);
        setNewIds([]);
        router.refresh();
      }
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
        setNewIds([]);
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
            value={config.profile.name}
            onChange={(event) =>
              update({
                ...config,
                profile: { ...config.profile, name: event.target.value },
              })
            }
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className={labelText} htmlFor="profile-handle">
            Handle
          </label>
          <input
            id="profile-handle"
            className={field}
            value={config.profile.handle}
            placeholder="@pepeflynn"
            onChange={(event) =>
              update({
                ...config,
                profile: { ...config.profile, handle: event.target.value },
              })
            }
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
            value={config.profile.bio}
            onChange={(event) =>
              update({
                ...config,
                profile: { ...config.profile, bio: event.target.value },
              })
            }
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className={labelText} htmlFor="profile-avatar">
            Avatar path or URL
          </label>
          <input
            id="profile-avatar"
            className={`${field} font-mono text-[13px]`}
            value={config.profile.avatar}
            autoCapitalize="none"
            autoCorrect="off"
            placeholder="/fotocv.jpg"
            onChange={(event) =>
              update({
                ...config,
                profile: { ...config.profile, avatar: event.target.value },
              })
            }
          />
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium text-black dark:text-white">
            Links{" "}
            <span className="text-neutral-500 dark:text-neutral-400 font-normal">
              ({config.links.length})
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

        {config.links.length === 0 ? (
          <p className="text-sm text-neutral-500 dark:text-neutral-400 rounded-xl border border-black/10 dark:border-white/10 p-4">
            No links yet. Add one, or reset to the defaults below.
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {config.links.map((link, index) => (
              <LinkCard
                key={index}
                link={link}
                index={index}
                total={config.links.length}
                isNew={newIds.includes(link.id)}
                onChange={(patch) => patchLink(index, patch)}
                onMove={(delta) => moveLink(index, delta)}
                onRemove={() => removeLink(index)}
              />
            ))}
          </ul>
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
