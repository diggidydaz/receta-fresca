"use client";
// Teach-back: one question that checks the person understood their goal and the red light.
// The wrong answers are the two common misunderstandings (a forbidden food, a medicine change), and
// each gets its own plain explanation. Only the first answer is recorded for the clinician.
import { useRef, useState } from "react";
import { Icon } from "./Icon";
import { BigButton, ChoiceGroup, Notice } from "./ui";
import { useT } from "@/lib/i18n";
import { setState, useAppState } from "@/lib/store";
import type { L10n } from "@/lib/types";

type Answer = "over" | "forbidden" | "medicine";

const answers: Record<Answer, { label: L10n; why: L10n }> = {
  over: {
    label: { es: "Esa comida tiene bastantes más carbohidratos que mi meta", en: "That meal has quite a lot more carbohydrates than my goal" },
    why: { es: "¡Correcto! Rojo quiere decir que pasa bastante de su meta. Puede comer una porción más pequeña o añadir vegetales.", en: "Correct! Red means it goes well over your goal. You can have a smaller portion or add vegetables." },
  },
  forbidden: {
    label: { es: "Esa comida está prohibida y no la puedo comer nunca", en: "That food is forbidden and I can never eat it" },
    why: { es: "No. Ninguna comida está prohibida. Rojo quiere decir que esa porción pasa bastante de su meta. Una porción más pequeña puede salir verde.", en: "No. No food is forbidden. Red means that portion goes well over your goal. A smaller portion can come out green." },
  },
  medicine: {
    label: { es: "Tengo que tomar más medicina", en: "I need to take more medicine" },
    why: { es: "No. Nunca cambie su medicina por una luz de esta aplicación. Rojo solo habla de la comida. Si tiene preguntas sobre su medicina, llame a su clínico.", en: "No. Never change your medicine because of a light in this app. Red is only about the food. If you have questions about your medicine, call your clinician." },
  },
};

/** Option order depends on the prescription, so the right answer is not always first. */
function order(seed: string): Answer[] {
  const n = [...seed].reduce((a, c) => a + c.charCodeAt(0), 0) % 3;
  return n === 0 ? ["forbidden", "over", "medicine"] : n === 1 ? ["medicine", "forbidden", "over"] : ["over", "medicine", "forbidden"];
}

export function TeachBack({ goal, planAt }: { goal: number; planAt: string }) {
  const { t } = useT();
  const s = useAppState();
  const [pick, setPick] = useState<Answer | undefined>();
  const [shown, setShown] = useState<Answer | null>(null);
  const [needPick, setNeedPick] = useState(false);
  const resultRef = useRef<HTMLDivElement>(null);
  const already = s.teachBack?.planAt === planAt ? s.teachBack : null;

  const check = () => {
    if (!pick) { setNeedPick(true); return; }
    setShown(pick);
    if (!already) setState({ teachBack: { at: new Date().toISOString(), planAt, correct: pick === "over" } });
    requestAnimationFrame(() => resultRef.current?.focus());
  };

  const question = t({ es: `Su meta es cerca de ${goal} gramos de carbohidratos en cada comida. Si una comida sale en rojo, ¿qué quiere decir?`, en: `Your goal is about ${goal} grams of carbohydrates at each meal. If a meal comes out red, what does it mean?` });

  if (already?.correct && !shown) {
    return (
      <Notice><p className="flex items-center gap-2 text-[1.1rem] font-bold"><Icon name="check" className="text-go" /> {t({ es: "Ya contestó la pregunta del plan. ¡Muy bien!", en: "You already answered the plan question. Well done!" })}</p></Notice>
    );
  }

  return (
    <section className="flex flex-col gap-3 rounded-2xl border-[3px] border-brand bg-panel p-5" aria-labelledby="tb-h">
      <h2 id="tb-h">{t({ es: "Una pregunta para ver si quedó claro", en: "One question to check it is clear" })}</h2>
      <ChoiceGroup<Answer> legend={question} name="teachback" value={pick} onChange={(v) => { setPick(v); setNeedPick(false); setShown(null); }}
        options={order(planAt).map((a) => ({ value: a, label: t(answers[a].label) }))} />
      {needPick && <p role="alert" className="text-[1.25rem] font-bold text-stop">{t({ es: "Escoja una respuesta.", en: "Choose an answer." })}</p>}
      <BigButton icon="check" onClick={check}>{t({ es: "Ver si está bien", en: "Check my answer" })}</BigButton>
      <div ref={resultRef} tabIndex={-1} aria-live="polite" className="outline-none">
        {shown && (
          <div className={`flex items-start gap-3 rounded-2xl border-[3px] p-4 ${shown === "over" ? "border-go bg-go text-white" : "border-stop bg-panel"}`}>
            <Icon name={shown === "over" ? "check" : "info"} className={shown === "over" ? "" : "text-stop"} />
            <p className="text-[1.25rem] font-bold">{t(answers[shown].why)}</p>
          </div>
        )}
      </div>
    </section>
  );
}
