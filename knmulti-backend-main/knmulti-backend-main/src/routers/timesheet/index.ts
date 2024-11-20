import { Router } from "express";
import { controllerGet, controllerPost, controllerPut, controllerGetDaily, controllerGetRange } from "./controllers";
const timesheetRouter = Router();

timesheetRouter.get("/day", controllerGetDaily);
timesheetRouter.get("/day/:id", controllerGetDaily);
timesheetRouter.get("/range", controllerGetRange);
timesheetRouter.get("/range/:id", controllerGetRange);
timesheetRouter.get("/", controllerGet);
timesheetRouter.get("/:id", controllerGet);
timesheetRouter.post("/", controllerPost);
timesheetRouter.put("/:id", controllerPut);

export default timesheetRouter;
