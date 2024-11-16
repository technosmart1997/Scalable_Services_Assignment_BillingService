import { dbPool } from "../../db/pg/index.js";

export const APPOINTMENT_TYPES = Object.freeze({
  REGULAR: "regular",
  EMERGENCY: "emergency",
});

export const APPOINTMENT_GST = 18;

export const calculateFee = (fee) => {
  if (!fee || Number(fee) === 0) {
    return {
      basic: 0,
      gst: 0,
      total: 0,
    };
  }
  if (Number(fee) > 0) {
    const gst = Math.round(fee * (APPOINTMENT_GST / 100));
    const total = Math.round(fee + gst);
    return {
      basic: +fee,
      gst,
      total,
    };
  }
};

export const generateBill = async (data) => {
  // Validate User in database
  const { appointmentId } = data;

  try {
    const [appointment] =
      await dbPool`SELECT * from appointment WHERE appointment_id = ${appointmentId}`;
    if (!appointment) {
      return {
        status: false,
        code: 404,
        message: "Appointment not found!",
      };
    }

    const { fee, policyNumber, provider, patientId } = appointment;
    const calculateFees = calculateFee(fee);

    // If policyNumber not provided
    if (policyNumber) {
      // In case of emergeny 50% extra will be charged on top of base fees
      // Direct bill the patient based on the doctor fees and appointment type
      // Get doctor fees

      const [policy] =
        await dbPool`SELECT * from insurance WHERE "policyNumber" = ${policyNumber} AND active = true`;

      if (!policy) {
        return {
          status: false,
          code: 404,
          message: "Policy not found!",
        };
      }

      const insuranceClaim = {
        amount: calculateFees.total,
        appointmentId,
        policyNumber,
        provider,
        patientId,
        claimedDate: Date.now().toString(),
      };

      await dbPool`INSERT INTO ${dbPool(insuranceClaim)} RETURNING *`;

      return {
        status: true,
        code: 200,
        message: "Bill generated!",
        data: calculateFees,
      };
    }

    // if policy number is available in the appointement
    // Validate policy number

    return {
      status: true,
      code: 200,
      message: "Bill generated!",
      data: calculateFees,
    };
  } catch (error) {
    console.log(error);
    throw new Error("Error in generating bill", error?.message);
  }
};
