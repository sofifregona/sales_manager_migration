import { paymentRepo } from "../repositories/paymentRepo.js";
import { Payment } from "../entities/Payment.js";
import { AppError } from "../errors/AppError.js";
import { validateNumberID } from "../utils/validations/validationHelpers.js";
import { normalizeText } from "../utils/helpers/normalizeText.js";
// SERVICE FOR CREATE A BARTABLE
export const createPayment = async (data) => {
    const { name } = data;
    const normalizedName = normalizeText(name);
    // Validations for repeting brands
    const duplicate = await paymentRepo.findOneBy({ normalizedName });
    // If it exists and is active, then throw an error
    if (duplicate?.active) {
        throw new AppError("Ya existe una categoría con este nombre", 409);
    }
    // If it exists but is not active, then activate the existing one
    if (duplicate && !duplicate.active) {
        duplicate.active = true;
        return await paymentRepo.save(duplicate);
    }
    // If it doesn't exist, create a new one
    const newPayment = new Payment();
    newPayment.name = name;
    newPayment.normalizedName = normalizedName;
    newPayment.active = true;
    return await paymentRepo.save(newPayment);
};
// SERVICE FOR UPDATE OR DEACTIVATE A BARTABLE
export const updatePayment = async (updatedData) => {
    const { id, name, active } = updatedData;
    validateNumberID(id);
    const existing = await paymentRepo.findOneBy({ id, active: true });
    if (!existing)
        throw new AppError("Categoría no encontrada", 404);
    const data = {};
    if (name !== undefined) {
        const normalizedName = normalizeText(name);
        // Validations for repeting brands
        const duplicate = await paymentRepo.findOneBy({ normalizedName });
        if (duplicate && duplicate.id !== id && duplicate.active) {
            throw new AppError("Ya existe un método de pago con este nombre", 409);
        }
        if (duplicate && !duplicate.active) {
            data.active = true;
            await paymentRepo.update(duplicate.id, data);
            await paymentRepo.update(existing.id, { active: false });
            return await paymentRepo.findOneBy({ id: duplicate.id });
        }
        else {
            data.name = name;
            data.normalizedName = normalizedName;
        }
    }
    if (active !== undefined) {
        data.active = active;
    }
    await paymentRepo.update(id, data);
    return await paymentRepo.findOneBy({ id });
};
// SERVICE FOR GETTING ALL BARTABLES
export const getAllPayments = async () => {
    return await paymentRepo.find({
        where: {
            active: true,
        },
    });
};
// SERVICE FOR GETTING A BARTABLE BY ID
export const getPaymentById = async (id) => {
    validateNumberID(id);
    const existing = await paymentRepo.findOneBy({ id, active: true });
    if (!existing)
        throw new AppError("Categoría no encontrada", 404);
    return existing;
};
