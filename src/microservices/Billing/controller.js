import Joi from "joi";
import { APPOINTMENT_TYPES, generateBill } from "./service.js";

console.log(...Object.values(APPOINTMENT_TYPES));
export const generateBillHandler = async (req, res, next) => {
  try {
    const schema = Joi.object({
      appointmentId: Joi.any().required(),
    });
    await schema.validateAsync(req.body);

    // Make Service call
    const response = await generateBill(req.body);
    return res.json(response);
  } catch (error) {
    next(error);
  }
};
