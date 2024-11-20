import { Land } from "../../../models/land";

const updateLand = async (req: any, res: any) => {
    let { id } = req.params;
    try {
        await Land.findByIdAndUpdate(id, req.body)
        let data:any = await Land.findById(id);
        res.status(200).json(data);
    } catch (err) {
        console.log(err)
        res.status(400).json({ message: "Error while updating !", err })
    }
}
export default updateLand

export const addLandToOwner = async (req: any, res: any) => {
    try {
        let { id } = req.params;
        let data: any = await Land.findByIdAndUpdate({ _id: id, }, { $push: { landDetails: req.body } }, { new: true });
        res.status(200).json(data)
    } catch (err) {
        res.status(400).json({ message: "Error while adding land !" })
    }
}

export const addCommentToOwner = async (req: any, res: any) => {
    const { id } = req.params;
    try {
        let data = await Land.findByIdAndUpdate({ _id: id }, { $push: { comments: req.body } }, { new: true });
        res.status(200).json(data);
    } catch (err) {
        console.log(err)
        res.status(400).json({ message: "Error while adding comment", err })
    }
}

export const removeLandToOwner = async (req: any, res: any) => {
    try {
        let { id } = req.params;
        let data: any = await Land.findByIdAndUpdate({ _id: id, }, { $pull: { landDetails: { _id: req.body._id } } });
        res.status(200).json(data)
    } catch (err) {
        res.status(400).json({ message: "Error while adding land !" })
    }
}

export const removeCommentToOwner = async (req: any, res: any) => {
    const { id } = req.params;
    try {
        await Land.updateOne({ _id: id }, { $pull: { comments: { _id: req.body._id } } });
        res.status(200).json({ message: "Comment Deleted Successfully ." });
    } catch (err) {
        console.log(err)
        res.status(400).json({ message: "Error while adding comment", err })
    }
}

export const addDocsToLand = async (req: any, res: any) => {
    const { id } = req.params
    const {files}  = req.body;
    try {
        let data: any = await Land.findById(id);
            if(data){
               data.files.push(...files) 
               await data.save()
            }

        let landData = await Land.findById(id);
        res.status(200).json(landData);
    } catch (err) {
        console.log("error =>", err);
        res.status(400).json({ message: "Error while adding Files", err })
    }
}