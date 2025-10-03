<template>
  <div class="import-wrap">
    <h2 class="title">Import Calendar (.ics)</h2>

    <input
      class="file-input"
      type="file"
      accept=".ics,text/calendar"
      @change="onFileChange"
    />

    <div v-if="loading" class="hint">Parsing…</div>
    <div v-else-if="error" class="error">{{ error }}</div>

    <div v-else-if="events.length" class="list">
      <div
        v-for="(ev, i) in events"
        :key="ev.uid + ':' + (ev.recurrenceId ?? i)"
        class="card"
      >
        <div class="card-head">
          <div class="badge">Event</div>
          <div class="actions">
            <button class="btn btn-accent" @click="confirmOne(ev)">Confirm</button>
            <button class="btn btn-outline" @click="cancelOne(i)">Cancel</button>
          </div>
        </div>

        <div class="row">
          <div class="label">Title</div>
          <div class="value">{{ ev.title || '(No title)' }}</div>
        </div>
        <div class="row">
          <div class="label">Description</div>
          <div class="value">{{ ev.description || '—' }}</div>
        </div>
        <div class="row">
          <div class="label">Start</div>
          <div class="value">{{ formatDate(ev.start, ev.allDay) }}</div>
        </div>
        <div class="row">
          <div class="label">End</div>
          <div class="value">
            {{ ev.end ? formatDate(ev.end, ev.allDay) : '—' }}
          </div>
        </div>
      </div>

      <div class="bulk-actions">
        <button class="btn btn-accent" @click="confirmAll">Confirm All</button>
        <button class="btn btn-outline" @click="cancelAll">Cancel All</button>
      </div>
    </div>

    <div v-else class="hint">Choose an .ics file to preview events.</div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import ICAL from 'ical.js';

type PreviewEvent = {
  uid: string;
  recurrenceId?: string | null;
  title: string;
  description: string;
  start: Date;
  end: Date | null;
  allDay: boolean;
};

const emit = defineEmits<{
  /** Fired when the user confirms a single event */
  (e: 'add', event: PreviewEvent): void;
  /** Fired when the user confirms many events at once */
  (e: 'add-many', events: PreviewEvent[]): void;
  /** Fired when the user cancels all */
  (e: 'cancel-all'): void;
}>();

const events = ref<PreviewEvent[]>([]);
const loading = ref(false);
const error = ref<string | null>(null);

/** Format dates in the user's locale; for all-day, show date only */
function formatDate(d: Date, allDay: boolean): string {
  if (allDay) {
    return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(d);
  }
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(d);
}

async function onFileChange(e: Event) {
  const input = e.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;

  loading.value = true;
  error.value = null;
  events.value = [];

  try {
    const text = await file.text();
    events.value = await parseIcsToPreview(text);
  } catch (err: any) {
    console.error(err);
    error.value = 'Failed to parse the .ics file.';
  } finally {
    loading.value = false;
  }
}

/** Parse ICS text and return preview events.
 *  Keeps it simple: expands recurring events for the next 60 days (cap 200). */
async function parseIcsToPreview(icsText: string): Promise<PreviewEvent[]> {
  const jcal = ICAL.parse(icsText);
  const vcal = new ICAL.Component(jcal);
  const vevents = vcal.getAllSubcomponents('vevent');

  const out: PreviewEvent[] = [];
  const now = new Date();
  const viewStart = now;
  const viewEnd = new Date(now.getTime() + 60 * 24 * 3600 * 1000); // 60 days
  let emitted = 0;
  const MAX = 200;

  for (const ve of vevents) {
    const ev = new ICAL.Event(ve);

    // Non-recurring:
    if (!ev.isRecurring()) {
      out.push({
        uid: ev.uid,
        recurrenceId: null,
        title: ev.summary || '',
        description: (ev.description as unknown as string) || '',
        start: ev.startDate.toJSDate(),
        end: ev.endDate ? ev.endDate.toJSDate() : null,
        allDay: ev.startDate.isDate
      });
      emitted++;
      if (emitted >= MAX) break;
      continue;
    }

    // Recurring: expand within window
    const exp = new ICAL.RecurExpansion({ component: ve, dtstart: ev.startDate });

    while (emitted < MAX) {
      const next = exp.next();
      if (!next) break;

      const s = next.toJSDate();
      if (s < viewStart) continue;
      if (s >= viewEnd) break;

      // Apply per-instance overrides
      const details = ev.getOccurrenceDetails(next);

      out.push({
        uid: ev.uid,
        recurrenceId: details.recurrenceId
          ? details.recurrenceId.toJSDate().toISOString()
          : null,
        title: (details.item.summary as string) || ev.summary || '',
        description:
          (details.item.description as unknown as string) ||
          (ev.description as unknown as string) ||
          '',
        start: details.startDate.toJSDate(),
        end: details.endDate ? details.endDate.toJSDate() : null,
        allDay: details.startDate.isDate
      });
      emitted++;
    }
    if (emitted >= MAX) break;
  }

  // Sort by start time
  out.sort((a, b) => +a.start - +b.start);
  return out;
}

function confirmOne(ev: PreviewEvent) {
  emit('add', ev);
  // Remove from preview after confirming
  events.value = events.value.filter((x) => x !== ev);
}

function cancelOne(index: number) {
  events.value.splice(index, 1);
}

function confirmAll() {
  emit('add-many', events.value.slice());
  events.value = [];
}

function cancelAll() {
  events.value = [];
  emit('cancel-all');
}
</script>

<style scoped>
:root,
.import-wrap { --accent: #005493; --base: #ffffff; }

.import-wrap {
  background: var(--base);
  color: #0b0f12;
  padding: 1rem;
  max-width: 900px;
}

.title {
  margin: 0 0 .75rem 0;
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--accent);
}

.file-input {
  display: inline-block;
  margin: .5rem 0 1rem 0;
}

.hint { color: #445; margin-top: .5rem; }
.error { color: #b00020; margin-top: .5rem; }

.list { display: grid; gap: 12px; }

.card {
  border: 1px solid #d9e2ec;
  border-left: 6px solid var(--accent);
  border-radius: 10px;
  padding: .75rem .9rem;
  background: #fff;
  box-shadow: 0 1px 2px rgba(0,0,0,.04);
}

.card-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: .5rem;
}

.badge {
  background: var(--accent);
  color: #fff;
  font-size: .75rem;
  padding: .15rem .45rem;
  border-radius: 999px;
  letter-spacing: .02em;
}

.row {
  display: grid;
  grid-template-columns: 140px 1fr;
  gap: 10px;
  padding: .25rem 0;
  align-items: start;
}

.label {
  color: #334e68;
  font-weight: 600;
}
.value {
  color: #102a43;
  white-space: pre-wrap;
  word-break: break-word;
}

.actions { display: flex; gap: .5rem; }

.btn {
  border: 1px solid var(--accent);
  padding: .4rem .75rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  background: #fff;
}

.btn-accent {
  background: var(--accent);
  color: #fff;
  border-color: var(--accent);
}
.btn-accent:hover { filter: brightness(0.95); }

.btn-outline {
  background: #fff;
  color: var(--accent);
}
.btn-outline:hover { background: #f5fbff; }

.bulk-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  margin-top: .25rem;
}
</style>
