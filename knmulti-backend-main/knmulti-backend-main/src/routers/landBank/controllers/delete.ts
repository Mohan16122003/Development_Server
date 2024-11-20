import { Land } from "../../../models/land"

const deleteLand = async(req:any,res:any)=>{
    let {id} = req.params;
try{
    await Land.findByIdAndDelete(id);
    res.status(200).json({message:'Land Deleted Successfully'})

}catch(err){
    res.status(400).json({message:'Something Went Wrong while Deleting'})
}
}
export default deleteLand