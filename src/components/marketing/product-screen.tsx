import Image from "next/image";
import s from "./marketing.module.css";

export function ProductScreen({ src, alt, label, width = 860, height = 2080, example = true }: {
  src: string; alt: string; label: string; width?: number; height?: number; example?: boolean;
}) {
  return <figure className={s.productScreen}>
    <div className={s.productBar}><span>INSIDE MYMUSCLE</span><span>{label}</span></div>
    <a href={src} target="_blank" rel="noopener noreferrer" aria-label={`View full ${label} screenshot (opens in a new tab)`}>
      <Image src={src} alt={alt} width={width} height={height} quality={95} sizes="(max-width: 800px) 90vw, 480px" />
      <span className={s.screenHoverHint} aria-hidden="true">Explore {label} <span>↗</span></span>
    </a>
    <figcaption><span>Actual app{example ? " · Example data" : ""}</span><a href={src} target="_blank" rel="noopener noreferrer">View full screen <span aria-hidden="true">↗</span><span className={s.srOnly}> (opens in a new tab)</span></a></figcaption>
  </figure>;
}
