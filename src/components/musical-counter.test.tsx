import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { MusicalCounter } from "@/components/musical-counter";
import { ALL_INSTRUMENTS } from "@/data/instruments";
import { STORAGE_KEY } from "@/lib/rehearsal";

describe("Contador Musical", () => {
  beforeEach(() => {
    window.localStorage.clear();
    Object.defineProperty(window.navigator, "vibrate", {
      configurable: true,
      value: vi.fn(),
    });
  });

  it("incrementa, decrementa sem ficar negativo e salva localmente", async () => {
    const user = userEvent.setup();
    render(<MusicalCounter />);

    const increase = await screen.findByRole("button", { name: "Aumentar Violino" });
    const decrease = screen.getByRole("button", { name: "Diminuir Violino" });
    expect(decrease).toBeDisabled();

    await user.click(increase);
    await user.click(increase);
    expect(screen.getByLabelText("Violino: 2")).toHaveTextContent("2");

    await user.click(decrease);
    expect(screen.getByLabelText("Violino: 1")).toHaveTextContent("1");

    await waitFor(() => {
      const saved = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "{}");
      expect(saved.counts.violin).toBe(1);
    });
  });

  it("restaura a contagem após uma nova renderização", async () => {
    const user = userEvent.setup();
    const first = render(<MusicalCounter />);
    await user.click(await screen.findByRole("button", { name: "Aumentar Violino" }));

    await waitFor(() => {
      expect(window.localStorage.getItem(STORAGE_KEY)).toContain('"violin":1');
    });
    first.unmount();

    render(<MusicalCounter />);
    expect(await screen.findByLabelText("Violino: 1")).toHaveTextContent("1");
  });

  it("abre a confirmação antes de apagar uma contagem", async () => {
    const user = userEvent.setup();
    render(<MusicalCounter />);
    await user.click(await screen.findByRole("button", { name: "Aumentar Violino" }));
    await user.click(screen.getByRole("button", { name: /Novo ensaio/i }));

    expect(screen.getByRole("alertdialog", { name: "Iniciar um novo ensaio?" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Iniciar novo" }));
    expect(screen.getByLabelText("Violino: 0")).toHaveTextContent("0");
  });

  it("informa os campos ausentes antes de gerar o PDF", async () => {
    render(<MusicalCounter />);
    const generateButton = await screen.findByRole("button", { name: /Gerar PDF/i });
    fireEvent.click(generateButton);

    const validation = await screen.findByText(/Preencha antes de gerar o PDF/);
    expect(validation).toHaveTextContent("Localidade");
    expect(validation).not.toHaveTextContent("Regional");
    expect(validation).not.toHaveTextContent("Responsável");
  });

  it("exibe no card o total atualizado de organistas", async () => {
    const user = userEvent.setup();
    render(<MusicalCounter />);

    expect(await screen.findByText("0 organistas presentes")).toBeInTheDocument();
    await user.click(
      screen.getByRole("button", { name: "Aumentar Organistas que tocaram" }),
    );

    expect(screen.getByText("1 organista presente")).toBeInTheDocument();
  });

  it("não exibe os campos Regional e Responsável pela contagem", async () => {
    render(<MusicalCounter />);
    await screen.findByRole("button", { name: "Aumentar Violino" });

    expect(screen.queryByLabelText("Regional")).not.toBeInTheDocument();
    expect(
      screen.queryByLabelText("Responsável pela contagem"),
    ).not.toBeInTheDocument();
  });

  it("seleciona a data pelo calendário da interface", async () => {
    const user = userEvent.setup();
    render(<MusicalCounter />);

    const dateTrigger = await screen.findByRole("button", {
      name: /Data do ensaio:/i,
    });
    await user.click(dateTrigger);

    const targetDate = new Date();
    targetDate.setHours(12, 0, 0, 0);
    targetDate.setDate(targetDate.getDate() + 1);
    const targetLabel = new Intl.DateTimeFormat("pt-BR", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(targetDate);

    await user.click(screen.getByRole("button", { name: targetLabel }));

    const expectedDate = [
      targetDate.getFullYear(),
      String(targetDate.getMonth() + 1).padStart(2, "0"),
      String(targetDate.getDate()).padStart(2, "0"),
    ].join("-");
    const expectedDisplay = [
      String(targetDate.getDate()).padStart(2, "0"),
      String(targetDate.getMonth() + 1).padStart(2, "0"),
      targetDate.getFullYear(),
    ].join("/");

    expect(dateTrigger).toHaveTextContent(expectedDisplay);
    await waitFor(() => {
      const saved = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "{}");
      expect(saved.metadata.date).toBe(expectedDate);
    });
  });

  it("ajusta o horário pela interface sem depender do seletor nativo", async () => {
    const user = userEvent.setup();
    render(<MusicalCounter />);

    const timeTrigger = await screen.findByRole("button", {
      name: /Horário do ensaio:/i,
    });
    const initialHour = Number(timeTrigger.textContent?.split(":")[0] ?? 0);
    const expectedHour = String((initialHour + 1) % 24).padStart(2, "0");

    await user.click(timeTrigger);
    expect(
      screen.getByRole("dialog", { name: "Ajuste a hora e os minutos" }),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Aumentar hora" }));
    await user.click(screen.getByRole("button", { name: "45" }));
    await user.click(screen.getByRole("button", { name: /Confirmar/i }));

    expect(timeTrigger).toHaveTextContent(`${expectedHour}:45`);
    await waitFor(() => {
      const saved = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "{}");
      expect(saved.metadata.time).toBe(`${expectedHour}:45`);
    });
  });

  it("seleciona a UF em uma grade acessível e salva localmente", async () => {
    const user = userEvent.setup();
    render(<MusicalCounter />);

    const stateTrigger = await screen.findByRole("button", {
      name: "Estado: não selecionado",
    });
    await user.click(stateTrigger);

    expect(
      screen.getByRole("dialog", { name: "Selecionar UF" }),
    ).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "SP — São Paulo" }));

    expect(stateTrigger).toHaveTextContent("SP");
    expect(stateTrigger).toHaveAccessibleName("Estado: São Paulo (SP)");
    await waitFor(() => {
      const saved = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "{}");
      expect(saved.metadata.uf).toBe("SP");
    });
  });

  it("usa as imagens geradas nos instrumentos e mantém o ícone do órgão", async () => {
    const { container } = render(<MusicalCounter />);
    await screen.findByRole("button", { name: "Aumentar Violino" });

    expect(
      container.querySelectorAll('[data-icon-source="generated"]'),
    ).toHaveLength(ALL_INSTRUMENTS.length);
    expect(
      container.querySelectorAll('[data-icon-source="iconify"]'),
    ).toHaveLength(2);

    for (const instrument of ALL_INSTRUMENTS) {
      expect(
        container.querySelector(
          `img[src="/icons/instruments/${instrument.id}.png"]`,
        ),
      ).toBeInTheDocument();
    }
  });
});
