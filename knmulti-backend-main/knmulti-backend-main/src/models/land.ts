import { model } from "mongoose";
import { ILand, LandSchema } from "../db/schema/land";

export const Land = model<ILand>("LandBank", LandSchema);