import Image from "next/image";

export function SkhpkWatermark() {
  return (
    <div className="skhpk-watermark" aria-hidden="true">
      <div className="skhpk-watermark-text" />
      <Image
        src="/polri-logo.png"
        alt=""
        width={340}
        height={340}
        className="skhpk-watermark-emblem"
      />
    </div>
  );
}
