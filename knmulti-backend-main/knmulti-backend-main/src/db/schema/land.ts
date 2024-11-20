import { Document, Schema } from "mongoose";
interface FilesType{
    file:string;
    name:string
}
export interface ILand extends Document {
owner: Schema.Types.ObjectId;
land_type:string;
land_area:string;
land_cost:string|number;
khata_no:string;
plot_no:string;
chakka_no:string;
files:FilesType;
remark:string;
landmark:string;
mouza:string;
project:Schema.Types.ObjectId|null;
}
const landFilesSchema = new Schema<FilesType>({
    file:{type:String, required:true},
    name:{type:String, required:true},
})
export const LandSchema = new Schema<ILand>({
    owner:{ type: Schema.Types.ObjectId,
      ref: "Vendor",
      required: true},
    land_type:{type:String, required:true},
    land_cost:{type:String, required:true},
    land_area:{type:String,required:true},
    khata_no:{type:String, required:true},
    plot_no:{type:String, required:true},
    chakka_no:{type:String, required:true},
    files:[landFilesSchema],
    landmark:{type:String,required:true},
    mouza:{type:String, required:true},
    remark:{type:String},
    project:{type:Schema.Types.ObjectId, ref:'Project', default:null}
})