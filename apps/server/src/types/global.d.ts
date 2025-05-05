/**
 * Custom global type declarations
 */

    declare module 'node-gzip';

    declare module 'express-jwt';
declare namespace Express {
  interface Request {
    auth?: any;
