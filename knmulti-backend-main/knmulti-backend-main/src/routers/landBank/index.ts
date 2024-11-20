import { Router } from "express";
import getAllLands,{getSingleLand,getActiveLands} from "./controllers/get";
import addLand from "./controllers/post";
import updateLand,{addLandToOwner,addCommentToOwner,removeLandToOwner,removeCommentToOwner,addDocsToLand} from "./controllers/put";
import deleteLand from './controllers/delete'
const landBankRouter = Router();

landBankRouter.get(`/`, getAllLands);
landBankRouter.get(`/active`, getActiveLands);
landBankRouter.get(`/:id`, getSingleLand);
landBankRouter.post(`/`, addLand);
landBankRouter.delete(`/:id`, deleteLand);
landBankRouter.put(`/:id`, updateLand);
landBankRouter.put(`/remove/:id`, removeLandToOwner);
landBankRouter.put(`/add-docs/:id`, addDocsToLand);
landBankRouter.put(`/comments/add/:id`, addCommentToOwner);
landBankRouter.put(`/comments/remove/:id`, removeCommentToOwner);

export default landBankRouter