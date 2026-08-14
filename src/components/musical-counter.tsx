"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { CcbLogo } from "@/components/ccb-logo";
import { CounterRow } from "@/components/counter-row";
import { FamilySection } from "@/components/family-section";
import { RehearsalDatePicker } from "@/components/rehearsal-date-picker";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { INSTRUMENT_FAMILIES, type InstrumentId } from "@/data/instruments";
import { generateRehearsalPdf } from "@/lib/pdf";
import {
  calculateTotals,
  createNewRehearsal,
  hasMeaningfulData,
  missingMetadataFields,
  readStoredRehearsal,
  touchState,
  writeStoredRehearsal,
  type RehearsalMetadata,
  type RehearsalState,
} from "@/lib/rehearsal";
import styles from "./musical-counter.module.css";
import {
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  FileDown,
  LoaderCircle,
  Music2,
  RotateCcw,
} from "lucide-react";

const UF_OPTIONS = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT",
  "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO",
  "RR", "SC", "SP", "SE", "TO",
];

const downloadBlob = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
};

export function MusicalCounter() {
  const [state, setState] = useState<RehearsalState>(() =>
    createNewRehearsal(new Date(0)),
  );
  const [hydrated, setHydrated] = useState(false);
  const [storageWarning, setStorageWarning] = useState("");
  const [message, setMessage] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const metadataRef = useRef<HTMLDetailsElement>(null);

  useEffect(() => {
    const handle = window.setTimeout(() => {
      const restored = readStoredRehearsal(window.localStorage);
      setState(restored.state);
      setStorageWarning(restored.warning ?? "");
      setHydrated(true);
    }, 0);

    return () => window.clearTimeout(handle);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      writeStoredRehearsal(window.localStorage, state);
    } catch {
      queueMicrotask(() => {
        setStorageWarning(
          "Não foi possível salvar neste aparelho. Não feche a página até concluir a contagem.",
        );
      });
    }
  }, [state, hydrated]);

  const totals = useMemo(() => calculateTotals(state), [state]);
  const completedMetadata = missingMetadataFields(state.metadata).length === 0;

  const updateMetadata = (key: keyof RehearsalMetadata, value: string) => {
    setMessage("");
    setState((current) =>
      touchState({
        ...current,
        metadata: { ...current.metadata, [key]: value },
      }),
    );
  };

  const adjustInstrument = (id: InstrumentId, delta: number) => {
    setMessage("");
    setState((current) =>
      touchState({
        ...current,
        counts: {
          ...current.counts,
          [id]: Math.max(0, current.counts[id] + delta),
        },
      }),
    );
    if (delta > 0 && "vibrate" in navigator) navigator.vibrate?.(10);
  };

  const adjustOrganists = (
    key: keyof RehearsalState["organists"],
    delta: number,
  ) => {
    setMessage("");
    setState((current) =>
      touchState({
        ...current,
        organists: {
          ...current.organists,
          [key]: Math.max(0, current.organists[key] + delta),
        },
      }),
    );
    if (delta > 0 && "vibrate" in navigator) navigator.vibrate?.(10);
  };

  const requestReset = () => {
    if (hasMeaningfulData(state)) {
      setConfirmReset(true);
      return;
    }
    setState(createNewRehearsal());
    setMessage("Novo ensaio iniciado.");
  };

  const resetRehearsal = () => {
    setState(createNewRehearsal());
    setConfirmReset(false);
    setMessage("Novo ensaio iniciado.");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const createPdf = async () => {
    const missing = missingMetadataFields(state.metadata);
    if (missing.length > 0) {
      setMessage(`Preencha antes de gerar o PDF: ${missing.join(", ")}.`);
      if (metadataRef.current) metadataRef.current.open = true;
      metadataRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
    if (totals.grand === 0) {
      setMessage("Adicione pelo menos um músico ou organista antes de gerar o PDF.");
      return;
    }

    setIsGenerating(true);
    setMessage("");
    try {
      const { blob, filename } = await generateRehearsalPdf(state);
      const file = new File([blob], filename, { type: "application/pdf" });
      const shareData: ShareData = {
        title: "Resumo do Ensaio Musical",
        text: `Resumo do ensaio de ${state.metadata.locality}`,
        files: [file],
      };

      if (navigator.share && navigator.canShare?.(shareData)) {
        try {
          await navigator.share(shareData);
          setMessage("PDF criado e compartilhado.");
        } catch (error) {
          if (error instanceof DOMException && error.name === "AbortError") {
            setMessage("Compartilhamento cancelado. O ensaio continua salvo.");
          } else {
            downloadBlob(blob, filename);
            setMessage("PDF criado e baixado.");
          }
        }
      } else {
        downloadBlob(blob, filename);
        setMessage("PDF criado e baixado.");
      }
    } catch {
      setMessage("Não foi possível criar o PDF. Tente novamente.");
    } finally {
      setIsGenerating(false);
    }
  };

  if (!hydrated) {
    return (
      <main className={styles.loadingScreen}>
        <CcbLogo />
        <p className="flex items-center gap-2">
          <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
          Preparando o contador…
        </p>
      </main>
    );
  }

  return (
    <div className={styles.appShell}>
      <header className={styles.stickyHeader}>
        <div className={styles.brandRow}>
          <div className={styles.brand}>
            <CcbLogo compact />
            <span>
              <strong>Contador Musical</strong>
              <small>Ensaio musical</small>
            </span>
          </div>
          <div className={styles.grandTotal} aria-live="polite">
            <small>Total geral</small>
            <strong>{totals.grand}</strong>
          </div>
        </div>
        <div className={styles.quickTotals}>
          <span>Orquestra <strong>{totals.orchestra}</strong></span>
          <span>Organistas <strong>{totals.organists}</strong></span>
          <span className={styles.saveStatus}>
            <span className={styles.savedDot} aria-hidden="true" />
            Salvo localmente
          </span>
        </div>
      </header>

      <main className={styles.mainContent}>
        <section className={styles.introCard}>
          <p className={styles.eyebrow}>Contagem do ensaio</p>
          <h1>Registre a orquestra com poucos toques.</h1>
          <p>Os dados ficam somente neste aparelho e são salvos automaticamente.</p>
        </section>

        {storageWarning && (
          <div className={styles.warning} role="alert">
            <strong>Atenção</strong>
            <span>{storageWarning}</span>
          </div>
        )}

        {message && (
          <div className={styles.message} role="status" aria-live="polite">
            {message}
          </div>
        )}

        <details
          className={`${styles.metadataCard} ${completedMetadata ? styles.metadataComplete : ""}`}
          ref={metadataRef}
          id="rehearsal-data"
          open={!completedMetadata}
        >
          <summary className={styles.metadataSummary}>
            <span className={styles.metadataIdentity}>
              <span className={styles.metadataIcon} aria-hidden="true"><CalendarDays /></span>
              <span>
                <span className={styles.sectionKicker}>Identificação</span>
                <strong>Dados do ensaio</strong>
                {completedMetadata && (
                  <small>{state.metadata.locality} · {state.metadata.city}/{state.metadata.uf}</small>
                )}
              </span>
            </span>
            <span className={styles.metadataSummaryActions}>
              <span className={styles.completionTag}>
                {completedMetadata && <CheckCircle2 aria-hidden="true" />}
                {completedMetadata ? "Completo" : "Preencher"}
              </span>
              <ChevronDown className={styles.metadataChevron} aria-hidden="true" />
            </span>
          </summary>
          <div className={styles.metadataForm}>
            <div className={styles.formGridTwo}>
              <Field className={styles.shadcnField}>
                <FieldLabel htmlFor="date" className={styles.shadcnFieldLabel}>
                  Data
                </FieldLabel>
                <RehearsalDatePicker
                  id="date"
                  value={state.metadata.date}
                  onChange={(value) => updateMetadata("date", value)}
                />
              </Field>
              <Field className={styles.shadcnField}>
                <FieldLabel htmlFor="time" className={styles.shadcnFieldLabel}>
                  Horário
                </FieldLabel>
                <Input id="time" type="time" value={state.metadata.time} onChange={(event) => updateMetadata("time", event.target.value)} />
              </Field>
            </div>
            <Field className={styles.shadcnField}>
              <FieldLabel htmlFor="locality" className={styles.shadcnFieldLabel}>
                Localidade
              </FieldLabel>
              <Input id="locality" type="text" autoComplete="organization" placeholder="Ex.: Jardim das Flores" value={state.metadata.locality} onChange={(event) => updateMetadata("locality", event.target.value)} />
            </Field>
            <div className={styles.formGridCity}>
              <Field className={styles.shadcnField}>
                <FieldLabel htmlFor="city" className={styles.shadcnFieldLabel}>
                  Cidade
                </FieldLabel>
                <Input id="city" type="text" autoComplete="address-level2" placeholder="Cidade" value={state.metadata.city} onChange={(event) => updateMetadata("city", event.target.value)} />
              </Field>
              <Field className={styles.shadcnField}>
                <FieldLabel htmlFor="uf" className={styles.shadcnFieldLabel}>UF</FieldLabel>
                <Select value={state.metadata.uf} onValueChange={(value) => updateMetadata("uf", value)}>
                  <SelectTrigger id="uf" aria-label="Estado" className={styles.ufSelectTrigger}>
                    <SelectValue placeholder="UF" />
                  </SelectTrigger>
                  <SelectContent position="popper" align="end" className={styles.ufSelectContent}>
                    {UF_OPTIONS.map((uf) => <SelectItem key={uf} value={uf}>{uf}</SelectItem>)}
                  </SelectContent>
                </Select>
              </Field>
            </div>
          </div>
        </details>

        <div className={styles.sectionHeading}>
          <span>
            <p className={styles.eyebrow}>Orquestra</p>
            <h2>Instrumentos</h2>
          </span>
          <span className={styles.sectionTotal}>
            <small>Total</small>
            <strong>{totals.orchestra}</strong>
          </span>
        </div>

        <div className={styles.familyList}>
          {INSTRUMENT_FAMILIES.map((family, index) => (
            <FamilySection
              key={family.id}
              id={`family-${family.id}`}
              label={family.label}
              instruments={family.instruments}
              counts={state.counts}
              subtotal={totals.families[family.id]}
              onAdjust={adjustInstrument}
              defaultOpen={index === 0}
            />
          ))}
        </div>

        <details className={styles.familyCard} id="family-organists">
          <summary className={styles.familySummary}>
            <span className={styles.familyIdentity}>
              <span className={`${styles.familyBadge} ${styles.organBadge}`} aria-hidden="true"><Music2 /></span>
              <span>
                <strong>Órgão Eletrônico</strong>
                <small>Organistas presentes</small>
              </span>
            </span>
            <span className={styles.familyTotal}>
              <small>Subtotal</small>
              <strong>{totals.organists}</strong>
            </span>
            <ChevronDown className={styles.familyChevron} aria-hidden="true" />
          </summary>
          <div className={styles.familyBody}>
            <CounterRow instrument="organ-played" label="Organistas que tocaram" value={state.organists.played} onDecrease={() => adjustOrganists("played", -1)} onIncrease={() => adjustOrganists("played", 1)} />
            <CounterRow instrument="organ-waiting" label="Organistas que não tocaram" value={state.organists.didNotPlay} onDecrease={() => adjustOrganists("didNotPlay", -1)} onIncrease={() => adjustOrganists("didNotPlay", 1)} />
          </div>
        </details>

        <section className={styles.finalSummary} aria-label="Resumo da contagem">
          <div><span>Orquestra</span><strong>{totals.orchestra}</strong></div>
          <div><span>Organistas presentes</span><strong>{totals.organists}</strong></div>
          <div className={styles.finalTotal}><span>Total geral</span><strong>{totals.grand}</strong></div>
        </section>

        <p className={styles.privacyNote}>
          Esta é uma ferramenta independente. Nenhuma informação é enviada para servidores.
        </p>
      </main>

      <footer className={styles.actionBar}>
        <Button variant="outline" size="lg" className={styles.resetButton} onClick={requestReset}>
          <RotateCcw aria-hidden="true" /> Novo ensaio
        </Button>
        <Button size="lg" className={styles.pdfButton} onClick={createPdf} disabled={isGenerating}>
          {isGenerating ? <LoaderCircle className="animate-spin" aria-hidden="true" /> : <FileDown aria-hidden="true" />}
          {isGenerating ? "Criando PDF…" : "Gerar PDF"}
        </Button>
      </footer>

      <AlertDialog open={confirmReset} onOpenChange={setConfirmReset}>
        <AlertDialogContent size="sm" className={styles.confirmDialog}>
          <AlertDialogHeader>
            <AlertDialogMedia className={styles.dialogIcon}><RotateCcw aria-hidden="true" /></AlertDialogMedia>
            <AlertDialogTitle>Iniciar um novo ensaio?</AlertDialogTitle>
            <AlertDialogDescription>As contagens atuais serão apagadas deste aparelho. Gere o PDF antes, se precisar guardar o resumo.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className={styles.dialogActions}>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction variant="destructive" className={styles.confirmResetButton} onClick={resetRehearsal}>Iniciar novo</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
