import { Schema } from "mongoose"

export const dfrSchema = new Schema<IDFReport>({
    assigned_by: { type: Number, ref: "Employee", required: true },
    assigned_to: { type: Number, ref: "Employee", required: true },
    date: { type: String, required: true, default: new Date().toISOString() },
    leadInfo: [{ name: String, contactNo: String, callNo: String, releventPoint: String, nextAppoinment: String }]
})
interface leadInfo {
    name: string,
    contactNo: string,
    callNo: string,
    releventPoint: string,
    nextAppoinment: string,
}

export interface IDFReport {
    assigned_by: number | string,
    assigned_to: number | string,
    date: string,
    leadInfo: leadInfo[]
}