import { Router } from "express";
import {
  controllerDelete,
  controllerGet,
  controllerGetSwitchable,
  controllerGetStatusList,
  controllerPost,
  controllerPut,
} from "./controllers";

const leadStatusRouter = Router();

leadStatusRouter.post("/", controllerPost);
leadStatusRouter.get("/", controllerGet);
leadStatusRouter.get("/switchable", controllerGetSwitchable);
leadStatusRouter.get("/json", controllerGetStatusList);
leadStatusRouter.get("/:id", controllerGet);
leadStatusRouter.put("/:id", controllerPut);
leadStatusRouter.delete('/:id', controllerDelete);

export default leadStatusRouter;
