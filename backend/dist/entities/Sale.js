var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, } from "typeorm";
import { Bartable } from "./Bartable.js";
import { Payment } from "./Payment.js";
import { ProductSold } from "./ProductSold.js";
let Sale = class Sale {
    id;
    dateTime;
    total;
    bartable;
    open;
    discount;
    payment;
    products;
};
__decorate([
    PrimaryGeneratedColumn(),
    __metadata("design:type", Number)
], Sale.prototype, "id", void 0);
__decorate([
    Column(),
    __metadata("design:type", Date)
], Sale.prototype, "dateTime", void 0);
__decorate([
    Column("decimal", { precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], Sale.prototype, "total", void 0);
__decorate([
    ManyToOne(() => Bartable, { nullable: false }),
    __metadata("design:type", Bartable)
], Sale.prototype, "bartable", void 0);
__decorate([
    Column(),
    __metadata("design:type", Boolean)
], Sale.prototype, "open", void 0);
__decorate([
    Column("int", { nullable: true }),
    __metadata("design:type", Object)
], Sale.prototype, "discount", void 0);
__decorate([
    ManyToOne(() => Payment, { nullable: false }),
    __metadata("design:type", Payment)
], Sale.prototype, "payment", void 0);
__decorate([
    OneToMany(() => ProductSold, (productSold) => productSold.sale),
    __metadata("design:type", Array)
], Sale.prototype, "products", void 0);
Sale = __decorate([
    Entity()
], Sale);
export { Sale };
