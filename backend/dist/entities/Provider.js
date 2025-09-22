var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
let Provider = class Provider {
    id;
    name;
    normalizedName;
    cuit;
    telephone;
    email;
    address;
    active;
};
__decorate([
    PrimaryGeneratedColumn(),
    __metadata("design:type", Number)
], Provider.prototype, "id", void 0);
__decorate([
    Column(),
    __metadata("design:type", String)
], Provider.prototype, "name", void 0);
__decorate([
    Column({ name: "normalized_name" }),
    __metadata("design:type", String)
], Provider.prototype, "normalizedName", void 0);
__decorate([
    Column("bigint", { nullable: true }),
    __metadata("design:type", Object)
], Provider.prototype, "cuit", void 0);
__decorate([
    Column("bigint", { nullable: true }),
    __metadata("design:type", Object)
], Provider.prototype, "telephone", void 0);
__decorate([
    Column("varchar", { nullable: true }),
    __metadata("design:type", Object)
], Provider.prototype, "email", void 0);
__decorate([
    Column("varchar", { nullable: true }),
    __metadata("design:type", Object)
], Provider.prototype, "address", void 0);
__decorate([
    Column({ default: true }),
    __metadata("design:type", Boolean)
], Provider.prototype, "active", void 0);
Provider = __decorate([
    Entity()
], Provider);
export { Provider };
