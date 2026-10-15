import Link from "next/link";

import Image from "next/image";
import localFont from "next/font/local";

const bodyFont = localFont({ src: "./fonts/Inter_400Regular.ttf", display: "swap" });
const titleFont = localFont({ src: "./fonts/BarlowCondensed_800ExtraBold.ttf", weight: "800", display: "swap" });

type LegalSection = {
  title: string;
  body: string[];
};

type LegalPageProps = {
  title: string;
  updatedAt: string;
  sections: LegalSection[];
  locale?: "nl" | "en";
};

export function LegalPage({ title, updatedAt, sections, locale = "en" }: LegalPageProps) {
  return (
    <div lang={locale} className={`${bodyFont.className} min-h-screen bg-white text-[#171717]`}>

      <main className="mx-auto max-w-3xl px-6 pb-20 pt-16 sm:px-8 lg:px-10">
        <Link
          href="/"
          className="inline-flex min-h-11 items-center text-sm underline underline-offset-4"
        >
          {locale === "nl" ? "Terug naar home" : "Back to home"}
        </Link>

        <div className="mt-8">
          <div aria-label="MyMuscle by Apphletes" className="mb-8">
            <p className={`${titleFont.className} text-5xl leading-none`}>MYMUSCLE</p>
            <div className="mt-2 flex items-center gap-1.5 text-xs text-[#595959]">
              <span>by</span><Image src="/branding/apphletes-logo.svg" alt="Apphletes" width={83} height={20} />
            </div>
          </div>
          <h1 className={`${titleFont.className} mt-4 text-4xl sm:text-5xl`}>
            {title}
          </h1>
          <p className="mt-4 text-sm text-[#595959]">{locale === "nl" ? "Bijgewerkt:" : "Last updated"} {updatedAt}</p>
          <Link href="/delete-account" className="mt-5 inline-flex min-h-11 items-center text-sm underline underline-offset-4">{locale === "nl" ? "Account en gegevens laten verwijderen" : "Request account and data deletion"}</Link>

          <div className="mt-10 space-y-8">
            {sections.map((section) => (
              <section key={section.title}>
                <h2 className={`${titleFont.className} text-2xl sm:text-3xl`}>
                  {section.title}
                </h2>
                <div className="mt-3 space-y-3 text-sm leading-7 text-[#595959] sm:text-base">
                  {section.body.map((paragraph, index) => (
                    <p key={`${section.title}-${index}`}>{paragraph}</p>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
