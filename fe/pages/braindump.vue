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
      <p>Are you sure you want to delete this braindump?</p>
      <div>
        <Button class="me-3" variant="primary" @click="confirmDelete">
          Delete
        </Button>
        <Button variant="secondary" @click="cancelDeleteEvent">
          Cancel
        </Button>
      </div>
    </Modal>
    <!-- Braindump Modal -->
    <Modal
      id="braindumpModal"
      ref="modalRef"
      :title="formMode + ' Braindump'"
      :show-footer="true"
    >
      <Form
        action="#"
        id="braindump-form"
        @submit="submitBraindumpForm"
        :validate="true"
        :defaultBtns="false"
        :reviewForm="false"
      >
        <RichText
          v-model="braindumpForm.content"
          name="content"
          label="Content"
          required="true"
        />
        <FormInput
          v-model="braindumpForm.colour"
          type="color"
          name="colour"
          label="Colour"
          required="true"
        />
      </Form>

      <!-- Footer actions go here -->
      <template #footer>
        <!-- This submits the form above by referencing its id -->
        <Button type="submit" form="braindump-form" variant="primary">
          {{ formMode === 'Add' ? 'Add' : 'Save' }}
        </Button>
        <Button type="button" variant="secondary" @click="modalRef?.close()">
          Cancel
        </Button>
      </template>
    </Modal>


    <Button
      variant="primary"
      class="mb-3"
      @click="openAddModal"
    >
      <i class="fa fa-plus" aria-hidden="true"></i> Add Braindump
    </Button>

    <PageSection>
      <div class="board-container">
        <div
          class="board"
          ref="board"
          :style="{
            'min-width': `${boardWidth}px`,
            'min-height': `${boardHeight}px`,
          }"
        >
          <div
            v-for="note in notes"
            :key="note.braindumpid"
            class="note"
            :class="{
              dragging: draggingNoteId === note.braindumpid,
              resizing: resizingNoteId === note.braindumpid,
            }"
            :style="getNoteStyle(note)"
            @mousedown="startDrag(note, $event)"
          >
            <div class="note-content text-primary prose
                        prose-p:my-1 prose-ul:my-1 prose-ol:my-1
                        prose-li:my-0 prose-headings:my-2"
            v-html="sanitizedHtml(note.content)">
            </div>

            <div class="row justify-content-between align-items-center">
              <div class="col">
                <span class="badge bg-light-cyan text-primary">
                  {{ formatDate(note.datecreated) }}
                </span>
              </div>

              <div class="col col-auto">
                <Button
                  class="btn btn-primary badge me-2"
                  modal="braindumpModal"
                  @click.stop="openEditModal(note)"
                >
                  <i class="fa fa-pencil" aria-hidden="true"></i>
                  <span class="sr-only">Edit Braindump</span>
                </Button>
                <Button
                  variant="secondary"
                  class="btn btn-primary badge"
                  modal="deleteConfirmationModal"
                  @click.stop="setNoteToDelete(note.braindumpid)"
                  ><i class="fa fa-trash text-primary" aria-hidden="true"></i>
                  <span class="sr-only">Delete Braindump</span></Button
                >
                <div
                  class="resize-handle"
                  @mousedown.stop="startResize(note, $event)"
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageSection>
  </PageMain>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, nextTick } from "vue";
import type { IBraindump } from "~/types/braindump";
import braindumpApi from "~/api/braindumpService";
import Modal from "../components/Modal.vue";
import RichText from "~/components/RichText.vue";

const modalRef = ref<InstanceType<typeof Modal> | null>(null);
const deleteModalRef = ref<InstanceType<typeof Modal> | null>(null);

const pageTitle = "Brain Dump";
const pageLayout = "main";
const isLoggedIn: Boolean = true;
const appConfig = useAppConfig();
useHead({
  title: `${pageTitle} - ${appConfig.header.name} - University of Victoria`,
});

// Form state
const formMode = ref<"Add" | "Edit">("Add");
const setFormMode = (mode: "Add" | "Edit") => {
  formMode.value = mode;
};

const openAddModal = () => {
  resetForm();
  setFormMode("Add");
  modalRef.value?.open();
};



const braindumpForm = ref<{
  braindumpid?: string;
  content: string;
  colour: string;
}>({
  content: "",
  colour: "#fffaed",
});

// 2 new reference to bring sticky note to front
const noteZIndices = ref<Map<string, number>>(new Map());
const maxZIndex = ref(1);

// Reset form data
const resetForm = () => {
  braindumpForm.value = {
    content: "",
    colour: "#fffaed",
  };

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
};

//cancel event deletion
function cancelDeleteEvent() {
  noteToDelete.value = null;
  deleteModalRef.value?.close();
}

// Board state
const boardWidth = ref(2000);
const boardHeight = ref(2000);
const notes = ref<IBraindump[]>([]);

// Interaction state
const draggingNoteId = ref<string | null>(null);
const resizingNoteId = ref<string | null>(null);
const dragStart = ref({ x: 0, y: 0, startX: 0, startY: 0 });
const resizeStart = ref({ x: 0, y: 0, width: 0, height: 0 });

// Generate random position within board viewport
const getRandomPosition = () => ({
  x: Math.floor(Math.random() * (window.innerWidth - 400)),
  y: Math.floor(Math.random() * (window.innerHeight - 400)),
});

// Generate random size for new notes
const getRandomSize = () => ({
  width: 200 + Math.floor(Math.random() * 200),
  height: 150 + Math.floor(Math.random() * 200),
});

// Fetch notes from API
const fetchNotes = async () => {
  try {
    const response = await braindumpApi.getBraindumps();
    notes.value = response.data;
    calculateBoardSize();
  } catch (error) {
    console.error("Failed to fetch notes:", error);
  }
};

// Submit form handler
const submitBraindumpForm = async (e: Event) => {
  e.preventDefault();

  try {
    if (formMode.value === "Add") {
      const position = getRandomPosition();
      const size = getRandomSize();

      const response = await braindumpApi.createBraindump({
        content: braindumpForm.value.content,
        colour: braindumpForm.value.colour,
        boardpositionx: position.x,
        boardpositiony: position.y,
        boardsizex: size.width,
        boardsizey: size.height,
      });

      notes.value.push(response.data);

      // Hide modal
      modalRef.value?.close();
    } else if (braindumpForm.value.braindumpid) {
      await braindumpApi.updateBraindump(
        braindumpForm.value.braindumpid,
        {
          content: braindumpForm.value.content,
          colour: braindumpForm.value.colour,
          datemodified: new Date(),
        }
      );

      // Update local note
      const index = notes.value.findIndex(
        (n) => n.braindumpid === braindumpForm.value.braindumpid
      );
      if (index !== -1) {
        notes.value[index].content = braindumpForm.value.content;
        notes.value[index].colour = braindumpForm.value.colour;
        notes.value[index].datemodified = new Date();
      }
      // Hide modal
      modalRef.value?.close();
    }
  } catch (error) {
    console.error("Form submission failed:", error);
  }
};

// Track note to delete
const noteToDelete = ref<string | null>(null);

// Set note ID when delete button is clicked
const setNoteToDelete = (id: string) => {
  noteToDelete.value = id;
  deleteModalRef.value?.open();         // ← open confirm modal
};

// Confirm deletion
const confirmDelete = async () => {
  if (noteToDelete.value) {
    await deleteNote(noteToDelete.value);
    deleteModalRef.value?.close();
    noteToDelete.value = null;
  }
};
// Delete note
const deleteNote = async (id: string) => {
  try {
    await braindumpApi.deleteBraindump(id);
    notes.value = notes.value.filter((note) => note.braindumpid !== id);
    calculateBoardSize();
  } catch (error) {
    console.error("Failed to delete note:", error);
  }
};

// Open edit modal
const openEditModal = (note: IBraindump) => {
  resetForm();
  setFormMode("Edit");
  braindumpForm.value = {
    braindumpid: note.braindumpid,
    content: note.content ?? "",
    colour: note.colour || "#fffaed",
  };
  modalRef.value?.open();
};

// Note styling
const getNoteStyle = (note: IBraindump) => ({
  left: `${note.boardpositionx}px`,
  top: `${note.boardpositiony}px`,
  width: `${note.boardsizex}px`,
  height: `${note.boardsizey}px`,
  backgroundColor: note.colour || "#fffaed",
  borderColor: `rgba(0, 0, 0, ${note.colour ? "0.2" : "0.1"})`,
  zIndex: noteZIndices.value.get(note.braindumpid) || 1,
});

// Date formatting
const formatDate = (date: Date | string) => {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

// Board sizing
const calculateBoardSize = () => {
  let maxX = window.innerWidth;
  let maxY = window.innerHeight;

  notes.value.forEach((note) => {
    maxX = Math.max(maxX, note.boardpositionx + note.boardsizex + 50);
    maxY = Math.max(maxY, note.boardpositiony + note.boardsizey + 50);
  });

  boardWidth.value = maxX;
  boardHeight.value = maxY;
};

// bring sticky note to front on click
const bringToFront = (noteId: string) => {
  maxZIndex.value += 1;
  noteZIndices.value.set(noteId, maxZIndex.value);
};

// --- Dragging functionality ---
const startDrag = (note: IBraindump, event: MouseEvent) => {
  if (event.button !== 0) return;
  
  bringToFront(note.braindumpid); // ADD THIS LINE
  
  draggingNoteId.value = note.braindumpid;
  dragStart.value = {
    x: event.clientX,
    y: event.clientY,
    startX: note.boardpositionx,
    startY: note.boardpositiony,
  };

  document.addEventListener("mousemove", handleDrag);
  document.addEventListener("mouseup", stopDrag);
};

const handleDrag = (event: MouseEvent) => {
  if (!draggingNoteId.value) return;

  const note = notes.value.find((n) => n.braindumpid === draggingNoteId.value);
  if (!note) return;

  const dx = event.clientX - dragStart.value.x;
  const dy = event.clientY - dragStart.value.y;

  // Calculate new position
  let newX = dragStart.value.startX + dx;
  let newY = dragStart.value.startY + dy;

  // Get board element to check boundaries
  const boardElement = document.querySelector('.board') as HTMLElement;
  if (boardElement) {
    const boardRect = boardElement.getBoundingClientRect();
    const containerRect = boardElement.parentElement?.getBoundingClientRect();
    
    if (containerRect) {
      // Calculate the scrollable area bounds
      const minX = 0;
      const minY = 0;
      const maxX = boardWidth.value - note.boardsizex;
      const maxY = boardHeight.value - note.boardsizey;

      // Constrain position within board boundaries
      newX = Math.max(minX, Math.min(newX, maxX));
      newY = Math.max(minY, Math.min(newY, maxY));
    }
  }

  note.boardpositionx = newX;
  note.boardpositiony = newY;
};

const stopDrag = async () => {
  if (!draggingNoteId.value) return;

  const note = notes.value.find((n) => n.braindumpid === draggingNoteId.value);
  if (note) {
    try {
      await braindumpApi.updateBraindump(note.braindumpid, {
        boardpositionx: note.boardpositionx,
        boardpositiony: note.boardpositiony,
      });
    } catch (error) {
      console.error("Failed to update note position:", error);
    }
  }

  draggingNoteId.value = null;
  document.removeEventListener("mousemove", handleDrag);
  document.removeEventListener("mouseup", stopDrag);
};

// --- Resizing functionality ---
const startResize = (note: IBraindump, event: MouseEvent) => {
  if (event.button !== 0) return;
  event.stopPropagation();

  bringToFront(note.braindumpid); // ADD THIS LINE

  resizingNoteId.value = note.braindumpid;
  resizeStart.value = {
    x: event.clientX,
    y: event.clientY,
    width: note.boardsizex,
    height: note.boardsizey,
  };

  document.addEventListener("mousemove", handleResize);
  document.addEventListener("mouseup", stopResize);
};

const handleResize = (event: MouseEvent) => {
  if (!resizingNoteId.value) return;

  const note = notes.value.find((n) => n.braindumpid === resizingNoteId.value);
  if (!note) return;

  const dx = event.clientX - resizeStart.value.x;
  const dy = event.clientY - resizeStart.value.y;

  note.boardsizex = Math.max(200, resizeStart.value.width + dx);
  note.boardsizey = Math.max(150, resizeStart.value.height + dy);
};

const stopResize = async () => {
  if (!resizingNoteId.value) return;

  const note = notes.value.find((n) => n.braindumpid === resizingNoteId.value);
  if (note) {
    try {
      await braindumpApi.updateBraindump(note.braindumpid, {
        boardsizex: note.boardsizex,
        boardsizey: note.boardsizey,
      });
    } catch (error) {
      console.error("Failed to update note size:", error);
    }
  }

  resizingNoteId.value = null;
  document.removeEventListener("mousemove", handleResize);
  document.removeEventListener("mouseup", stopResize);
};

function sanitizedHtml(html?: string): string {
  if (!html) return ''

  if (typeof window === 'undefined' || !('DOMParser' in globalThis)) {
    return escapeHtml(html).replace(/\n/g, '<br>')
  }

  const parser = new DOMParser()
  const doc = parser.parseFromString(html, 'text/html')

  const ALLOW = new Set(['P','BR','DIV','UL','OL','LI','STRONG','B','EM','I'])
  // Tags we drop entirely (no children)
  const DROP = new Set([
    'SCRIPT','STYLE','IFRAME','OBJECT','EMBED','LINK','META','FORM',
    'INPUT','BUTTON','TEXTAREA','SVG','MATH','FRAME','FRAMESET','APPLET'
  ])

  // Remove comments
  const it = doc.createNodeIterator(doc.body, NodeFilter.SHOW_COMMENT)
  const comments: Comment[] = []
  for (let n = it.nextNode(); n; n = it.nextNode()) comments.push(n as Comment)
  comments.forEach(c => c.remove())

  // Walk all elements
  const els = Array.from(doc.body.querySelectorAll('*')) as HTMLElement[]
  for (const el of els) {
    const tag = el.tagName

    if (DROP.has(tag)) {
      el.remove()
      continue
    }

    if (!ALLOW.has(tag)) {
      // unwrap unknown tags (e.g., span)
      el.replaceWith(...Array.from(el.childNodes))
      continue
    }

    if (tag === 'B') {
      const strong = doc.createElement('strong')
      strong.innerHTML = el.innerHTML
      el.replaceWith(strong)
      continue
    }
    if (tag === 'I') {
      const em = doc.createElement('em')
      em.innerHTML = el.innerHTML
      el.replaceWith(em)
      continue
    }

    // Strip all attributes on allowed tags
    for (const a of Array.from(el.attributes)) el.removeAttribute(a.name)
  }

  // Trim and return
  return doc.body.innerHTML.trim()
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

// Lifecycle hooks
onMounted(() => {
  fetchNotes();
  window.addEventListener("resize", calculateBoardSize);
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", calculateBoardSize);
  document.removeEventListener("mousemove", handleDrag);
  document.removeEventListener("mouseup", stopDrag);
  document.removeEventListener("mousemove", handleResize);
  document.removeEventListener("mouseup", stopResize);
});
</script>

<style scoped>
.board-container {
  overflow: auto;
  height: 75vh;
  border-radius: 8px;
  background-color: #dfecff;
  background-image: linear-gradient(rgba(0, 0, 0, 0.05) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0, 0, 0, 0.05) 1px, transparent 1px);
  background-size: 20px 20px;
  padding: 1rem;
}

.board {
  position: relative;
  min-width: 100%;
  min-height: 100%;
}

.note {
  position: absolute;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1), 0 0 0 1px var(--border-color);
  padding: 15px;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transition: box-shadow 0.2s, transform 0.2s, width 0.1s, height 0.1s;
  cursor: grab;
  user-select: none;
}

.note-content.prose :where(p) { margin: 0; }
.note-content.prose :where(p + p) { margin-top: 0.25rem; }

.note-content.prose :where(ul, ol) {
  margin: 0.25rem 0;
  padding-left: 1.25rem;
}
.note-content.prose :where(li) { margin: 0; }

.note.dragging {
  cursor: grabbing;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2), 0 0 0 2px var(--border-color);
  z-index: 1000 !important;
}

.note.resizing {
  cursor: nwse-resize;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2), 0 0 0 2px var(--border-color);
  z-index: 1000 !important;
}

.note:hover {
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15), 0 0 0 1px var(--border-color);
  transform: translateY(-2px);
}

.note-content {
  flex-grow: 1;
  overflow-y: auto;
  font-size: 14px;
  line-height: 1.5;
  /*white-space: pre-wrap;
  word-break: break-word;*/
  margin-bottom: 5px;
  border-bottom: var(--border-color) solid 1px;
}

.resize-handle {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 16px;
  height: 16px;
  cursor: nwse-resize;
  background: transparent;
}

.resize-handle::after {
  content: "";
  position: absolute;
  bottom: 3px;
  right: 3px;
  width: 8px;
  height: 8px;
  border-right: 2px solid rgba(0, 0, 0, 0.3);
  border-bottom: 2px solid rgba(0, 0, 0, 0.3);
}
</style>
