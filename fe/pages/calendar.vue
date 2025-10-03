<template>
  <PageMain :title="pageTitle" :layout="pageLayout" v-if="!isLoggedIn">
    <Alert title="You are not logged in!" classes="alert-danger">
      <p>
        To use this tool you need to sign in to your  account. Sign in via
        sign in button from the top right.
      </p>
    </Alert>
  </PageMain>
  <PageMain :title="pageTitle" :layout="pageLayout" v-if="isLoggedIn">
    <!-- Event Form Modal -->
    <Modal
      id="eventForm"
      ref="eventFormModal"
      :title="formMode + ' Event'"
      :show-footer="true"
    >
      <Form
        action="#"
        id="calendar-form"
        @submit.prevent="handleSaveEvent"
        :validate="true"
        :defaultBtns="false"  
        :reviewForm="false"
      >
        <!-- Title -->
        <FormInput
          v-model="eventForm.title"
          name="title"
          label="Title"
          :required="true"
        />

        <!-- All-day -->
        <div class="form-row">
          <label class="-label" for="allDay">All-day</label>
          <input id="allDay" type="checkbox" v-model="eventForm.allDay" />
        </div>

        <!-- Start Date (date-only) -->
        <FormInput
          name="start_date"
          label="Date"
          type="date"
          v-model="eventForm.startDate"
          :required="true"
        />

        <!-- Times (hidden for all-day) -->
        <template v-if="!eventForm.allDay">
          <TimeSpinner v-model="eventForm.startTime" :step="5" label="Start time" />
          <TimeSpinner v-model="eventForm.endTime"   :step="5" label="End time" />
        </template>

        <!-- Description -->
        <FormTextArea
          v-model="eventForm.description"
          name="description"
          label="Description"
        />

        <!-- Recurrence -->
        <div class="-section">
          <h4 class="-section-title">Recurrence</h4>

          <!-- Frequency -->
          <div class="form-row">
            <label class="-label" for="freq">Repeats</label>
            <select id="freq" v-model="eventForm.recurrence.freq">
              <option value="NONE">Does not repeat</option>
              <option value="DAILY">Daily</option>
              <option value="WEEKLY">Weekly</option>
              <option value="MONTHLY">Monthly</option>
              <option value="YEARLY">Yearly</option>
            </select>
          </div>

          <!-- Interval -->
          <div class="form-row" v-if="eventForm.recurrence.freq !== 'NONE'">
            <label class="-label" for="interval">Every</label>
            <FormInput
              id="interval"
              type="number"
              min="1"
              style="max-width: 120px"
              v-model.number="eventForm.recurrence.interval"
              name="interval"
              label=""
              placeholder="1"
            />
            <span class="hint">
              {{ eventForm.recurrence.freq.toLowerCase() }}(s)
            </span>
          </div>

          <!-- Weekly: connected day buttons -->
          <div class="form-row" v-if="eventForm.recurrence.freq === 'WEEKLY'">
            <label class="-label">On</label>
            <div class="segmented segmented-days" role="group" aria-label="Repeat on">
              <template v-for="d in DAY_SEGMENTS" :key="d.value">
                <input
                  class="segmented-input"
                  type="checkbox"
                  :id="`wd-${d.value}`"
                  :value="d.value"
                  v-model="eventForm.recurrence.weekdays"
                />
                <label class="segmented-segment" :for="`wd-${d.value}`" :title="d.title">
                  {{ d.text }}
                </label>
              </template>
            </div>
          </div>

          <!-- Monthly options -->
          <div v-if="eventForm.recurrence.freq === 'MONTHLY'">
            <div class="form-row">
              <label class="-label" for="monthlyMode">Repeat by</label>
              <select id="monthlyMode" v-model="eventForm.recurrence.monthlyMode">
                <option value="">(choose)</option>
                <option value="day">Day of month</option>
                <option value="weekday">Nth weekday</option>
              </select>
            </div>

            <div class="form-row" v-if="eventForm.recurrence.monthlyMode === 'day'">
              <label class="-label" for="monthlyDay">Day</label>
              <FormInput
                id="monthlyDay"
                type="number"
                min="1"
                max="31"
                style="max-width: 120px"
                v-model.number="eventForm.recurrence.monthlyDay"
                name="monthlyDay"
                label=""
                placeholder="1..31"
              />
            </div>

            <div class="form-row" v-else-if="eventForm.recurrence.monthlyMode === 'weekday'">
              <label class="-label">Which</label>
              <select v-model.number="eventForm.recurrence.monthlyOrdinal" style="max-width: 120px">
                <option :value="1">1st</option>
                <option :value="2">2nd</option>
                <option :value="3">3rd</option>
                <option :value="4">4th</option>
                <option :value="-1">Last</option>
              </select>
              <select v-model="eventForm.recurrence.monthlyWeekday" style="max-width: 140px; margin-left: 8px;">
                <option v-for="d in ['MO','TU','WE','TH','FR','SA','SU']" :key="d" :value="d">{{ d }}</option>
              </select>
            </div>
          </div>

          <!-- End condition -->
          <div class="form-row" v-if="eventForm.recurrence.freq !== 'NONE'">
            <label class="-label">Ends</label>
            <div class="radio-group">
              <label><input type="radio" value="never" v-model="eventForm.recurrence.endMode" /> Never</label>
              <label><input type="radio" value="until" v-model="eventForm.recurrence.endMode" /> On date</label>
              <label><input type="radio" value="count" v-model="eventForm.recurrence.endMode" /> After N times</label>
            </div>
          </div>

          <FormInput
            v-if="eventForm.recurrence.freq !== 'NONE' && eventForm.recurrence.endMode === 'until'"
            name="end_date"
            label="Repeat Until"
            type="date"
            v-model="eventForm.recurrence.until"
          />

          <div class="form-row" v-if="eventForm.recurrence.freq !== 'NONE' && eventForm.recurrence.endMode === 'count'">
            <label class="-label" for="count">Occurrences</label>
            <FormInput
              id="count"
              type="number"
              min="1"
              style="max-width: 120px"
              v-model.number="eventForm.recurrence.count"
              name="count"
              label=""
              placeholder="e.g. 10"
            />
          </div>
        </div>
      </Form>

      <!-- Modal footer (explicit buttons) -->
      <template #footer>
        <!-- Cancel just closes -->
        <Button variant="secondary" @click="eventFormModal?.close?.()">Cancel</Button>

        <!-- Save submits the form above -->
        <Button
          variant="primary"
          class="ms-2"
          type="submit"
          form="calendar-form"
          :disabled="formMode === 'Saving'"
        >
          {{ formMode === 'Saving' ? 'Saving…' : (isEditing ? 'Save Changes' : 'Add Event') }}
        </Button>
      </template>
    </Modal>



    <!-- Delete Confirmation Modal -->
    <Modal
      id="deleteConfirmModal"
      ref="deleteConfirmModal"
      title="Confirm Deletion"
      :show-footer="false"
    >
      <p>Are you sure you want to delete this event?</p>
      <div>
        <Button class="me-3" variant="primary" @click="handleDeleteEvent"
          >Delete</Button
        >
        <Button variant="secondary" @click="cancelDeleteEvent"
          >Cancel</Button
        >
      </div>
    </Modal>

    <!-- Calendar Upload Modal -->
    <Modal
      id="uploadCalModal"
      ref="uploadCalModal"
      title="Upload Calendar"
    >
      <p>Upload a .ics file</p>

      <Form action="#" id="calendar-form">
        <input
          type="file"
          accept=".ics,text/calendar"
          @change="onFileChange"
        />
      </Form>

      <div v-if="loading" class="hint">Parsing...</div>

      <template v-else>
        <div v-if="stagedEvents.length" class="list">

          <!-- Sticky bulk actions (top) -->
          <div class="bulk-bar">
            <div class="count">
              {{ stagedEvents.length }} event{{ stagedEvents.length === 1 ? '' : 's' }} ready
            </div>
            <div class="spacer"></div>
            <Button type="button" variant="primary" @click="confirmAll">
              Add All
            </Button>
            <Button type="button" variant="secondary" class="ms-2" @click="cancelAll">
              Cancel All
            </Button>
          </div>

          <!-- Dense list -->
          <div class="ev-list">
            <div
              v-for="(ev, i) in stagedEvents"
              :key="ev.calendarid || i"
              class="ev-row"
            >
              <div class="ev-main">
                <div class="ev-title">
                  <span class="t">{{ ev.title || '(No title)' }}</span>
                  <span v-if="ev.location" class="loc"> · {{ ev.location }}</span>
                </div>
                <div class="ev-sub">
                  {{ formatRangeInZone(ev.startdatetime!, ev.enddatetime, ev.allday, ev.tzid) }}
                  <span v-if="!ev.allday && ev.tzid" class="tz"> ({{ ev.tzid }})</span>
                  <template v-if="ev.rrule">
                    <span class="dot"> • </span>
                    <span class="rr">{{ recurrenceSummary(ev).lineA }}</span>
                  </template>
                </div>
              </div>

              <div class="ev-actions">
                <Button
                  type="button"
                  variant="primary"
                  class="btn-compact"
                  @click="confirmOne(ev)"
                >
                  Add
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  class="btn-compact ms-1"
                  @click="cancelOne(i)"
                >
                  Skip
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div v-else class="hint">Choose an .ics file to preview events.</div>
      </template>
    </Modal>

    <div class="calendar-controls">
      <div class="cal-toolbar">
        <!-- LEFT: actions -->
        <div class="cal-actions">
          <Button variant="primary" modal="eventForm" @click="prepareNewEvent">
            <i class="fa fa-plus" aria-hidden="true"></i> Add Event
          </Button>
          <Button variant="primary" modal="uploadCalModal" @click="uploadCal">Import</Button>
          <Button variant="primary" @click="() => exportCal('My_Calendar', events.map(toExportRow))">Export</Button>
        </div>

        <!-- CENTER: nav -->
        <div class="calendar-nav">
          <Button variant="secondary" @click="prevPeriod">
            <i class="fa fa-chevron-left text-primary" aria-hidden="true"></i>
          </Button>
          <h3 class="cal-title">
            <template v-if="currentView === 'month'">{{ currentMonthName }} {{ currentYear }}</template>
            <template v-else>{{ weekRangeText }}</template>
          </h3>
          <Button variant="secondary" @click="nextPeriod">
            <i class="fa fa-chevron-right text-primary" aria-hidden="true"></i>
          </Button>
        </div>

        <!-- RIGHT: toggles -->
        <div class="cal-toggles">
          <div class="btn-group">
            <Button variant="secondary" :class="{ 'active-toggle': !showTasks }" @click="showTasks = false">Events</Button>
            <Button variant="secondary" :class="{ 'active-toggle': showTasks }" @click="showTasks = true">Tasks</Button>
          </div>

          <div class="btn-group">
            <Button variant="secondary" :class="{ 'active-toggle': currentView === 'month' }" @click="currentView = 'month'">Month</Button>
            <Button variant="secondary" :class="{ 'active-toggle': currentView === 'week' }" @click="currentView = 'week'">Week</Button>
          </div>

          <Button variant="outline-secondary" @click="goToToday">Today</Button>
        </div>
      </div>
    </div>

    <PageSection>
      <div class="calendar-wrapper">
        <div class="calendar-surface">

          <div class="calendar-container">
            <!-- Month View -->
            <div v-if="currentView === 'month'" class="calendar-month-view">
              <div class="calendar-grid">
                <div class="day-header" v-for="day in dayNames" :key="day">
                  {{ day }}
                </div>
                <div
                  v-for="day in calendarDays"
                  :key="day.date.toString()"
                  class="calendar-day"
                  :class="{
                    'current-month': day.isCurrentMonth,
                    today: isToday(day.date),
                  }"
                >
                  <div class="day-number">{{ day.date.getDate() }}</div>

                  <!-- Events Display -->
                  <template v-if="!showTasks">
                    <div
                      v-for="event in day.events"
                      :key="event.uid + '-' + (event.recurrenceId || event.start.toISOString())" 
                      class="calendar-event"
                      :style="{ borderLeft: '4px solid ' + getEventColor(event.master || event) }" 
                    >
                      <strong>{{ event.title || "Event" }}</strong>
                      <div class="event-time">
                        {{ formatTime(event.start) }} - {{ formatTime(event.end!) }}   
                      </div>
                      <div class="event-actions mt-1">
                        <Button
                          class="btn btn-primary badge me-2"
                          modal="eventForm"
                          @click.stop="prepareEditEvent(event.master || event)"  
                        >
                          <i class="fa fa-pencil" aria-hidden="true"></i>
                          <span class="sr-only">Edit Event</span>
                        </Button>
                        <Button
                          variant="secondary"
                          class="btn btn-primary badge"
                          modal="deleteConfirmModal"
                          @click.stop="setEventToDelete(event.master || event)"  
                        >
                          <i class="fa fa-trash text-primary" aria-hidden="true"></i>
                          <span class="sr-only">Delete event</span>
                        </Button>
                      </div>
                    </div>
                  </template>

                  <!-- Tasks Display -->
                  <template v-else>
                    <div
                      v-for="task in day.tasks"
                      :key="task.taskid"
                      class="calendar-task"
                      :style="{ backgroundColor: task.colour || '#e0f2f1' }"
                    >
                      <strong>{{ task.taskname || "Task" }}</strong>
                      <div class="task-time">
                        Due: {{ formatTime(task.duedate) }}
                      </div>
                    </div>
                  </template>
                </div>
              </div>
            </div>

            <!-- Week View -->
            <div v-else class="calendar-week-view">
              <div class="week-header">
                <div class="time-column"></div>
                <div
                  v-for="day in weekDays"
                  :key="day.date.toString()"
                  class="day-header"
                  :class="{ today: isToday(day.date) }"
                >
                  <div class="day-name">{{ formatDayName(day.date) }}</div>
                  <div class="day-date">{{ day.date.getDate() }}</div>
                </div>
              </div>

              <div class="week-body">
                <div class="time-column">
                  <div v-for="time in timeSlots" :key="time" class="time-slot">
                    {{ time }}
                  </div>
                </div>

                <div
                  v-for="(day, dayIndex) in weekDays"
                  :key="day.date.toString()"
                  class="day-column"
                  :class="{ today: isToday(day.date) }"
                >
                  <div
                    v-for="time in timeSlots"
                    :key="time"
                    class="time-slot"
                    modal="eventForm"
                    @click="!showTasks ? prepareNewEventAtTime(day.date, time) : null"
                  >
                    <!-- Events -->
                    <template v-if="!showTasks">
                      <template v-for="event in day.events" :key="event.uid + '-' + (event.recurrenceId || event.start.toISOString())">
                        <div
                          v-if="isEventInTimeSlot(event, time)"
                          class="calendar-event"
                          :style="{ borderLeft: '4px solid ' + getEventColor(event.master || event) }"
                        >
                          <strong>{{ event.title || "Event" }}</strong>
                          <div class="event-time">
                            {{ formatTime(event.start) }} - {{ formatTime(event.end!) }} 
                          </div>
                          <div class="event-actions mt-1">
                            <Button
                              class="btn btn-primary badge me-2"
                              modal="eventForm"
                              @click.stop="prepareEditEvent(event.master || event)"
                            >
                              <i class="fa fa-pencil" aria-hidden="true"></i>
                            </Button>
                            <Button
                              variant="secondary"
                              class="btn btn-primary badge"
                              modal="deleteConfirmModal"
                              @click.stop="setEventToDelete(event.master || event)"
                            >
                              <i class="fa fa-trash text-primary" aria-hidden="true"></i>
                              <span class="sr-only">Delete event</span>
                            </Button>
                          </div>
                        </div>
                      </template>
                    </template>

                    <!-- Tasks (unchanged) -->
                    <template v-else>
                      <div v-for="task in day.tasks" :key="task.taskid">
                        <div
                          v-if="isTaskInTimeSlot(task, time)"
                          class="calendar-task"
                          :style="{ backgroundColor: task.colour || '#e0f2f1' }"
                        >
                          <strong>{{ task.taskname || 'Task' }}</strong>
                          <div class="task-time">Due: {{ formatTime(task.duedate) }}</div>
                        </div>
                      </div>
                    </template>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageSection>

  </PageMain>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import type { ICalendar } from "~/types/calendar";
import calendarService from "~/api/calendarService";
import { Modal } from "#components";
import type { ITask } from "~/types/task";
import taskService from "~/api/taskService";
import ICAL from 'ical.js'
import TimeSpinner from "~/components/TimeSpinner.vue";
//import { sleep } from "../utils/sleep";

const WEEKDAYS = ['SU','MO','TU','WE','TH','FR','SA'] as const;
type Weekday = typeof WEEKDAYS[number];
type Frequency = 'NONE'|'DAILY'|'WEEKLY'|'MONTHLY'|'YEARLY';
type MonthlyMode = ''|'day'|'weekday';

const DAY_SEGMENTS = [
  { value: 'SU', text: 'S', title: 'Sunday' },
  { value: 'MO', text: 'M', title: 'Monday' },
  { value: 'TU', text: 'T', title: 'Tuesday' },
  { value: 'WE', text: 'W', title: 'Wednesday' },
  { value: 'TH', text: 'Th', title: 'Thursday' },
  { value: 'FR', text: 'F', title: 'Friday' },
  { value: 'SA', text: 'Sa', title: 'Saturday' },
] as const;

type ExportItem = {
  uid?: string;
  title?: string;
  description?: string;
  startdatetime: Date;
  enddatetime?: Date | null;
  allDay?: boolean;
  rrule?: string | null;
};

type RRuleParts = {
  FREQ?: 'DAILY'|'WEEKLY'|'MONTHLY'|'YEARLY';
  INTERVAL?: string;
  BYDAY?: string;
  BYMONTHDAY?: string;  
  UNTIL?: string;      
  COUNT?: string;
  WKST?: Weekday;
};

// occurence for rendering on calendar includes recurrenceId
type Occurrence = {
  uid: string;
  title: string;
  description?: string;
  location?: string;
  start: Date;
  end?: Date | null;
  allday: boolean;
  tzid?: string;
  rrule?: string | null;
  master: ICalendar;  
  recurrenceId?: string | null; 
};

interface EventForm {
  title: string;
  description: string;
  startDate: string;
  startTime: string;
  endTime: string;
  endDate: string;
  allDay: boolean;

  recurrence: {
    freq: Frequency; 
    interval: number;    

    // WEEKLY:
    weekdays: Weekday[];     

    // MONTHLY:
    monthlyMode: MonthlyMode; 
    monthlyDay?: number;     
    monthlyOrdinal?: 1|2|3|4|-1; 
    monthlyWeekday?: Weekday;

    // End condition:
    endMode: 'never'|'until'|'count';
    until?: string; 
    count?: number; 
  };
}


const pageTitle = "Calendar";
const pageLayout = "main";
const isLoggedIn: Boolean = true;
const appConfig = useAppConfig();

const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const currentDate = ref(new Date());
const events = ref<ICalendar[]>([]);
const currentView = ref<"month" | "week">("month");

// Generate time slots for week view
const timeSlots = computed(() => {
  const slots = [];
  for (let hour = 7; hour <= 21; hour++) {
    slots.push(`${hour}:00`);
  }
  return slots;
});

const suspendExpansion = ref(false);

// Modals
const eventFormModal = ref();
const deleteConfirmModal = ref();
const uploadCalModal = ref();

// file dependencies
const calFileName = ref<string>('');
const fileSize = ref<number>(0);
const preview = ref<string>('');

const stagedEvents = ref<Partial<ICalendar>[]>([]);

// Add showTasks state
const showTasks = ref(false); // false = events, true = tasks

// Fetch tasks
const tasks = ref<ITask[]>([]);
const fetchTasks = async () => {
  try {
    const response = await taskService.getTasks();
    tasks.value = response.data;
  } catch (error) {
    console.error("Failed to fetch tasks:", error);
  }
};

// Add task handling to day objects
function createDayObject(date: Date, isCurrentMonth: boolean) {
  return {
    date,
    isCurrentMonth,
    events: getEventsForDate(date),
    tasks: getTasksForDate?.(date) ?? [],
  };
}
// Get tasks for a specific date
function getTasksForDate(date: Date): ITask[] {
  return tasks.value.filter((task: ITask) => {
    if (!task.duedate) return false;
    const taskDate = new Date(task.duedate);
    return (
      taskDate.getDate() === date.getDate() &&
      taskDate.getMonth() === date.getMonth() &&
      taskDate.getFullYear() === date.getFullYear()
    );
  });
}

// Check if task is in time slot (for week view)
function isTaskInTimeSlot(task: ITask, timeSlot: string): boolean {
  if (!task.duedate) return false;
  const [hour] = timeSlot.split(":").map(Number);
  const taskDate = new Date(task.duedate);
  return taskDate.getHours() === hour;
}

// Update weekDays computed for tasks
const weekDays = computed(() => {
  const days = [];
  const current = new Date(currentDate.value);
  current.setDate(current.getDate() - current.getDay());

  for (let i = 0; i < 7; i++) {
    const date = new Date(current);
    date.setDate(current.getDate() + i);
    days.push({
      date,
      events: !showTasks.value ? getEventsForDate(date) : [],
      tasks: showTasks.value ? getTasksForDate(date) : [],
    });
  }

  return days;
});

// Form state
const formMode = ref<"Add" | "Edit" | "Saving">("Add");
const setFormMode = (mode: "Add" | "Edit" | "Saving") => {
  formMode.value = mode;
};
const isEditing = ref(false);
const loading = ref(false);
const currentEvent = ref<ICalendar | null>(null);
const eventToDelete = ref<ICalendar | null>(null);
const eventForm = ref<EventForm>({
  title: '',
  description: '',
  startDate: '',
  startTime: '',
  endDate: '',
  endTime: '',
  allDay: false,
  recurrence: {
    freq: 'NONE',
    interval: 1,
    weekdays: [],
    monthlyMode: '',
    monthlyDay: undefined,
    monthlyOrdinal: 1,
    monthlyWeekday: undefined,
    endMode: 'never',
    until: '',
    count: undefined,
  },
});

// Helper to convert Date to datetime-local string
function toDateTimeLocal(d: Date) {
  const date = new Date(d);
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toISOString().slice(0, 16);
}

async function fetchEvents() {
  try {
    const response = await calendarService.getCalendars();
    events.value = (response.data as any[])
      .map(normalizeRow)
      .sort((a, b) => +a.startdatetime - +b.startdatetime);
  } catch (error) {
    console.error("Failed to fetch events:", error);
  }
}

// Generate a color for the event based on title
function getEventColor(event: ICalendar): string {
  return event.task?.colour || "#e3f2fd"; // Use task color if available, else default
}

// Add Events
function roundUp(date: Date, minutes = 30): Date {
  const ms = minutes * 60 * 1000;
  return new Date(Math.ceil(date.getTime() / ms) * ms);
}
function toYMD(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const da = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${da}`;
}
function toHM(d: Date): string {
  const h = String(d.getHours()).padStart(2, '0');
  const m = String(d.getMinutes()).padStart(2, '0');
  return `${h}:${m}`;
}

function prepareNewEvent() {
  isEditing.value = false;

  const now = new Date();
  const start = roundUp(now, 30);                // next 30-min slot
  const end   = new Date(start.getTime() + 60 * 60 * 1000); // +1 hour

  eventForm.value = {
    title: '',
    description: '',
    allDay: false,

    // date-only + time-only fields
    startDate: toYMD(start),
    startTime: toHM(start),
    endDate:   toYMD(end),   
    endTime:   toHM(end),

    recurrence: {
      freq: 'NONE',          // NONE | DAILY | WEEKLY | MONTHLY | YEARLY
      interval: 1,
      weekdays: [],       
      monthlyMode: '',  
      monthlyDay: undefined,
      monthlyOrdinal: 1, 
      monthlyWeekday: undefined,
      endMode: 'never',
      until: '',      
      count: undefined,
    },
  };

  // catch-all form validation reset
  nextTick().then(() => {
    const rootEl: HTMLElement | undefined =
      (eventFormModal.value?.$el as HTMLElement | undefined) ??
      (eventFormModal.value as unknown as HTMLElement | undefined)

    if (!rootEl) return

    const formEl = (rootEl.matches('form') ? rootEl : rootEl.querySelector('form')) as HTMLFormElement | null

    // Native reset
    formEl?.reset?.()

    const container = formEl ?? rootEl
    container.classList.remove('was-validated')
    container.querySelectorAll('.is-invalid,[aria-invalid="true"]').forEach((el: Element) => {
      (el as HTMLElement).classList.remove('is-invalid')
      ;(el as HTMLElement).setAttribute('aria-invalid', 'false')
      ;(el as HTMLInputElement).setCustomValidity?.('')
    })
  })

  eventFormModal.value?.open?.();
}

// Upload .ics file
function uploadCal() {
  // reset values
  calFileName.value = "";
  fileSize.value = 0;
  stagedEvents.value = [];
  preview.value = "";
  //open modal
  uploadCalModal.value.open();
}

async function onFileChange(e: Event) {
  const input = e.target as HTMLInputElement;
  const file = input.files?.[0]
  if (!file) return;

  try {
    loading.value = true;
    events.value = [];

    calFileName.value = file.name;
    fileSize.value = file.size

    const text = await file.text();
    await parseIcsToPreview(text);
    preview.value = text.slice(0, 300);
  }  catch (err: any) {
    console.error(err)
  } finally {
    loading.value = false;
  }
}

// Parse ical and stuff

function firstInstanceEnd(start: Date, end: Date) {
  const d = new Date(start);
  d.setHours(end.getHours(), end.getMinutes(), end.getSeconds(), end.getMilliseconds());
  if (d <= start) d.setDate(d.getDate() + 1);
  return d;
}

async function parseIcsToPreview(icsText: string) {
  const jcal = ICAL.parse(icsText);
  const vcal = new ICAL.Component(jcal);
  const vevents = vcal.getAllSubcomponents('vevent');

  const staged: Partial<ICalendar>[] = [];

  for (const ve of vevents) {
    const ev = new ICAL.Event(ve);
    const dtstart = ev.startDate.toJSDate();
    const dtend   = ev.endDate ? ev.endDate.toJSDate() : null;

    const rruleProp = ve.getFirstProperty('rrule');
    const rruleStr  = rruleProp ? String(rruleProp.getFirstValue()) : null;

    const exProps = ve.getAllProperties('exdate') || [];
    const rProps  = ve.getAllProperties('rdate')  || [];
    const exdate = exProps.map(p => String(p.getFirstValue())).join(',');
    const rdate  = rProps .map(p => String(p.getFirstValue())).join(',');

    const allday = !!ev.startDate.isDate;
    const instanceEnd = dtend
      ? (rruleStr ? firstInstanceEnd(dtstart, dtend) : dtend)
      : null;

    staged.push({
      calendarid: ev.uid || crypto.randomUUID(),
      title: ev.summary || '',
      description: ev.description || '',
      startdatetime: dtstart,
      enddatetime: instanceEnd ?? dtstart,
      allday,
      rrule: rruleStr || undefined,
      exdate: exdate || undefined,
      rdate: rdate || undefined,
      location: ev.location || undefined,
    });
  }

  stagedEvents.value = staged; // one per series
}

function formatDateInZone(d: Date, allDay: boolean, tzid?: string) {
  const dateFmt = new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    ...(allDay ? {} : tzid ? { timeZone: tzid } : {})
  });
  const timeFmt = allDay ? null : new Intl.DateTimeFormat(undefined, {
    timeStyle: 'short',
    ...(tzid ? { timeZone: tzid } : {})
  });
  return allDay
    ? dateFmt.format(d)
    : `${dateFmt.format(d)} ${timeFmt!.format(d)}`;
}

function formatRangeInZone(start: Date, end?: Date | null, allDay = false, tzid?: string) {
  if (allDay) return formatDateInZone(start, true, tzid);
  const date = new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', ...(tzid ? { timeZone: tzid } : {}) }).format(start);
  const t = new Intl.DateTimeFormat(undefined, { timeStyle: 'short', ...(tzid ? { timeZone: tzid } : {}) });
  const s = t.format(start);
  const e = end ? t.format(end) : '';
  return `${date} ${s}${e ? '–' + e : ''}`;
}

type ExportRow = {
  calendarid?: string;
  title?: string;
  description?: string | null;
  location?: string | null;
  startdatetime: Date;
  enddatetime?: Date | null;
  allday: boolean;
  tzid?: string | null;
  rrule?: string | null;
  rdate?: string | null;
  exdate?: string | null;
};

function buildIcs(filename: string, items: ExportRow[]): string {
  const vcal = new ICAL.Component(['vcalendar', [], []]);
  vcal.addPropertyWithValue('prodid', '-//Mathine//Calendar 1.0//EN');
  vcal.addPropertyWithValue('version', '2.0');
  vcal.addPropertyWithValue('calscale', 'GREGORIAN');

  for (const ev of items) {
    const ve = new ICAL.Component('vevent');
    ve.addPropertyWithValue('uid', ev.calendarid || (crypto?.randomUUID?.() ?? String(Math.random())));
    ve.addPropertyWithValue('dtstamp', ICAL.Time.fromJSDate(new Date(), true));

    if (ev.title)       ve.addPropertyWithValue('summary', ev.title);
    if (ev.description) ve.addPropertyWithValue('description', ev.description);
    if (ev.location)    ve.addPropertyWithValue('location', ev.location);

    if (ev.allday) {
      const s = ICAL.Time.fromJSDate(ev.startdatetime, true); (s as any).isDate = true;
      const e = ICAL.Time.fromJSDate(ev.enddatetime ?? new Date(ev.startdatetime.getTime()+86400000), true);
      (e as any).isDate = true;
      ve.addPropertyWithValue('dtstart', s);
      ve.addPropertyWithValue('dtend', e);
    } else {
      // TZ-aware or UTC
      const addDT = (name: 'dtstart'|'dtend', d: Date) => {
        if (ev.tzid) {
          const p = new ICAL.Property(name, ve);
          p.setParameter('tzid', ev.tzid);
          p.setValue(ICAL.Time.fromJSDate(d));
          ve.addProperty(p);
        } else {
          ve.addPropertyWithValue(name, ICAL.Time.fromJSDate(d, true));
        }
      };
      addDT('dtstart', ev.startdatetime);
      if (ev.enddatetime) addDT('dtend', ev.enddatetime);
    }

    if (ev.rrule) ve.addPropertyWithValue('rrule', ICAL.Recur.fromString(ev.rrule));
    vcal.addSubcomponent(ve);
  }
  return vcal.toString();
}

function exportCal(filename = 'calendar', items?: ExportRow[]) {
  const rows = (items && items.length) ? items : events.value.map(toExportRow);
  if (!rows.length) {
    console.warn('No events to export');
    return;
  }
  const ics = buildIcs(filename, rows);   
  downloadIcs(ics, `${filename}.ics`);   
}

// Confirm one staged event from ics upload
async function confirmOne(ev: Partial<ICalendar>, i?: number) {
  loading.value = true;
  try {
    const res = await calendarService.createCalendar(ev as ICalendar);
    updateLocalEvents(res.data, true);
    if (typeof i === 'number') stagedEvents.value.splice(i, 1);
  } finally {
    loading.value = false;
  }
}

// Cancel one staged event fron ics upload
function cancelOne(index: number) {
  stagedEvents.value.splice(index, 1);
}

function updateLocalEventsBulk(rows: any[]) {
  const normalized = rows.map(normalizeRow);
  const map = new Map(events.value.map(e => [e.calendarid, e]));
  for (const r of normalized) map.set(r.calendarid, r);
  events.value = Array.from(map.values()).sort((a,b)=>+a.startdatetime - +b.startdatetime);
}

async function confirmAll() {
  if (loading.value) return;
  loading.value = true;
  suspendExpansion.value = true;
  try {
    const toCreate = stagedEvents.value.slice();
    stagedEvents.value = [];

    const created: ICalendar[] = [];
    const CONC = 4; let idx = 0;

    async function worker() {
      while (idx < toCreate.length) {
        const i = idx++;
        const res = await calendarService.createCalendar(toCreate[i] as ICalendar);
        created.push(res.data);
      }
    }
    await Promise.all(Array.from({ length: CONC }, worker));
    updateLocalEventsBulk(created); // single reactive assignment
  } catch (e) {
    console.error('Bulk create failed', e);
  } finally {
    suspendExpansion.value = false;
    loading.value = false;
  }
}

function cancelAll() {
  stagedEvents.value = [];
}



// Prepare new event at specific time (for week view)
function prepareNewEventAtTime(day: Date, time: string) {
  prepareNewEvent();

  // parse "HH:mm" (fallback 09:00 if malformed)
  const m = /^(\d{1,2}):(\d{2})$/.exec(time);
  const hours = m ? Number(m[1]) : 9;
  const minutes = m ? Number(m[2]) : 0;

  const start = new Date(day);
  start.setHours(hours, minutes, 0, 0);

  const end = new Date(start.getTime() + 60 * 60 * 1000); // +1 hour

  // fill the new form shape
  eventForm.value.allDay = false;
  eventForm.value.startDate = toYMD(start);
  eventForm.value.startTime = toHM(start);
  eventForm.value.endDate   = toYMD(end); 
  eventForm.value.endTime   = toHM(end);
}

// Set event to delete
function setEventToDelete(event: ICalendar) {
  eventToDelete.value = event;
  deleteConfirmModal.value?.open();
}

// Cancel event deletion
function cancelDeleteEvent() {
  eventToDelete.value = null;
  deleteConfirmModal.value?.close();
}

function buildRRuleFromForm(form: EventForm): string | undefined {
  const r = form.recurrence;
  if (!r || r.freq === 'NONE') return undefined;

  // DTSTART (local) for defaults
  const startLocal = parseLocalDateTime(
    form.startDate,
    form.allDay ? '00:00' : (form.startTime || '00:00')
  );

  const parts: string[] = [`FREQ=${r.freq}`];

  if (r.interval && r.interval > 1) parts.push(`INTERVAL=${Math.floor(r.interval)}`);

  if (r.freq === 'WEEKLY') {
    const startWd = weekdayCode(startLocal);
    const days = Array.isArray(r.weekdays) ? [...r.weekdays] : [];
    if (!days.length) days.push(startWd);
    else if (!days.includes(startWd)) days.push(startWd);
    parts.push(`BYDAY=${days.join(',')}`);
  }

  if (r.freq === 'MONTHLY') {
    if (r.monthlyMode === 'day' && r.monthlyDay) {
      parts.push(`BYMONTHDAY=${r.monthlyDay}`);
    } else if (r.monthlyMode === 'weekday' && r.monthlyWeekday) {
      const ord = r.monthlyOrdinal ?? 1; // 1|2|3|4|-1
      parts.push(`BYDAY=${ord === -1 ? '-1' : String(ord)}${r.monthlyWeekday}`);
    } else {
      // default to DTSTART day-of-month
      parts.push(`BYMONTHDAY=${startLocal.getDate()}`);
    }
  }

  if (r.endMode === 'until' && r.until) {
    const [ud, ut] = splitDateTimeString(r.until);
    // If user picked date-only for all-day events, make UNTIL inclusive end-of-day local
    const untilLocal = parseLocalDateTime(
      ud,
      ut ?? (form.allDay ? '23:59' : (form.endTime || '23:59'))
    );
    parts.push(`UNTIL=${toIcsUtc(untilLocal)}`);
  } else if (r.endMode === 'count' && r.count && r.count > 0) {
    parts.push(`COUNT=${Math.floor(r.count)}`);
  }

  return parts.join(';');
}


// Edit event
function prepareEditEvent(event: ICalendar) {
  setFormMode("Edit");
  isEditing.value = true;
  currentEvent.value = event;

  // Base datetime-local inputs
  const start = new Date(event.startdatetime);
  const end   = event.enddatetime ? new Date(event.enddatetime) : undefined;

  // Parse RRULE string (e.g., "FREQ=WEEKLY;INTERVAL=2;BYDAY=MO,WE;UNTIL=20251231T235959Z")
  const R = parseRRuleString((event as any).rrule);

  // Frequency
  const freq: Frequency =
    R.FREQ === 'DAILY'   ? 'DAILY' :
    R.FREQ === 'WEEKLY'  ? 'WEEKLY' :
    R.FREQ === 'MONTHLY' ? 'MONTHLY' :
    R.FREQ === 'YEARLY'  ? 'YEARLY' : 'NONE';

  // Interval
  const interval = R.INTERVAL ? Math.max(1, Number(R.INTERVAL)) : 1;

  // Weekly weekdays
  let weekdays: Weekday[] = [];
  if (freq === 'WEEKLY') {
    if (R.BYDAY) {
      weekdays = R.BYDAY.split(',')
        .map(s => s.trim() as Weekday)
        .filter(s => ['SU','MO','TU','WE','TH','FR','SA'].includes(s));
    }
    if (!weekdays.length) weekdays = [weekdayCode(start)];
  }

  // Monthly mode
  let monthlyMode: '' | 'day' | 'weekday' = '';
  let monthlyDay: number | undefined;
  let monthlyOrdinal: 1|2|3|4|-1 | undefined = 1;
  let monthlyWeekday: Weekday | undefined;

  if (freq === 'MONTHLY') {
    if (R.BYMONTHDAY) {
      const first = Number(R.BYMONTHDAY.split(',')[0]);
      if (Number.isFinite(first)) {
        monthlyMode = 'day';
        monthlyDay = first;
      }
    } else if (R.BYDAY) {
      // Expect forms like "2TU" or "-1FR"
      const tokens = R.BYDAY.split(',').map(s => s.trim());
      const m = tokens[0].match(/^(-?\d)?(SU|MO|TU|WE|TH|FR|SA)$/);
      if (m) {
        monthlyMode = 'weekday';
        monthlyOrdinal = (m[1] ? Number(m[1]) as any : 1);
        monthlyWeekday = m[2] as Weekday;
      }
    }
    // Fallback: same day-of-month as DTSTART
    if (!monthlyMode) {
      monthlyMode = 'day';
      monthlyDay = start.getUTCDate();
    }
  }

  // End condition
  let endMode: 'never'|'until'|'count' = 'never';
  let until = '';
  let count: number | undefined;

  if (R.COUNT) {
    const n = Number(R.COUNT);
    if (Number.isFinite(n) && n > 0) { endMode = 'count'; count = n; }
  } else if (R.UNTIL) {
    endMode = 'until';
    until = toDateTimeLocal(parseIcsUntilToDate(R.UNTIL));
  }

  const allDay = Boolean((event as any).allday);

  // Populate the simple form
  eventForm.value = {
    title: event.title || '',
    description: event.description || '',
    startDate: toYMD(start),
    startTime: toHM(start),
    endDate:   toYMD(end!),   
    endTime:   toHM(end!),
    allDay,
    recurrence: {
      freq,
      interval,
      weekdays,
      monthlyMode,
      monthlyDay,
      monthlyOrdinal,
      monthlyWeekday,
      endMode,
      until,
      count,
    },
  };

  eventFormModal.value?.open?.();
}


// Close modals
function closeEventFormModal() {
  eventFormModal.value.close();
}

function coerceRecurrenceUntilFromEndDate(form: EventForm) {
  const r = form.recurrence;
  if (!r || r.freq === 'NONE') return;

  const hasUntil = r.endMode === 'until' && !!r.until;
  const hasCount = r.endMode === 'count' && !!r.count;
  const hasEndDate = !!form.endDate;

  if (!hasUntil && !hasCount && hasEndDate) {
    r.endMode = 'until';
    r.until = form.endDate!;
  }
}

// Handle form submission
async function handleSaveEvent() {
  if (loading.value) return;

  try {
    loading.value = true;
    setFormMode("Saving");

    const form = eventForm.value;

    // Build instance start/end (single event)
    const start = parseLocalDateTime(
      form.startDate,
      form.allDay ? '00:00' : (form.startTime || '00:00')
    );
    if (isNaN(+start)) throw new Error("Start date is required.");

    const endProvided = !!(form.endDate || form.endTime);
    const rawEnd = endProvided
      ? parseLocalDateTime(
          form.endDate || form.startDate,
          form.allDay ? '00:00' : (form.endTime || form.startTime || '00:00')
        )
      : new Date(start);

    if (!form.allDay && rawEnd < start) throw new Error("End must be after start.");

    const isRecurring = form.recurrence?.freq && form.recurrence.freq !== 'NONE';
    const instanceEnd = isRecurring ? alignEndToStartDay(start, rawEnd) : rawEnd;

    // sanitize before building RRULE
    if (isRecurring) {
      if (form.recurrence.endMode !== 'until') form.recurrence.until = '';
      if (form.recurrence.endMode !== 'count') form.recurrence.count = undefined;
    }

    const rrule = buildRRuleFromForm({
      ...form,
      recurrence: {
        ...form.recurrence,
        // Only pass through fields that match the chosen mode
        until: form.recurrence.endMode === 'until' ? form.recurrence.until : '',
        count: form.recurrence.endMode === 'count' ? form.recurrence.count : undefined,
      }
    });

    const eventData: Partial<ICalendar> = {
      title: (form.title || '').trim(),
      description: (form.description || '').trim(),
      startdatetime: start,
      enddatetime: instanceEnd,
      allday: !!form.allDay,
      rrule: rrule ?? undefined,
    };

    if (isEditing.value && currentEvent.value) {
      const res = await calendarService.updateCalendar(currentEvent.value.calendarid, eventData);
      updateLocalEvents(res.data);
    } else {
      const res = await calendarService.createCalendar(eventData as ICalendar);
      updateLocalEvents(res.data, true);
    }

    closeEventFormModal();
  } catch (error) {
    console.error("Failed to save event:", error);
  } finally {
    loading.value = false;
    setFormMode("Add");
  }
}



// Handle deletion
async function handleDeleteEvent() {
  if (!eventToDelete.value) return;

  try {
    await calendarService.deleteCalendar(eventToDelete.value.calendarid);
    removeLocalEvent(eventToDelete.value.calendarid);
    deleteConfirmModal.value?.close();
    eventToDelete.value = null;
  } catch (error) {
    console.error("Failed to delete event:", error);
  }
}

// local events management
function compareEvents(a: ICalendar, b: ICalendar) {
  const aStart = new Date(a.startdatetime).getTime();
  const bStart = new Date(b.startdatetime).getTime();
  if (aStart !== bStart) return aStart - bStart;
  const aEnd = new Date(a.enddatetime).getTime();
  const bEnd = new Date(b.enddatetime).getTime();
  if (aEnd !== bEnd) return aEnd - bEnd;
  return (a.title || "").localeCompare(b.title || "");
}
function insertSorted<T>(arr: T[], item: T, cmp: (x: T, y: T) => number) {
  let lo = 0, hi = arr.length;
  while (lo < hi) {
    const mid = (lo + hi) >>> 1;
    if (cmp(arr[mid], item) <= 0) lo = mid + 1;
    else hi = mid;
  }
  return [...arr.slice(0, lo), item, ...arr.slice(lo)];
}

function updateLocalEvents(updatedEvent: ICalendar | any, isNew = false) {
  const ev = normalizeRow(updatedEvent);

  if (isNew) {
    // work on a copy so insertSorted can't mutate the original in place
    const next = insertSorted([...events.value], ev, compareEvents);
    events.value = Array.isArray(next) ? next : [...events.value, ev]; // safety
    return;
  }

  // remove then reinsert (covers time changes that move its position)
  const without = events.value.filter(e => e.calendarid !== ev.calendarid);
  const next = insertSorted(without, ev, compareEvents);
  events.value = Array.isArray(next) ? next : [...without, ev]; // safety
}

function removeLocalEvent(calendarid: string) {
  const index = events.value.findIndex((e) => e.calendarid === calendarid);
  if (index !== -1) {
    events.value.splice(index, 1);
  }
}

// Calendar display logic
const currentYear = computed(() => currentDate.value.getFullYear());
const currentMonth = computed(() => currentDate.value.getMonth());
const currentMonthName = computed(() =>
  currentDate.value.toLocaleString("default", { month: "long" })
);

const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

function occursOnDay(ev: { start: Date; end?: Date | null }, day: Date): boolean {
  const dayStart = startOfDay(day);
  const dayEnd   = addDays(dayStart, 1);
  const s = ev.start;
  const e = ev.end ?? ev.start; // <= default
  return s < dayEnd && e > dayStart; // [start, end)
}

const viewWindow = computed(() => {
  if (currentView.value === 'month') {
    const firstOfMonth = new Date(currentYear.value, currentMonth.value, 1);
    const firstGrid = addDays(firstOfMonth, -firstOfMonth.getDay());          // Sunday grid start
    const lastOfMonth = new Date(currentYear.value, currentMonth.value + 1, 0);
    const lastGrid = addDays(lastOfMonth, 6 - lastOfMonth.getDay());          // Saturday grid end
    return { start: startOfDay(firstGrid), end: addDays(startOfDay(lastGrid), 1) }; // [start, end)
  } else {
    // Week view: start on Sunday of the week containing currentDate
    const base = currentDate.value;
    const sunday = addDays(startOfDay(base), -base.getDay());
    return { start: sunday, end: addDays(sunday, 7) };
  }
});

function alignEndToStartDay(start: Date, end: Date): Date {
  // Copy start’s date; use end’s clock time
  const d = new Date(start);
  d.setHours(end.getHours(), end.getMinutes(), end.getSeconds(), end.getMilliseconds());
  // If the end clock is earlier than start (overnight events), push to next day
  if (d <= start) d.setDate(d.getDate() + 1);
  return d;
}

function computeAllDayEnd(start: Date, end?: Date | null) {
  // DTEND for all-day is non-inclusive. If end is provided, use its date-only;
  // otherwise use start + 1 day.
  const s = new Date(start); s.setHours(0,0,0,0);
  if (!end) { const d = new Date(s); d.setDate(d.getDate() + 1); return d; }
  const e = new Date(end); e.setHours(0,0,0,0);
  return e > s ? e : new Date(s.getTime() + 86400000);
}

function buildVeventFromRow(row: ICalendar): ICAL.Component {
  const ve = new ICAL.Component('vevent');
  ve.addPropertyWithValue('uid', row.calendarid);
  ve.addPropertyWithValue('dtstamp', ICAL.Time.fromJSDate(new Date(), true));

  const hasRecurrence = !!row.rrule || !!row.rdate;

  if (row.allday) {
    // use local date parts; mark VALUE=DATE
    const s = ICAL.Time.fromJSDate(row.startdatetime); // <-- no ", true"
    (s as any).isDate = true;
    ve.addPropertyWithValue('dtstart', s);

    const endDate = computeAllDayEnd(row.startdatetime, row.enddatetime ?? null);
    const e = ICAL.Time.fromJSDate(endDate);           // <-- no ", true"
    (e as any).isDate = true;
    ve.addPropertyWithValue('dtend', e);
  } else {
    // Timed event
    if (row.tzid) {
      const p = new ICAL.Property('dtstart', ve);
      p.setParameter('tzid', row.tzid);
      p.setValue(ICAL.Time.fromJSDate(row.startdatetime));
      ve.addProperty(p);
    } else {
      ve.addPropertyWithValue('dtstart', ICAL.Time.fromJSDate(row.startdatetime, true)); // UTC
    }

    if (row.enddatetime) {
      const endForDuration = hasRecurrence
        ? alignEndToStartDay(row.startdatetime, row.enddatetime)
        : row.enddatetime;
      if (row.tzid) {
        const p = new ICAL.Property('dtend', ve);
        p.setParameter('tzid', row.tzid);
        p.setValue(ICAL.Time.fromJSDate(endForDuration));
        ve.addProperty(p);
      } else {
        ve.addPropertyWithValue('dtend', ICAL.Time.fromJSDate(endForDuration, true));
      }
    }
  }

  if (row.title)       ve.addPropertyWithValue('summary', row.title);
  if (row.description) ve.addPropertyWithValue('description', row.description);
  if (row.location)    ve.addPropertyWithValue('location', row.location);

  if (row.rrule) ve.addPropertyWithValue('rrule', ICAL.Recur.fromString(row.rrule));

  // EXDATE / RDATE
  const addDateList = (prop: 'rdate'|'exdate', list?: string | null) => {
    if (!list) return;
    for (const s of list.split(/[;,]\s*/).filter(Boolean)) {
      const p = new ICAL.Property(prop, ve);  // attach to parent
      if (/^\d{8}$/.test(s)) p.setParameter('VALUE', 'DATE'); // YYYYMMDD
      const t = ICAL.Time.fromString(s, p as any);
      p.setValue(t);
      ve.addProperty(p);
    }
  };
  addDateList('rdate', row.rdate);
  addDateList('exdate', row.exdate);

  return ve;
}


const MAX_ITER = 2000;  // cap iterations per series
const MAX_MS   = 50;    // time budget per series (ms)

// Safe range expansion
function expandRowIntoWindowSafe(row: ICalendar, winStart: Date, winEnd: Date): Occurrence[] {
  const t0 = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();
  try {
    const out: Occurrence[] = [];
    const ve = buildVeventFromRow(row);
    const ev = new (ICAL as any).Event(ve);

    // EXDATE lookup
    const exdates = new Set(
      (ve.getAllProperties('exdate') || [])
        .flatMap((p: any) => (p.getValues?.() ?? [p.getFirstValue?.()]))
        .filter(Boolean)
        .map((t: any) => String(t))
    );

    const exp = new (ICAL as any).RecurExpansion({ component: ve, dtstart: ev.startDate });

    // crude fast-forward for unbounded rules far in the past
    if (row.rrule && !/COUNT=|UNTIL=/.test(row.rrule)) {
      const yearsDiff = (winStart.getTime() - row.startdatetime.getTime()) / (365 * 864e5);
      if (yearsDiff > 2) {
        let warmups = 500;
        while (warmups-- > 0 && exp.next()) {}
      }
    }

    let i = 0;
    while (i < MAX_ITER) {
      const now = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();
      
      if (now - t0 > MAX_MS) break;

      const next: any = exp.next();
      if (!next) break;
      i++;

      if (exdates.has(String(next))) continue;

      const det = ev.getOccurrenceDetails(next);
      const s = det.startDate.toJSDate();
      const e = det.endDate ? det.endDate.toJSDate() : null;
      const wholeDay = !!det.startDate.isDate || row.allday || isWholeDayLocal(s, e);

      if (s >= winEnd) break;                    // already past window → stop
      if (e && e <= winStart) continue;          // ends before window
      if (!e && s < winStart) continue;          // zero-length before window

      out.push({
        uid: row.calendarid,
        title: (det.item.summary as any) || row.title,
        description: (det.item.description as any) || row.description,
        location: (det.item.location as any) || row.location,
        start: s,
        end: e,
        allday: wholeDay || row.allday,
        tzid: row.tzid ?? undefined,
        rrule: row.rrule ?? null,
        master: row,
        recurrenceId: String(next),
      });
    }

    // If nothing emitted, show the master once if it overlaps the window
    if (!out.length && overlaps(row.startdatetime, row.enddatetime, winStart, winEnd)) {
      out.push({
        uid: row.calendarid,
        title: row.title,
        description: row.description,
        location: row.location ?? undefined,
        start: row.startdatetime,
        end: row.enddatetime ?? null,
        allday: row.allday,
        tzid: row.tzid ?? undefined,
        rrule: row.rrule ?? null,
        master: row,
        recurrenceId: null,
      });
    }

    return out;
  } catch (err) {
    console.error('Expansion error', row.calendarid, row.rrule, err);
    return overlaps(row.startdatetime, row.enddatetime, winStart, winEnd)
      ? [{
          uid: row.calendarid,
          title: row.title,
          description: row.description,
          location: row.location ?? undefined,
          start: row.startdatetime,
          end: row.enddatetime ?? null,
          allday: row.allday,
          tzid: row.tzid ?? undefined,
          rrule: row.rrule ?? null,
          master: row,
          recurrenceId: null,
        }]
      : [];
  }
}

function isLocalMidnight(d: Date) {
  return d.getHours() === 0 && d.getMinutes() === 0 && d.getSeconds() === 0 && d.getMilliseconds() === 0;
}
function isWholeDayLocal(s: Date, e: Date | null) {
  if (!e) return false;
  const dur = e.getTime() - s.getTime();
  return isLocalMidnight(s) && isLocalMidnight(e) && dur === 24 * 60 * 60 * 1000;
}

const visibleInstances = computed<Occurrence[]>(() => {
  if (suspendExpansion.value) return [];
  const { start, end } = viewWindow.value;
  const out: Occurrence[] = [];
  for (const row of events.value) {
    out.push(...expandRowIntoWindowSafe(row, start, end));
  }
  return out.sort((a, b) => +a.start - +b.start);
});


function overlaps(s: Date, e: Date | null, winStart: Date, winEnd: Date) {
  // [s, e) overlaps [winStart, winEnd)
  const end = e ?? s; // zero-duration allowed
  return end > winStart && s < winEnd;
}

function parseLocalDateTime(dateStr: string, timeStr?: string): Date {
  if (!dateStr) return new Date(NaN);
  const [y, m, d] = dateStr.split('-').map(Number);
  let hh = 0, mm = 0;
  if (timeStr) {
    const m2 = /^(\d{1,2}):(\d{2})$/.exec(timeStr.trim());
    if (m2) { hh = +m2[1]; mm = +m2[2]; }
  }
  return new Date(y, (m || 1) - 1, d || 1, hh, mm, 0, 0); // local time
}

function splitDateTimeString(s: string): [string, string?] {
  const [d, t] = s.trim().split(/[T ]/, 2);
  return [d, t];
}


// Week range text for header
const weekRangeText = computed(() => {
  if (weekDays.value.length < 1) return "";

  const firstDay = weekDays.value[0].date;
  const lastDay = weekDays.value[6].date;

  // Same month
  if (firstDay.getMonth() === lastDay.getMonth()) {
    return `${firstDay.toLocaleString("default", { month: "long" })} 
            ${firstDay.getDate()} - ${lastDay.getDate()}, 
            ${firstDay.getFullYear()}`;
  }

  // Same year, different months
  if (firstDay.getFullYear() === lastDay.getFullYear()) {
    return `${firstDay.toLocaleString("default", {
      month: "short",
    })} ${firstDay.getDate()} - 
            ${lastDay.toLocaleString("default", {
              month: "short",
            })} ${lastDay.getDate()}, 
            ${firstDay.getFullYear()}`;
  }

  // Different years
  return `${firstDay.toLocaleString("default", {
    month: "short",
  })} ${firstDay.getDate()}, ${firstDay.getFullYear()} - 
          ${lastDay.toLocaleString("default", {
            month: "short",
          })} ${lastDay.getDate()}, ${lastDay.getFullYear()}`;
});

function isToday(date: Date): boolean {
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
}

function getEventsForDate(date: Date) {
  const dayStart = startOfDay(date);
  return visibleInstances.value.filter(ev => occursOnDay(ev, dayStart));
}


const calendarDays = computed(() => {
  const days = [];
  const firstDay = new Date(currentYear.value, currentMonth.value, 1);
  const lastDay = new Date(currentYear.value, currentMonth.value + 1, 0);

  // Pad start of month
  const startPad = firstDay.getDay();
  for (let i = startPad; i > 0; i--) {
    const date = new Date(currentYear.value, currentMonth.value, 1 - i);
    days.push(createDayObject(date, false));
  }

  // Current month days
  for (let i = 1; i <= lastDay.getDate(); i++) {
    const date = new Date(currentYear.value, currentMonth.value, i);
    days.push(createDayObject(date, true));
  }

  // Pad end of month
  const endPad = 6 - lastDay.getDay();
  for (let i = 1; i <= endPad; i++) {
    const date = new Date(currentYear.value, currentMonth.value + 1, i);
    days.push(createDayObject(date, false));
  }

  return days;
});

// Format day name for week view
function formatDayName(date: Date): string {
  return date.toLocaleString("default", { weekday: "short" });
}

// Format time for display
function formatTime(date: string | Date | undefined) {
  if (!date) return "";
  return new Date(date).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

// Check if event is in a specific time slot
function isEventInTimeSlot(event: Occurrence, timeSlot: string): boolean {
  const [hour] = timeSlot.split(':').map(Number);
  return new Date(event.start).getHours() === hour;
}

// Navigation functions
function prevPeriod() {
  if (currentView.value === "month") {
    currentDate.value = new Date(currentYear.value, currentMonth.value - 1, 1);
  } else {
    const newDate = new Date(currentDate.value);
    newDate.setDate(newDate.getDate() - 7);
    currentDate.value = newDate;
  }
}

function nextPeriod() {
  if (currentView.value === "month") {
    currentDate.value = new Date(currentYear.value, currentMonth.value + 1, 1);
  } else {
    const newDate = new Date(currentDate.value);
    newDate.setDate(newDate.getDate() + 7);
    currentDate.value = newDate;
  }
}

function goToToday() {
  currentDate.value = new Date();
}

onMounted(() => {
  fetchEvents();
  fetchTasks();
});

// ICS Export Utils

function toExportRow(r: ICalendar) {
  const start = r.startdatetime instanceof Date ? r.startdatetime : new Date(r.startdatetime);
  const end   = r.enddatetime   ? (r.enddatetime instanceof Date ? r.enddatetime : new Date(r.enddatetime)) : null;
  return {
    calendarid: r.calendarid,
    title: r.title,
    description: r.description ?? null,
    location: r.location ?? null,
    startdatetime: start,
    enddatetime: end ?? start,
    allday: !!r.allday,
    tzid: r.tzid ?? null,
    rrule: r.rrule ?? null,
    rdate: r.rdate ?? null,
    exdate: r.exdate ?? null,
  };
}

function addDays(d: Date, n: number) {
  const z = new Date(d);
  z.setDate(z.getDate() + n);
  return z;
}

function normalizeRow(row: any): ICalendar {
  return {
    ...row,
    startdatetime: new Date(row.startdatetime),
    enddatetime: row.enddatetime ? new Date(row.enddatetime) : null,
    allday: asBool(row.allday),
    tzid: row.tzid ?? null,
    rrule: row.rrule ?? null,
    rdate: row.rdate ?? null,
    exdate: row.exdate ?? null,
  };
}


function weekdayCode(d: Date): Weekday {
  return WEEKDAYS[d.getUTCDay()];
}

// RFC 5545 UTC datetime: YYYYMMDDTHHMMSSZ
function toIcsUtc(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    d.getUTCFullYear().toString() +
    pad(d.getUTCMonth() + 1) +
    pad(d.getUTCDate()) +
    "T" +
    pad(d.getUTCHours()) +
    pad(d.getUTCMinutes()) +
    pad(d.getUTCSeconds()) +
    "Z"
  );
}

function weekdayLabel(token: Weekday): string {
  return { SU:'Sun', MO:'Mon', TU:'Tue', WE:'Wed', TH:'Thu', FR:'Fri', SA:'Sat' }[token];
}

function bydayList(rr: RRuleParts, start: Date): Weekday[] {
  if (!rr.BYDAY) return [weekdayCode(start)];
  // Keep ICS order but normalize to tokens
  return rr.BYDAY.split(',')
    .map(s => s.trim().replace(/^-?\d/, '')) // strip ordinals like 2TU → TU
    .filter(s => (WEEKDAYS as readonly string[]).includes(s)) as Weekday[];
}

function recurrenceSummary(ev: Partial<ICalendar>) {
  const rr = parseRRuleString(ev.rrule);
  if (!rr.FREQ) {
    return { lineA: formatRangeInZone(ev.startdatetime!, ev.enddatetime, ev.allday, ev.tzid), lineB: '', chips: [] as string[] };
  }

  const timeLine = formatRangeInZone(ev.startdatetime!, ev.enddatetime, ev.allday, ev.tzid);

  const interval = rr.INTERVAL ? Math.max(1, Number(rr.INTERVAL)) : 1;
  const freqName = rr.FREQ === 'DAILY' ? 'Daily'
                 : rr.FREQ === 'WEEKLY' ? 'Weekly'
                 : rr.FREQ === 'MONTHLY' ? 'Monthly'
                 : 'Yearly';
  const every = interval > 1 ? `Every ${interval} ${freqName.toLowerCase()}` : freqName;

  let onPart = '';
  const chips: string[] = [];

  if (rr.FREQ === 'WEEKLY') {
    const days = bydayTokens(rr.BYDAY, ev.startdatetime);
    if (days.length) {
      onPart = ' on ' + days.map(weekdayLabel).join(', ');
      chips.push(...days.map(weekdayLabel));
    }
  } else if (rr.FREQ === 'MONTHLY') {
    if (rr.BYMONTHDAY) {
      onPart = ` on day ${rr.BYMONTHDAY}`;
      chips.push(`Day ${rr.BYMONTHDAY}`);
    } else if (rr.BYDAY) {
      onPart = ` on ${rr.BYDAY}`; // keep as-is (e.g., 2TU, -1FR)
      chips.push(rr.BYDAY);
    }
  }

  let ends = ', indefinitely';
  if (rr.COUNT) ends = `, ${rr.COUNT} occurrences`;
  else if (rr.UNTIL) {
    const u = parseIcsUntilToDate(rr.UNTIL);
    if (u) ends = `, until ${new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(u)}`;
  }

  return {
    lineA: timeLine,
    lineB: `${every}${onPart}${ends}`,
    chips
  };
}

function bydayTokens(rrBYDAY?: string, start?: Date): Weekday[] {
  if (!rrBYDAY) {
    if (!start) return [];
    return [WEEKDAYS[start.getUTCDay()]];
  }
  return rrBYDAY
    .split(',')
    .map(s => s.trim().replace(/^-?\d/, '')) // strip ordinals like 2TU → TU
    .filter((s): s is Weekday => (WEEKDAYS as readonly string[]).includes(s));
}

function parseRRuleString(rrule?: string | null): RRuleParts {
  const out: Record<string, string> = {};
  if (!rrule) return out as RRuleParts;
  for (const part of rrule.split(';')) {
    const [k, v] = part.split('=');
    if (k && v) out[k.trim().toUpperCase()] = v.trim().toUpperCase();
  }
  return out as RRuleParts;
}

function parseIcsUntilToDate(until: string): Date {
  if (/^\d{8}$/.test(until)) { // YYYYMMDD
    const y = +until.slice(0,4), m = +until.slice(4,6)-1, d = +until.slice(6,8);
    return new Date(Date.UTC(y,m,d,0,0,0));
  }
  if (/^\d{8}T\d{6}Z$/.test(until)) { // YYYYMMDDTHHMMSSZ
    const y = +until.slice(0,4), m = +until.slice(4,6)-1, d = +until.slice(6,8);
    const H = +until.slice(9,11), M = +until.slice(11,13), S = +until.slice(13,15);
    return new Date(Date.UTC(y,m,d,H,M,S));
  }
  const dt = new Date(until); // ISO fallback
  return isNaN(+dt) ? new Date() : dt;
}

function downloadIcs(ics: string, filename: string) {
  const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  URL.revokeObjectURL(a.href);
  a.remove();
}

function asBool(v: unknown) {
  return v === true || v === 1 || v === '1' || v === 'Y';
}

// Watch showTasks to refresh calendar
watch(showTasks, () => {
  // Force recomputation of calendar days
  currentDate.value = new Date(currentDate.value);
});
</script>

<style scoped>
.calendar-wrapper {
  max-width: 1100px;          /* adjust if needed */
  margin: 0 auto;
  padding: 12px;
}
.calendar-surface {
  background: #fff;
  border: 1px solid var(--border, #d9e2ec);
  border-radius: 10px;
  box-shadow: 0 6px 18px rgba(0,0,0,.06);
  overflow: hidden;            /* keeps grid corners tidy */
}

/* Keep your existing .calendar-controls, just tighten spacing */
.calendar-controls {
  background-color: #fff;
  padding: 0.875rem 1rem;
  border-bottom: 1px solid var(--border, #d9e2ec);
  border-radius: 10px 10px 0 0;   /* blends with .calendar-surface */
  box-shadow: none;               /* the surface provides the shadow */
}

/* -------- Buttons (works for <Button> + .btn) -------- */
button, .btn, .calendar-controls Button {
  --btn-bg: #f8fafc;
  --btn-ink: #0b1720;
  --btn-bd: #d9e2ec;
  --btn-shadow: 0 1px 2px rgba(0,0,0,.06);
  --btn-radius: 8px;

  appearance: none;
  display: inline-flex;
  align-items: center;
  gap: .5rem;
  padding: .45rem .85rem;
  border: 1px solid var(--btn-bd);
  border-radius: var(--btn-radius);
  background: var(--btn-bg);
  color: var(--btn-ink);
  font-weight: 600;
  line-height: 1.1;
  cursor: pointer;
  transition: background .15s ease, border-color .15s ease, box-shadow .15s ease, transform .03s ease;
  box-shadow: var(--btn-shadow);
}

button:hover, .btn:hover, .calendar-controls Button:hover {
  background: #f1f5f9;
}

button:active, .btn:active, .calendar-controls Button:active {
  transform: translateY(1px);
}

/* Focus ring */
button:focus-visible, .btn:focus-visible, .calendar-controls Button:focus-visible {
  outline: none;
  box-shadow: 0 0 0 3px rgba(0,84,147,.2);
}

/* Primary */
.btn-primary,
Button[variant="primary"] {
  --btn-bg: var(--accent, #005493);
  --btn-ink: #fff;
  --btn-bd: var(--accent, #005493);
  background: var(--btn-bg);
  color: var(--btn-ink);
  border-color: var(--btn-bd);
}
.btn-primary:hover,
Button[variant="primary"]:hover {
  filter: brightness(1.06);
}

/* Secondary (neutral filled) */
.btn-secondary,
Button[variant="secondary"] {
  --btn-bg: #eef2f6;
  --btn-ink: #0b1720;
  --btn-bd: #d9e2ec;
}

/* Outline secondary */
.btn-outline-secondary,
Button[variant="outline-secondary"] {
  background: transparent;
  color: var(--accent, #005493);
  border-color: var(--accent, #005493);
}
.btn-outline-secondary:hover,
Button[variant="outline-secondary"]:hover {
  background: rgba(0,84,147,.08);
}

/* Compact pill buttons in event cards */
.btn-compact {
  padding: 4px 8px !important;
  font-size: 12px !important;
  line-height: 1.1 !important;
  border-radius: 9999px !important;
}
.view-toggle .btn {
  border-radius: 4px;
  padding: 0.375rem 0.75rem;
}

.view-toggle .btn.active {
  background-color: #005493;
  color: white;
  border-color: #005493;
}

.calendar-nav {
  display: flex;
  align-items: center;
}

.calendar-container {
  max-width: 100%;
  overflow: hidden;
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 1px;
  background-color: #e9ecef;
  border: 1px solid #e9ecef;
}

.day-header {
  text-align: center;
  font-weight: bold;
  padding: 10px 0;
  background-color: #f8f9fa;
  border-bottom: 1px solid #dee2e6;
}

.calendar-day {
  position: relative;
  min-height: 120px;
  border: 1px solid #eee;
  padding: 8px;
  background-color: #f9f9f9;
}

.calendar-day.current-month {
  background-color: #fff;
}

.calendar-day.today {
  background-color: #e6f7ff;
}

.day-number {
  font-weight: bold;
  margin-bottom: 5px;
  text-align: right;
  font-size: 0.9rem;
}

.day-column {
  position: relative;
}

.calendar-event {
  background-color: #e3f2fd;
  padding: 4px 8px;
  margin: 4px 0;
  border-radius: 3px;
  font-size: 0.85rem;
  position: relative;
}

.event-time {
  font-size: 0.75rem;
  opacity: 0.8;
}

.event-actions {
  display: flex;
  justify-content: flex-end;
}

.calendar-task {
  padding: 4px 8px;
  margin: 4px 0;
  border-radius: 3px;
  font-size: 0.85rem;
  position: relative;
  color: #333;
}

.task-time {
  font-size: 0.75rem;
  opacity: 0.8;
  font-style: italic;
}

/* Week View Styles */
.time-slot {
  position: relative;
}

.calendar-week-view .calendar-event,
.calendar-week-view .calendar-task {
  margin: 2px;
  padding: 2px 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.week-header {
  display: flex;
  background-color: #f8f9fa;
  border-bottom: 1px solid #dee2e6;
}

.time-column {
  width: 60px;
  min-width: 60px;
  border-right: 1px solid #dee2e6;
}

.day-header {
  flex: 1;
  text-align: center;
  padding: 8px 0;
  border-right: 1px solid #dee2e6;
}

.day-header:last-child {
  border-right: none;
}

.day-header.today {
  background-color: #e6f7ff;
  font-weight: bold;
}

.day-name {
  font-size: 0.9rem;
  font-weight: bold;
}

.day-date {
  font-size: 1.2rem;
  margin-top: 4px;
}

.week-body {
  display: flex;
  flex: 1;
  overflow-y: auto;
}

.time-column {
  width: 60px;
  min-width: 60px;
  border-right: 1px solid #dee2e6;
}

.time-slot {
  height: 60px;
  border-bottom: 1px solid #e9ecef;
  padding: 2px;
  position: relative;
  font-size: 0.8rem;
  text-align: right;
  padding-right: 4px;
  color: #6c757d;
}

.day-column {
  flex: 1;
  border-right: 1px solid #e9ecef;
}

.day-column:last-child {
  border-right: none;
}

.day-column.today {
  background-color: #f0f9ff;
}

.day-column .time-slot {
  cursor: pointer;
}

.day-column .time-slot:hover {
  background-color: #f8f9fa;
}

/* Button groups */
.btn-group {
  border-radius: 8px;
  overflow: hidden;
  box-shadow: inset 0 0 0 1px #ddd;
}
.btn-group > .btn,
.btn-group > Button {
  border-radius: 0;
  border: none;
  box-shadow: none;
}
.btn-group > .btn + .btn,
.btn-group > Button + Button {
  border-left: 1px solid #e5eaf0;
}

.calendar-container {
  max-width: 100%;
  overflow: hidden;
  background: #fff;
}

.active-toggle {
  background-color: #0055b7;
  color: white;
}

/* Accent + neutrals */
:root {
  --accent: #005493;
  --accent-ink: #ffffff;
  --ink: #0b1720;
  --muted: #5b6b79;
  --border: #d9e2ec;
  --ring: #cfe6f3;
  --bg: #ffffff;
}

.form-row { display: grid; grid-template-columns: 140px 1fr; gap: 12px; align-items: center; margin: 8px 0; }
.-label { color: #334e68; font-weight: 600; }

/* Segmented control (connected pills) */
.segmented {
  display: inline-grid;
  grid-auto-flow: column;
  grid-auto-columns: 1fr;
  border: 1px solid var(--border);
  border-radius: 9999px;
  overflow: hidden;
  background: var(--bg);
}

/* Hide inputs but keep them accessible */
.segmented-input {
  position: absolute;
  opacity: 0;
  pointer-events: none;
}

/* Individual segments */
.segmented-segment {
  padding: 8px 12px;
  font-weight: 600;
  text-align: center;
  color: var(--ink);
  background: var(--bg);
  border-right: 1px solid var(--border);
  cursor: pointer;
  user-select: none;
}
.segmented-segment:last-of-type { border-right: none; }

/* Active state */
.segmented-input:checked + .segmented-segment {
  background: var(--accent);
  color: var(--accent-ink);
}

/* Focus ring (keyboard) */
.segmented-input:focus + .segmented-segment {
  box-shadow: inset 0 0 0 3px var(--ring);
}

/* Hover (optional) */
.segmented-segment:hover { background: #f7fbff; }

.segmented.segmented-days .segmented-input:checked + .segmented-segment {
  background: #005493;
  color: #ffffff;
  border-color: #005493;
}

/* Hover on selected (optional, slightly brighter) */
.segmented.segmented-days .segmented-input:checked + .segmented-segment:hover {
  filter: brightness(1.06);
}

/* Keyboard focus ring */
.segmented.segmented-days .segmented-input:focus + .segmented-segment {
  box-shadow: inset 0 0 0 3px rgba(0,84,147,0.25);
}

/* Unselected (ensure white base & subtle border) */
.segmented.segmented-days .segmented-segment {
  background: #ffffff;
  color: #0b1720;
  border-right: 1px solid #d9e2ec;
}
.segmented.segmented-days .segmented-segment:last-of-type { border-right: none; }

.segmented-days { width: 100%; }

.list { margin-top: 8px; }

/* Sticky toolbar */
.bulk-bar {
  position: sticky;
  top: 0;
  z-index: 1;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: #fff;
  border-bottom: 1px solid #e6e8eb;
  border-top-left-radius: 6px;
  border-top-right-radius: 6px;
}
.bulk-bar .count { font-weight: 600; }
.bulk-bar .spacer { flex: 1; }

/* Scrollable, dense list */
.ev-list {
  max-height: 60vh;
  overflow: auto;
}

/* Row layout */
.ev-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 12px;
  border-bottom: 1px solid #f0f2f5;
}
.ev-main { flex: 1 1 auto; min-width: 0; }
.ev-actions { flex: 0 0 auto; display: flex; }

.ev-title {
  font-weight: 600;
  font-size: 14px;
  line-height: 1.2;
  margin-bottom: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.ev-title .loc { color: #667085; font-weight: 500; }

.ev-sub {
  color: #667085;
  font-size: 12px;
  line-height: 1.2;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.ev-sub .dot { margin: 0 4px; }
.ev-sub .rr { font-style: italic; }

.btn-compact {
  padding: 4px 8px !important;
  line-height: 1.1 !important;
  font-size: 12px !important;
}

/* --- Toolbar layout --- */
.cal-toolbar {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  grid-template-areas: "actions nav toggles";
  align-items: center;
  gap: 12px;
}

.cal-actions   { grid-area: actions; display: flex; flex-wrap: wrap; gap: 8px; align-items: center; }
.calendar-nav  { grid-area: nav;     display: flex; align-items: center; gap: 10px; justify-content: center; }
.cal-toggles   { grid-area: toggles; display: flex; flex-wrap: wrap; gap: 10px; align-items: center; justify-content: flex-end; }

/* Title stays centered even if left/right grow */
.cal-title { margin: 0; font-weight: 700; }

/* Make all toolbar buttons visually consistent height */
.cal-toolbar Button,
.cal-toolbar .btn {
  padding: 0.45rem 0.8rem;
  line-height: 1.1;
}

/* Button groups spacing inside toolbar */
.cal-toggles .btn-group { display: inline-flex; }
.cal-toggles .btn-group + .btn-group { margin-left: 6px; }

/* Ensure secondary nav arrows match height */
.calendar-nav Button { height: 36px; display: inline-flex; align-items: center; }

/* Keep the toolbar feeling like one piece with the calendar surface */
.calendar-controls {
  padding: .75rem 1rem;
  border-bottom: 1px solid var(--border, #d9e2ec);
  border-radius: 10px 10px 0 0;
  box-shadow: none;
}

/* --- Responsive: stack into two rows on small screens --- */
@media (max-width: 900px) {
  .cal-toolbar {
    grid-template-columns: 1fr 1fr;
    grid-template-areas:
      "actions toggles"
      "nav nav";
    row-gap: 8px;
  }
  .calendar-nav { order: 2; }
}

@media (max-width: 600px) {
  .cal-actions { gap: 6px; }
  .cal-toggles { gap: 6px; }
  .cal-title   { font-size: 1rem; }
}

/* --- Optional: make primary/secondary look like a set --- */
.cal-actions Button[variant="primary"] + Button[variant="primary"] { margin-left: 6px; }


/* Responsive adjustments */
@media (max-width: 768px) {
  .calendar-controls {
    flex-direction: column;
    gap: 1rem;
  }

  .calendar-grid {
    gap: 1px;
    background-color: #e9ecef;
    border-top: 1px solid #e9ecef;  /* seam under controls */
    border-left: none;
    border-right: none;
    border-bottom: none;
  }
  .calendar-day {
    background-color: #fff;
    border: 1px solid #eef1f4;
  }
  .calendar-day.today {
    background-color: #eaf3fb;
    border-color: #cfe6f3;
  }

  .calendar-event,
  .calendar-task {
    font-size: 0.75rem;
  }

  .event-actions {
    display: none; /* Hide actions on mobile */
  }

  .week-view {
    flex-direction: column;
  }

  .time-column {
    display: none;
  }

  .week-header {
    display: none;
  }

  .week-body {
    flex-direction: column;
  }

  .day-column {
    border-right: none;
    border-bottom: 1px solid #dee2e6;
  }
}
</style>
