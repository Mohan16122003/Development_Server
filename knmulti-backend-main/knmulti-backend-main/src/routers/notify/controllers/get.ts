import { Request, Response } from "express";
import { Notify } from "../../../models/notify";

export default async function controllerGet(req: Request, res: Response) {
  try {

    //  const reqQuery = { ...req.query };
    //  let queryStr = JSON.stringify(reqQuery);
    //  queryStr = queryStr.replace(/\b(in)\b/g, match => `$${match}`);
    // JSON.parse(queryStr)

    const filter = {
      ...req.query
    };

    const user = (req as any)?.user;
    const userAuthority = user?.jobRole?.authorities?.concat(user?.userAuthorites);
    // console.log(user,userAuthority);
    if (!userAuthority.includes("ADMIN")) {
      filter['userAuthority'] = { $in: userAuthority };
    }
    const notifyData = await Notify.find(filter).sort({ _id: -1 });
    res.status(200).json(notifyData);

  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
}