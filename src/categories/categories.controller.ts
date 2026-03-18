import { Body, Controller, Delete, Get, Param, Post, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { jwtAuthGuard } from "src/common/guards/jwt-auth.guard";
import { RolesGuard } from "src/common/guards/roles.guard";
import { Roles } from "src/common/decorators/roles.decorator";
import { UserRole } from "src/common/enum/roles.enum";
import { CategoriesService } from "./categories.service";
import { CreateCategoryDto } from "./dto/create-category.dto";
import { CreateSubCategoryDto } from "./dto/create-subcategory.dto";

@ApiTags("categories")
@Controller("categories")
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  // Public: all users can fetch categories/subcategories
  @Get()
  getAll() {
    return this.categoriesService.getAll();
  }

  // Public: all subcategories
  @Get("subcategories")
  getAllSubCategories() {
    return this.categoriesService.getAllSubCategories();
  }

  // Public: subcategories by category
  @Get(":categoryId/subcategories")
  getSubCategoriesByCategory(@Param("categoryId") categoryId: string) {
    return this.categoriesService.getSubCategoriesByCategory(categoryId);
  }

  // Admin: create/delete category
  @ApiBearerAuth()
  @UseGuards(jwtAuthGuard, RolesGuard)
  @Post()
  @Roles(UserRole.ADMIN)
  createCategory(@Body() dto: CreateCategoryDto) {
    return this.categoriesService.createCategory(dto);
  }

  @ApiBearerAuth()
  @UseGuards(jwtAuthGuard, RolesGuard)
  @Delete(":id")
  @Roles(UserRole.ADMIN)
  deleteCategory(@Param("id") id: string) {
    return this.categoriesService.deleteCategory(id);
  }

  // Admin: create/delete subcategory
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
  @Delete("subcategories/:id")
  @Roles(UserRole.ADMIN)
  deleteSubCategory(@Param("id") id: string) {
    return this.categoriesService.deleteSubCategory(id);
  }
}
