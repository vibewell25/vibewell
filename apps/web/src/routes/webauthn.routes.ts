import { Router } from 'express';
import { z } from 'zod';

import { WebAuthnService } from '../services/webauthn.service';

import { validateRequest } from '../middleware/validate-request';

import { isAuthenticated } from '../middleware/auth';

import prisma from '../lib/prisma';

const router = Router();
const webAuthnService = new WebAuthnService(prisma);

// Request validation schemas
const finishRegistrationSchema = z.object({
  response: z.object({}).passthrough(), // Allow any WebAuthn registration response
  deviceName: z.string().optional(),
const finishAuthenticationSchema = z.object({
  response: z.object({}).passthrough(), // Allow any WebAuthn authentication response
// Start registration

router.post('/register/start', isAuthenticated, async (req, res, next) => {
  try {
    const options = await webAuthnService.startRegistration(req.user.id);
    res.json(options);
catch (error) {
    next(error);
// Finish registration
router.post(

  '/register/finish',
  isAuthenticated,
  validateRequest(finishRegistrationSchema),
  async (req, res, next) => {
    try {
      const result = await webAuthnService.finishRegistration(
        req.user.id,
        req.body.response,
        req.body.deviceName
res.json(result);
catch (error) {
      next(error);
// Start authentication

router.post('/auth/start', isAuthenticated, async (req, res, next) => {
  try {
    const options = await webAuthnService.startAuthentication(req.user.id);
    res.json(options);
catch (error) {
    next(error);
// Finish authentication
router.post(

  '/auth/finish',
  isAuthenticated,
  validateRequest(finishAuthenticationSchema),
  async (req, res, next) => {
    try {
      const result = await webAuthnService.finishAuthentication(
        req.user.id,
        req.body.response
res.json(result);
catch (error) {
      next(error);
// List devices
router.get('/devices', isAuthenticated, async (req, res, next) => {
  try {
    const devices = await webAuthnService.listDevices(req.user.id);
    res.json(devices);
catch (error) {
    next(error);
// Remove device
router.delete('/devices/:credentialId', isAuthenticated, async (req, res, next) => {
  try {
    const result = await webAuthnService.removeDevice(
      req.user.id,
      req.params.credentialId
res.json(result);
catch (error) {
    next(error);
export default router; 