import { brandRepo } from "../repositories/brandRepo.js";
import { Brand } from "../entities/Brand.js";
import { AppError } from "../errors/AppError.js";
import { validateNumberID } from "../utils/validations/validationHelpers.js";
import { normalizeText } from "../utils/helpers/normalizeText.js";
// SERVICE FOR CREATE A BARTABLE
export const createBrand = async (data) => {
    const { name } = data;
    const normalizedName = normalizeText(name);
    // Validations for repeting brands
    const duplicate = await brandRepo.findOneBy({ normalizedName });
    // If it exists and is active, then throw an error
    if (duplicate?.active) {
        throw new AppError("Ya existe una marca con este nombre", 409);
    }
    // If it exists but is not active, then activate the existing one
    if (duplicate && !duplicate.active) {
        duplicate.active = true;
        return await brandRepo.save(duplicate);
    }
    // If it doesn't exist, create a new one
    const newBrand = new Brand();
    newBrand.name = name;
    newBrand.normalizedName = normalizedName;
    newBrand.active = true;
    return await brandRepo.save(newBrand);
};
// SERVICE FOR UPDATE OR DEACTIVATE A BARTABLE
export const updateBrand = async (updatedData) => {
    const { id, name, active } = updatedData;
    validateNumberID(id);
    const existing = await brandRepo.findOneBy({ id, active: true });
    if (!existing)
        throw new AppError("Marca no encontrada", 404);
    const data = {};
    if (name !== undefined) {
        const normalizedName = normalizeText(name);
        // Validations for repeting brands
        const duplicate = await brandRepo.findOneBy({ normalizedName });
        if (duplicate && duplicate.id !== id && duplicate.active) {
            throw new AppError("Ya existe una marca con este nombre", 409);
        }
        if (duplicate && !duplicate.active) {
            data.active = true;
            await brandRepo.update(duplicate.id, data);
            await brandRepo.update(existing.id, { active: false });
            return await brandRepo.findOneBy({ id: duplicate.id });
        }
        else {
            data.name = name;
            data.normalizedName = normalizedName;
        }
    }
    if (active !== undefined) {
        data.active = active;
    }
    await brandRepo.update(id, data);
    return await brandRepo.findOneBy({ id });
};
// SERVICE FOR GETTING ALL BARTABLES
export const getAllBrands = async () => {
    return await brandRepo.find({
        where: {
            active: true,
        },
    });
};
// SERVICE FOR GETTING A BARTABLE BY ID
export const getBrandById = async (id) => {
    validateNumberID(id);
    const existing = await brandRepo.findOneBy({ id, active: true });
    if (!existing)
        throw new AppError("Marca no encontrada", 404);
    return existing;
};
