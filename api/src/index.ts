import express from "express";
import { config as dotenvConfig } from "dotenv";
import gen from "~~/config/genDataSource";

import userRouter from "./routes/user.routes";
import taskxtagRouter from "./routes/taskxtag.routes";
import taskRouter from "./routes/task.routes";
import tagRouter from "./routes/tag.routes";
import priorityRouter from "./routes/priority.routes";
import kanbanRouter from "./routes/kanbanlabel.routes";
import calendarRouter from "./routes/calendar.routes";
import imageRouter from "./routes/image.routes";
import braindumpRouter from "./routes/braindump.routes";
import autograderRouter from "./routes/autograder.routes";

dotenvConfig({ path: "ContainerEnv" });

// --------------------------------
//           CONSTANTS
// --------------------------------
const port: number = parseInt(process.env.EXPRESS_PORT ?? "") || 3001;
const hostname: string = process.env.EXPRESS_HOSTNAME ?? "0.0.0.0";

const cors = require("cors");
// Configure CORS for all origins, credentials, and headers
const corsOptions = {
  origin: true, // This enables the dynamic reflection of the request origin
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Custom-Header'] // Replace with a more specific list in production
};

// --------------------------------
//     EXPRESSJS INITIALIZATION
// --------------------------------
const app: express.Application = express();
process.env.TZ = "America/Vancouver";

// --------------------------------
//        GLOBAL MIDDLEWARE
// --------------------------------
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors(corsOptions));
// ----------------------------------------------------------------------------------------------
//             BYPASSES SESSION DATA WITH MOCK DATA (DELETE IN PROD, JUST FOR TESTING)
// ----------------------------------------------------------------------------------------------
// Debugging: Check if routers are properly imported
console.log('Braindump router:', typeof braindumpRouter);
console.log('Autograder router:', typeof autograderRouter);
// ----------------------------------------------------------------------------------------------
//                           (DELETE IN PROD, JUST FOR TESTING)
// ----------------------------------------------------------------------------------------------
// --------------------------------
//             ROUTES
// --------------------------------
//app.use('/users', userRouter);
app.use("/autograders", (req, res, next) => {
  console.log('REACHED AUTOGrader MOUNT POINT:', req.originalUrl);
  next();
}, autograderRouter);
app.use("/taskxtags", taskxtagRouter);
app.use("/tasks", taskRouter);
app.use("/tags", tagRouter);
app.use("/priorities", priorityRouter);
app.use("/kanbanlabels", kanbanRouter);
app.use("/calendars", calendarRouter);
app.use("/images", imageRouter);
app.use("/braindumps", braindumpRouter);

// --------------------------------
//      APPLICATION STARTUP
// --------------------------------
async function initializeDB() {
  const dbs: Promise<void>[] = [];
  dbs.push(
    gen
      .initialize()
      .then(() => {
        console.log(
          `Connection with ${gen.options.database} database established.`
        );
      })
      .catch((e: any) => {
        console.error("Error during Data Source initialization:", e);
        throw e;
      })
  );

  return Promise.all(dbs);
}

initializeDB().then(async () => {
  app.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
  });
});
