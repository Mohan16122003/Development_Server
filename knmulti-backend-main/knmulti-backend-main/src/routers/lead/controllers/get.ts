// create an express get route for lead model

import { Request, Response } from "express";
import { Lead } from "../../../models";
const populateQuery = [{ path: 'createdBy', select: "_id name email firstName lastName" },{ path: 'assignedTo', select: "_id name email firstName lastName" },{ path:'currentAssigned', select: "_id name email firstName lastName" },{path:'project', select: "_id name leadcustomers subPlots type saleStatus "},{path:'status'}];
export default async function controllerGet(req: Request, res: Response) {
  const { id } = req.params;
  const { email, phone } = req.query;
  if (email || phone) {
    if (email) {
      const data = await Lead.find({ email });
      if (data.length) {
        return res.status(200).send({ message: "Lead With this Email Already Exist !", error: true });
      } else {
        if (phone) {
          const data = await Lead.find({ phone });
          if (data.length) {
            return res.status(200).send({ message: "Lead With this Phone No. Already Exist !", error: true });
          } else {
            return res.status(200).send({ error: false })
          }
        }
        return res.status(200).send({ error: false })
      }
    }
  }
  if (id) {
    const lead:any = await Lead.findById(id).populate(populateQuery).lean()
    lead.projects = findSubplots(lead.plots, lead.project)
    if (!lead) {
      return res.status(404).send({ message: "Lead not found" });
    } else {
      return res.status(200).send(lead);
    }
  } else {
    let leads:any = await Lead.find({})
      .populate(populateQuery).sort({ updatedAt: -1 }).lean();
    let data = leads.map((el:any) => {
      return {...el, project:findSubplots(el.plots, el.project)}
    })
    res.status(200).send({data,leads});
  }
}

export const controllerGetLatest = async (req: Request, res: Response) => {
  try {
    let latestLead = await Lead.findOne().sort({ _id: -1 });
    res.status(200).json(latestLead);
  } catch (err) {
    res.status(500).json({ message: "Something went wrong" })
  }

}
export async function controllerGetByEmployee(req: Request, res: Response) {

  const { id } = req.params;
  if (id) {
    // const leads: any = await Lead.find({ currentAssigned: id })
    const leads: any = await Lead.find({ createdBy: id })
      .populate({ path: 'createdBy', select: "_id name email firstName lastName" })
      .populate({ path: 'assignedTo', select: "_id name email firstName lastName" })
      .populate({ path: 'currentAssigned', select: "_id name email firstName lastName" })
      .populate('project')
      .populate('status');
    if (!leads) {
      return res.status(404).send({ message: "Lead not found" });
    } else {

      return res.status(200).send(leads);
    }
  } else {
    return res.status(404).send({ message: "No employee provided" });
  }
}

export const getExistingPhone = async (req: Request, res: Response) => {
  try {
    const { phone } = req.query;
      if (phone) {
        let phoneExists = await Lead.findOne({ phone })
        if (phoneExists) {
          return res.status(200).send({error: true });
        }
      }
      return res.status(200).send({error:false});
  } catch (err) {
    res.status(400).json(err)
  }
}

export const getExistingEmail = async (req: Request, res: Response) => {
  try {
    const { email } = req.query;
    if (email) {
      let emailExists = await Lead.findOne({ email })
      if (emailExists) {
        return res.status(200).send({ message: "Lead With this Email Already Exist !", error: true });
      }
      return res.status(200).send({message:'unique email',error:false});
    }
  } catch (err) {
    res.status(400).json(err)
  }
}

export const findSubplots = (plots: string[], projects: any) => {
  let subplots:any = []
  plots?.forEach((plot: any) => {
    projects.forEach((element:any) => {
    element?.subPlots?.forEach((subPlot: any) => {
      if (plot.toString() == subPlot._id.toString()) {
        subplots.push({...subPlot, parent:element.name,parent_id:element._id, parent_type:element.type})
      }
    })
    })
  })
  const uniqueArr:any = [];
  const seenIds:any = {};
  for(const obj of subplots){
    const id = obj._id;
    if(!seenIds[id]) {
      seenIds[id] = true;
      uniqueArr.push(obj);
    }
  }
  return uniqueArr;
}