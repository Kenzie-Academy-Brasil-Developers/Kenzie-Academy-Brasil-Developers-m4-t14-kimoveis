import { Router } from "express";
import {
  createRealEstateControllers,
  retrieveRealEstateControllers,
} from "../../controllers/realEstate.controllers";
import verifyTokenMiddleware from "../../middlewares/verifyToken.middlewares";
import verifyDataMiddleware from "../../middlewares/verifyInputData.middlewares";
import verifyAdminPermission from "../../middlewares/verifyAdmin.middlewares";
import { createRealEstateSchema } from "../../schema/real_estate.schema";
const realEstateRoutes: Router = Router();

realEstateRoutes.post(
  "",
  verifyTokenMiddleware,
  verifyAdminPermission,
  verifyDataMiddleware(createRealEstateSchema),
  createRealEstateControllers
);
realEstateRoutes.get("", retrieveRealEstateControllers);

export default realEstateRoutes;
