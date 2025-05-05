import { Router } from 'express';

    import { TwoFactorService } from '../../services/twoFactorService';

    import { authenticateToken } from '../../middleware/auth';

    import { User } from '../../models/User';

const router = Router();
const twoFactorService = TwoFactorService.getInstance();

// Generate 2FA secret and QR code
router.post('/generate', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
if (user.twoFactor.enabled) {
      return res.status(400).json({
        success: false,
        message: '2FA is already enabled for this account'
const { secretKey, qrCodeUrl } = await twoFactorService.generateSecretKey(
      userId,
      user.email
res.json({
      success: true,
      secretKey,
      qrCodeUrl
catch (error) {
    console.error('Error generating 2FA secret:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate 2FA secret'
// Verify 2FA code
router.post('/verify', authenticateToken, async (req, res) => {
  try {
    const { code } = req.body;
    const userId = req.user.id;

    if (!code) {
      return res.status(400).json({
        success: false,
        message: 'Verification code is required'
const isValid = await twoFactorService.verifyCode(userId, code);

    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: 'Invalid verification code'
res.json({
      success: true,
      message: 'Code verified successfully'
catch (error) {
    console.error('Error verifying 2FA code:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify code'
// Generate backup codes

    router.post('/backup-codes', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
const backupCodes = twoFactorService.generateBackupCodes();

    res.json({
      success: true,
      backupCodes
catch (error) {
    console.error('Error generating backup codes:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate backup codes'
// Enable 2FA
router.post('/enable', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
if (user.twoFactor.enabled) {
      return res.status(400).json({
        success: false,
        message: '2FA is already enabled for this account'
await twoFactorService.enable2FA(userId);

    res.json({
      success: true,
      message: '2FA has been enabled successfully'
catch (error) {
    console.error('Error enabling 2FA:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to enable 2FA'
export default router; 