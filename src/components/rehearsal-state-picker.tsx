"use client"

import { useState } from "react"
import { Check, ChevronDown } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import styles from "./musical-counter.module.css"

type RehearsalStatePickerProps = {
  id: string
  value: string
  onChange: (value: string) => void
}

const BRAZILIAN_STATES = [
  { code: "AC", name: "Acre" },
  { code: "AL", name: "Alagoas" },
  { code: "AP", name: "Amapá" },
  { code: "AM", name: "Amazonas" },
  { code: "BA", name: "Bahia" },
  { code: "CE", name: "Ceará" },
  { code: "DF", name: "Distrito Federal" },
  { code: "ES", name: "Espírito Santo" },
  { code: "GO", name: "Goiás" },
  { code: "MA", name: "Maranhão" },
  { code: "MT", name: "Mato Grosso" },
  { code: "MS", name: "Mato Grosso do Sul" },
  { code: "MG", name: "Minas Gerais" },
  { code: "PA", name: "Pará" },
  { code: "PB", name: "Paraíba" },
  { code: "PR", name: "Paraná" },
  { code: "PE", name: "Pernambuco" },
  { code: "PI", name: "Piauí" },
  { code: "RJ", name: "Rio de Janeiro" },
  { code: "RN", name: "Rio Grande do Norte" },
  { code: "RS", name: "Rio Grande do Sul" },
  { code: "RO", name: "Rondônia" },
  { code: "RR", name: "Roraima" },
  { code: "SC", name: "Santa Catarina" },
  { code: "SP", name: "São Paulo" },
  { code: "SE", name: "Sergipe" },
  { code: "TO", name: "Tocantins" },
] as const

export function RehearsalStatePicker({
  id,
  value,
  onChange,
}: RehearsalStatePickerProps) {
  const [open, setOpen] = useState(false)
  const selectedState = BRAZILIAN_STATES.find((state) => state.code === value)

  const selectState = (code: string) => {
    onChange(code)
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          className={styles.ufSelectTrigger}
          aria-label={
            selectedState
              ? `Estado: ${selectedState.name} (${selectedState.code})`
              : "Estado: não selecionado"
          }
        >
          <span>{selectedState?.code ?? "UF"}</span>
          <ChevronDown aria-hidden="true" />
        </Button>
      </DialogTrigger>

      <DialogContent className={styles.ufPickerDialog}>
        <div className={styles.ufPickerHeader}>
          <span className={styles.ufPickerEyebrow}>Estado</span>
          <DialogTitle className={styles.ufPickerTitle}>
            Selecionar UF
          </DialogTitle>
        </div>

        <div
          className={styles.ufPickerGrid}
          role="group"
          aria-label="Estados do Brasil"
        >
          {BRAZILIAN_STATES.map((state) => {
            const isSelected = state.code === value

            return (
              <Button
                key={state.code}
                type="button"
                variant={isSelected ? "default" : "outline"}
                className={styles.ufPickerOption}
                aria-label={`${state.code} — ${state.name}`}
                aria-pressed={isSelected}
                onClick={() => selectState(state.code)}
              >
                {state.code}
                {isSelected && <Check aria-hidden="true" />}
              </Button>
            )
          })}
        </div>

        <div className={styles.ufPickerActions}>
          <DialogClose asChild>
            <Button type="button" variant="ghost">
              Cancelar
            </Button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  )
}
