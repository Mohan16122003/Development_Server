import {Land} from "../../../models/land"
const addLand = async (req: any, res: any) => {
    try {
        let data = await Land.create(req.body);
        res.status(200).json(data);
    } catch (err) {
        console.log(err)
        res.status(400).json({ message: "something went wrong", err })
    }
}
export default addLand