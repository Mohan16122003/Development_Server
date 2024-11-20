import { Request, Response } from "express";
import { IProject } from "../../../db/schema/project";
import { Project } from "../../../models";
import { Land } from "../../../models/land";

export default function controllerDelete(req: Request, res: Response): void {
  const id = req.params.id;
  if (id) {

    Project.findByIdAndDelete(id, async (err: Error, project: IProject) => {
      if (err) {
        res.status(500).send(err);
      } else if (project) {
        if(project.lands.length){
          await Land.updateMany({_id:{$in:project.lands}},{project:null})
          }
        res.status(200).send(project);
      } else {
        res.status(404).send("Not found");
      }
    });
  } else {
    res.status(400).send("No id was provided");
  }
}
