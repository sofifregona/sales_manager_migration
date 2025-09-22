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
import { Category } from "./Category.js";
import { Brand } from "./Brand.js";
import { Provider } from "./Provider.js";
let Product = class Product {
    id;
    code;
    name;
    normalizedName;
    price;
    category;
    provider;
    brand;
    active;
};
__decorate([
    PrimaryGeneratedColumn(),
    __metadata("design:type", Number)
], Product.prototype, "id", void 0);
__decorate([
    Column(),
    __metadata("design:type", Number)
], Product.prototype, "code", void 0);
__decorate([
    Column(),
    __metadata("design:type", String)
], Product.prototype, "name", void 0);
__decorate([
    Column({ name: "normalized_name" }),
    __metadata("design:type", String)
], Product.prototype, "normalizedName", void 0);
__decorate([
    Column("decimal", { precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], Product.prototype, "price", void 0);
__decorate([
    ManyToOne(() => Category, { nullable: true }),
    __metadata("design:type", Object)
], Product.prototype, "category", void 0);
__decorate([
    ManyToOne(() => Provider, { nullable: true }),
    __metadata("design:type", Object)
], Product.prototype, "provider", void 0);
__decorate([
    ManyToOne(() => Brand, { nullable: true }),
    __metadata("design:type", Object)
], Product.prototype, "brand", void 0);
__decorate([
    Column({ default: true }),
    __metadata("design:type", Boolean)
], Product.prototype, "active", void 0);
Product = __decorate([
    Entity()
], Product);
export { Product };
