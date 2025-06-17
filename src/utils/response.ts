export class ApiResponse {
  static success(data: any, message?: string) {
    return {
      success: true,
      message: message || 'Success',
      data
    };
  }

  static error(message: string, errors?: any) {
    return {
      success: false,
      message,
      errors
    };
  }

  static paginated(data: any[], pagination: any) {
    return {
      success: true,
      data,
      pagination
    };
  }
}
