import { afterEach, describe, expect, it, vi } from "vitest";
import { deliverPdf, isMobileBrowser } from "@/lib/pdf-download";

const desktopUserAgent =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/152.0 Safari/537.36";
const mobileUserAgent =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Version/18.0 Mobile/15E148 Safari/604.1";

describe("entrega do PDF", () => {
  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("reconhece navegadores móveis sem confundir um navegador desktop", () => {
    expect(isMobileBrowser(mobileUserAgent)).toBe(true);
    expect(isMobileBrowser(desktopUserAgent)).toBe(false);
  });

  it("baixa diretamente no desktop mesmo quando Web Share está disponível", async () => {
    vi.useFakeTimers();
    const share = vi.fn();
    const createObjectUrl = vi.fn(() => "blob:rehearsal-pdf");
    const revokeObjectUrl = vi.fn();
    const click = vi.spyOn(HTMLAnchorElement.prototype, "click");

    Object.defineProperty(navigator, "userAgent", {
      configurable: true,
      value: desktopUserAgent,
    });
    Object.defineProperty(navigator, "share", { configurable: true, value: share });
    Object.defineProperty(URL, "createObjectURL", {
      configurable: true,
      value: createObjectUrl,
    });
    Object.defineProperty(URL, "revokeObjectURL", {
      configurable: true,
      value: revokeObjectUrl,
    });

    const result = await deliverPdf({
      blob: new Blob(["pdf"], { type: "application/pdf" }),
      filename: "ensaio.pdf",
      title: "Resumo do Ensaio Musical",
      text: "Resumo do ensaio",
    });

    expect(result).toBe("downloaded");
    expect(share).not.toHaveBeenCalled();
    expect(createObjectUrl).toHaveBeenCalledOnce();
    expect(click).toHaveBeenCalledOnce();
    expect(revokeObjectUrl).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1_000);
    expect(revokeObjectUrl).toHaveBeenCalledWith("blob:rehearsal-pdf");
  });
});
