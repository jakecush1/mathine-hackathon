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
    <Modal
      id="deleteConfirmationModal"
      ref="deleteModalRef"
      title="Confirm Deletion"
      :show-footer="false"
    >
      <p>Are you sure you want to delete this task? Deletig Task will delete associated Calendar event Too!</p>
      <div>
        <Button class="me-3" variant="primary" @click="confirmDelete">
          Delete
        </Button>
        <Button variant="secondary" @click="canceld">
          Cancel
        </Button>
      </div>
    </Modal>
    <!-- Task Tags Modal -->
    <Modal id="taskTagModal" title="Task Tags" :show-footer="true" ref="taskTagModalRef">
      <Form
        action="#"
        id="simple-form"
        :validate="true"
        :defaultBtns="false"
        :reviewForm="false"
        @submit.prevent="addTaskTag"
      >
        <div class="row justify-content-between align-items-end">
          <div class="col">
            <FormSelectEnhanced
              name="tasktags"
              label="Task Tags"
              :options="availableTags"
              optVal="tagid"
              optTxt="tagname"
              v-model="selectedTagId"
              required="true"
            />
          </div>
          <div class="col col-auto">
            <Button
              variant="primary"
              @click.prevent="addTaskTag"
              :disabled="!selectedTagId"
            >
              <i class="fa fa-plus" aria-hidden="true"></i>
              <span class="sr-only">Add Tags</span>
            </Button>
          </div>
        </div>
      </Form>
      <div class="row mt-3">
        <div
          class="col-auto mb-1"
          v-for="taskxtag in currentTaskTags"
          :key="taskxtag.tagxtaskid"
        >
          <div
            class="row ms-1 justify-content-between align-items-center badge bg-light-cyan"
          >
            <span class="text-primary p-1">
              {{ "#" + taskxtag.tag?.tagname }}
            </span>
            <span class="p-1">
              <Button
                variant="secondary"
                class="btn btn-primary badge p-1"
                @click.stop="deleteTaskxTag(taskxtag.tagxtaskid)"
              >
                <i class="fa fa-trash text-primary" aria-hidden="true"></i>
                <span class="sr-only">Delete Tag</span>
              </Button>
            </span>
          </div>
        </div>
      </div>
    </Modal>

    <Modal
      id="deleteTagConfirmationModal"
      ref="deleteTagModalRef"
      title="Confirm Deletion"
      :show-footer="false"
    >
      <p>
        Are you sure you want to delete this Tag? It will delete assigned tags
        to your tasks?
      </p>
      <div>
        <Button class="me-3" variant="primary" @click="confirmTagDelete">
          Delete
        </Button>
        <Button variant="secondary" @click="cancel"> Cancel </Button>
      </div>
    </Modal>
    <!-- Tag Modal -->
    <Modal
      id="tagModal"
      ref="tagModalRef"
      title="Manage Tags"
      :show-footer="true"
    >
      <Form
        action="#"
        id="tagform"
        :validate="true"
        :defaultBtns="false"
        :reviewForm="false"
        @submit.prevent="addTag(tagForm.tagname)"
      >
        <div class="row justify-content-between align-items-end">
          <div class="col">
            <FormInput
              v-model="tagForm.tagname"
              ref="tagInput"
              name="tagname"
              label="Tag"
              :required="true"
            />
          </div>
          <div class="col col-auto">
            <Button
              variant="primary"
              @click.prevent="addTag(tagForm.tagname)"
            >
              <i class="fa fa-plus" aria-hidden="true"></i>
              <span class="sr-only">Add Tags</span>
            </Button>
          </div>
        </div>
      </Form>
      <div class="row">
        <div class="col-auto mb-1" v-for="tag in tags" :key="tag.tagid">
          <div
            class="row ms-1 justify-content-between align-items-center badge bg-light-cyan"
          >
            <span class="text-primary p-1">
              {{ "#" + tag.tagname }}
            </span>
            <span class="p-1">
              <Button
                variant="secondary"
                class="btn btn-primary badge p-1"
                modal="deleteTagConfirmationModal"
                @click.stop="openDeleteTag(tag.tagid)"
                ><i class="fa fa-trash text-primary" aria-hidden="true"></i>
                <span class="sr-only">Delete Tag</span></Button
              >
            </span>
          </div>
        </div>
      </div>
    </Modal>
    <!-- Kanban Modal -->
    <Modal
      id="kanbanModal"
      ref="modalRef"
      :title="form + ' Task'"
      :show-footer="true"
    >
      <Form
        action="#"
        id="task-form"
        @submit.prevent="submittaskform"
        :validate="true"
        :defaultBtns="false"
        :reviewForm="false"
      >
        <FormInput
          v-model="kanbanForm.taskname"
          name="taskname"
          label="Task Name"
          :required="true"
        />
        <FormSelectEnhanced
          v-model="kanbanForm.priorityid"
          name="priorityid"
          label="Priority"
          :options="selectPriority"
          required="true"
          :other="false"
          optVal="priorityid"
          optTxt="priorityname"
        />
        <FormDatePicker
          v-model="kanbanForm.duedate"
          name="duedate"
          label="Due Date"
          required="true"
          data-fp-time="true"
        />
        <FormInput
          v-model="kanbanForm.colour"
          type="color"
          name="colour"
          label="Colour"
          :required="true"
        />
        <FormTextArea
          v-model="kanbanForm.description"
          name="description"
          label="Description"
        />
        <div class="d-flex justify-content-between my-2">
          <div>
            <Button
              variant="secondary"
              v-if="form === 'Edit'"
              @click="addTaskToCalendar(kanbanForm)"
              :disabled="isEventAdded(kanbanForm.taskid)"
            >
              <i class="fa fa-calendar" aria-hidden="true"></i>
              {{
                isEventAdded(kanbanForm.taskid)
                  ? "Added to Calendar"
                  : "Add to Calendar"
              }}
            </Button>
          </div>
          <div>
            <Button
              variant="secondary"
              v-if="form === 'Edit'"
              modal="deleteConfirmationModal"
              @click="openDeleteTask(kanbanForm.taskid)"
            >
              <i class="fa fa-trash text-primary" aria-hidden="true"></i>
              <span class="sr-only">Delete Task</span>
            </Button>
          </div>
        </div>
      </Form>

      <template #footer>
        <Button
          variant="primary"
          type="submit"
          form="task-form"
        >
          {{ form === 'Add' ? 'Create Task' : 'Save Changes' }}
        </Button>
        <Button variant="secondary" type="button" @click="modalRef?.close?.()">
          Cancel
        </Button>
      </template>
    </Modal>
    <!-- Actions toolbar -->
    <section class="page-toolbar mb-4">
    <div class="toolbar-inner">
      <h3 class="toolbar-title">Actions</h3>
      <div class="toolbar-actions">
        <Button variant="primary" @click="openKanbanAdd">
          <i class="fa fa-plus" aria-hidden="true"></i>
          <span class="ms-1">Add Task</span>
        </Button>

        <Button variant="primary" @click="tagModalRef?.open?.()">
          <i class="fa fa-tags" aria-hidden="true"></i>
          <span class="ms-1">Manage Tags</span>
        </Button>

        <Button variant="secondary" @click="toggleFilters">
          <i class="fa fa-filter" aria-hidden="true"></i>
          <span class="ms-1">{{ showFilters ? "Hide Filters" : "Show Filters" }}</span>
        </Button>
      </div>
    </div>
  </section>
    <!-- Filter Section -->
    <Form
      v-if="showFilters"
      action="#"
      id="filter-form"
      :validate="false"
      :defaultBtns="false"
      @submit.prevent=""
    >
      <div class="row mb-3 g-3">
        <div class="col-md-3">
          <FormSelectEnhanced
            v-model="priorityFilter"
            label="Priority"
            name="priorityFilter"
            :options="[
              { priorityid: '', priorityname: 'All' },
              ...selectPriority,
            ]"
            optVal="priorityid"
            optTxt="priorityname"
          />
        </div>
        <div class="col-md-3">
          <FormSelectEnhanced
            v-model="tagFilter"
            name="tagFilter"
            label="Tags"
            :options="[{ tagid: '', tagname: 'All' }, ...tags]"
            optVal="tagid"
            optTxt="tagname"
          />
        </div>
        <div class="col-md-3">
          <FormDatePicker
            name="duefrom"
            label="Due From"
            data-fp-time="true"
            v-model="dateStartFilter"
          />
        </div>
        <div class="col-md-3">
          <FormDatePicker
            name="dueto"
            label="Due To"
            data-fp-time="true"
            v-model="dateEndFilter"
          />
        </div>
      </div>
    </Form>
    <div v-if="!columns.length" class="text-danger">
      Debug: columns empty — labels={{ sortedKanbanlabels?.length }} tasks={{ tasks?.length }}
    </div>
    <!-- Kanban Board -->
    <div class="row g-3 flex-nowrap flex-lg-wrap overflow-auto pb-2 kanban-row">
      <div
        v-for="column in columns"
        :key="column.id"
        class="col-10 col-sm-8 col-md-6 col-lg-4 d-flex page-layout kanban-col"
        :data-kanbanlabelid="column.id"
      >
        <div class="card p-2 kanban-card flex-grow-1">
          <h4 class="mb-2">{{ column.name }} Tasks</h4>
          <div class="kanban-list">
            <Draggable
              class="drag-area"
              :list="column.tasks"
              item-key="taskid"
              :group="{ name: 'tasks' }"
              :animation="150"
              :sort="true"
              @change="e => onDragChange(e, column)"
            >
              <template #item="{ element }">
                <div
                  v-show="passesFilters(element)"
                  class="card p-2 mb-3 drag-card"
                  :style="{ borderLeft: '4px solid ' + element.colour }"
                  :data-taskid="element.taskid"
                >
                  <div class="row justify-content-between align-items-center">
                    <div class="col">
                      <h4 class="my-2">{{ element.taskname }}</h4>
                      <h6 class="text-muted" v-if="element.coursename">
                        {{ element.coursename }}
                      </h6>
                      <span class="badge" :class="priorityBadge(element.priority?.priorityname)">
                        {{ element.priority.priorityname }}
                      </span>
                      <span
                        class="mx-2 badge text-primary border border-primary"
                        v-if="element.duedate"
                      >
                        {{ formatDate(element.duedate) }}
                      </span>
                      <p class="text-muted mt-2 mb-0" v-if="element.description">
                        {{ element.description }}
                      </p>
                      <p class="mb-2 p-0"></p>
                      <span
                        ><Button
                          class="btn btn-primary badge"
                          modal="taskTagModal"
                          @click="openTagManager(element)"
                        >
                          {{ "Manage "
                          }}<i class="fa fa-hashtag" aria-hidden="true"></i>
                          <span class="sr-only"></span>
                        </Button></span
                      >
                      <span
                        v-for="tasktag in element.taskxtag"
                        :key="tasktag.tagxtaskid"
                        class="mx-1 badge bg-light-cyan text-primary"
                      >
                        #{{ tasktag.tag?.tagname }}
                      </span>
                    </div>

                    <div class="col col-auto">
                      <div class="btn-row">
                        <span
                      v-if="column.name === 'Completed'"
                      >
                        <Button
                          variant="secondary"
                          modal="deleteConfirmationModal"
                          @click="setModalData(element), openDeleteTask(kanbanForm.taskid)"
                        >
                          <i class="fa fa-trash text-primary" aria-hidden="true"></i>
                          <span class="sr-only">Delete Task</span>
                        </Button>
                      </span>
                      <Button
                          variant="secondary"
                          modal="kanbanModal"
                          @click="openKanbanEdit(element)"
                        >
                          <i class="fa fa-pencil" aria-hidden="true"></i>
                          <span class="sr-only">Edit</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </template>
            </Draggable>
          </div>
        </div>
      </div>
    </div>
  </PageMain>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, nextTick, watch } from "vue";
import FormSelectEnhanced from '../components/FormSelect.vue';
import Draggable from "vuedraggable";
import taskService from "../api/taskService";
import { usePriorityStore } from "../store/priorityStore";
import { useKanbanLabelStore } from "~/store/kanbanLabelStore";
import { useTagStore } from "~/store/tagStore";
import { storeToRefs } from "pinia";
import { Modal } from "#components";
import type { ITask } from "~/types/task";
import type { IPriority } from "~/types/priority";
import type { ITaskXTag } from "~/types/taskxtag";
import taskXTagService from "~/api/taskXTagService";
import calendarService from "../api/calendarService";
import type { ICalendar } from "~/types/calendar";

type Column = { id: string; name: string; tasks: ITask[] }

const modalRef = ref()
const deleteModalRef = ref()
const taskTagModalRef = ref()
const tagModalRef= ref()
const deleteTagModalRef = ref()
const priority = ref<IPriority>();
const columns = ref<Column[]>([]);
const activeQuery = ref('')
const tagInput = ref<HTMLInputElement | null>(null)

const pageTitle = "Kanban";
const pageLayout = "main";
const isLoggedIn: Boolean = true;
const appConfig = useAppConfig();
useHead({
  title: `${pageTitle} - ${appConfig.header.name} - University of Victoria`,
});

// Initialize stores
const kanbanLabelStore = useKanbanLabelStore();
const { sortedKanbanlabels } = storeToRefs(kanbanLabelStore);
const priorityStore = usePriorityStore();
const { priorities, getPriorityById } = storeToRefs(priorityStore);
const tagStore = useTagStore();
const { tags } = storeToRefs(tagStore);

// Fetch, kanbanLabel priorities and tasks when component is mounted
onMounted(async () => {
  await kanbanLabelStore.fetchKanbanLabels();
  await priorityStore.fetchPriorities();
  await tagStore.fetchTags();
  await fetchTasks();
  rebuildColumns(); // ← force one pass after data arrives
});

const openKanbanAdd = () => {
  resetModalData()
  setForm('Add')
  modalRef.value?.open?.()
}
const openKanbanEdit = (t: ITask) => {
  setForm('Edit')
  setModalData(t)
  modalRef.value?.open?.()
}
const openDeleteTask = (taskId: string) => {
  setTaskToDelete(taskId)
  deleteModalRef.value?.open?.()
}
const openTagManager = (t: ITask) => {
  openTagModal(t) // your existing setter
  taskTagModalRef.value?.open?.()
}
const openDeleteTag = (tagId: string) => {
  setTagToDelete(tagId)
  deleteTagModalRef.value?.open?.()
}

//Global Tags things **********************************************

// add tag form data
const tagForm = ref({ tagname: "" });

const addTag = async (tagname: string) => {
  try {
    await tagStore.createTag({ tagname: tagname.trim() })
    tagForm.value.tagname = ''
    await nextTick()
    // @ts-expect-error access component root element
    tagInput.value?.$el?.querySelector('input')?.focus()
  } catch (e) {
    console.error(e)
  }
}

// Track tag to delete
const tagToDelete = ref<string | null>(null);

//cancel delete tag modal
const cancel = () => {
  deleteTagModalRef.value?.close();
};

// Set tag ID when delete button is clicked
const setTagToDelete = (id: string) => {
  tagToDelete.value = id;
};

// Confirm deletion
const confirmTagDelete = async () => {
  if (tagToDelete.value) {
    try {
      await tagStore.deleteTag(tagToDelete.value);

      await fetchTasks();

      deleteTagModalRef.value?.close();
      tagToDelete.value = null;
    } catch (error) {
      console.error("Failed to delete Tag:", error);
    }
  }
};

//Task to Calendar things **********************************************

// Track added calendar events
const calendarEvents = ref<Record<string, string>>({});

// Add to calendar function
const addTaskToCalendar = async (task: typeof kanbanForm.value) => {
  if (!task.taskid || isEventAdded(task.taskid)) return;

  const eventData: Partial<ICalendar> = {
    title: task.taskname,
    description: task.description || "Task from Kanban board",
    startdatetime: new Date(task.duedate),
    enddatetime: new Date(task.duedate), // same as due date for single-day tasks
    taskid: task.taskid,
  };

  try {
    const response = await calendarService.createCalendar(
      eventData as ICalendar
    );
    calendarEvents.value[task.taskid] = response.data.calendareventid;
    modalRef.value?.close();
    await fetchTasks(); //to make sure tasks are updated with calendar info
  } catch (error) {
    console.error("Failed to create calendar event:", error);
  }
};

// Check if event is added
const isEventAdded = (taskId: string) => {
  return tasks.value.some(
    (task) => task.taskid === taskId && task.calendar.length > 0
  );
};

// Filter things ***********************************************

// Add filter states
const showFilters = ref(false);
const priorityFilter = ref<string>('')          // '' = All
const tagFilter      = ref<string>('')          // '' = All
const dateStartFilter = ref<string | Date | ''>('') // '' = unset
const dateEndFilter   = ref<string | Date | ''>('') // '' = unset

const PRIORITY_BADGE: Record<string, string> = {
  low: 'bg-success text-white',
  medium: 'bg-warning text-dark',
  high: 'bg-danger text-white'
}
const priorityBadge = (name?: string) =>
  PRIORITY_BADGE[(name || '').trim().toLowerCase()] || 'bg-secondary text-white'

// Toggle filter visibility
const toggleFilters = () => {
  showFilters.value = !showFilters.value;
  if (!showFilters.value) {
    resetFilters();
  }
};

// Reset filters
const resetFilters = () => {
  priorityFilter.value = "";
  tagFilter.value = "";
  dateStartFilter.value = "";
  dateEndFilter.value = "";
};

function toDate(d: string | Date | '' | null | undefined): Date | null {
  if (!d) return null
  return d instanceof Date ? d : new Date(d)
}

function passesFilters(t: any): boolean {
  // Priority
  if (priorityFilter.value && t.priority?.priorityid !== priorityFilter.value) return false

  // Tag (assumes t.taskxtag = [{ tag?: { tagid }}, ...])
  if (tagFilter.value) {
    const tagIds: string[] =
      (t.taskxtag ?? [])
        .map((x: any) => x.tag?.tagid)
        .filter(Boolean)
    if (!tagIds.includes(tagFilter.value)) return false
  }

  // Due date range (inclusive)
  const start = toDate(dateStartFilter.value)
  const end   = toDate(dateEndFilter.value)
  if (start || end) {
    const due: Date | null = t.duedate ? new Date(t.duedate) : null
    if (!due) return false // if filtering by date, require a due date
    if (start && due < start) return false
    if (end   && due > end)   return false
  }

  // Optional text search across a few fields
  const q = activeQuery.value.trim().toLowerCase()
  if (q) {
    const haystack = [
      t.taskname,
      t.description,
      t.coursename,
      t.priority?.priorityname
    ].map((s: any) => (s ?? '').toString().toLowerCase()).join(' ')
    if (!haystack.includes(q)) return false
  }

  return true
}

// Task Tags things **********************************************

// Current task being edited
const currentTask = ref<ITask | null>(null);
const currentTaskTags = ref<ITaskXTag[]>([]);
const selectedTagId = ref<string>("");

// Available tags for current task (not already assigned)
const availableTags = computed(() => {
  if (!tags.value || !currentTask.value) return [];

  const assignedTagIds =
    currentTask.value.taskxtag?.map((t) => t.tag?.tagid) || [];
  return tags.value.filter((tag) => !assignedTagIds.includes(tag.tagid));
});

// Open tag management modal
const openTagModal = (task: ITask) => {
  currentTask.value = task;
  currentTaskTags.value = [...(task.taskxtag || [])];
  selectedTagId.value = "";
};
// Add tag to task
const addTaskTag = async () => {
  if (!currentTask.value || !selectedTagId.value) return;

  try {
    const newTag: Omit<ITaskXTag, "tagxtaskid"> = {
      taskid: currentTask.value.taskid,
      tagid: selectedTagId.value,
    };

    // Call service to create association
    const response = await taskXTagService.createTaskXTag(newTag);

    // Add to current task tags
    currentTaskTags.value.push(response.data);

    // Update main task list
    const taskIndex = tasks.value.findIndex(
      (t) => t.taskid === currentTask.value?.taskid
    );
    if (taskIndex !== -1) {
      if (!tasks.value[taskIndex].taskxtag) {
        tasks.value[taskIndex].taskxtag = [];
      }
      tasks.value[taskIndex].taskxtag?.push(response.data);
    }

    // Reset selection
    selectedTagId.value = "";
  } catch (error) {
    console.error("Failed to add tag:", error);
  }
};

// Remove tag from task
const deleteTaskxTag = async (taskxtagid: string) => {
  try {
    await taskXTagService.deleteTaskXTag(taskxtagid);

    // Remove from current task tags
    const index = currentTaskTags.value.findIndex(
      (t) => t.tagxtaskid === taskxtagid
    );
    if (index !== -1) {
      currentTaskTags.value.splice(index, 1);
    }

    // Update main task list
    const taskIndex = tasks.value.findIndex(
      (t) => t.taskid === currentTask.value?.taskid
    );
    if (taskIndex !== -1 && tasks.value[taskIndex].taskxtag) {
      tasks.value[taskIndex].taskxtag = tasks.value[taskIndex].taskxtag?.filter(
        (t) => t.tagxtaskid !== taskxtagid
      );
    }
  } catch (error) {
    console.error("Failed to delete tag:", error);
  }
};

// Task specific things **********************************************

// Fetch tasks from API
const tasks = ref<ITask[]>([]);
const fetchTasks = async () => {
  try {
    const response = await taskService.getTasks();
    tasks.value = response.data;
  } catch (error) {
    console.error("Failed to fetch tasks:", error);
  }
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);

  // Get date components (local time)
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  // Get time components (local time)
  let hoursN = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, "0");

  // Convert to 12-hour format with uppercase AM/PM
  const ampm = hoursN >= 12 ? "PM" : "AM";
  hoursN = hoursN % 12 || 12; // Convert 0 to 12
  const hours = String(hoursN).padStart(2, "0"); // Ensure 2-digit format

  return `${year}-${month}-${day} ${hours}:${minutes} ${ampm}`;
};

// Priorities with store data
const selectPriority = computed(() => priorities.value);

// columns based on kanban labels
function rebuildColumns() {
  const byId = Object.fromEntries(columns.value.map(c => [String(c.id), c]));

  // Ensure ascending order (by explicit order field if you have it; fallback to datecreated)
  const labels = [...sortedKanbanlabels.value].sort((a: any, b: any) => {
    const ao = Number(a.order ?? a.sort ?? a.position ?? 0);
    const bo = Number(b.order ?? b.sort ?? b.position ?? 0);
    if (ao !== bo) return ao - bo;

    const ad = new Date(a.datecreated ?? 0).getTime();
    const bd = new Date(b.datecreated ?? 0).getTime();
    return ad - bd;
  });

  labels.reverse();

  const next: Column[] = [];
  for (const label of labels) {
    const id = label.kanbanlabelid;
    const col = byId[id] ?? { id, name: label.kanbanlabelname, tasks: [] as ITask[] };
    col.name = label.kanbanlabelname;

    col.tasks.splice(0, col.tasks.length);
    for (const t of tasks.value) {
      if (t.kanbanlabel?.kanbanlabelid === id) col.tasks.push(t);
    }
    next.push(col);
  }
  columns.value = next;
}


watch([sortedKanbanlabels, tasks], rebuildColumns, { immediate: true });


// Add task function
const addTask = async () => {
  try {
    const firstColumnId = columns.value[0] ? columns.value[0].id : "todo";
    const response = await taskService.createTask({
      ...kanbanForm.value,
      kanbanlabelid: firstColumnId, // Default to first column
      duedate: kanbanForm.value.duedate
        ? new Date(kanbanForm.value.duedate)
        : undefined,
      duration: kanbanForm.value.duration
        ? new Date(kanbanForm.value.duration)
        : undefined,
    });

    await fetchTasks();
    modalRef.value?.close();
    resetModalData();
  } catch (error) {
    console.error("Failed to create task:", error);
  }
};

// Update task function
const updateTask = async () => {
  try {
    const taskId = kanbanForm.value.taskid;
    if (!taskId) throw new Error("Task ID missing");

    const response = await taskService.updateTask(taskId, {
      ...kanbanForm.value,
      duedate: kanbanForm.value.duedate
        ? new Date(kanbanForm.value.duedate)
        : undefined,
      duration: kanbanForm.value.duration
        ? new Date(kanbanForm.value.duration)
        : undefined,
    });

    await fetchTasks();
    modalRef.value?.close();
    resetModalData();
  } catch (error) {
    console.error("Failed to update task:", error);
  }
};

// Track note to delete
const taskToDelete = ref<string | null>(null);

// Set note ID when delete button is clicked
const setTaskToDelete = (id: string) => {
  taskToDelete.value = id;
};

// Confirm deletion
const confirmDelete = async () => {
  if (taskToDelete.value) {
    await deleteTask(taskToDelete.value);
    deleteModalRef.value?.close();
    taskToDelete.value = null;
  }
};

// Delete task function
const deleteTask = async (id: string) => {
  try {
    if (!id) throw new Error("Task ID missing");

    await taskService.deleteTask(id);

    await fetchTasks();
  } catch (error) {
    console.error("Failed to delete task:", error);
  }
};

//cancel delete tag modal
const canceld = () => {
  deleteModalRef.value?.close();
};

// Submit form handler
const submittaskform = async (e: Event) => {
  e.preventDefault();
  if (form.value === "Add") {
    await addTask();
  } else {
    await updateTask();
  }
};

// Handle drag end event
const handleDragEnd = async (event: any) => {
  const toColumnElement = event.to.closest("[data-kanbanlabelid]");
  if (!toColumnElement) return;

  const newLabelId = toColumnElement.dataset.kanbanlabelid;
  const taskId = event.item.dataset.taskid;

  const task = tasks.value.find((t) => t.taskid === taskId);
  if (!task || task.kanbanlabel?.kanbanlabelid === newLabelId) return;

  task.kanbanlabel ??= {
      kanbanlabelid: '',
      kanbanlabelname: '',
      datecreated: new Date(),
      datemodified: new Date(),
    }

  const oldLabelId = task.kanbanlabel?.kanbanlabelid || "";
  task.kanbanlabel.kanbanlabelid = newLabelId; // Optimistic UI update

  try {
    await taskService.updateTask(taskId, { kanbanlabelid: newLabelId });
  } catch (error) {
    console.error("Failed to update task:", error);
    task.kanbanlabel.kanbanlabelid = oldLabelId; // Revert on error
    await fetchTasks();
  }
};

function onDragChange(evt: any, targetColumn: { id: string; tasks: any[] }) {
  if (evt.moved) return;

  if (evt.added) {
    const task = evt.added.element;

    (task.kanbanlabel ??= {
      kanbanlabelid: '',
      kanbanlabelname: '',
      datecreated: new Date(),
      datemodified: new Date(),
    }).kanbanlabelid = String(targetColumn.id);

    return;
  }
}


const kanbanForm = ref({
  taskid: "",
  taskname: "",
  priorityid: "",
  duedate: "",
  duration: "",
  colour: "#80ff80",
  description: "",
});
const form = ref("Add"); // 'Add' or 'Edit'

const setModalData = (passToModal: ITask) => {
  kanbanForm.value = {
    taskid: passToModal.taskid,
    taskname: passToModal.taskname,
    priorityid: passToModal.priority?.priorityid || "",
    duedate: passToModal.duedate
      ? formatDate(passToModal.duedate.toString())
      : "",
    duration: passToModal.duration ? passToModal.duration.toString() : "",
    colour: passToModal.colour,
    description: passToModal.description || "",
  };
};


const resetModalData = () => {
  kanbanForm.value = {
    taskid: "",
    taskname: "",
    priorityid: "",
    duedate: "",
    duration: "",
    colour: "#80ff80",
    description: "",
  }

  // catch-all form validation reset
  nextTick().then(() => {
    const rootEl: HTMLElement | undefined =
      (modalRef.value?.$el as HTMLElement | undefined) ??
      (modalRef.value as unknown as HTMLElement | undefined)

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
}
const setForm = (formType: string) => {
  form.value = formType;
};
</script>
<style scoped>
/* Column sizing & look */
.kanban-col {
    flex: 0 1 360px;           /* basis = 360px, can shrink a bit */
    max-width: 420px;
  }

.kanban-card {
  background: #fff;
  border: 1px solid rgba(0,0,0,.08);
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0,0,0,.06);
}

/* Row behavior (force left→right, equal heights) */
.kanban-row {
    flex-wrap: wrap;           /* allow multiple rows */
    justify-content: center;   /* center columns on each line */
    align-items: stretch;      /* same height cards */
    gap: 1rem;                 /* visual gutter */
  }

/* Column header */
.kanban-card > h4 {
  font-weight: 700;
  font-size: 1.05rem;
  margin: .25rem .25rem .75rem;
  padding-bottom: .25rem;
  border-bottom: 1px solid rgba(0,0,0,.06);
}

.drag-area {
  min-height: 55vh;
  transition: background-color 0.2s;
}

.drag-card:hover { cursor: move; }

.kanban-card {
  display: flex;
  flex-direction: column;
  height: 80vh;                 /* tall columns on desktop */
}

.kanban-list {
  flex: 1 1 auto;
  min-height: 0;
  overflow-y: auto;             /* desktop: vertical scroll inside column */
  overscroll-behavior: contain;
  -webkit-overflow-scrolling: touch;
}

/* Row defaults (desktop) */
.kanban-row {
  display: flex;                /* your row already is flex via Bootstrap; this is safe */
  overflow: visible;
  scroll-snap-type: none;
}

/* ===== Mobile (≤768px) – horizontal scrolling columns ===== */
@media (max-width: 768px) {
  /* horizontally scrollable row, centered */
  .kanban-row {
    flex-wrap: nowrap;
    overflow-x: auto;
    overflow-y: hidden;
    scroll-snap-type: x mandatory;
    -webkit-overflow-scrolling: touch;

    gap: 0.75rem;              /* similar to g-3 */
    padding-inline: 7.5vw;     /* ⬅️ half of (100vw - 85vw): centers first/last */
  }

  /* each column behaves like a centered slide */
  .kanban-col {
    flex: 0 0 auto;
    width: 85vw;               /* one column ≈ full view width */
    scroll-snap-align: center; /* snap each column to the center */
    /* optional: keep each snap precise */
    scroll-snap-stop: always;
  }

  /* avoid inner vertical scroll on mobile */
  .kanban-card { height: auto; }
  .kanban-list { overflow: visible; }
  .drag-area { min-height: 20vh; }
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

</style>
