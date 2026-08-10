"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AppMark } from "@/components/app-mark";
import { CounterRow } from "@/components/counter-row";
import { FamilySection } from "@/components/family-section";
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

const UF_OPTIONS = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT",
  "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO",
  "RR", "SC", "SP", "SE", "TO",
];

const FAMILY_BADGES = { strings: "C", woodwinds: "M", brass: "Mt" } as const;

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
        <AppMark />
        <p>Preparando o contador…</p>
      </main>
    );
  }

  return (
    <div className={styles.appShell}>
      <header className={styles.stickyHeader}>
        <div className={styles.brandRow}>
          <div className={styles.brand}>
            <AppMark />
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
            <span>
              <span className={styles.sectionKicker}>Identificação</span>
              <strong>Dados do ensaio</strong>
            </span>
            <span className={styles.completionTag}>
              {completedMetadata ? "Completo" : "Preencher"}
            </span>
          </summary>
          <div className={styles.metadataForm}>
            <div className={styles.formGridTwo}>
              <label>
                <span>Data</span>
                <input type="date" value={state.metadata.date} onChange={(event) => updateMetadata("date", event.target.value)} />
              </label>
              <label>
                <span>Horário</span>
                <input type="time" value={state.metadata.time} onChange={(event) => updateMetadata("time", event.target.value)} />
              </label>
            </div>
            <label>
              <span>Localidade</span>
              <input type="text" autoComplete="organization" placeholder="Ex.: Jardim das Flores" value={state.metadata.locality} onChange={(event) => updateMetadata("locality", event.target.value)} />
            </label>
            <div className={styles.formGridCity}>
              <label>
                <span>Cidade</span>
                <input type="text" autoComplete="address-level2" placeholder="Cidade" value={state.metadata.city} onChange={(event) => updateMetadata("city", event.target.value)} />
              </label>
              <label>
                <span>UF</span>
                <select value={state.metadata.uf} onChange={(event) => updateMetadata("uf", event.target.value)} aria-label="Estado">
                  <option value="">UF</option>
                  {UF_OPTIONS.map((uf) => <option key={uf}>{uf}</option>)}
                </select>
              </label>
            </div>
            <label>
              <span>Regional</span>
              <input type="text" placeholder="Regional musical" value={state.metadata.regional} onChange={(event) => updateMetadata("regional", event.target.value)} />
            </label>
            <label>
              <span>Responsável pela contagem</span>
              <input type="text" autoComplete="name" placeholder="Nome completo" value={state.metadata.responsible} onChange={(event) => updateMetadata("responsible", event.target.value)} />
            </label>
          </div>
        </details>

        <div className={styles.sectionHeading}>
          <span>
            <p className={styles.eyebrow}>Orquestra</p>
            <h2>Instrumentos</h2>
          </span>
          <strong>{totals.orchestra}</strong>
        </div>

        <div className={styles.familyList}>
          {INSTRUMENT_FAMILIES.map((family, index) => (
            <FamilySection
              key={family.id}
              id={`family-${family.id}`}
              label={family.label}
              badge={FAMILY_BADGES[family.id]}
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
              <span className={`${styles.familyBadge} ${styles.organBadge}`} aria-hidden="true">♪</span>
              <span>
                <strong>Órgão Eletrônico</strong>
                <small>Organistas presentes</small>
              </span>
            </span>
            <span className={styles.familyTotal}>
              <small>Subtotal</small>
              <strong>{totals.organists}</strong>
            </span>
          </summary>
          <div className={styles.familyBody}>
            <CounterRow label="Organistas que tocaram" value={state.organists.played} onDecrease={() => adjustOrganists("played", -1)} onIncrease={() => adjustOrganists("played", 1)} />
            <CounterRow label="Organistas que não tocaram" value={state.organists.didNotPlay} onDecrease={() => adjustOrganists("didNotPlay", -1)} onIncrease={() => adjustOrganists("didNotPlay", 1)} />
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
        <button type="button" className={styles.resetButton} onClick={requestReset}>
          <span aria-hidden="true">↻</span> Novo ensaio
        </button>
        <button type="button" className={styles.pdfButton} onClick={createPdf} disabled={isGenerating}>
          <span aria-hidden="true">⇩</span> {isGenerating ? "Criando PDF…" : "Gerar PDF"}
        </button>
      </footer>

      {confirmReset && (
        <div className={styles.modalBackdrop} role="presentation">
          <section className={styles.confirmDialog} role="dialog" aria-modal="true" aria-labelledby="reset-title">
            <span className={styles.dialogIcon} aria-hidden="true">↻</span>
            <h2 id="reset-title">Iniciar um novo ensaio?</h2>
            <p>As contagens atuais serão apagadas deste aparelho. Gere o PDF antes, se precisar guardar o resumo.</p>
            <div className={styles.dialogActions}>
              <button type="button" onClick={() => setConfirmReset(false)}>Cancelar</button>
              <button type="button" className={styles.confirmResetButton} onClick={resetRehearsal}>Iniciar novo</button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
