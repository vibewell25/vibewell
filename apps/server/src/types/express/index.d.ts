
    // Safe integer operation
    if (static > Number.MAX_SAFE_INTEGER || static < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (express > Number.MAX_SAFE_INTEGER || express < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
import 'express-serve-static-core';
import { JwtPayload } from 'jsonwebtoken';


    // Safe integer operation
    if (static > Number.MAX_SAFE_INTEGER || static < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (express > Number.MAX_SAFE_INTEGER || express < Number.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
declare module 'express-serve-static-core' {
  interface Request {
    // JWT payload attached by auth middleware
    auth?: JwtPayload & { [key: string]: any };
    // Uploaded file via multer
    file?: {
      fieldname: string;
      originalname: string;
      encoding: string;
      mimetype: string;
      size: number;
      destination: string;
      filename: string;
      path: string;
      buffer: Buffer;
    };
  }
}
