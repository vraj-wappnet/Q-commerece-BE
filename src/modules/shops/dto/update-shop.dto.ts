import { PartialType } from "@nestjs/swagger";
import { CreateShopDto } from "./create-shop.dto";

export class updateShopDto extends PartialType(CreateShopDto) {}
