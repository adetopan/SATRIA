import QRCode from "qrcode";

export async function QrCode({
  value,
  className,
  size = 112,
}: {
  value: string;
  className?: string;
  size?: number;
}) {
  let src = "";
  try {
    src = await QRCode.toDataURL(value || " ", {
      margin: 1,
      width: size,
      errorCorrectionLevel: "M",
      color: {
        dark: "#111111",
        light: "#ffffff",
      },
    });
  } catch {
    src = "";
  }

  if (!src) {
    return (
      <div
        className={className}
        style={{ width: size, height: size }}
        aria-label="QR specimen tanda tangan"
      />
    );
  }

  return (
    <img
      src={src}
      alt="QR specimen tanda tangan"
      width={size}
      height={size}
      className={className}
    />
  );
}
