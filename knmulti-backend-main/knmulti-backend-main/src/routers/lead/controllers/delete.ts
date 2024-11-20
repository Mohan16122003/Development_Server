// create am express delete route for load model

import { Request, Response } from "express";
import { Lead, Project } from "../../../models";

export default async function controllerDelete(req: Request, res: Response) {
  const { id } = req.params;
  if (id) {
    const lead = await Lead.findByIdAndDelete(id);
    if (!lead) {
      return res.status(404).send({ message: "Load not found" });
    } else {
      for (let projectID of lead?.project) {
        const project = await Project.findById(projectID);
        if (project) {
          project.subPlots = project?.subPlots?.map(subPlot => {
            subPlot.leadsInfo = subPlot?.leadsInfo?.filter(leadInfo =>
              leadInfo.lead && leadInfo?.lead?.toString() !== lead?._id?.toString()
            )
            return subPlot
          });
          await project.save();
        }
      }
      return res.status(200).send(lead);
    }
  } else {
    res.status(400).send({ message: "id is required" });
  }
}
