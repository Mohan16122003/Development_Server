import { Request, Response } from "express";
import { Timesheet } from "../../../models/timesheet";

export default async function controllerGet(req: any, res: Response) {
  const { id } = req.params;
  let idArr: string[] = req.query?.empIdArr as string[];
  // for Payload services 
  if (idArr?.length) {
    let arr = idArr.map((el: string) => parseInt(el));
    let data = await Timesheet.find({ employee: { $in: arr } }).lean();
    if (data) {
      let timesheet = data.map(el => {
        return { ...el, productionTime: getProductionTime(el), totalTime: getTotalworkingTime(el) }
      })
      res.status(200).json(timesheet);
    } else {
      res.status(200).json({ message: "No data found" });
    }
  } else if (id) {
    const data = await Timesheet.find({ employee: id }).lean();
    if (data) {
      let timesheet = data.map(el => {
        return { ...el, productionTime: getProductionTime(el), totalTime: getTotalworkingTime(el) }
      })
      res.status(200).json(timesheet);
    } else {
      res.status(404).json({ message: "timesheet not found" });
    }
  } else {
    const { page = 1, limit = 500, date = null } = req.query;
    const data = await Timesheet.find({})
      .limit(parseInt(limit as string))
      .skip(parseInt(limit as string) * (parseInt(page as string) - 1)).lean();
    if (data) {
      let timesheet = data.map(el => {
        return { ...el, productionTime: getProductionTime(el), totalTime: getTotalworkingTime(el) }
      })
      res.status(200).json(timesheet);
    } else {
      res.status(200).json({ message: "No data found" });
    }
  }
}

export const controllerGetDaily = async (req: Request, res: Response) => {
  let { id } = req.params;
  let { day }: any = req.query;
  if (id) {
    try {
      let today = new Date(day.split("T")[0]);
      let data = await Timesheet.find({ employee: id, date: { $gte: today, $lt: new Date(today.getTime() + 86400000) } }).lean();
      let timesheet = data?.map(el => {
        return { ...el, productionTime: getProductionTime(el), totalTime: getTotalworkingTime(el) }
      })
      res.status(200).json(timesheet);
    } catch (err) {
      res.status(400).json({ message: "Error While Fetching User's timesheet", err })
    }
  } else {
    let today = new Date(day.split("T")[0]);
    try {
      let data = await Timesheet.find({ date: { $gte: today } }).lean()
      let timesheet = data?.map(el => {
        return { ...el, productionTime: getProductionTime(el), totalTime: getTotalworkingTime(el) }
      })
      res.status(200).json(timesheet);
    } catch (err) {
      res.status(400).json({ message: "Error while Getting Timesheet", err })
    }
  }
}
export const controllerGetRange = async (req: Request, res: Response) => {
  const { id } = req.params
  const { range }: any = req.query;
  const { from, to } = JSON.parse(range)
  if (id) {

    try {
      let frmDate = new Date(from)
      let toDate = new Date(to)
      let data = await Timesheet.find({ employee: id, date: { $gte: frmDate, $lte: new Date(toDate) } }).lean();
      let timesheet = data?.map(el => {
        return { ...el, productionTime: getProductionTime(el), totalTime: getTotalworkingTime(el) }
      })
      res.status(200).json(timesheet);
      return
    } catch (err) {
      res.status(400).json("error")
      return
    }
  } else {
    try {
      let frmDate = new Date(from)
      let toDate = new Date(to)
      let data = await Timesheet.find({ date: { $gte: frmDate, $lte: new Date(toDate) } }).lean();
      let timesheet = data?.map(el => {
        return { ...el, productionTime: getProductionTime(el), totalTime: getTotalworkingTime(el) }
      })
      res.status(200).json(timesheet);
      return
    } catch (err) {
      res.status(400).json("error")
      return
    }
  }
}
const getProductionTime = (data: any) => {
  return data.sessions
    ?.map((el: any) => {
      let upto = el.upto;
      const from = el.from;
      if (!upto) {
        upto = el.from;
      }
      const dt1 = new Date(from);
      const dt2 = new Date(upto);
      const diffInMillisec = dt2.getTime() - dt1.getTime() || 0;
      return diffInMillisec;
    })
    .reduce(
      (acc: any, current: any) => {
        acc += current;
        return acc;
      },
      0
    );
};

const getTotalworkingTime = (data: any) => {
  const startTime = new Date(data.sessions[0].from);
  const start = startTime.getTime();
  const endTime = data?.sessions[data?.sessions.length - 1].upto
    ? new Date(data.sessions[data.sessions?.length - 1].upto)
    : new Date(data.sessions[data.sessions?.length - 1].from);
  const end = endTime.getTime();
  const diff = end - start;
  return diff
};
