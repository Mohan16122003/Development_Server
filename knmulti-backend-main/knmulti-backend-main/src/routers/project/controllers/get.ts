import { AnyARecord } from "dns";
import { Request, Response } from "express";
import { IProject } from "../../../db/schema/project";
import { Project } from "../../../models/project";

const populateQuery = [
  {
    path: "leads",
    select:'name email assignedTo firstName lastName lead leadType phone'
  },
  {
    path:'members'
  },
  {path:'createdBy',select:'name firstName lastName email'},
  {path:'lands', select:'files chakka_no khata_no land_type mouza plot_no', populate:{path:'owner', select:'name email phone mobile'} },
  {path:'subPlots', populate:[
    {path:'leadsInfo.lead',select:'name email assignedTo firstName lastName lead leadType phone'},
    {path:'leadsInfo.customer'},
    {path:'leadsInfo.lead.assignedTo',select:'name email assignedTo firstName lastName lead leadType phone'},
    {path:'soldBy',select:'name email assignedTo firstName lastName lead leadType phone'},
    {path:'soldTo',select:'name email assignedTo firstName lastName lead leadType phone displayName'},
  ]}

]
export default async function controllerGet(req: Request, res: Response) {
  const id = req.params.id;
  if (id) {
    const project = await Project.findById(id).populate(populateQuery)
    if (project) {
      res.json(project);
    } else {
      res.status(404).send("Not found");
    }
  } else {
    const { userId } = req.query;
    if (!userId) {
      const Projects: IProject[] = await Project.find(req.query)
        .populate("leads")
        .populate("members")
        .populate("createdBy")
        .sort({ updatedAt: -1 });
      res.status(200).send(Projects);
    } else {
      const Projects: IProject[] = await Project.find({
        members: { $in: [userId] },
      })
        .populate("leads")
        .populate("members")
        .populate("createdBy")
        .sort({ updatedAt: -1 });
      res.status(200).send(Projects);
    }
  }
}

export async function controllerGetAllStatus(req: Request, res: Response) {
  try {
    const projects = await Project.find(req.query)
      .populate("leads")
      .populate("subPlots.leadsInfo.lead")
      .populate("subPlots.leadsInfo.customer")
      .populate("subPlots.leadsInfo.lead.assignedTo")
      .populate("subPlots.soldBy")
      .populate("subPlots.soldTo");

    let statusInfoList: any = [];

    let statusData = projects.map((p) => {
      const projectData = {
        pId: p._id,
        pName: p?.name,
        pType: p?.type,
        pSubType: p?.subtype,
      };
      p.subPlots.map((sp) => {
        const subPlot = {
          spName: sp?.name,
          spArea: sp?.area,
          cost: sp?.cost,
          _id: sp?._id,
        };
        sp.leadsInfo.map((l: any) => {
          const leadData = {
            isCustomer: l?.isCustomer,
            leadType: l?.leadType,
            customer: {
              cId: l?.customer?._id,
              name: l?.customer?.displayName,
            },
            lead: {
              lId: l?.lead?._id,
              name: l?.lead?.name,
            },
            projectData,
            subPlot,
          };
          statusInfoList.push(leadData);
        });
      });
    });

    res.status(200).json(statusInfoList);
  } catch (error) {
    res.status(500).json({ msg: "Server Error" });
  }
}
