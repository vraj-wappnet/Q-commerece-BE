export const MESSAGES = {
  ORDER: {
    CREATED: "Order created successfully",
    FETCHED: "Orders fetched successfully",
    UPDATED: "Order updated successfully",
    CANCELLED: "Order cancelled successfully",
  },

  CART: {
    FETCHED: "Cart fetched successfully",
    UPDATED: "Cart updated successfully",
    LIST_FETCHED: "Carts fetched successfully",
  },

  CATEGORY: {
    CREATED: "Category created successfully",
    UPDATED: "Category updated successfully",
    DELETED: "Category deleted successfully",
    LIST_FETCHED: "Categories fetched successfully",
    SUBCATEGORY_CREATED: "SubCategory created successfully",
    SUBCATEGORY_UPDATED: "SubCategory updated successfully",
    SUBCATEGORY_DELETED: "SubCategory deleted successfully",
    SUBCATEGORY_LIST_FETCHED: "SubCategories fetched successfully",
  },

  DELIVERY_PROFILE: {
    CREATED: "Delivery profile created successfully",
    FETCHED: "Delivery profile fetched successfully",
    LIST_FETCHED: "Delivery profiles fetched successfully",
    UPDATED: "Delivery profile updated successfully",
  },

  AUTH: {
    LOGIN: "Login successful",
    REGISTER: "User registered successfully",
    INVALID: "Invalid credentials",
  },

  PAYMENT: {
    SUCCESS: "Payment successful",
    FAILED: "Payment failed",
  },

  DELIVERY: {
    ASSIGNED: "Delivery assigned successfully",
    ACCEPTED: "Delivery accepted",
    REJECTED: "Delivery rejected",
  },

  COMMON: {
    SUCCESS: "Success",
    ERROR: "Something went wrong",
    NOT_FOUND: "Resource not found",
    BAD_REQUEST: "Bad request",
    UNAUTHORIZED: "Unauthorized",
    FORBIDDEN: "Forbidden",
    CONFLICT: "Conflict",
    VALIDATION_FAILED: "Validation failed",
    INTERNAL_SERVER_ERROR: "Internal server error",
    GET_SUCCESS: "Data fetched successfully",
    POST_SUCCESS: "Created successfully",
    PUT_SUCCESS: "Updated successfully",
    PATCH_SUCCESS: "Updated successfully",
    DELETE_SUCCESS: "Deleted successfully",
  },
};

export const getDefaultSuccessMessage = (method?: string): string => {
  switch ((method || "").toUpperCase()) {
    case "GET":
      return MESSAGES.COMMON.GET_SUCCESS;
    case "POST":
      return MESSAGES.COMMON.POST_SUCCESS;
    case "PUT":
      return MESSAGES.COMMON.PUT_SUCCESS;
    case "PATCH":
      return MESSAGES.COMMON.PATCH_SUCCESS;
    case "DELETE":
      return MESSAGES.COMMON.DELETE_SUCCESS;
    default:
      return MESSAGES.COMMON.SUCCESS;
  }
};

export const getDefaultErrorMessage = (statusCode: number): string => {
  switch (statusCode) {
    case 400:
      return MESSAGES.COMMON.BAD_REQUEST;
    case 401:
      return MESSAGES.COMMON.UNAUTHORIZED;
    case 403:
      return MESSAGES.COMMON.FORBIDDEN;
    case 404:
      return MESSAGES.COMMON.NOT_FOUND;
    case 409:
      return MESSAGES.COMMON.CONFLICT;
    case 422:
      return MESSAGES.COMMON.VALIDATION_FAILED;
    default:
      return MESSAGES.COMMON.INTERNAL_SERVER_ERROR;
  }
};
