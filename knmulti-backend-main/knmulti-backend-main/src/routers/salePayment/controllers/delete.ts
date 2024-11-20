// create an express delete controller for the salePayment modle

import { Request, Response } from "express";
import { CustomerTimeline } from "../../../models/customerTimeline";
import { SalePayment } from "../../../models/salePayment";
import { deleteFile } from "../../../utils/s3";
import { Project, SaleInvoice } from "../../../models";

export default async function controllerDelete(req: Request, res: Response) {
  try {
    const { id } = req.params;
    let salePayment: any = await SalePayment.findById(id);
    const receivedAmount: any = +salePayment?.amountReceived || 0;
    let invoice: any = await SaleInvoice.findOne({
      paymentReceived: { $elemMatch: { id } },
    });
    invoice.paidAmount = invoice?.paidAmount - receivedAmount;
    if (invoice.paidAmount > 0) {
      invoice.status = "PARTIAL";
    }
    if (invoice.paidAmount == 0) {
      invoice.status = "OPEN";
    }
    invoice.paymentReceived = invoice.paymentReceived.filter(
      (el: any) => el.id != id
    );
    await invoice.save();

    const updatedInvoice: any = await SaleInvoice.findById(
      invoice?._id
    ).populate("project");
    if (updatedInvoice?.status == "PARTIAL") {
      if (updatedInvoice?.plot) {
        const subPlot = await updatedInvoice?.project.subPlots.find(
          (p: any) => p.name == updatedInvoice?.plot
        );
        subPlot.leadsInfo.forEach((l: any) => {
          if (
            l.customer?.toHexString() == updatedInvoice.customer?.toHexString()
          ) {
            l.leadType = "Registration";
          }
        });

        updatedInvoice.project.subPlots[
          updatedInvoice.project.subPlots.findIndex(
            (p: any) => p.name == updatedInvoice.plot
          )
        ] = subPlot;

        const updateProject = await Project.findByIdAndUpdate(
          updatedInvoice.project?._id,
          { subPlots: updatedInvoice.project.subPlots },
          { new: true }
        );
      }
    }
    if (updatedInvoice?.status == "OPEN") {
      if (updatedInvoice?.plot) {
        const subPlot = await updatedInvoice?.project.subPlots.find(
          (p: any) => p.name == updatedInvoice?.plot
        );
        subPlot.leadsInfo.forEach((l: any) => {
          if (
            l.customer?.toHexString() == updatedInvoice.customer?.toHexString()
          ) {
            l.leadType = "Won";
          }
        });

        updatedInvoice.project.subPlots[
          updatedInvoice.project.subPlots.findIndex(
            (p: any) => p.name == updatedInvoice.plot
          )
        ] = subPlot;

        await Project.findByIdAndUpdate(
          updatedInvoice.project?._id,
          { subPlots: updatedInvoice.project.subPlots },
          { new: true }
        );
      }
    }
    await SalePayment.findByIdAndDelete(id);
    res.status(200).send("file deleted successfully");
  } catch (e) {
    console.log(e);
  }
}
