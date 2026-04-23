type SectionHeadingProps = {
  eyebrow: string;
  title: string;
  description: string;
  align?: "left" | "center";
};

const alignmentClasses = {
  left: "items-start text-left",
  center: "items-center text-center",
};

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
}: SectionHeadingProps) {
  return (
    <div className={`mx-auto flex max-w-3xl flex-col gap-4 ${alignmentClasses[align]}`}>
      <span className="inline-flex rounded-full border border-sky-400/20 bg-sky-400/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.28em] text-sky-100/85">
        {eyebrow}
      </span>
      <h2 className="font-display text-balance text-3xl font-semibold text-white sm:text-4xl lg:text-5xl">
        {title}
      </h2>
      <p className="max-w-2xl text-base leading-8 text-slate-300 sm:text-lg">
        {description}
      </p>
    </div>
  );
}
