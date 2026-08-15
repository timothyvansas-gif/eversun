"use client";

import { useCallback, useState } from "react";
import { MOBILE_QUERY } from "@/lib/breakpoints";

export type AppointmentSurface = "sheet" | "qr";

export function getAppointmentSurface(isMobile: boolean): AppointmentSurface {
  return isMobile ? "sheet" : "qr";
}

/**
 * Owns the shared responsive appointment flow: a bottom sheet on mobile and
 * the QR overlay on larger viewports. Consumers keep control of the copy and
 * rendered surfaces; this hook only centralises their identical state logic.
 */
export function useAppointmentLauncher() {
  const [qrOpen, setQrOpen] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);

  const open = useCallback(() => {
    if (getAppointmentSurface(window.matchMedia(MOBILE_QUERY).matches) === "sheet") {
      setSheetOpen(true);
      return;
    }

    setQrOpen(true);
  }, []);

  const closeQr = useCallback(() => setQrOpen(false), []);
  const closeSheet = useCallback(() => setSheetOpen(false), []);

  return { qrOpen, sheetOpen, open, closeQr, closeSheet };
}
