import { Router } from "express";
import {
  controllerDelete,
  controllerGet,
  controllerGetByEmployee,
  controllerPost,
  controllerPut,
  commentPut,
  controllerGetLatest
} from "./controllers";
import { getExistingEmail, getExistingPhone } from "./controllers/get";

const leadRouter = Router();
 
leadRouter.get("/check-email", getExistingEmail);
leadRouter.get("/check-phone", getExistingPhone);
leadRouter.get("/latest", controllerGetLatest);
leadRouter.get("/", controllerGet);
leadRouter.get("/:id", controllerGet);
leadRouter.get("/employee/:id", controllerGetByEmployee);
leadRouter.post("/", controllerPost as any);
leadRouter.put("/:id", controllerPut as any);
leadRouter.delete("/:id", controllerDelete);
leadRouter.put("/comment/:id", commentPut as any);

export default leadRouter;
