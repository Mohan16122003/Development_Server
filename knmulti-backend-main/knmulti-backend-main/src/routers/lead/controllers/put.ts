// create an express put route for lead model

import { Response } from "express";
import { Customer, Lead } from "../../../models";
import { Employee } from "../../../models/employee";
import RequestWithUser from "../../../utils/requestWithUser";
import moment from "moment";

export default async function controllerPut(
  req: RequestWithUser,
  res: Response
) {
  const { id } = req.params;
  if (!id) {
    return res.status(400).send({ message: "id is required" });
  } else {
    const data = req.body;
    // if (data.status === "Lead Won") {
    //   console.log("Lead Won", req.user.id);
    //   await Employee.findByIdAndUpdate(req.user.id, {
    //     $push: {
    //       activities: {
    //         activityType: "Lead Won",
    //         dateTime: new Date(),
    //         description: `Lead ${data.name} has been won`,
    //         link: `/profile/lead-profile/${data.id}`,
    //       },
    //     },
    //   });
    // } else if (data.status === "Lead Lost") {
    //   await Employee.findByIdAndUpdate(req.user.id, {
    //     $push: {
    //       activities: {
    //         activityType: "Lead Lost",
    //         dateTime: new Date(),
    //         description: `Lead ${data.name} has been lost`,
    //         link: `/profile/lead-profile/${data.id}`,
    //       },
    //     },
    //   });
    // } else if (data.employeeActivity) {
    //   await Employee.findByIdAndUpdate(req.user.id, {
    //     $push: {
    //       activities: data.employeeActivity,
    //     },
    //   });
    // }
    try {
      const leadData: any = await Lead.findById(id);
      if (leadData.currentAssigned !== data.currentAssigned) {
        data.activities = leadData.activities;
        data.activities.push({
          activityType: "Project Assignment",
          description: `Assigned To New Employee`,
          dateTime: new Date(),
          employee: req.user.id,
        });
      }
      await Lead.findByIdAndUpdate(id, data);
      let lead = await Lead.findById(id);
      if (!lead) return res.status(404).send("Lead not found");
      if(lead.customer){
        let updateCustomer:any = await Customer.findById(lead.customer);
        updateCustomer.project = lead.project;
        updateCustomer.plots = lead.plots;
       await updateCustomer.save();
      }
      return res.status(200).send(lead);
    } catch (err) {
      console.log(err);
    }
  }
}

export async function commentPut(req: RequestWithUser, res: Response) {
  const data = req.body;
  const { id } = req.params;
  const date = new Date();
  // const newDate = `${date.getDate()}-${date.getMonth()+1}-${date.getFullYear()}`;
  const newDate = moment().format("YYYY-MM-DD");
  try {
    const comment = {
      employee: req.user._id,
      firstName: req.user.firstName,
      lastName: req.user.lastName,
      comment: data.commentToAdd,
      date: newDate,
    };
    const lead = await Lead.findByIdAndUpdate(
      id,
      { $push: { comments: comment } },
      { new: true }
    );
    return res.status(200).json(lead);
  } catch (e) {
    console.log(e);
    return res.status(400).json(e);
  }
}
