export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public isOperational = true,
  ) {
    super(message);
    this.name = 'AppError';
    Object.setPrototypeOf(this, AppError.prototype);
    Error.captureStackTrace(this, this.constructor);
export const handleError = (error: unknown): AppError => {
  if (error instanceof AppError) {
    return error;
// Handle Prisma errors
  if (error instanceof Error && error.name === 'PrismaClientKnownRequestError') {
    return new AppError('Database operation failed', 500);
// Handle validation errors
  if (error instanceof Error && error.name === 'ValidationError') {
    return new AppError(error.message, 400);
// Default error
  return new AppError('Something went wrong', 500);
