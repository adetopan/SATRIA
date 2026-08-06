"use client";

import { useEffect, useRef } from "react";
import JsBarcode from "jsbarcode";

export function Barcode({
  value,
  className,
}: {
  value: string;
  className?: string;
}) {
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    if (!svgRef.current || !value) return;
    JsBarcode(svgRef.current, value, {
      format: "CODE128",
      displayValue: false,
      margin: 0,
      height: 56,
      width: 1.4,
      background: "#ffffff",
      lineColor: "#111111",
    });
  }, [value]);

  return (
    <div className={className}>
      <svg ref={svgRef} />
    </div>
  );
}
