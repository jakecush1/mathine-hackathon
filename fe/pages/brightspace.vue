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
      size="lg"
    >
      <div v-if="gradingResults" class="grading-results">
        <div class="grade-summary text-center mb-4 p-4 rounded-3 bg-light">
          <h4 class="text-muted mb-3">Estimated Grade</h4>
          <div class="grade-display">
            <span
              class="grade-badge badge fs-4 px-4 py-3"
              :class="getGradeBadgeClass(gradingResults.estimatedGrade)"
            >
              {{ gradingResults.estimatedGrade }}%
            </span>
          </div>
        </div>

        <div class="feedback-section mb-4">
          <h5 class="section-title mb-3">
            <i class="fa fa-comments text-primary me-2"></i>
            Feedback
          </h5>
          <div
            class="feedback-content p-4 bg-white border rounded-3 shadow-sm"
            v-html="formatFeedback(gradingResults.feedback)"
          ></div>
        </div>

        <div v-if="gradingResults.improvementSuggestions" class="suggestions-section">
          <h5 class="section-title mb-3">
            <i class="fa fa-lightbulb-o text-warning me-2"></i>
            Improvement Suggestions
          </h5>
          <div class="list-group">
            <div
              v-for="(suggestion, index) in gradingResults.improvementSuggestions"
              :key="index"
              class="list-group-item d-flex align-items-start border-0 mb-2 rounded-3 shadow-sm"
            >
              <span class="badge bg-primary me-3 mt-1">{{ index + 1 }}</span>
              <span class="suggestion-text flex-grow-1">{{ suggestion }}</span>
            </div>
          </div>
        </div>
      </div>

      <template #footer>
        <div class="modal-footer-buttons w-100 d-flex gap-2 justify-content-end">
          <Button variant="outline-secondary" @click="resultsModalRef?.close()" class="px-4">
            <i class="fa fa-times me-2"></i>
            Close
          </Button>
          <Button variant="primary" @click="gradeNewSubmission" class="px-4">
            <i class="fa fa-refresh me-2"></i>
            Grade Another Submission
          </Button>
        </div>
      </template>
    </Modal>

    <!-- Autograder Form -->
    <PageSection>
      <div class="row justify-content-center">
        <div class="col-12 col-xl-10">
          <div class="card shadow-sm border-0 rounded-3 overflow-hidden">
            <div class="card-header bg-primary text-white py-4">
              <div class="d-flex align-items-center">
                <i class="fa fa-graduation-cap fa-2x me-3"></i>
                <div>
                  <h4 class="mb-1 fw-bold">Autograder Assistant</h4>
                  <p class="mb-0 opacity-90">
                    Get course-specific feedback and estimated grades for your assignments
                  </p>
                </div>
              </div>
            </div>
            <div class="card-body p-4">
              <Form
                action="#"
                id="autograder-form"
                @submit="submitAutograderForm"
                :validate="true"
                :defaultBtns="false"
                :reviewForm="false"
              >
                <div class="row g-4">
                  <!-- Left Column -->
                  <div class="col-md-6">
                    <!-- Course Name -->
                    <div class="form-section">
                      <FormInput
                        v-model="autograderForm.courseName"
                        type="text"
                        name="courseName"
                        label="Course Name"
                        placeholder="e.g., Computer Science 101"
                        required="true"
                        icon="fa-book"
                      />
                    </div>

                    <!-- Assignment Description -->
                    <div class="form-section">
                      <label class="form-label fw-semibold">
                        <i class="fa fa-file-text-o me-2 text-primary"></i>
                        Assignment Description
                        <span class="text-danger">*</span>
                      </label>
                      <div class="file-upload-wrapper mb-3">
                        <input
                          type="file"
                          class="form-control"
                          accept=".pdf"
                          @change="handleFileUpload($event, 'assignmentDescription')"
                          ref="assignmentDescriptionFile"
                        />
                        <div class="form-text">Upload PDF or paste text below</div>
                      </div>
                      <FilePreview
                        v-if="uploadedFiles.assignmentDescription"
                        :file="uploadedFiles.assignmentDescription"
                        @remove="removeFile('assignmentDescription')"
                      />
                      <RichText
                        v-model="autograderForm.assignmentDescription"
                        name="assignmentDescription"
                        placeholder="Paste the full assignment description and requirements..."
                        :height="200"
                      />
                    </div>

                    <!-- Rubric -->
                    <div class="form-section">
                      <label class="form-label fw-semibold">
                        <i class="fa fa-list-alt me-2 text-info"></i>
                        Grading Rubric (Optional)
                      </label>
                      <div class="file-upload-wrapper mb-3">
                        <input
                          type="file"
                          class="form-control"
                          accept=".pdf"
                          @change="handleFileUpload($event, 'rubric')"
                          ref="rubricFile"
                        />
                        <div class="form-text">Upload PDF or paste text below</div>
                      </div>
                      <FilePreview
                        v-if="uploadedFiles.rubric"
                        :file="uploadedFiles.rubric"
                        @remove="removeFile('rubric')"
                      />
                      <FormInput
                        v-model="autograderForm.rubric"
                        type="textarea"
                        name="rubric"
                        placeholder="Paste the grading rubric..."
                        :rows="4"
                      />
                    </div>

                    <!-- Answer Key -->
                    <div class="form-section">
                      <label class="form-label fw-semibold">
                        <i class="fa fa-key me-2 text-warning"></i>
                        Answer Key (Optional)
                      </label>
                      <div class="file-upload-wrapper mb-3">
                        <input
                          type="file"
                          class="form-control"
                          accept=".pdf"
                          @change="handleFileUpload($event, 'answerKey')"
                          ref="answerKeyFile"
                        />
                        <div class="form-text">Upload PDF or paste text below</div>
                      </div>
                      <FilePreview
                        v-if="uploadedFiles.answerKey"
                        :file="uploadedFiles.answerKey"
                        @remove="removeFile('answerKey')"
                      />
                      <FormInput
                        v-model="autograderForm.answerKey"
                        type="textarea"
                        name="answerKey"
                        placeholder="Paste the Answer Key..."
                        :rows="4"
                      />
                    </div>
                  </div>

                  <!-- Right Column -->
                  <div class="col-md-6">
                    <!-- Student Submission -->
                    <div class="form-section">
                      <label class="form-label fw-semibold">
                        <i class="fa fa-upload me-2 text-success"></i>
                        Your Submission
                        <span class="text-danger">*</span>
                      </label>
                      <div class="file-upload-wrapper mb-3">
                        <input
                          type="file"
                          class="form-control"
                          accept=".pdf"
                          @change="handleFileUpload($event, 'studentSubmission')"
                          ref="studentSubmissionFile"
                        />
                        <div class="form-text">Upload PDF or paste text below</div>
                      </div>
                      <FilePreview
                        v-if="uploadedFiles.studentSubmission"
                        :file="uploadedFiles.studentSubmission"
                        @remove="removeFile('studentSubmission')"
                      />
                      <RichText
                        v-model="autograderForm.studentSubmission"
                        name="studentSubmission"
                        placeholder="Paste your assignment submission..."
                        :height="300"
                      />
                    </div>

                    <!-- Course Materials -->
                    <div class="form-section">
                      <FormInput
                        v-model="autograderForm.courseMaterials"
                        type="textarea"
                        name="courseMaterials"
                        label="Relevant Course Materials (Optional)"
                        placeholder="Paste key course concepts, readings, or materials that should be considered..."
                        :rows="3"
                        icon="fa-graduation-cap"
                      />
                    </div>
                  </div>
                </div>

                <!-- Form Actions -->
                <div class="form-actions mt-5 pt-4 border-top">
                  <div class="d-flex gap-3 justify-content-center">
                    <Button
                      type="submit"
                      variant="primary"
                      :disabled="isGrading"
                      class="px-5 py-2 fw-semibold"
                      size="lg"
                    >
                      <i class="fa fa-graduation-cap me-2" aria-hidden="true"></i>
                      {{ isGrading ? "Grading..." : "Grade Submission" }}
                    </Button>
                    <Button
                      type="button"
                      variant="outline-secondary"
                      @click="resetAutograderForm"
                      class="px-4 py-2"
                    >
                      <i class="fa fa-refresh me-2"></i>
                      Reset Form
                    </Button>
                  </div>
                </div>
              </Form>
            </div>
          </div>
        </div>
      </div>

      <!-- Recent Gradings Section -->
      <div class="row mt-5 justify-content-center" v-if="gradingHistory.length > 0">
        <div class="col-12 col-xl-10">
          <div class="card shadow-sm border-0 rounded-3">
            <div class="card-header bg-light py-3">
              <h5 class="mb-0 fw-semibold">
                <i class="fa fa-history me-2 text-primary"></i>
                Recent Gradings
              </h5>
            </div>
            <div class="card-body p-0">
              <div class="table-responsive">
                <table class="table table-hover mb-0">
                  <thead class="table-light">
                    <tr>
                      <th class="ps-4">Course</th>
                      <th>Assignment</th>
                      <th>Grade</th>
                      <th>Date</th>
                      <th class="pe-4 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="grading in gradingHistory" :key="grading.id" class="align-middle">
                      <td class="ps-4 fw-semibold">{{ grading.courseName }}</td>
                      <td class="text-truncate" style="max-width: 200px">
                        {{ truncateText(grading.assignmentDescription, 50) }}
                      </td>
                      <td>
                        <span
                          class="badge fs-6 px-3 py-2"
                          :class="getGradeBadgeClass(grading.estimatedGrade)"
                        >
                          {{ grading.estimatedGrade }}%
                        </span>
                      </td>
                      <td class="text-muted">{{ formatDate(grading.timestamp) }}</td>
                      <td class="pe-4 text-center">
                        <div class="btn-group btn-group-sm" role="group">
                          <Button
                            variant="outline-primary"
                            size="sm"
                            @click="viewGradingDetails(grading)"
                            class="px-3"
                            title="View Details"
                          >
                            <i class="fa fa-eye" aria-hidden="true"></i>
                          </Button>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            @click="deleteGrading(grading.id)"
                            class="px-3"
                            title="Delete"
                          >
                            <i class="fa fa-trash" aria-hidden="true"></i>
                          </Button>
                        </div>
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
import autograderService from "~/api/autograderService";

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

// File Preview Component (inline definition for simplicity)
const FilePreview = {
  props: ['file'],
  emits: ['remove'],
  template: `
    <div class="file-preview alert alert-info d-flex align-items-center justify-content-between py-2 mb-3 rounded-2">
      <div class="d-flex align-items-center">
        <i class="fa fa-file-pdf-o me-2 text-danger"></i>
        <span class="fw-semibold">{{ file.name }}</span>
      </div>
      <button
        type="button"
        class="btn-close btn-close-sm"
        @click="$emit('remove')"
        aria-label="Remove file"
      ></button>
    </div>
  `
};

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

// Utility functions
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
.card {
  transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
}

.card:hover {
  transform: translateY(-2px);
}

.card-header {
  border-bottom: none;
}

.form-section {
  margin-bottom: 2rem;
}

.form-section:last-child {
  margin-bottom: 0;
}

.section-title {
  color: #2c3e50;
  font-weight: 600;
  border-bottom: 2px solid #e9ecef;
  padding-bottom: 0.5rem;
}

.grade-badge {
  font-size: 1.5rem;
  padding: 0.75rem 1.5rem;
  border-radius: 50px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.grade-summary {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.feedback-content {
  max-height: 300px;
  overflow-y: auto;
  font-size: 0.95rem;
  line-height: 1.6;
  background: #ffffff;
  border: 1px solid #e9ecef !important;
}

.file-upload-wrapper .form-control {
  border: 2px dashed #dee2e6;
  background-color: #f8f9fa;
  transition: all 0.3s ease;
}

.file-upload-wrapper .form-control:hover {
  border-color: #007bff;
  background-color: #e7f3ff;
}

.file-preview {
  border-left: 4px solid #17a2b8;
  background-color: #f8f9fa;
  border-radius: 8px;
}

.btn-close-sm {
  padding: 0.25rem;
  font-size: 0.75rem;
}

.form-actions {
  background-color: #f8f9fa;
  margin: 0 -1.5rem -1.5rem;
  padding: 1.5rem !important;
}

.table th {
  font-weight: 600;
  text-transform: uppercase;
  font-size: 0.875rem;
  letter-spacing: 0.5px;
  color: #6c757d;
}

.table tbody tr {
  transition: background-color 0.2s ease;
}

.table tbody tr:hover {
  background-color: #f8f9fa;
}

.modal-footer-buttons {
  border-top: 1px solid #dee2e6;
  padding-top: 1rem;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .card-header .d-flex {
    flex-direction: column;
    text-align: center;
  }
  
  .card-header i {
    margin-bottom: 0.5rem;
  }
  
  .form-actions .d-flex {
    flex-direction: column;
    gap: 1rem !important;
  }
  
  .btn-group {
    width: 100%;
    justify-content: center;
  }
}

/* Animation for grading state */
.btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

/* Custom scrollbar for feedback */
.feedback-content::-webkit-scrollbar {
  width: 6px;
}

.feedback-content::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.feedback-content::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.feedback-content::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>