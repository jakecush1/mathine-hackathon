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
      id="coursetaskModal"
      ref="coursemodalRef"
      title="Add Course Task"
      :show-footer="true"
    >
      <Form
        action="#"
        id="course-form"
        @submit="submitcoursetaskform"
        :validate="true"
        :defaultBtns="true"
        :reviewForm="false"
      >
        <FormInput
          v-model="courseForm.taskname"
          name="taskname"
          label="Task Name"
          required="true"
        />
        <FormSelectEnhanced
          v-model="courseForm.priorityid"
          name="priorityid"
          label="Priority"
          :options="selectPriority"
          required="true"
          :other="false"
          optVal="priorityid"
          optTxt="priorityname"
        />
        <FormDatePicker
          v-model="courseForm.duedate"
          name="duedate"
          label="Due Date"
          required="true"
          data-fp-time="true"
        />
        <FormInput
          v-model="courseForm.colour"
          type="color"
          name="colour"
          label="Colour"
          required="true"
        />
        <FormTextArea
          v-model="courseForm.description"
          name="description"
          label="Description"
        />
      </Form>
    </Modal>

    <div v-if="brightApi.hasBrightCookie()">
      <div v-if="initialLoading" class="text-center py-5">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading courses...</span>
        </div>
        <p class="mt-2">Loading your courses...</p>
      </div>

      <div v-else-if="filteredEnrolments.length">
        <Accordions id="courses-accordion">
          <AccordionItem
            v-for="(enrolment, index) in filteredEnrolments"
            :key="enrolment.OrgUnit.Id"
            :id="'courses-accordion'"
            :title="enrolment.OrgUnit.Name"
            :index="index"
          >
            <div v-if="loadingStates[enrolment.OrgUnit.Id] === 'loading'">
              <div class="text-center py-4">
                <div class="spinner-border text-primary" role="status">
                  <span class="visually-hidden">Loading...</span>
                </div>
                <p class="mt-2">Loading deliverables...</p>
              </div>
            </div>

            <div v-else-if="loadingStates[enrolment.OrgUnit.Id] === 'loaded'">
              <div v-if="deliverablesMap[enrolment.OrgUnit.Id]?.length">
                <div
                  v-for="deliverable in deliverablesMap[enrolment.OrgUnit.Id]"
                  :key="deliverable.Id"
                  class="deliverable-item mb-4 p-3 border rounded"
                >
                  <div class="row justify-content-between my-2">
                    <div class="col">
                      <h3 class="h5">{{ deliverable.Name }}</h3>
                      <p class="mb-1">
                        <strong>Due:</strong>
                        {{
                          deliverable.DueDate
                            ? formatDate(deliverable.DueDate)
                            : "No due date"
                        }}
                      </p>
                    </div>
                    <div class="col-auto">
                      <Button
                        variant="primary"
                        modal="coursetaskModal"
                        @click="
                          setModalData(
                            deliverable,
                            enrolment.OrgUnit.Name,
                            enrolment.OrgUnit.Id
                          )
                        "
                      >
                        <i class="fa fa-plus me-1" aria-hidden="true"></i>
                        Import to Kanban Tasks
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
              <div v-else class="alert alert-info">
                No deliverables found for this course
              </div>
            </div>

            <div v-else-if="loadingStates[enrolment.OrgUnit.Id] === 'error'">
              <div class="alert alert-danger">
                Error loading deliverables
                <Button
                  @click="retryLoad(enrolment.OrgUnit.Id)"
                  class="mt-2"
                >
                  <i class="fa fa-refresh me-1" aria-hidden="true"></i>
                  Try Again
                </Button>
              </div>
            </div>
          </AccordionItem>
        </Accordions>
      </div>
      <div v-else>No course enrolments found.</div>
    </div>

    <div v-else>
      <Alert
        title="You are not logged in to Brightspace!"
        classes="alert-danger"
      >
        <p>Signing in to Brightspace to get enrolled courses...</p>
        <div class="spinner-border text-primary mt-2" role="status">
          <span class="visually-hidden">Signing in...</span>
        </div>
        <p class="mt-2">If you are not redirected automatically, click below:</p>
        <Button @click="signIn"> Sign in to Brightspace </Button>
      </Alert>
    </div>
  </PageMain>
</template>

<script setup lang="ts">
import { useBrightspaceApi } from "~/composable/brightspace";
import { ref, computed, onMounted, onUnmounted } from "vue";
import FormSelectEnhanced from '../components/FormSelect.vue';
import taskService from "~/api/taskService";
import type { ITask } from "~/types/task";
import { storeToRefs } from "pinia";
import { usePriorityStore } from "~/store/priorityStore";
import { useKanbanLabelStore } from "~/store/kanbanLabelStore";

const pageTitle = "Courses";
const pageLayout = "main";
const isLoggedIn: Boolean = true;

// Initialize stores
const priorityStore = usePriorityStore();
const kanbanLabelStore = useKanbanLabelStore();
const { priorities } = storeToRefs(priorityStore);
const { sortedKanbanlabels } = storeToRefs(kanbanLabelStore);
const selectPriority = computed(() => priorities.value);

// Composable API
const brightApi = useBrightspaceApi();

// Refs
const coursemodalRef = ref();
const deliverablesMap = ref<Record<number, any[]>>({});
const loadingStates = ref<
  Record<number, "initial" | "loading" | "loaded" | "error">
>({});
const initialLoading = ref(true);
const whoYouAre = ref<any>(null);
const enrolments = ref<any>(null);
const autoSignInAttempted = ref(false);

// Course form
const courseForm = ref({
  taskname: "",
  priorityid: "",
  duedate: "",
  colour: "#80ff80",
  description: "",
  coursebsid: "", // Enrollment's OrgUnit.Id
  coursename: "", // Enrollment's OrgUnit.Name
  dropboxbsid: "", // Deliverable's Id
  dropboxdue: "", // Deliverable's DueDate
});

// Computed enrolments
const filteredEnrolments = computed(() => {
  if (!enrolments.value?.Items) return [];
  return enrolments.value.Items.filter((item: any) => {
    return item.OrgUnit.Type.Id === 3 && item.Access.IsActive && (item.Access.StartDate>="2025-08-10T08:00:00.000Z");
  });
});

// Lifecycle hooks
onMounted(async () => {
  await priorityStore.fetchPriorities();
  await kanbanLabelStore.fetchKanbanLabels();
  
  // Add auto sign-in logic
  if (isLoggedIn && !brightApi.hasBrightCookie() && !autoSignInAttempted.value) {
    autoSignInAttempted.value = true;
    // Add a small delay to allow the UI to render the loading state
    setTimeout(() => {
      signIn();
    }, 200);
  } else {
    fetchUserData();
  }

  document.addEventListener("shown.bs.collapse", handleAccordionShown);
});


onUnmounted(() => {
  document.removeEventListener("shown.bs.collapse", handleAccordionShown);
});

// Event handler for accordion expansion
const handleAccordionShown = (event: Event) => {
  const target = event.target as HTMLElement;
  if (!target.classList.contains("accordion-collapse")) return;

  const idParts = target.id.split("-");
  if (idParts.length < 3) return;

  const index = parseInt(idParts[idParts.length - 2]);
  if (isNaN(index)) return;

  const enrolment = filteredEnrolments.value[index];
  if (!enrolment) return;

  const orgUnitId = enrolment.OrgUnit.Id;
  if (
    !deliverablesMap.value[orgUnitId] &&
    loadingStates.value[orgUnitId] !== "loading"
  ) {
    loadDeliverables(orgUnitId);
  }
};

// API functions
const fetchUserData = async () => {
  if (!brightApi.hasBrightCookie()) {
    initialLoading.value = false;
    return;
  }

  try {
    whoYouAre.value = await brightApi.whoami();
    enrolments.value = await brightApi.enrolments();

    if (enrolments.value?.Items) {
      enrolments.value.Items.filter(
        (item: any) => item.OrgUnit.Type.Id === 3
      ).forEach((item: any) => {
        loadingStates.value[item.OrgUnit.Id] = "initial";
      });
    }
  } catch (error) {
    console.error("Error fetching user data:", error);
  } finally {
    initialLoading.value = false;
  }
};

const loadDeliverables = async (orgUnitId: number) => {
  try {
    loadingStates.value[orgUnitId] = "loading";
    const response = await brightApi.deliverables(orgUnitId.toString());
    deliverablesMap.value[orgUnitId] = Array.isArray(response) ? response : [];
    loadingStates.value[orgUnitId] = "loaded";
  } catch (error) {
    console.error("Error fetching deliverables:", error);
    loadingStates.value[orgUnitId] = "error";
  }
};

const retryLoad = async (orgUnitId: number) => {
  loadingStates.value[orgUnitId] = "initial";
  loadDeliverables(orgUnitId);
};

// Form handlers
const setModalData = (
  deliverable: any,
  courseName: string,
  courseId: string
) => {
  courseForm.value = {
    taskname: deliverable.Name,
    priorityid: "",
    duedate: deliverable.DueDate
      ? formatDate(deliverable.DueDate)
      : "",
    colour: "#80ff80",
    description: "",
    coursebsid: courseId, // Course ID (enrollment's OrgUnit.Id)
    coursename: courseName, // Course name
    dropboxbsid: deliverable.Id.toString(), // Deliverable ID
    dropboxdue: deliverable.DueDate,
  };
};

const submitcoursetaskform = async (e: Event) => {
  e.preventDefault();
  try {
    // Initialize Kanban Label as ToDo
    const firstColumnId = sortedKanbanlabels.value[0]?.kanbanlabelid || "";

    const taskData: Omit<ITask, "taskid" | "datecreated" | "datemodified"> = {
      taskname: courseForm.value.taskname,
      priorityid: courseForm.value.priorityid,
      duedate: courseForm.value.duedate
        ? new Date(courseForm.value.duedate)
        : undefined,
      colour: courseForm.value.colour,
      description: courseForm.value.description,
      kanbanlabelid: firstColumnId,
      coursebsid: courseForm.value.coursebsid,
      coursename: courseForm.value.coursename,
      dropboxbsid: courseForm.value.dropboxbsid,
      dropboxdue: courseForm.value.dropboxdue
        ? new Date(courseForm.value.dropboxdue)
        : undefined,
    };

    await taskService.createTask(taskData);
    coursemodalRef.value?.close();
    courseForm.value = {
      taskname: "",
      priorityid: "",
      duedate: "",
      colour: "#80ff80",
      description: "",
      coursebsid: "",
      coursename: "",
      dropboxbsid: "",
      dropboxdue: "",
    };
  } catch (error) {
    console.error("Failed to create task:", error);
  }
};

// Utility functions

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  
  // Get date components (local time)
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  // Get time components (local time)
  let hoursN = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, '0');
  
  // Convert to 12-hour format with uppercase AM/PM
  const ampm = hoursN >= 12 ? 'PM' : 'AM';
  hoursN = hoursN % 12 || 12; // Convert 0 to 12
  const hours = String(hoursN).padStart(2, '0'); // Ensure 2-digit format

  return `${year}-${month}-${day} ${hours}:${minutes} ${ampm}`;
};

const signIn = () => {
  window.location.pathname = "/api/bright/auth";
};

const appConfig = useAppConfig();
useHead({
  title: `${pageTitle} - ${appConfig.header.name} - University of Victoria`,
});
</script>
