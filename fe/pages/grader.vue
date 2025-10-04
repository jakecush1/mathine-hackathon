<template>
  <PageMain :title="pageTitle" :layout="pageLayout" v-if="!isLoggedIn">
    <Alert title="You are not logged in!" classes="alert-danger">
      <p>
        To use this tool you need to sign in to your account. Sign in via
        sign in button from the top right.
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
          <h4 class="d-inline">Estimated Grade: </h4>
          <span class="badge" :class="getGradeBadgeClass(gradingResults.estimatedGrade)">
            {{ gradingResults.estimatedGrade }}%
          </span>
        </div>
        
        <div class="mb-3">
          <h5>Feedback:</h5>
          <div class="feedback-content p-3 bg-light rounded" v-html="formatFeedback(gradingResults.feedback)"></div>
        </div>
        
        <div v-if="gradingResults.improvementSuggestions">
          <h5>Improvement Suggestions:</h5>
          <ul class="list-group">
            <li v-for="(suggestion, index) in gradingResults.improvementSuggestions" 
                :key="index" class="list-group-item">
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
                Get course-specific feedback and estimated grades for your assignments
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
                    
                    <RichText
                      v-model="autograderForm.assignmentDescription"
                      name="assignmentDescription"
                      label="Assignment Description"
                      placeholder="Paste the full assignment description and requirements..."
                      required="true"
                      :height="200"
                    />

                    <FormInput
                      v-model="autograderForm.rubric"
                      type="textarea"
                      name="rubric"
                      label="Grading Rubric (Optional)"
                      placeholder="Paste the grading rubric if available..."
                      :rows="4"
                    />
                  </div>
                  
                  <div class="col-md-6">
                    <RichText
                      v-model="autograderForm.studentSubmission"
                      name="studentSubmission"
                      label="Your Submission"
                      placeholder="Paste your assignment submission here..."
                      required="true"
                      :height="300"
                    />

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
                    {{ isGrading ? 'Grading...' : 'Grade Submission' }}
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
                      <td class="text-truncate" style="max-width: 200px;">
                        {{ truncateText(grading.assignmentDescription, 50) }}
                      </td>
                      <td>
                        <span class="badge" :class="getGradeBadgeClass(grading.estimatedGrade)">
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
import autograderApi from "~/api/autograderService";

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
  studentSubmission: "",
  courseMaterials: ""
});

const isGrading = ref(false);
const gradingResults = ref<IGradingResult | null>(null);
const gradingHistory = ref<IGradingHistory[]>([]);

// Submit autograder form
const submitAutograderForm = async (e: Event) => {
  e.preventDefault();
  isGrading.value = true;

  try {
    // Call the autograder API
    const response = await autograderApi.gradeSubmission(autograderForm.value);
    gradingResults.value = response.data;
    
    // Add to history
    const historyItem: IGradingHistory = {
      id: Date.now().toString(),
      courseName: autograderForm.value.courseName,
      assignmentDescription: autograderForm.value.assignmentDescription,
      estimatedGrade: gradingResults.value.estimatedGrade,
      timestamp: new Date(),
      fullResults: gradingResults.value
    };
    
    gradingHistory.value.unshift(historyItem);
    
    // Save to localStorage (or your preferred storage)
    saveGradingHistory();
    
    // Show results modal
    resultsModalRef.value?.open();
    
  } catch (error) {
    console.error("Grading failed:", error);
    // You might want to show an error message to the user
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
    studentSubmission: "",
    courseMaterials: ""
  };
};

// Grade another submission
const gradeNewSubmission = () => {
  resultsModalRef.value?.close();
  resetAutograderForm();
  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

// View grading details
const viewGradingDetails = (grading: IGradingHistory) => {
  gradingResults.value = grading.fullResults;
  resultsModalRef.value?.open();
};

// Delete grading from history
const deleteGrading = (id: string) => {
  gradingHistory.value = gradingHistory.value.filter(item => item.id !== id);
  saveGradingHistory();
};

// Save grading history to localStorage
const saveGradingHistory = () => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('autograderHistory', JSON.stringify(gradingHistory.value));
  }
};

// Load grading history from localStorage
const loadGradingHistory = () => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('autograderHistory');
    if (saved) {
      gradingHistory.value = JSON.parse(saved);
    }
  }
};

// Utility functions
const getGradeBadgeClass = (grade: number) => {
  if (grade >= 90) return 'bg-success';
  if (grade >= 80) return 'bg-primary';
  if (grade >= 70) return 'bg-warning';
  return 'bg-danger';
};

const formatFeedback = (feedback: string) => {
  // Simple formatting - you might want to use a more robust solution
  return feedback.replace(/\n/g, '<br>');
};

const truncateText = (text: string, maxLength: number) => {
  if (!text) return '';
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
};

const formatDate = (date: Date | string) => {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
};

// Lifecycle hooks
onMounted(() => {
  loadGradingHistory();
});
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
</style>