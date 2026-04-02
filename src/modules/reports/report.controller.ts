import {
  BadRequestException,
  Controller,
  Get,
  Post,
  Query,
  Req,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { ReportService } from "./report.service";
import { jwtAuthGuard } from "src/common/guards/jwt-auth.guard";
import type { Response } from "express";
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { FileInterceptor } from "@nestjs/platform-express";

@ApiTags("Reports")
@Controller("reports")
export class ReportController {
  constructor(
    private reportService: ReportService,
  ) {}

  @UseGuards(jwtAuthGuard)
  @Get()
  @ApiBearerAuth()
  async getReport(
    @Req() req,
    @Query("filter") filter: string,
    @Res() res: Response,
  ) {
    const csv = await this.reportService.generateReport(req.user.id, filter);

    const filename =
      req.user.role === "admin" ? "admin-report.csv" : "seller-report.csv";

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename=${filename}`);

    return res.send(csv);
  }

  @Get("sample-csv")
  @ApiOperation({ summary: 'Download sample CSV', description: 'Download a sample CSV file with all required product fields' })
  @ApiResponse({ status: 200, description: 'Sample CSV downloaded successfully' })
  async downloadSample(@Res() res: Response) {
    const headers = [
      'name',
      'description', 
      'longDescription',
      'mrp',
      'sellingPrice',
      'discountPercentage',
      'stockQuantity',
      'isAvailable',
      'lowStockThreshold',
      'unit',
      'unitValue',
      'packSize',
      'brand',
      'isVeg',
      'expiryDays',
      'images',
      'categoryId',
      'subCategoryId'
    ].join(',');

    const sampleData1 = [
      'iPhone 14',
      'Apple mobile',
      'Latest iPhone with A16 chip',
      '70000',
      '65000',
      '7.14',
      '50',
      'true',
      '5',
      'pieces',
      '1',
      'box',
      'Apple',
      'true',
      '365',
      '"https://example.com/iphone1.jpg,https://example.com/iphone2.jpg"',
      'uuid-category-id',
      'uuid-subcategory-id'
    ].join(',');

    const sampleData2 = [
      'T-shirt',
      'Cotton t-shirt',
      'Comfortable cotton t-shirt for daily wear',
      '500',
      '400',
      '20',
      '100',
      'true',
      '20',
      'pieces',
      '1',
      'pack',
      'Cotton',
      'true',
      '730',
      '"https://example.com/tshirt.jpg"',
      'uuid-category-id',
      'uuid-subcategory-id'
    ].join(',');

    const csv = `${headers}\n${sampleData1}\n${sampleData2}`;

    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=sample-products.csv",
    );

    return res.send(csv);
  }

  @Get("sample-excel")
  @ApiOperation({ summary: 'Download sample Excel with dropdowns', description: 'Download a sample Excel file with dropdown menus for category and subcategory selection' })
  @ApiResponse({ status: 200, description: 'Sample Excel downloaded successfully' })
  async downloadSampleExcel(@Res() res: Response) {
    return this.reportService.generateBulkUploadSampleExcel(res);
  }

  @Post("upload-products-excel")
  @UseGuards(jwtAuthGuard)
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Excel file (.xlsx) to upload products'
        }
      },
      required: ['file']
    }
  })
  @ApiOperation({ summary: 'Upload products via Excel file', description: 'Upload multiple products at once using an Excel file. Only sellers can access this endpoint.' })
  @ApiResponse({ status: 200, description: 'Products uploaded successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - file required or invalid format' })
  @ApiResponse({ status: 401, description: 'Unauthorized - JWT token required' })
  @ApiResponse({ status: 403, description: 'Forbidden - only sellers can upload products' })
  @UseInterceptors(FileInterceptor("file"))
  async uploadProductsExcel(
    @UploadedFile() file: Express.Multer.File,
    @Req() req,
  ) {
    if (!file) {
      throw new BadRequestException("File is required");
    }

    // Check if user is a seller
    if (req.user.role?.name !== 'SELLER') {
      throw new BadRequestException("Only sellers can upload products");
    }

    return this.reportService.bulkUploadExcel(file ,req.user)
  }

  @Get("categories")
  @UseGuards(jwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all categories', description: 'Get list of all categories for dropdown selection' })
  @ApiResponse({ status: 200, description: 'Categories retrieved successfully' })
  async getCategories() {
    return this.reportService.getCategories();
  }

  @Get("subcategories")
  @UseGuards(jwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get subcategories by category', description: 'Get subcategories for a specific category' })
  @ApiResponse({ status: 200, description: 'Subcategories retrieved successfully' })
  async getSubcategories(@Query('categoryId') categoryId: string) {
    return this.reportService.getSubcategories(categoryId);
  }
}
