import mongoose from "mongoose";
import { Land } from "../../../models/land"
import { VendorBill } from "../../../models/VendorBill";

const getAllLands = async (req: any, res: any) => {
    const mouza = req.query.mouza;
    if (mouza) {
        try {
            let land: any = await Land.aggregate([
                {
                    $match: {mouza}
                },
                {
                    $lookup: {
                        from: 'vendors',
                        localField: 'owner',
                        foreignField: '_id',
                        as: 'owner'
                    }
                },
                {
                    $lookup: {
                        from: 'projects',
                        localField: 'project',
                        foreignField: '_id',
                        as: 'projects',
                    }
                },
                {
                    $project: {
                        projects: { $arrayElemAt: ['$projects', 0] },
                        owner: { $arrayElemAt: ['$owner', 0] },
                        _id: 1,
                        land_type: 1,
                        land_area: 1,
                        plot_no: 1,
                        landmark: 1,
                        files: 1,
                        land_cost: 1,
                        mouza: 1,
                    }
                },
                {
                    $project: {
                        'projects.name': 1,
                        'owner.name': 1,
                        'owner._id': 1,
                        'projects._id': 1,
                        _id: 1,
                        land_type: 1,
                        land_area: 1,
                        plot_no: 1,
                        landmark: 1,
                        files: 1,
                        land_cost: 1,
                        mouza: 1,
                    }
                }
            ]).option({ lean: true });
            if (land.length) {
                let data = await Promise.all(land.map(async (el: any) => {
                    return { ...el, owner: { ...el.owner, total_land_area: calcArea(el.owner._id, land), ...await calcAmount(el.owner._id) } }
                }))
                res.status(200).json(data)
            } else {
                res.status(200).json({ message: "No Data Found !" })
            }
        } catch (err) {
            console.log(err)
            res.status(400).json({ message: "Error while getting Lands !", err })
        }
    } else {
        try {
            let land: any = await Land.aggregate([
                {
                    $match: req.query.owner ? { owner: new mongoose.Types.ObjectId(req.query.owner) } : {}
                },
                {
                    $lookup: {
                        from: 'vendors',
                        localField: 'owner',
                        foreignField: '_id',
                        as: 'owner'
                    }
                },
                {
                    $lookup: {
                        from: 'projects',
                        localField: 'project',
                        foreignField: '_id',
                        as: 'projects',
                    }
                },
                {
                    $project: {
                        projects: { $arrayElemAt: ['$projects', 0] },
                        owner: { $arrayElemAt: ['$owner', 0] },
                        _id: 1,
                        land_type: 1,
                        land_area: 1,
                        plot_no: 1,
                        landmark: 1,
                        files: 1,
                        land_cost: 1,
                        mouza: 1,
                    }
                },
                {
                    $project: {
                        'projects.name': 1,
                        'owner.name': 1,
                        'owner._id': 1,
                        'projects._id': 1,
                        _id: 1,
                        land_type: 1,
                        land_area: 1,
                        plot_no: 1,
                        landmark: 1,
                        files: 1,
                        land_cost: 1,
                        mouza: 1,
                    }
                }
            ]).option({ lean: true });
            if (land.length) {
                let data = await Promise.all(land.map(async (el: any) => {
                    return { ...el, owner: { ...el.owner, total_land_area: calcArea(el.owner._id, land), ...await calcAmount(el.owner._id) } }
                }))
                res.status(200).json(data)
            } else {
                res.status(200).json({ message: "No Data Found !" })
            }
        } catch (err) {
            console.log(err)
            res.status(400).json({ message: "Error while getting Lands !", err })
        }
    }
}
export default getAllLands
export const getSingleLand = async (req: any, res: any) => {
    const { id } = req.params;
    try {
        let land: any = await Land.findById(id)
        if (land.length) {
            res.status(200).json(land);
        } else {
            res.status(400).json("cannot find the Land")
        }
    } catch (err) {
        res.status(400).json("Error While Getting Data", err)
    }
}

export const getActiveLands = async (req: any, res: any) => {
    try {
        let bills: any = await VendorBill.find({ status: 'PAID' }).select('landId');
        bills = bills.map((bill: any) => bill.landId);
        let data = await Land.find({ _id: { $in: bills } });
        res.status(200).json(data);
    } catch (err) {
        res.status(400).json(err)
    }
}

const calcArea = (id: string, arr: any) => {
    let filterArr = arr.filter((el: any) => el.owner._id.toString() == id.toString()).reduce((acc: any, cmp: any) => {
        acc += +cmp.land_area;
        return acc;
    }, 0)
    return filterArr
}

const calcTotalCost = (id: string, arr: any) => {
    return arr.filter((el: any) => el.owner._id.toString() == id.toString()).reduce((acc: any, cmp: any) => {
        acc += +cmp.land_cost
        return acc;
    }, 0)
}

const calcAmount = async (_id: string) => {
    let data = await VendorBill.find({ vendorId: _id }).select('balanceDue discountAmount total subTotal');

    return data.reduce((acc: any, cmp: any) => {
        acc.balance_due += +cmp.balanceDue;
        acc.net_land_cost += +cmp.total;
        acc.discount += +cmp.discountAmount;
        acc.total_land_cost += +cmp.subTotal;
        return acc;
    }, { balance_due: 0, net_land_cost: 0, discount: 0, total_land_cost: 0 })
}