// src/components/Img.tsx
export default function Img(props: React.ImgHTMLAttributes<HTMLImageElement>) {
  return <img loading="lazy" decoding="async" {...props} />;
}
