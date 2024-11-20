import { Schema } from "mongoose";
import { USER_AUTHORITIES } from "../../constants";

interface INotify {
  notifyHead: string;
  notifyBody: string;
  notifyDate: Date;
  unseenNotify: Boolean;
  userAuthority: Array<USER_AUTHORITIES> | ['ADMIN'];
  createdBy: number;
}

const notifySchema = new Schema<INotify>(
  {
    notifyHead: { type: String, required: true },
    notifyBody: { type: String, required: true },
    notifyDate: {
      type: Date,
      default: new Date(),
    },
    unseenNotify: { type: Boolean, default: true },
    userAuthority: {
      type: [{
        type: String,
        enum: Object.values(USER_AUTHORITIES)
      }],
      default: ['ADMIN'],
      required: true
    },
    createdBy: { type: Number, ref: "Employee", required: true },
  },
  {
    timestamps: true,
  }
);

export { notifySchema, INotify };
