import { Injectable, BadRequestException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Between, Repository } from "typeorm";
import { Order } from "../orders/entity/order.entity";
import { User } from "../auth/entity/user.entity";
import { Product } from "../products/entity/product.entity";
import { Category } from "../categories/entity/category.entity";
import { SubCategory } from "../categories/entity/sub-category.entity";
import { Shop } from "../shops/entity/shop.entity";
import dayjs from "dayjs";
import { Parser } from 'json2csv';
import { OrderStatus, PaymentStatus, paymentMethod } from "src/common/enum/status.enum";
import * as XLSX from 'xlsx';
import type { Response } from 'express';
import ExcelJS from "exceljs";

@Injectable()
export class ReportService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    @InjectRepository(SubCategory)
    private readonly subCategoryRepository: Repository<SubCategory>,
    @InjectRepository(Shop)
    private readonly shopRepository: Repository<Shop>
  ) {}

  private getDateFilter(type: string) {
    const now = dayjs();

    switch (type) {
      case "daily":
        return [now.startOf("day").toDate(), now.endOf("day").toDate()];
      case "weekly":
        return [now.startOf("week").toDate(), now.endOf("week").toDate()];
      case "monthly":
        return [now.startOf("month").toDate(), now.endOf("month").toDate()];
      case "yearly":
        return [now.startOf("year").toDate(), now.endOf("year").toDate()];
      default:
        return null;
    }
  }

  async generateReport(userId: string, filter: string) {
    const dateRange = this.getDateFilter(filter);
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['role']
    });

    if (!user) {
      throw new Error('User not found');
    }

    const query = this.orderRepository.createQueryBuilder('order')
      .leftJoinAndSelect('order.user', 'user')
      .leftJoinAndSelect('order.items', 'items')
      .leftJoinAndSelect('items.product', 'product')
      .leftJoinAndSelect('product.shop', 'shop')
      .leftJoinAndSelect('shop.seller', 'seller');

    if (user.role.name === 'SELLER') {
      query.innerJoin('items.product', 'productFilter')
        .innerJoin('productFilter.shop', 'shopFilter')
        .innerJoin('shopFilter.seller', 'shopUser')
        .andWhere('shopUser.id = :userId', { userId });
    }

    if (dateRange) {
      query.andWhere('order.createdAt BETWEEN :start AND :end', { 
        start: dateRange[0], 
        end: dateRange[1] 
      });
    }

    const orders = await query.orderBy('order.createdAt', 'DESC').getMany();

    return this.convertToCSV(orders);
  }

  private convertToCSV(data: any[], startIndex = 1) {
    const transformedData: any[] = [];
    
    data.forEach((order, orderIndex) => {
      if (order.items && order.items.length > 0) {
        // Create row for each item in the order
        order.items.forEach((item, itemIndex) => {
          const baseIndex = transformedData.length + startIndex;
          transformedData.push({
            id: baseIndex,
            firstName: order.user?.firstName || '',
            lastName: order.user?.lastName || '',
            productName: item.product?.name || '',
            shopName: item.product?.shop?.shopName || '',
            sellerName: `${item.product?.shop?.seller?.firstName || ''} ${item.product?.shop?.seller?.lastName || ''}`.trim(),
            totalAmount: order.totalAmount,
            status: this.getEnumName(order.status),
            paymentStatus: this.getEnumName(order.paymentStatus),
            paymentMethod: this.getEnumName(order.paymentMethod),
            cancelReason: order.cancelReason || '',
            items: `${item.product?.name || ''} (${item.quantity}x $${item.price})`
          });
        });
      } else {
        // Create single row for order without items
        const baseIndex = transformedData.length + startIndex;
        transformedData.push({
          id: baseIndex,
          firstName: order.user?.firstName || '',
          lastName: order.user?.lastName || '',
          productName: '',
          shopName: '',
          sellerName: '',
          totalAmount: order.totalAmount,
          status: this.getEnumName(order.status),
          paymentStatus: this.getEnumName(order.paymentStatus),
          paymentMethod: this.getEnumName(order.paymentMethod),
          cancelReason: order.cancelReason || '',
          items: ''
        });
      }
    });
    
    const parser = new Parser();
    return parser.parse(transformedData);
  }

  private getEnumName(value: any): string {
    if (!value) return '';
    
    // Convert Order Status enum values to readable names
    if (Object.values(OrderStatus).includes(value)) {
      const orderStatusMap: { [key: number]: string } = {
        [OrderStatus.PENDING]: 'PENDING',
        [OrderStatus.CONFIRMED]: 'CONFIRMED',
        [OrderStatus.PACKED]: 'PACKED',
        [OrderStatus.OUT_FOR_DELIVERY]: 'OUT FOR DELIVERY',
        [OrderStatus.DELIVERED]: 'DELIVERED',
        [OrderStatus.ASSIGNED]: 'ASSIGNED',
        [OrderStatus.CANCELLED]: 'CANCELLED'
      };
      return orderStatusMap[value] || value.toString();
    }
    
    // Convert Payment Status enum values to readable names
    if (Object.values(PaymentStatus).includes(value)) {
      const paymentStatusMap: { [key: number]: string } = {
        [PaymentStatus.PENDING]: 'PENDING',
        [PaymentStatus.PROCESSING]: 'PROCESSING',
        [PaymentStatus.COMPLETED]: 'COMPLETED',
        [PaymentStatus.FAILED]: 'FAILED',
        [PaymentStatus.REFUNDED]: 'REFUNDED'
      };
      return paymentStatusMap[value] || value.toString();
    }
    
    // Convert Payment Method enum values to readable names
    if (Object.values(paymentMethod).includes(value)) {
      const paymentMethodMap: { [key: number]: string } = {
        [paymentMethod.CASH_ON_DELIVERY]: "Cash on Delivery",
        [paymentMethod.ONLINE_PAYMENT]: "Online Payment",
      };
      return paymentMethodMap[value] || value.toString();
    }
    
    return value.toString();
  }

  async getCategories() {
    const categories = await this.categoryRepository.find({
      order: { name: 'ASC' }
    });
    return categories.map(cat => ({
      id: cat.id,
      name: cat.name
    }));
  }

  async getSubcategories(categoryId?: string) {
    if (!categoryId) {
      return [];
    }
    
    const subcategories = await this.subCategoryRepository.find({
      where: { category: { id: categoryId } },
      relations: ['category'],
      order: { name: 'ASC' }
    });
    
    return subcategories.map(sub => ({
      id: sub.id,
      name: sub.name,
      categoryId: sub.category.id,
      categoryName: sub.category.name
    }));
  }

  async bulkUploadExcel(file: Express.Multer.File, user: any) {
    if (!file) {
      throw new BadRequestException("File is required");
    }

    try {
      const workbook = XLSX.read(file.buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      
      if (!sheetName) {
        throw new BadRequestException("Excel file is empty or has no sheets");
      }

      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      
      if (jsonData.length < 2) {
        throw new BadRequestException("Excel file must have at least a header row and one data row");
      }

      const headers = jsonData[0] as string[];
      const rawRows = jsonData.slice(1) as any[];
      
      // Validate required headers
      const requiredHeaders = ['name', 'categoryId'];
      const missingHeaders = requiredHeaders.filter(header => !headers.includes(header));
      
      if (missingHeaders.length > 0) {
        throw new BadRequestException(`Missing required columns: ${missingHeaders.join(', ')}`);
      }

      const createdProducts: Product[] = [];
      const errors: string[] = [];

      // Ignore trailing template rows that are empty (common when dropdown validations are
      // pre-applied down to many rows like 1000 in the sample file).
      const rows = rawRows.filter((row) => {
        if (!Array.isArray(row)) return false;
        return row.some((cell) => {
          if (cell === null || cell === undefined) return false;
          return String(cell).trim() !== "";
        });
      });
      
      // Fetch categories and subcategories
      const categories = await this.categoryRepository.find({
        relations: ["subCategories"],
        order: { name: "ASC" },
      });
      
      if (!categories.length) {
        throw new BadRequestException(
          "No categories found. Please create category and subcategory first.",
        );
      }

      const categoryById = new Map<string, Category>();
      const categoryByName = new Map<string, Category>();
      const subCategoryByComposite = new Map<string, SubCategory>();
      const subCategoryByNameComposite = new Map<string, SubCategory>();
      
      for (const category of categories) {
        categoryById.set(category.id, category);
        categoryByName.set(category.name.trim().toLowerCase(), category);
        for (const subCategory of category.subCategories || []) {
          subCategoryByComposite.set(
            `${category.id}::${subCategory.id}`,
            subCategory,
          );
          subCategoryByNameComposite.set(
            `${category.id}::${subCategory.name.trim().toLowerCase()}`,
            subCategory,
          );
        }
      }

      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const rowNum = i + 2; // Excel row numbers (1-indexed + header row)
        
        try {
          // Create row object with headers
          const rowData: any = {};
          headers.forEach((header, index) => {
            rowData[header] = row[index];
          });

          const resolvedPrice = rowData.price || rowData.sellingPrice || rowData.mrp;
          if (!rowData.name || !resolvedPrice) {
            errors.push(`Row ${rowNum}: Name and one of price/sellingPrice/mrp is required`);
            continue;
          }

          if (isNaN(Number(resolvedPrice))) {
            errors.push(`Row ${rowNum}: Invalid price for ${rowData.name}`);
            continue;
          }

          const categoryId = String(rowData.categoryId || "").trim();
          let category: Category | undefined;
          if (categoryId) {
            category =
              categoryById.get(categoryId) ||
              categoryByName.get(categoryId.toLowerCase());
            if (!category) {
              errors.push(`Row ${rowNum}: Category not found (${categoryId}). Use categoryId or category name from dropdown.`);
              continue;
            }
          } else {
            errors.push(`Row ${rowNum}: categoryId is required`);
            continue;
          }

          const subCategoryId = String(rowData.subCategoryId || "").trim();
          let subCategory: SubCategory | undefined = undefined;
          if (subCategoryId) {
            subCategory =
              subCategoryByComposite.get(`${category.id}::${subCategoryId}`) ||
              subCategoryByNameComposite.get(
                `${category.id}::${subCategoryId.toLowerCase()}`,
              ) ||
              undefined;
            if (!subCategory) {
              errors.push(`Row ${rowNum}: Subcategory not found under ${category.name} (${subCategoryId}). Use subCategoryId or subcategory name from dropdown.`);
              continue;
            }
          }

          let shop: Shop | null = null;
          if (user.role?.name !== "ADMIN") {
            // For sellers, find their shop
            shop = await this.shopRepository.findOne({
              where: { seller: { id: user.id } },
            });

            if (!shop) {
              errors.push(`Row ${rowNum}: No shop found for seller`);
              continue;
            }
          } else if (rowData.shopId) {
            // For admins, use specified shop
            shop = await this.shopRepository.findOne({
              where: { id: rowData.shopId }
            });
            
            if (!shop) {
              errors.push(`Row ${rowNum}: Shop not found`);
              continue;
            }
          }

          const productData: any = {
            name: rowData.name,
            description: rowData.description || null,
            longDescription: rowData.longDescription || null,
            mrp: Number(rowData.mrp || resolvedPrice),
            sellingPrice: Number(rowData.sellingPrice || resolvedPrice),
            discountPercentage: rowData.discountPercentage ? Number(rowData.discountPercentage) : null,
            stockQuantity: Number(rowData.stockQuantity || 0),
            isAvailable: rowData.isAvailable !== undefined ? Boolean(rowData.isAvailable) : true,
            lowStockThreshold: rowData.lowStockThreshold ? Number(rowData.lowStockThreshold) : null,
            unit: rowData.unit || 'pieces',
            unitValue: rowData.unitValue ? Number(rowData.unitValue) : null,
            packSize: rowData.packSize || null,
            brand: rowData.brand || null,
            isVeg: rowData.isVeg !== undefined ? Boolean(rowData.isVeg) : true,
            expiryDays: rowData.expiryDays ? Number(rowData.expiryDays) : null,
            images: rowData.images ? (Array.isArray(rowData.images) ? rowData.images : String(rowData.images).split(',').map((img: string) => img.trim())) : [],
            category: category,
            subCategory: subCategory || undefined,
            shop: shop || undefined
          };

          const product = this.productRepository.create(productData);

          const savedProduct = await this.productRepository.save(product);
          if (Array.isArray(savedProduct)) {
            createdProducts.push(...savedProduct);
          } else {
            createdProducts.push(savedProduct);
          }
        } catch (error: any) {
          errors.push(`Row ${rowNum}: ${error.message}`);
        }
      }
      
      return {
        message: `Successfully processed ${rows.length} rows`,
        totalProcessed: rows.length,
        successCount: createdProducts.length,
        errorCount: errors.length,
        errors: errors,
        products: createdProducts
      };
    } catch (error: any) {
      throw new BadRequestException(`Error processing Excel file: ${error.message}`);
    }
  }

  async generateBulkUploadSampleExcel(res: Response) {
    const categories = await this.getCategories();
    const subCategoriesByCategory = await Promise.all(
      categories.map(async (category) => this.getSubcategories(category.id)),
    );
    const subCategories = subCategoriesByCategory.flat();

    if (!categories.length) {
      throw new BadRequestException(
        "No categories found. Please create category and subcategory first.",
      );
    }

    const workbook = new ExcelJS.Workbook();
    const productsSheet = workbook.addWorksheet("Products");
    const categoriesSheet = workbook.addWorksheet("Categories");
    const subcategoriesSheet = workbook.addWorksheet("Subcategories");

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
    ];

    productsSheet.addRow(headers);

    categoriesSheet.addRow(['categoryName']);
    categories.forEach((category) => {
      categoriesSheet.addRow([category.name]);
    });

    subcategoriesSheet.addRow(['subCategoryName', 'categoryName']);
    subCategories.forEach((subCategory) => {
      subcategoriesSheet.addRow([
        subCategory.name,
        subCategory.categoryName,
      ]);
    });

    const sampleData = [
      [
        'iPhone 14',
        'Apple mobile',
        'Latest iPhone with A16 chip',
        '70000',
        '65000',
        '7.14',
        '50',
        'TRUE',
        '5',
        'pieces',
        '1',
        'box',
        'Apple',
        'TRUE',
        '365',
        'https://example.com/iphone1.jpg,https://example.com/iphone2.jpg',
        categories[0]?.name || '',
        subCategories[0]?.name || '',
      ],
      [
        'T-shirt',
        'Cotton t-shirt',
        'Comfortable cotton t-shirt for daily wear',
        '500',
        '400',
        '20',
        '100',
        'TRUE',
        '20',
        'pieces',
        '1',
        'pack',
        'Cotton',
        'TRUE',
        '730',
        'https://example.com/tshirt.jpg',
        categories[0]?.name || '',
        subCategories[1]?.name || '',
      ]
    ];

    sampleData.forEach((row) => productsSheet.addRow(row));

    headers.forEach((header, index) => {
      productsSheet.getColumn(index + 1).width = Math.max(header.length + 2, 16);
    });

    // Show readable names in dropdowns (from getCategories/getSubcategories data).
    // Upload still supports both ID and Name for these two columns.
    const categoryValidationFormula = `'Categories'!$A$2:$A$${Math.max(categories.length + 1, 2)}`;
    const subCategoryValidationFormula = `'Subcategories'!$A$2:$A$${Math.max(subCategories.length + 1, 2)}`;

    for (let row = 2; row <= 1000; row++) {
      productsSheet.getCell(`Q${row}`).dataValidation = {
        type: 'list',
        allowBlank: false,
        formulae: [categoryValidationFormula],
        showErrorMessage: true,
        errorTitle: 'Invalid Category',
        error: 'Please select a category from the dropdown list.',
      };

      productsSheet.getCell(`R${row}`).dataValidation = {
        type: 'list',
        allowBlank: true,
        formulae: [subCategoryValidationFormula],
        showErrorMessage: true,
        errorTitle: 'Invalid Subcategory',
        error: 'Please select a subcategory from the dropdown list.',
      };
    }

    // Add instructions as comments
    const instructions = [
      'INSTRUCTIONS:',
      '1. Use dropdown menus in columns Q (categoryId) and R (subCategoryId).',
      '2. Refer to "Categories" and "Subcategories" sheets for available options',
      '3. categoryId is REQUIRED (you can select Category Name from dropdown)',
      '4. subCategoryId is OPTIONAL (you can select Subcategory Name from dropdown)',
      '5. Fill all required fields (name, categoryId, and at least one price field)',
    ];

    const instructionsSheet = workbook.addWorksheet('Instructions');
    instructions.forEach((instruction) => {
      instructionsSheet.addRow([instruction]);
    });
    instructionsSheet.getColumn(1).width = 120;
    categoriesSheet.state = 'hidden';
    subcategoriesSheet.state = 'hidden';

    const excelBuffer = Buffer.from(await workbook.xlsx.writeBuffer());

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=sample-products.xlsx');
    
    return res.send(excelBuffer);
  }
}
