// create an expres put request handle for customer/:id

import { Request, Response } from "express";
import moment from "moment";
import { Customer, Lead } from "../../../models";
import RequestWithUser from "../../../utils/requestWithUser";

export default async function controllerPut(req: Request, res: Response) {
  const { id } = req.params;
  const data = req.body;
  if (!id) {
    return res.status(400).send({ message: "No id provided" });
  }
  const customer = await Customer.findByIdAndUpdate(id, data);
  if (!customer) {
    return res.status(404).send({ message: "Customer not found" });
  }
  return res.status(200).send(customer);
}

export const controllerPutIntrest = async (req: Request, res: Response) => {
  const { id } = req.params;
  let data = req.body;
  if (!id) {
    return res.status(400).send({ message: "No id provided" });
  }
  try {
    let customer: any, lead: any;
    customer = await Customer.findByIdAndUpdate(id, data, { new: true });
    lead = await createLead(customer);
    customer.lead = lead;
    await customer.save();
    return res.status(200).send(customer);
  } catch (err) {
    return res.status(400).send(err);
  }
};

export async function commentPut(req: RequestWithUser, res: Response) {
  const data = req.body;
  const { id } = req.params;
  const date = new Date();
  // const newDate = `${date.getDate()}-${date.getMonth()+1}-${date.getFullYear()}`;
  const newDate = moment().format("YYYY-MM-DD");
  try {
    const comment = {
      employee: req.user.id,
      comment: data.commentToAdd,
      date: newDate,
    };
    const customer = await Customer.findByIdAndUpdate(
      id,
      { $push: { comments: comment } },
      { new: true }
    );
    return res.status(200).json(customer);
  } catch (e) {
    console.log(e);
    return res.status(400).json(e);
  }
}

const createLead = async (customer: any) => {
  try {
    const leadExist = await Lead.findOne({ customer: customer._id });
    if (leadExist) {
      leadExist.project = customer.project;
      leadExist.plots = customer.plots;
      let lead = await leadExist.save();
      return lead;
    } else {
      let leadsCount = Lead.countDocuments();
      const leadData = {
        status: "634fa0b419aae4c1fd3278c7",
        leadType: "customer",
        firstName: customer.firstName,
        lastName: customer.lastName,
        startDate: new Date().toISOString(),
        nextAppointment: null,
        email: customer.email,
        name: customer.firstName + " " + customer.lastName,
        project: customer.project,
        lead: `LD-${+leadsCount + 1}`,
        phone: customer.phone || customer.workPhone,
        address: customer.billingAddress || customer.shippingAddress,
        createdBy: customer.createdBy,
        asignedTo: [customer.currentAssigned],
        currentAssigned: customer.currentAssigned,
        totalCalls: "0",
        pointDiscussed: "",
        plots: customer.plots,
        notes: [],
        comments: [],
        activities: [],
        customer: customer._id,
      };
      let newLead = await Lead.create(leadData);
      return newLead;
    }
  } catch (err) {
    return err;
  }
};
