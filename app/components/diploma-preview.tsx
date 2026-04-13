const DIPLOMA_SRC = "/diploma_Ingeniero_Flynn.jpg";

export default function DiplomaPreview() {
  return (
    <section className="w-full py-10">
      <h2 className="text-md sm:text-xl font-bold text-left text-gray-800 dark:text-gray-100 mb-6 select-none">
        engineering diploma (UBA)
      </h2>

      <div className="flex w-full flex-col gap-3">
        <a
          href={DIPLOMA_SRC}
          target="_blank"
          rel="noopener noreferrer"
          className="group block w-full origin-center motion-safe:transition-[transform,box-shadow] motion-safe:duration-300 motion-safe:ease-out motion-safe:hover:scale-[1.02] motion-reduce:hover:scale-100 rounded-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-800 dark:focus-visible:outline-neutral-200"
          aria-label="Open engineering diploma image"
        >
          <div className="w-full overflow-hidden rounded-xl border border-gray-200/70 dark:border-gray-700/70 bg-white shadow-md ring-1 ring-black/5 motion-safe:transition-shadow motion-safe:duration-300 motion-safe:group-hover:shadow-xl dark:bg-neutral-950 dark:ring-white/10">
            {/* Intrinsic aspect from the file; full width of parent */}
            <img
              src={DIPLOMA_SRC}
              alt="Engineering diploma"
              className="block h-auto w-full object-contain"
              loading="lazy"
              decoding="async"
            />
          </div>
        </a>
        <p className="text-xs text-neutral-500 dark:text-neutral-400">
          Click to open the full image.
        </p>
      </div>
    </section>
  );
}
