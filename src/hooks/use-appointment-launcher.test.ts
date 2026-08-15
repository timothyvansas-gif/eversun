import { describe, expect, it } from "vitest";
import { getAppointmentSurface } from "@/hooks/use-appointment-launcher";

describe("getAppointmentSurface", () => {
  it("uses the bottom sheet on mobile", () => {
    expect(getAppointmentSurface(true)).toBe("sheet");
  });

  it("uses the QR overlay on larger viewports", () => {
    expect(getAppointmentSurface(false)).toBe("qr");
  });
});
