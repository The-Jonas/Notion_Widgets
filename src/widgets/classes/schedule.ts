// Grade de aulas escrita no próprio link do embed.
//
// Formato (uma aula por item, separadas por ";"):
//   dias horário-horário Nome @ Sala
//   mon,wed 08:00-09:50 Cálculo 1 @ ICC A1-23; tue 14:00-15:50 PAA @ PJC 102
// Dias aceitos: mon tue wed thu fri sat sun ou seg ter qua qui sex sab dom.

export interface Slot {
  day: number;     // 0 = domingo ... 6 = sábado (igual Date.getDay)
  start: number;   // minutos desde 00:00
  end: number;
  name: string;
  room: string;
}

const DAYS: Record<string, number> = {
  sun: 0, mon: 1, tue: 2, wed: 3, thu: 4, fri: 5, sat: 6,
  dom: 0, seg: 1, ter: 2, qua: 3, qui: 4, sex: 5, sab: 6, 'sáb': 6,
};

/** "08:30" ou "8h30" → minutos. */
function toMinutes(t: string): number {
  const m = t.trim().match(/^(\d{1,2})(?:[:h](\d{2}))?h?$/i);
  return m ? Number(m[1]) * 60 + Number(m[2] ?? 0) : NaN;
}

/** Lê o texto da grade e devolve as aulas (itens inválidos são ignorados). */
export function parseSchedule(raw: string): Slot[] {
  const slots: Slot[] = [];
  for (const item of raw.split(/[;\n]/)) {
    const m = item.trim().match(/^([a-zçá,\s-]+?)\s+(\d{1,2}(?:[:h]\d{2})?h?)\s*-\s*(\d{1,2}(?:[:h]\d{2})?h?)\s+(.+)$/i);
    if (!m) continue;
    const [name, room = ''] = m[4].split('@').map((s) => s.trim());
    const start = toMinutes(m[2]);
    const end = toMinutes(m[3]);
    if (!Number.isFinite(start) || !Number.isFinite(end)) continue;
    for (const d of m[1].toLowerCase().split(/[,\s]+/).filter(Boolean)) {
      if (d in DAYS) slots.push({ day: DAYS[d], start, end, name, room });
    }
  }
  return slots.sort((a, b) => a.day - b.day || a.start - b.start);
}

export interface Upcoming {
  slot: Slot;
  startsIn: number;  // minutos até começar (0 se já começou)
  daysAhead: number; // 0 = hoje
}

/** Aula acontecendo agora (se houver). */
export function currentSlot(slots: Slot[], now: Date): Slot | null {
  const day = now.getDay();
  const min = now.getHours() * 60 + now.getMinutes();
  return slots.find((s) => s.day === day && s.start <= min && min < s.end) ?? null;
}

/** As próximas `n` aulas a partir de agora (olhando até 7 dias à frente). */
export function upcoming(slots: Slot[], now: Date, n: number): Upcoming[] {
  const day = now.getDay();
  const min = now.getHours() * 60 + now.getMinutes();
  const out: Upcoming[] = [];
  for (let ahead = 0; ahead <= 7 && out.length < n; ahead++) {
    const d = (day + ahead) % 7;
    for (const s of slots.filter((x) => x.day === d)) {
      if (ahead === 0 && s.start <= min) continue;
      out.push({ slot: s, startsIn: ahead * 1440 + s.start - min, daysAhead: ahead });
      if (out.length >= n) break;
    }
  }
  return out;
}

/** 510 → "08:30". */
export function clock(min: number): string {
  return `${String(Math.floor(min / 60)).padStart(2, '0')}:${String(min % 60).padStart(2, '0')}`;
}

/** 95 → "1h 35m", 20 → "20 min". */
export function span(min: number): string {
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (h >= 24) return `${Math.floor(h / 24)}d ${h % 24}h`;
  return m ? `${h}h ${m}m` : `${h}h`;
}

export const DEMO =
  'mon,wed 08:00-09:50 Cálculo 1 @ ICC A1-23; mon,wed 10:00-11:50 Algoritmos @ PJC 102; tue,thu 14:00-15:50 Estruturas de Dados @ ICC B1-14; tue 16:00-17:50 Física 1 @ BSA S1; fri 08:00-09:50 Inglês Instrumental @ IL 12; thu 19:00-20:40 Lab de Programação @ LINF 5';
