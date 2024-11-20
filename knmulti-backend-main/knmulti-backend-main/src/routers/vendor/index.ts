import { Router } from "express";
import {
  controllerDelete,
  controllerGet,
  controllerPost,
  controllerPut,
  controllerComment,
  deleteComment,
} from "./controllers";

const vendorRouter = Router();

vendorRouter.get("/", controllerGet);
vendorRouter.get("/:id", controllerGet);
vendorRouter.post("/", controllerPost);
vendorRouter.delete("/:id", controllerDelete);
vendorRouter.put("/:id", controllerPut);
vendorRouter.put("/add-comment/:id", controllerComment);
vendorRouter.put("/remove-comment/:id", deleteComment);

export default vendorRouter;
