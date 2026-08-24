export type PdfDeliveryResult = "downloaded" | "shared" | "share-cancelled";

type PdfDeliveryOptions = {
  blob: Blob;
  filename: string;
  title: string;
  text: string;
};

const MOBILE_BROWSER_PATTERN = /Android|iPhone|iPad|iPod|IEMobile|Opera Mini/i;

export const isMobileBrowser = (userAgent = navigator.userAgent) =>
  MOBILE_BROWSER_PATTERN.test(userAgent);

export const downloadPdf = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.hidden = true;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();

  // Mantém a URL disponível tempo suficiente para o navegador iniciar o download.
  window.setTimeout(() => URL.revokeObjectURL(url), 1_000);
};

export const deliverPdf = async ({
  blob,
  filename,
  title,
  text,
}: PdfDeliveryOptions): Promise<PdfDeliveryResult> => {
  // Navegadores desktop também oferecem Web Share. Neles, o comportamento esperado
  // do botão é salvar o arquivo imediatamente na pasta de downloads.
  if (!isMobileBrowser() || !navigator.share) {
    downloadPdf(blob, filename);
    return "downloaded";
  }

  const file = new File([blob], filename, { type: "application/pdf" });
  const shareData: ShareData = { title, text, files: [file] };

  if (!navigator.canShare?.(shareData)) {
    downloadPdf(blob, filename);
    return "downloaded";
  }

  try {
    await navigator.share(shareData);
    return "shared";
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      return "share-cancelled";
    }

    downloadPdf(blob, filename);
    return "downloaded";
  }
};
