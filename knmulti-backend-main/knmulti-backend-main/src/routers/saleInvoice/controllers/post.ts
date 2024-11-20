// create an express post route for the saleInvoice controller

import { Request, Response } from "express";
import { Customer, SaleEstimate, SaleInvoice } from "../../../models";
import putFile from "../../../utils/s3";
import validateSaleInvoice from "../../../validators/validateSaleInvoice";
import fs from "fs";
import { generateSaleInvoicePDF } from "../../../utils/pdf-generation/generatePDF";
import { CustomerTimeline } from "../../../models/customerTimeline";

export default async function controllerPost(req: Request, res: Response) {
  const data = req.body;
  const errors = validateSaleInvoice(data);
  if (errors.length) {
    return res.status(400).json({ errors });
  }
  if (data.estimate && (await isEstimateExists(data.estimate))) {
    return res.status(400).json({
      errors: [{ message: "Invoice for this estimate already exists" }],
    });
  }
  try {
    const latest: any = await SaleInvoice.find({}).sort({ _id: -1 }).limit(1);
    if (latest.length > 0 && latest[latest.length - 1].invoice) {
      data.invoice = `INV-${parseInt(latest[0].invoice.split("-")[1]) + 1}`;
      data.orderNumber = `ORD-${parseInt(latest[0].invoice.split("-")[1]) + 1}`;
    } else {
      data.invoice = "INV-1";
      data.orderNumber = "ORD-1";
    }

    const saleInvoice: any = await SaleInvoice.create(data);

    await CustomerTimeline.create({
      customer: saleInvoice?.customer,
      timelineType: "Invoice Created",
      description: `Invoice ${saleInvoice?.invoice} Created`,
      // link: "",
    });

    const uploadedInvoice = await SaleInvoice.findById(
      saleInvoice?._id
    ).populate(["customer", "tcsTax"]);
    const pathToFile = await generateSaleInvoicePDF(uploadedInvoice.toJSON());

    const file = await fs.readFileSync(pathToFile);
    await putFile(file, `${uploadedInvoice._id}.pdf`);

    const invoice = await SaleInvoice.findByIdAndUpdate(
      uploadedInvoice._id,
      {
        pdf_url: `https://knmulti.fra1.digitaloceanspaces.com/${uploadedInvoice._id}.pdf`,
      },
      { new: true }
    )
      .populate({
        path: "customer",
        select: "displayName billingAddress email",
      })
      .populate("project");
    fs.rmSync(pathToFile);
    res.status(200).send(invoice);
  } catch (e) {
    res
      .status(500)
      .json({ msg: "Server Error: Sale Estimate data couldn't be created" });
  }
}

const isEstimateExists = async (estimate: string) => {
  const saleEstimate = await SaleEstimate.findById(estimate);
  console.log({ saleEstimate });
  if (!saleEstimate) {
    return false;
  }
  return true;
};
