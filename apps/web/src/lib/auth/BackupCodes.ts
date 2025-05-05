import { prisma } from '@/lib/prisma';
import { randomBytes, timingSafeEqual } from 'crypto';
import bcrypt from 'bcryptjs';

export class BackupCodeService {
  private static readonly BACKUP_CODE_LENGTH = 8;
  private static readonly NUM_BACKUP_CODES = 10;
  private static readonly SALT_ROUNDS = 10;

  static async generateCodes(userId: string): Promise<string[]> {
    // Generate random backup codes
    const codes = Array.from({ length: this.NUM_BACKUP_CODES }, () =>
      randomBytes(4).toString('hex').slice(0, this.BACKUP_CODE_LENGTH)
// Hash and store the codes
    await prisma.$transaction(
      codes.map(code => 
        prisma.backupCode.create({
          data: {
            userId,
            code: bcrypt.hashSync(code, this.SALT_ROUNDS),
            used: false
)
      )
return codes;
static async verifyCode(userId: string, code: string): Promise<boolean> {
    // Find all unused backup codes for the user
    const backupCodes = await prisma.backupCode.findMany({
      where: {
        userId,
        used: false
// Check each code using timing-safe comparison
    for (const backupCode of backupCodes) {
      if (await bcrypt.compare(code, backupCode.code)) {
        // Mark the code as used
        await prisma.backupCode.update({
          where: { id: backupCode.id },
          data: {
            used: true,
            usedAt: new Date()
return true;
return false;
static async getRemainingCodes(userId: string): Promise<number> {
    return await prisma.backupCode.count({
      where: {
        userId,
        used: false
static async invalidateAllCodes(userId: string): Promise<void> {
    await prisma.backupCode.updateMany({
      where: {
        userId,
        used: false
data: {
        used: true,
        usedAt: new Date()
static async shouldGenerateNewCodes(userId: string): Promise<boolean> {
    const remainingCodes = await this.getRemainingCodes(userId);

    return remainingCodes < this.NUM_BACKUP_CODES / 2;
