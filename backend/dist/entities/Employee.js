var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";
let Employee = class Employee {
    id;
    name;
    normalizedName;
    dni;
    telephone;
    email;
    address;
    active;
};
__decorate([
    PrimaryGeneratedColumn(),
    __metadata("design:type", Number)
], Employee.prototype, "id", void 0);
__decorate([
    Column(),
    __metadata("design:type", String)
], Employee.prototype, "name", void 0);
__decorate([
    Column({ name: "normalized_name" }),
    __metadata("design:type", String)
], Employee.prototype, "normalizedName", void 0);
__decorate([
    Column("bigint", { nullable: true }),
    __metadata("design:type", Object)
], Employee.prototype, "dni", void 0);
__decorate([
    Column("bigint", { nullable: true }),
    __metadata("design:type", Object)
], Employee.prototype, "telephone", void 0);
__decorate([
    Column("varchar", { nullable: true }),
    __metadata("design:type", Object)
], Employee.prototype, "email", void 0);
__decorate([
    Column("varchar", { nullable: true }),
    __metadata("design:type", Object)
], Employee.prototype, "address", void 0);
__decorate([
    Column({ default: true }),
    __metadata("design:type", Boolean)
], Employee.prototype, "active", void 0);
Employee = __decorate([
    Entity()
], Employee);
export { Employee };
