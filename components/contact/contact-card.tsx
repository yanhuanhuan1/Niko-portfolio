"use client";

import { Mail } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic";
import type { ReactNode } from "react";

import { ContactCardCtas } from "./contact-card-ctas";
import { siteContent, t } from "@/content/site-content";
import { useIsMobile } from "@/hooks/useIsMobile";
import { useLanguage } from "@/lib/language";
import { FadeIn } from "@/components/ui/motion-primitives";
import type { ShaderFlowProps } from "../shaders/shader-flow";

const ShaderFlow = dynamic<ShaderFlowProps>(
  () => import("../shaders/shader-flow").then((mod) => mod.ShaderFlow),
  {
    ssr: false,
    loading: () => null,
  }
);

const CARD_FADE_MASK =
  "radial-gradient(ellipse 90% 110% at 50% 50%, rgba(0,0,0,1) 0%, rgba(0,0,0,0.92) 40%, rgba(0,0,0,0.7) 70%, rgba(0,0,0,0.4) 90%, rgba(0,0,0,0.15) 100%)";

type ContactCardProps = {
  secondaryLabel?: string;
  secondaryHref?: string;
  descriptionOverride?: string;
};

type SocialItem = {
  key: "mail" | "linkedin" | "x";
  href: string;
  label: {
    zh: string;
    en: string;
  };
  imageSrc?: string;
};

export function ContactCard({
  secondaryLabel,
  secondaryHref = "/projects",
  descriptionOverride,
}: ContactCardProps = {}): ReactNode {
  const { language } = useLanguage();
  const isMobile = useIsMobile(768);
  const contact = siteContent.contact;
  const resolvedTitle = t(contact.heading, language);
  const resolvedCopy = descriptionOverride ?? t(contact.description, language);
  const resolvedSecondaryLabel =
    secondaryLabel ??
    t(
      secondaryHref === "/" ? contact.secondary.home : contact.secondary.projects,
      language
    );
  const socials = contact.socials as readonly SocialItem[];

  return (
    <section className="mx-auto my-12 w-full max-w-275 px-6 sm:my-20 sm:px-10">
      <FadeIn>
        <div className="relative w-full overflow-hidden rounded-4xl border border-foreground/8 bg-background p-1.5 shadow-sm">
          <div className="relative w-full overflow-hidden rounded-[1.6rem]">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 opacity-45 dark:opacity-25"
              style={{
                WebkitMaskImage: CARD_FADE_MASK,
                maskImage: CARD_FADE_MASK,
              }}
            >
              {!isMobile ? <ShaderFlow scale={3} brightness={3} /> : null}
            </div>

            <div className="relative grid gap-8 p-6 sm:gap-10 sm:p-7 md:grid-cols-[1.2fr_1fr] md:items-stretch md:gap-6 md:p-6">
              <div className="flex flex-col gap-5">
                <h2 className="font-serif text-[2.25rem] font-medium leading-[1.05] tracking-tight text-foreground sm:text-[2.75rem] lg:text-[3.25rem]">
                  {resolvedTitle}
                </h2>
                <p className="mb-6 max-w-[29ch] text-[18px] leading-[1.4] tracking-tight text-foreground/65 sm:text-[22px]">
                  {resolvedCopy}
                </p>
                <ContactCardCtas
                  secondaryLabel={resolvedSecondaryLabel}
                  secondaryHref={secondaryHref}
                />
              </div>

              <div className="border-foreground/8 flex flex-col items-center justify-center gap-6 rounded-[1.1rem] border bg-background p-6 sm:p-8">
                <div className="flex items-center gap-3 opacity-75">
                  {socials.map((social) => (
                    <SocialIcon
                      key={social.key}
                      href={social.href}
                      label={t(social.label, language)}
                      lucideIcon={social.key === "mail" ? Mail : undefined}
                      imageSrc={social.imageSrc}
                    />
                  ))}
                </div>
                <div className="flex flex-col items-center gap-1 text-center">
                  <p className="text-[13px] tracking-tight text-foreground/70">
                    {t(contact.footer.built, language)}
                  </p>
                  <p className="text-[12px] tracking-tight text-foreground/45">
                    {t(contact.footer.credit, language)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </FadeIn>
    </section>
  );
}

function SocialIcon({
  href,
  label,
  lucideIcon: LucideIcon,
  imageSrc,
}: {
  href: string;
  label: string;
  lucideIcon?: typeof Mail | undefined;
  imageSrc?: string | undefined;
}): ReactNode {
  const isExternal = href.startsWith("http");
  const props = isExternal
    ? { target: "_blank", rel: "noopener noreferrer" }
    : {};
  return (
    <Link
      href={href}
      aria-label={label}
      className="border-foreground/8 hover:border-foreground/15 focus-ring inline-flex h-11 w-11 items-center justify-center rounded-xl border bg-background text-foreground/70 transition-colors hover:text-foreground"
      {...props}
    >
      {LucideIcon ? (
        <LucideIcon className="h-4 w-4" strokeWidth={2.5} aria-hidden="true" />
      ) : imageSrc ? (
        <Image
          src={imageSrc}
          alt=""
          width={14}
          height={14}
          aria-hidden="true"
          className="max-h-[14px] max-w-[14px] object-contain dark:invert"
        />
      ) : null}
    </Link>
  );
}
