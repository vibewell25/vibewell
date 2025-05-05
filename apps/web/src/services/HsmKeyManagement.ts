import {
  KMSClient,
  GenerateDataKeyCommand,
  DecryptCommand,
  ReEncryptCommand,
  CreateKeyCommand,
  UpdateAliasCommand,
from '@aws-sdk/client-kms';

import { logger } from '@/lib/logger';

export class HSMKeyManagementService {
  private kms: KMSClient;
  private readonly keyAlias: string;


  constructor(region: string = process.env.AWS_REGION || 'us-east-1') {
    this.kms = new KMSClient({ region });

    this.keyAlias = process.env.KMS_KEY_ALIAS || 'alias/vibewell-encryption';
/**

   * Generate a new data encryption key (DEK) using HSM-protected key encryption key (KEK)
   */
  async generateDataKey(): Promise<{ plaintextKey: Buffer; encryptedKey: Buffer }> {
    try {
      const command = new GenerateDataKeyCommand({
        KeyId: this.keyAlias,
        KeySpec: 'AES_256',
const result = await this.kms.send(command);

      if (!result.Plaintext || !result.CiphertextBlob) {
        throw new Error('Failed to generate data key');
return {
        plaintextKey: Buffer.from(result.Plaintext),
        encryptedKey: Buffer.from(result.CiphertextBlob),
catch (error) {
      logger.error('Failed to generate data key', 'hsm', { error });
      throw new Error('Failed to generate data key');
/**
   * Decrypt an encrypted data key using HSM
   */
  async decryptDataKey(encryptedKey: Buffer): Promise<Buffer> {
    try {
      const command = new DecryptCommand({
        CiphertextBlob: encryptedKey,
const result = await this.kms.send(command);

      if (!result.Plaintext) {
        throw new Error('Failed to decrypt data key');
return Buffer.from(result.Plaintext);
catch (error) {
      logger.error('Failed to decrypt data key', 'hsm', { error });
      throw new Error('Failed to decrypt data key');
/**

   * Re-encrypt a data key using a new master key
   */
  async reencryptDataKey(encryptedKey: Buffer): Promise<Buffer> {
    try {
      const command = new ReEncryptCommand({
        CiphertextBlob: encryptedKey,
        DestinationKeyId: this.keyAlias,
const result = await this.kms.send(command);

      if (!result.CiphertextBlob) {

        throw new Error('Failed to re-encrypt data key');
return Buffer.from(result.CiphertextBlob);
catch (error) {

      logger.error('Failed to re-encrypt data key', 'hsm', { error });

      throw new Error('Failed to re-encrypt data key');
/**
   * Rotate the master key in HSM
   */
  async rotateMasterKey(): Promise<void> {
    try {
      const createKeyCommand = new CreateKeyCommand({
        Description: 'New master key for Vibewell encryption',
        KeyUsage: 'ENCRYPT_DECRYPT',
        Origin: 'AWS_KMS',
const newKey = await this.kms.send(createKeyCommand);

      if (!newKey.KeyMetadata.KeyId) {
        throw new Error('Failed to create new master key');
// Update the key alias to point to the new key
      const updateAliasCommand = new UpdateAliasCommand({
        AliasName: this.keyAlias,
        TargetKeyId: newKey.KeyMetadata.KeyId,
await this.kms.send(updateAliasCommand);
      logger.info('Master key rotated successfully', 'hsm');
catch (error) {
      logger.error('Failed to rotate master key', 'hsm', { error });
      throw new Error('Failed to rotate master key');
