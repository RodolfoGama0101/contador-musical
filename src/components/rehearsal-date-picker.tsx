"use client"

import { useMemo, useState } from "react"
import { CalendarDays } from "lucide-react"
import { ptBR } from "react-day-picker/locale"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import styles from "./musical-counter.module.css"

type RehearsalDatePickerProps = {
  id: string
  value: string
  onChange: (value: string) => void
}

const parseLocalDate = (value: string) => {
  const [year, month, day] = value.split("-").map(Number)
  if (!year || !month || !day) return undefined

  const date = new Date(year, month - 1, day)
  const isValid =
    !Number.isNaN(date.getTime()) &&
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day

  return isValid ? date : undefined
}

const serializeLocalDate = (date: Date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
})

export function RehearsalDatePicker({
  id,
  value,
  onChange,
}: RehearsalDatePickerProps) {
  const [open, setOpen] = useState(false)
  const selectedDate = useMemo(() => parseLocalDate(value), [value])
  const displayValue = selectedDate
    ? dateFormatter.format(selectedDate)
    : "Selecionar data"

  const selectDate = (date: Date | undefined) => {
    if (!date) return
    onChange(serializeLocalDate(date))
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          className={styles.datePickerTrigger}
          aria-label={`Data do ensaio: ${displayValue}`}
        >
          <span>{displayValue}</span>
          <CalendarDays aria-hidden="true" />
        </Button>
      </DialogTrigger>
      <DialogContent className={styles.datePickerDialog}>
        <DialogTitle className="sr-only">Selecionar data do ensaio</DialogTitle>
        <Calendar
          mode="single"
          locale={ptBR}
          selected={selectedDate}
          defaultMonth={selectedDate}
          onSelect={selectDate}
          autoFocus
        />
        <div className={styles.datePickerActions}>
          <Button variant="secondary" onClick={() => selectDate(new Date())}>
            Usar hoje
          </Button>
          <DialogClose asChild>
            <Button variant="ghost">Cancelar</Button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  )
}
