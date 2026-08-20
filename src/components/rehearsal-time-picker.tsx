"use client"

import { useState } from "react"
import { Clock3, Minus, Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import styles from "./musical-counter.module.css"

type RehearsalTimePickerProps = {
  id: string
  value: string
  onChange: (value: string) => void
}

const normalizeTime = (value: string) => {
  const match = /^(\d{2}):(\d{2})$/.exec(value)
  const hour = Number(match?.[1])
  const minute = Number(match?.[2])

  return {
    hour: Number.isInteger(hour) && hour >= 0 && hour <= 23 ? hour : 0,
    minute: Number.isInteger(minute) && minute >= 0 && minute <= 59 ? minute : 0,
  }
}

const padTimePart = (value: number) => String(value).padStart(2, "0")

export function RehearsalTimePicker({
  id,
  value,
  onChange,
}: RehearsalTimePickerProps) {
  const currentTime = normalizeTime(value)
  const [open, setOpen] = useState(false)
  const [hour, setHour] = useState(currentTime.hour)
  const [minute, setMinute] = useState(currentTime.minute)
  const displayValue = `${padTimePart(currentTime.hour)}:${padTimePart(currentTime.minute)}`

  const changeOpen = (nextOpen: boolean) => {
    if (nextOpen) {
      const nextTime = normalizeTime(value)
      setHour(nextTime.hour)
      setMinute(nextTime.minute)
    }
    setOpen(nextOpen)
  }

  const confirmTime = () => {
    onChange(`${padTimePart(hour)}:${padTimePart(minute)}`)
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={changeOpen}>
      <DialogTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          className={styles.timePickerTrigger}
          aria-label={`Horário do ensaio: ${displayValue}`}
        >
          <span>{displayValue}</span>
          <Clock3 aria-hidden="true" />
        </Button>
      </DialogTrigger>
      <DialogContent className={styles.timePickerDialog}>
        <div className={styles.timePickerHeader}>
          <span className={styles.timePickerEyebrow}>Horário do ensaio</span>
          <DialogTitle className={styles.timePickerTitle}>
            Ajuste a hora e os minutos
          </DialogTitle>
        </div>

        <div className={styles.timePickerControls}>
          <div className={styles.timePickerSegment}>
            <span>Hora</span>
            <Button
              type="button"
              variant="outline"
              size="icon-lg"
              aria-label="Aumentar hora"
              onClick={() => setHour((current) => (current + 1) % 24)}
            >
              <Plus aria-hidden="true" />
            </Button>
            <output aria-live="polite" aria-label={`Hora ${padTimePart(hour)}`}>
              {padTimePart(hour)}
            </output>
            <Button
              type="button"
              variant="outline"
              size="icon-lg"
              aria-label="Diminuir hora"
              onClick={() => setHour((current) => (current + 23) % 24)}
            >
              <Minus aria-hidden="true" />
            </Button>
          </div>

          <span className={styles.timePickerSeparator} aria-hidden="true">
            :
          </span>

          <div className={styles.timePickerSegment}>
            <span>Minutos</span>
            <Button
              type="button"
              variant="outline"
              size="icon-lg"
              aria-label="Aumentar minuto"
              onClick={() => setMinute((current) => (current + 1) % 60)}
            >
              <Plus aria-hidden="true" />
            </Button>
            <output aria-live="polite" aria-label={`Minutos ${padTimePart(minute)}`}>
              {padTimePart(minute)}
            </output>
            <Button
              type="button"
              variant="outline"
              size="icon-lg"
              aria-label="Diminuir minuto"
              onClick={() => setMinute((current) => (current + 59) % 60)}
            >
              <Minus aria-hidden="true" />
            </Button>
          </div>
        </div>

        <div
          className={styles.timePickerQuickMinutes}
          role="group"
          aria-label="Minutos rápidos"
        >
          {[0, 15, 30, 45].map((quickMinute) => (
            <Button
              key={quickMinute}
              type="button"
              variant={minute === quickMinute ? "default" : "outline"}
              aria-pressed={minute === quickMinute}
              onClick={() => setMinute(quickMinute)}
            >
              {padTimePart(quickMinute)}
            </Button>
          ))}
        </div>

        <div className={styles.timePickerActions}>
          <DialogClose asChild>
            <Button variant="ghost">Cancelar</Button>
          </DialogClose>
          <Button type="button" onClick={confirmTime}>
            Confirmar {padTimePart(hour)}:{padTimePart(minute)}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
