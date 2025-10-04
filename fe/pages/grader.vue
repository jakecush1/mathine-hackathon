<template>
  <PageMain :title="pageTitle" :layout="pageLayout" v-if="!isLoggedIn">
    <Alert title="You are not logged in!" classes="alert-danger">
      <p>
        To use this tool you need to sign in to your account. Sign in via sign
        in button from the top right.
      </p>
    </Alert>
  </PageMain>
  <PageMain :title="pageTitle" :layout="pageLayout" v-if="isLoggedIn">
    <!-- Results Modal -->
    <Modal
      id="resultsModal"
      ref="resultsModalRef"
      title="Grading Results"
      :show-footer="true"
    >
      <div v-if="gradingResults">
        <div class="mb-4">
          <h4 class="d-inline">Estimated Grade:</h4>
          <span
            class="badge"
            :class="getGradeBadgeClass(gradingResults.estimatedGrade)"
          >
            {{ gradingResults.estimatedGrade }}%
          </span>
        </div>

        <div class="mb-3">
          <h5>Feedback:</h5>
          <div
            class="feedback-content p-3 bg-light rounded"
            v-html="formatFeedback(gradingResults.feedback)"
          ></div>
        </div>

        <div v-if="gradingResults.improvementSuggestions">
          <h5>Improvement Suggestions:</h5>
          <ul class="list-group">
            <li
              v-for="(
                suggestion, index
              ) in gradingResults.improvementSuggestions"
              :key="index"
              class="list-group-item"
            >
              {{ suggestion }}
            </li>
          </ul>
        </div>
      </div>

      <template #footer>
        <Button variant="secondary" @click="resultsModalRef?.close()">
          Close
        </Button>
        <Button variant="primary" @click="gradeNewSubmission">
          Grade Another Submission
        </Button>
      </template>
    </Modal>

    <!-- Autograder Form -->
    <PageSection>
      <div class="row">
        <div class="col-12">
          <div class="card">
            <div class="card-header">
              <h4>Autograder Assistant</h4>
              <p class="mb-0 text-muted">
                Get course-specific feedback and estimated grades for your
                assignments
              </p>
            </div>
            <div class="card-body">
              <Form
                action="#"
                id="autograder-form"
                @submit="submitAutograderForm"
                :validate="true"
                :defaultBtns="false"
                :reviewForm="false"
              >
                <div class="row">
                  <div class="col-md-6">
                    <FormInput
                      v-model="autograderForm.courseName"
                      type="text"
                      name="courseName"
                      label="Course Name"
                      placeholder="e.g., Computer Science 101"
                      required="true"
                    />

                    <!-- Assignment Description -->
                    <div class="mb-3">
                      <label class="form-label"
                        >Assignment Description
                        <span class="text-danger"> </span
                      ></label>
                      <input
                        type="file"
                        class="form-control mb-2"
                        accept=".pdf"
                        @change="
                          handleFileUpload($event, 'assignmentDescription')
                        "
                        ref="assignmentDescriptionFile"
                      />
                      <div
                        v-if="uploadedFiles.assignmentDescription"
                        class="alert alert-info py-2 mb-2"
                      >
                        <i class="fa fa-file-pdf-o me-2"></i>
                        <strong>{{
                          uploadedFiles.assignmentDescription.name
                        }}</strong>
                        <button
                          type="button"
                          class="btn-close float-end"
                          @click="removeFile('assignmentDescription')"
                          aria-label="Remove file"
                        ></button>
                      </div>
                      <RichText
                        v-model="autograderForm.assignmentDescription"
                        name="assignmentDescription"
                        placeholder="Paste the full assignment description and requirements or upload PDF above..."
                        :height="200"
                      />
                    </div>

                    <!-- Rubric -->
                    <div class="mb-3">
                      <label class="form-label"
                        >Grading Rubric (Optional)
                      </label>
                      <input
                        type="file"
                        class="form-control mb-2"
                        accept=".pdf"
                        @change="handleFileUpload($event, 'rubric')"
                        ref="rubricFile"
                      />
                      <div
                        v-if="uploadedFiles.rubric"
                        class="alert alert-info py-2 mb-2"
                      >
                        <i class="fa fa-file-pdf-o me-2"></i>
                        <strong>{{ uploadedFiles.rubric.name }}</strong>
                        <button
                          type="button"
                          class="btn-close float-end"
                          @click="removeFile('rubric')"
                          aria-label="Remove file"
                        ></button>
                      </div>
                      <FormInput
                        v-model="autograderForm.rubric"
                        type="textarea"
                        name="rubric"
                        placeholder="Paste the grading rubric or upload PDF above..."
                        :rows="4"
                      />
                    </div>

                    <!-- Answer Key -->
                    <div class="mb-3">
                      <label class="form-label">Answer Key (Optional) </label>
                      <input
                        type="file"
                        class="form-control mb-2"
                        accept=".pdf"
                        @change="handleFileUpload($event, 'answerKey')"
                        ref="answerKeyFile"
                      />
                      <div
                        v-if="uploadedFiles.answerKey"
                        class="alert alert-info py-2 mb-2"
                      >
                        <i class="fa fa-file-pdf-o me-2"></i>
                        <strong>{{ uploadedFiles.answerKey.name }}</strong>
                        <button
                          type="button"
                          class="btn-close float-end"
                          @click="removeFile('answerKey')"
                          aria-label="Remove file"
                        ></button>
                      </div>
                      <FormInput
                        v-model="autograderForm.answerKey"
                        type="textarea"
                        name="answerKey"
                        placeholder="Paste the Answer Key or upload PDF above..."
                        :rows="4"
                      />
                    </div>
                  </div>

                  <div class="col-md-6">
                    <!-- Student Submission -->
                    <div class="mb-3">
                      <label class="form-label"
                        >Your Submission <span class="text-danger"> </span
                      ></label>
                      <input
                        type="file"
                        class="form-control mb-2"
                        accept=".pdf"
                        @change="handleFileUpload($event, 'studentSubmission')"
                        ref="studentSubmissionFile"
                      />
                      <div
                        v-if="uploadedFiles.studentSubmission"
                        class="alert alert-info py-2 mb-2"
                      >
                        <i class="fa fa-file-pdf-o me-2"></i>
                        <strong>{{
                          uploadedFiles.studentSubmission.name
                        }}</strong>
                        <button
                          type="button"
                          class="btn-close float-end"
                          @click="removeFile('studentSubmission')"
                          aria-label="Remove file"
                        ></button>
                      </div>
                      <RichText
                        v-model="autograderForm.studentSubmission"
                        name="studentSubmission"
                        placeholder="Paste your assignment submission or upload PDF above..."
                        :height="300"
                      />
                    </div>

                    <FormInput
                      v-model="autograderForm.courseMaterials"
                      type="textarea"
                      name="courseMaterials"
                      label="Relevant Course Materials (Optional)"
                      placeholder="Paste key course concepts, readings, or materials that should be considered..."
                      :rows="3"
                    />
                  </div>
                </div>

                <div class="mt-4">
                  <Button
                    type="submit"
                    variant="primary"
                    :disabled="isGrading"
                    class="me-3"
                  >
                    <i class="fa fa-graduation-cap" aria-hidden="true"></i>
                    {{ isGrading ? "Grading..." : "Grade Submission" }}
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    @click="resetAutograderForm"
                  >
                    Reset Form
                  </Button>
                </div>
              </Form>
            </div>
          </div>
        </div>
      </div>

      <!-- Recent Gradings Section -->
      <div class="row mt-5" v-if="gradingHistory.length > 0">
        <div class="col-12">
          <div class="card">
            <div class="card-header">
              <h5>Recent Gradings</h5>
            </div>
            <div class="card-body">
              <div class="table-responsive">
                <table class="table table-hover">
                  <thead>
                    <tr>
                      <th>Course</th>
                      <th>Assignment</th>
                      <th>Estimated Grade</th>
                      <th>Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="grading in gradingHistory" :key="grading.id">
                      <td>{{ grading.courseName }}</td>
                      <td class="text-truncate" style="max-width: 200px">
                        {{ truncateText(grading.assignmentDescription, 50) }}
                      </td>
                      <td>
                        <span
                          class="badge"
                          :class="getGradeBadgeClass(grading.estimatedGrade)"
                        >
                          {{ grading.estimatedGrade }}%
                        </span>
                      </td>
                      <td>{{ formatDate(grading.timestamp) }}</td>
                      <td>
                        <Button
                          variant="outline-primary"
                          size="sm"
                          @click="viewGradingDetails(grading)"
                          class="me-2"
                        >
                          <i class="fa fa-eye" aria-hidden="true"></i>
                        </Button>
                        <Button
                          variant="outline-secondary"
                          size="sm"
                          @click="deleteGrading(grading.id)"
                        >
                          <i class="fa fa-trash" aria-hidden="true"></i>
                        </Button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageSection>
  </PageMain>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import type { IGradingResult, IGradingHistory } from "~/types/autograder";
import autograderService from "~/api/autograderService"; // Updated import

const resultsModalRef = ref(null);

const pageTitle = "Autograder Assistant";
const pageLayout = "main";
const isLoggedIn: Boolean = true;
const appConfig = useAppConfig();
useHead({
  title: `${pageTitle} - ${appConfig.header.name} - University of Victoria`,
});

// Autograder form state
const autograderForm = ref({
  courseName: "",
  assignmentDescription: "",
  rubric: "",
  answerKey: "",
  studentSubmission: "",
  courseMaterials: "",
});

// File upload state
const uploadedFiles = ref({
  assignmentDescription: null as File | null,
  rubric: null as File | null,
  answerKey: null as File | null,
  studentSubmission: null as File | null,
});

const isGrading = ref(false);
const gradingResults = ref<IGradingResult | null>(null);
const gradingHistory = ref<IGradingHistory[]>([]);

// Refs for file inputs
const assignmentDescriptionFile = ref<HTMLInputElement | null>(null);
const rubricFile = ref<HTMLInputElement | null>(null);
const answerKeyFile = ref<HTMLInputElement | null>(null);
const studentSubmissionFile = ref<HTMLInputElement | null>(null);

// Handle file upload
const handleFileUpload = (event: Event, fieldName: string) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];

  if (file && file.type === "application/pdf") {
    uploadedFiles.value[fieldName] = file;
    console.log(`File uploaded for ${fieldName}:`, file.name);
  } else if (file) {
    alert("Please upload a PDF file");
    target.value = "";
  }
};

// Remove uploaded file
const removeFile = (fieldName: string) => {
  uploadedFiles.value[fieldName] = null;

  // Clear the file input
  const fileInputMap = {
    assignmentDescription: assignmentDescriptionFile,
    rubric: rubricFile,
    answerKey: answerKeyFile,
    studentSubmission: studentSubmissionFile,
  };

  const inputRef = fileInputMap[fieldName];
  if (inputRef.value) {
    inputRef.value.value = "";
  }

  console.log(`File removed for ${fieldName}`);
};

// Submit autograder form
const submitAutograderForm = async (e: Event) => {
  e.preventDefault();
  isGrading.value = true;

  try {
    // Check if we have any files uploaded
    const hasFiles = Object.values(uploadedFiles.value).some(
      (file) => file !== null
    );

    if (hasFiles) {
      // Use file upload method
      const formData = new FormData();

      // Append text fields
      formData.append("courseName", autograderForm.value.courseName);
      formData.append(
        "assignmentDescription",
        autograderForm.value.assignmentDescription
      );
      formData.append("rubric", autograderForm.value.rubric || "");
      formData.append("answerKey", autograderForm.value.answerKey || "");
      formData.append(
        "studentSubmission",
        autograderForm.value.studentSubmission
      );
      formData.append(
        "courseMaterials",
        autograderForm.value.courseMaterials || ""
      );

      // Append files
      if (uploadedFiles.value.assignmentDescription) {
        formData.append(
          "assignmentDescriptionFile",
          uploadedFiles.value.assignmentDescription
        );
      }
      if (uploadedFiles.value.rubric) {
        formData.append("rubricFile", uploadedFiles.value.rubric);
      }
      if (uploadedFiles.value.answerKey) {
        formData.append("answerKeyFile", uploadedFiles.value.answerKey);
      }
      if (uploadedFiles.value.studentSubmission) {
        formData.append(
          "studentSubmissionFile",
          uploadedFiles.value.studentSubmission
        );
      }

      const response = await autograderService.gradeSubmissionWithFiles(
        formData
      );
      gradingResults.value = response.data;
    } else {
      // Use text-only method
      const response = await autograderService.gradeSubmission(
        autograderForm.value
      );
      gradingResults.value = response.data;
    }

    // Add to history
    const historyItem: IGradingHistory = {
      id: Date.now().toString(),
      courseName: autograderForm.value.courseName,
      assignmentDescription: autograderForm.value.assignmentDescription,
      estimatedGrade: gradingResults.value.estimatedGrade,
      timestamp: new Date(),
      fullResults: gradingResults.value,
    };

    gradingHistory.value.unshift(historyItem);
    saveGradingHistory();
    resultsModalRef.value?.open();
  } catch (error) {
    console.error("Grading failed:", error);
    // You can show a user-friendly error message here
    alert("Grading failed. Please check your connection and try again.");
  } finally {
    isGrading.value = false;
  }
};

// Reset form
const resetAutograderForm = () => {
  autograderForm.value = {
    courseName: "",
    assignmentDescription: "",
    rubric: "",
    answerKey: "",
    studentSubmission: "",
    courseMaterials: "",
  };

  // Clear all uploaded files
  uploadedFiles.value = {
    assignmentDescription: null,
    rubric: null,
    answerKey: null,
    studentSubmission: null,
  };

  // Clear file inputs
  if (assignmentDescriptionFile.value)
    assignmentDescriptionFile.value.value = "";
  if (rubricFile.value) rubricFile.value.value = "";
  if (answerKeyFile.value) answerKeyFile.value.value = "";
  if (studentSubmissionFile.value) studentSubmissionFile.value.value = "";
};

// Grade another submission
const gradeNewSubmission = () => {
  resultsModalRef.value?.close();
  resetAutograderForm();
  // Scroll to top
  window.scrollTo({ top: 0, behavior: "smooth" });
};

// View grading details
const viewGradingDetails = (grading: IGradingHistory) => {
  gradingResults.value = grading.fullResults;
  resultsModalRef.value?.open();
};

// Delete grading from history
const deleteGrading = (id: string) => {
  gradingHistory.value = gradingHistory.value.filter((item) => item.id !== id);
  saveGradingHistory();
};

// Save grading history to localStorage
const saveGradingHistory = () => {
  if (typeof window !== "undefined") {
    localStorage.setItem(
      "autograderHistory",
      JSON.stringify(gradingHistory.value)
    );
  }
};

// Load grading history from localStorage
const loadGradingHistory = () => {
  if (typeof window !== "undefined") {
    const saved = localStorage.getItem("autograderHistory");
    if (saved) {
      gradingHistory.value = JSON.parse(saved);
    }
  }
};

// Check service health on component mount
onMounted(() => {
  loadGradingHistory();

  // Optional: Check if autograder service is available
  autograderService
    .healthCheck()
    .then(() => console.log("Autograder service is healthy"))
    .catch(() => console.warn("Autograder service is unavailable"));
});

// Utility functions (keep your existing ones)
const getGradeBadgeClass = (grade: number) => {
  if (grade >= 90) return "bg-success";
  if (grade >= 80) return "bg-primary";
  if (grade >= 70) return "bg-warning";
  return "bg-danger";
};

const formatFeedback = (feedback: string) => {
  return feedback.replace(/\n/g, "<br>");
};

const truncateText = (text: string, maxLength: number) => {
  if (!text) return "";
  return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
};

const formatDate = (date: Date | string) => {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};
</script>

<style scoped>
.feedback-content {
  max-height: 300px;
  overflow-y: auto;
  font-size: 0.9rem;
  line-height: 1.5;
}

.grade-badge {
  font-size: 1.1rem;
  padding: 0.5rem 1rem;
}

.table-responsive {
  max-height: 400px;
  overflow-y: auto;
}

.card {
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
  border: 1px solid rgba(0, 0, 0, 0.125);
}

.card-header {
  background-color: #f8f9fa;
  border-bottom: 1px solid rgba(0, 0, 0, 0.125);
}

.alert {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.alert i {
  color: #0c5460;
}

.btn-close {
  background: none;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  padding: 0;
  width: 20px;
  height: 20px;
}
</style>
