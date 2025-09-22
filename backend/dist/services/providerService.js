import { providerRepo } from "../repositories/providerRepo.js";
import { Provider } from "../entities/Provider.js";
import { AppError } from "../errors/AppError.js";
import { normalizeText } from "../utils/helpers/normalizeText.js";
import { validateCUI, validateEmailFormat, validateTelephone, } from "../utils/validations/validationPerson.js";
import { validateNumberID } from "../utils/validations/validationHelpers.js";
// SERVICE FOR CREATE A BARTABLE
export const createProvider = async (data) => {
    const { name, cuit, telephone, email, address } = data;
    const normalizedName = normalizeText(name);
    const duplicate = await providerRepo.findOneBy({ normalizedName });
    if (duplicate?.active) {
        throw new AppError("Ya existe un proveedor con este nombre", 409);
    }
    if (cuit !== null) {
        validateCUI(cuit, 11);
        const existingByCuit = await providerRepo.findOneBy({ cuit });
        if (existingByCuit?.active) {
            throw new AppError("Ya existe un proveedor con ese CUIT.", 409);
        }
    }
    if (telephone !== null) {
        validateTelephone(telephone);
    }
    if (email !== null) {
        validateEmailFormat(email);
    }
    if (duplicate && !duplicate.active) {
        duplicate.active = true;
        return await providerRepo.save(duplicate);
    }
    const newProvider = Object.assign(new Provider(), {
        name,
        normalizedName,
        cuit: cuit ?? null,
        telephone: telephone ?? null,
        email: email ?? null, // ya validado y trimmeado antes
        address: address ?? null, // también procesado antes
        active: true,
    });
    return await providerRepo.save(newProvider);
};
// SERVICE FOR UPDATE OR DEACTIVATE A BARTABLE
export const updateProvider = async (updatedData) => {
    const { id, name, cuit, telephone, email, address, active } = updatedData;
    validateNumberID(id);
    const existing = await providerRepo.findOneBy({ id, active: true });
    if (!existing)
        throw new AppError("Proveedor no encontrado", 404);
    const data = {};
    if (name !== undefined) {
        const normalizedName = normalizeText(name);
        const duplicate = await providerRepo.findOneBy({ normalizedName });
        if (duplicate && duplicate.id !== id && duplicate.active) {
            throw new AppError("Ya existe una categoría con este nombre", 409);
        }
        if (duplicate && !duplicate.active) {
            data.active = true;
            await providerRepo.update(duplicate.id, data);
            data.name = existing.name;
            data.normalizedName = existing.normalizedName;
            data.active = false;
        }
        else {
            data.name = name;
            data.normalizedName = normalizedName;
        }
    }
    if (cuit !== undefined) {
        if (cuit !== null) {
            validateCUI(cuit, 11);
            const duplicate = await providerRepo.findOneBy({ cuit });
            if (duplicate && duplicate.id !== id && duplicate.active) {
                throw new AppError("Ya existe un proveedor con este cuit.", 409);
            }
        }
        data.cuit = cuit;
    }
    if (telephone !== undefined) {
        if (telephone !== null) {
            validateTelephone(telephone);
        }
        data.telephone = telephone;
    }
    if (email !== undefined) {
        if (email !== null) {
            validateEmailFormat(email);
        }
        data.email = email;
    }
    if (address !== undefined) {
        data.address = address;
    }
    if (active !== undefined) {
        data.active = active;
    }
    await providerRepo.update(id, data);
    return await providerRepo.findOneBy({ id });
};
// SERVICE FOR GETTING ALL BARTABLES
export const getAllProviders = async () => {
    return await providerRepo.find({
        where: {
            active: true,
        },
    });
};
// SERVICE FOR GETTING A BARTABLE BY ID
export const getProviderById = async (id) => {
    validateNumberID(id);
    const existing = await providerRepo.findOneBy({ id, active: true });
    if (!existing)
        throw new AppError("Proveedor no encontrada", 404);
    return existing;
};
