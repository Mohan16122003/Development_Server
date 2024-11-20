import { model } from "mongoose";
import { dfrSchema, IDFReport } from "../db/schema/dailyfilledreport";

export const DFReport = model<IDFReport>("DFReport", dfrSchema);
