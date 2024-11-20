// create an express post route for the goal controller

import { Request, Response } from "express";
import { RecurringInvoice } from "../../../models/recurringInvoice";
import validateRecurringInvoice from "../../../validators/validateRecurringInvoice";
import moment from "moment";
import { calculateNextTime } from "../../../utils/nextTime";


export default async function controllerPost(req: Request, res: Response) {
  const data = req.body;
  const errors = validateRecurringInvoice(data);
  if (errors.length) {
    console.log({ errors })
    res.status(400).json({ errors });
    return;
  }

  const updateNextDate = calculateNextTime(data?.startDate, data?.frequency, data?.frequencyUnit);
  data.nextDate = updateNextDate;
  try {
    const latest: any = RecurringInvoice.find({}).sort({_id: -1}).limit(1);
    if (latest.length > 0 && latest[latest.length-1].orderNumber) {
      data.orderNumber = `ORD-${parseInt(latest[0].estimate.split('-')[1])+1}`;
    } else {
      data.orderNumber = 'ORD-1'
    }
    const recurringInvoice = await RecurringInvoice.create(data);
    let today = moment().format('YYYY-MM-DD');
    res.status(200).json(recurringInvoice);
  } catch (e) {
    return res.status(500).json({ msg: "Server Error: Sale Estimate data couldn't be created" });
  }
}
