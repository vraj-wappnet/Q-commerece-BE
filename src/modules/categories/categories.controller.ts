import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { jwtAuthGuard } from "src/common/guards/jwt-auth.guard";
import { RolesGuard } from "src/common/guards/roles.guard";
import { Roles } from "src/common/decorators/roles.decorator";
import { UserRole } from "src/common/enum/roles.enum";
import { CategoriesService } from "./categories.service";
import { CreateCategoryDto } from "./dto/create-category.dto";
import { CreateSubCategoryDto } from "./dto/create-subcategory.dto";
import { UpdateCategoryDto } from "./dto/update-category.dto";
import { UpdateSubCategoryDto } from "./dto/update-subcategory.dto";

@ApiTags("categories")
@Controller("categories")
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  getAll() {
    return this.categoriesService.getAll();
  }

  @Get("subcategories")
  getAllSubCategories() {
    return this.categoriesService.getAllSubCategories();
  }

  @Get(":categoryId/subcategories")
  getSubCategoriesByCategory(@Param("categoryId") categoryId: string) {
    return this.categoriesService.getSubCategoriesByCategory(categoryId);
  }

  @ApiBearerAuth()
  @UseGuards(jwtAuthGuard, RolesGuard)
  @Post()
  @Roles(UserRole.ADMIN)
  createCategory(@Body() dto: CreateCategoryDto) {
    return this.categoriesService.createCategory(dto);
  }

  @ApiBearerAuth()
  @UseGuards(jwtAuthGuard, RolesGuard)
  @Patch(":id")
  @Roles(UserRole.ADMIN)
  updateCategory(@Param("id") id: string, @Body() dto: UpdateCategoryDto) {
    return this.categoriesService.updateCategory(id, dto);
  }

  @ApiBearerAuth()
  @UseGuards(jwtAuthGuard, RolesGuard)
  @Delete(":id")
  @Roles(UserRole.ADMIN)
  deleteCategory(@Param("id") id: string) {
    return this.categoriesService.deleteCategory(id);
  }

  @ApiBearerAuth()
  @UseGuards(jwtAuthGuard, RolesGuard)
  @Post(":categoryId/subcategories")
  @Roles(UserRole.ADMIN)
  createSubCategory(
    @Param("categoryId") categoryId: string,
    @Body() dto: CreateSubCategoryDto,
  ) {
    return this.categoriesService.createSubCategory(categoryId, dto);
  }

  @ApiBearerAuth()
  @UseGuards(jwtAuthGuard, RolesGuard)
  @Patch("subcategories/:id")
  @Roles(UserRole.ADMIN)
  updateSubCategory(@Param("id") id: string, @Body() dto: UpdateSubCategoryDto) {
    return this.categoriesService.updateSubCategory(id, dto);
  }

  @ApiBearerAuth()
  @UseGuards(jwtAuthGuard, RolesGuard)
  @Delete("subcategories/:id")
  @Roles(UserRole.ADMIN)
  deleteSubCategory(@Param("id") id: string) {
    return this.categoriesService.deleteSubCategory(id);
  }
}
