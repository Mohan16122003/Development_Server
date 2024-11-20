// create an express delete route for the saleEstimate model

import { Request, Response } from "express";
import { SaleEstimate, SaleInvoice } from "../../../models";
import { CustomerTimeline } from "../../../models/customerTimeline";
import { deleteFile } from "../../../utils/s3";

export default async function controllerDelete(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const saleInvoice = await SaleInvoice.findByIdAndDelete(id);
    const estimate: any = await SaleEstimate.findOne({ invoiceId: id });
    estimate.status = "OPEN";
    estimate.isInvoiced = false;
    estimate.invoiceId = undefined;
    await estimate.save();
    await CustomerTimeline.create({
      customer: saleInvoice?.customer,
      timelineType: "Invoice Deleted",
      description: `Invoice ${saleInvoice?.invoice} Deleted`,
      // link: "",
    });
    if (!saleInvoice) {
      return res.status(404).json({ message: "SaleEstimate not found" });
    }
    await deleteFile(`${id}.pdf`);
    return res.status(200).json(saleInvoice);
  } catch (e) {
    console.log(e);
  }
}
