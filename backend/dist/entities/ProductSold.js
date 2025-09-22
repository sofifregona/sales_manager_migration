var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToOne, JoinColumn, } from "typeorm";
import { Product } from "./Product.js";
import { Sale } from "./Sale.js";
let ProductSold = class ProductSold {
    id;
    product;
    units;
    subtotal;
    sale;
};
__decorate([
    PrimaryGeneratedColumn(),
    __metadata("design:type", Number)
], ProductSold.prototype, "id", void 0);
__decorate([
    ManyToOne(() => Product),
    JoinColumn(),
    __metadata("design:type", Product)
], ProductSold.prototype, "product", void 0);
__decorate([
    Column(),
    __metadata("design:type", Number)
], ProductSold.prototype, "units", void 0);
__decorate([
    Column("decimal", { precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], ProductSold.prototype, "subtotal", void 0);
__decorate([
    ManyToOne(() => Sale),
    __metadata("design:type", Sale)
], ProductSold.prototype, "sale", void 0);
ProductSold = __decorate([
    Entity()
], ProductSold);
export { ProductSold };
