import { Router } from "express";
import {
    createDFR,
    getDFRs,
    updateDFR,
    deleteDFR,
    getDFRsAll
} from "./controllers";
const dfrRouter = Router();

dfrRouter.get("/", getDFRsAll);
dfrRouter.get("/:id", getDFRs);
dfrRouter.delete("/:id", deleteDFR);
dfrRouter.post("/", createDFR);
dfrRouter.put("/:id", updateDFR);

export default dfrRouter;