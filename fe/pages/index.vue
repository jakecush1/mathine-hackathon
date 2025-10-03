<template>
  <PageMain title="Welcome to the Mathiné" :layout="pageLayout">
    <PageSection>
      <p>
        Mathiné is a  student platform that unifies academic management and
        personal organization into one powerful workspace. Designed specifically
        for your university journey, it transforms how you track assignments,
        quizzes, deadlines, and personal commitments - all through an intuitive,
        single-point solution.
      </p>
    </PageSection>
    <PageSection title="Using Mathiné">
      <Accordions id="how-to-use-accordion">
        <!-- Sign In Accordion Item -->
        <AccordionItem title="Sign In" id="how-to-use-accordion" :index="0">
          <Alert
            title="Use your  credentials (same as .ca login)!"
            classes="alert-info"
          >
            <p>
              To use this tool requires you need to sign in to your active 
              account. You can Sign in via sign in button from the top right.
            </p>
          </Alert>
        </AccordionItem>

        <!-- Connect Courses Accordion Item -->
        <AccordionItem
          title="Connect Courses"
          id="how-to-use-accordion"
          :index="1"
        >
          <Alert
            title="Sign in to Brightspace through Brightspace Course page!"
            classes="alert-info"
          >
            <p>
              To use this tool will automatically sign ins to Brightspace with
              your active  account. Remmeber if you don't have acive courses, it
              won't show up anything after signing in. And if the courses don't have deliverables
              set in Brightspace, nothing will be there on dropdown so make sure of that if there is any problem.
            </p>
          </Alert>
        </AccordionItem>

        <!-- Synchronize Workflow Accordion Item -->
        <AccordionItem
          title="Synchronize Workflow"
          id="how-to-use-accordion"
          :index="2"
        >
          <div class="table-responsive">
            <table class="table table-bordered">
              <thead class="table-light">
                <tr>
                  <th>Page</th>
                  <th>Key Function</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Kanban</strong></td>
                  <td>Drag-and-drop academic/personal task management</td>
                </tr>
                <tr>
                  <td><strong>Calendar</strong></td>
                  <td>Unified academic/personal schedule</td>
                </tr>
                <tr>
                  <td><strong>Brain Dump</strong></td>
                  <td>Digital sticky-note thinking space</td>
                </tr>
                <tr>
                  <td><strong>Courses</strong></td>
                  <td>Import Brightspace course deliverables in Kanban</td>
                </tr>
              </tbody>
            </table>
          </div>
        </AccordionItem>

        <!-- Maintain Control Accordion Item -->
        <AccordionItem
          title="Maintain Control"
          id="how-to-use-accordion"
          :index="3"
        >
          <ul class="list-group list-group-flush">
            <li class="list-group-item">
              Tasks imported from Brightspace maintain original due dates but
              can be adjusted on your end.
            </li>
            <li class="list-group-item">
              Things you do here won't reflect on Brightspace
            </li>
            <li class="list-group-item">
              All data stored securely within 's infrastructure
            </li>
          </ul>
        </AccordionItem>
      </Accordions>
    </PageSection>
    <PageSection title="Know Us">
      <p>
        This helpful tool is developed by
        <a href="https://inspire.org/">INSPIRE </a>. Feel free to reach
        out for any queries or suggestions.
      </p>
    </PageSection>
  </PageMain>
</template>

<script setup lang="ts">
const pageTitle = "Mathiné";
const pageLayout = "main";
const appConfig = useAppConfig();
useHead({
  title: `${appConfig.header.name} - University of Victoria`,
});
</script>
