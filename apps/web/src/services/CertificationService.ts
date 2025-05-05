import { NotificationService } from './notification-service';
import {
  CertificationModel,
  PractitionerCertificationModel,
  Certification,
  PractitionerCertification,
  CertificationProgress,
from '../models/Certification';

export class CertificationService {
  private notificationService: NotificationService;

  constructor(notificationService: NotificationService) {
    this.notificationService = notificationService;
/**
   * Create a new certification program
   */
  async createCertification(certificationData: Partial<Certification>): Promise<Certification> {
    const certification = new CertificationModel(certificationData);
    return await certification.save();
/**
   * Enroll practitioner in certification program
   */
  async enrollPractitioner(
    practitionerId: string,
    certificationId: string,
  ): Promise<PractitionerCertification> {
    const certification = await CertificationModel.findById(certificationId);

    if (!certification) {
      throw new Error('Certification not found');
// Create progress entries for each requirement
    const progress: CertificationProgress[] = certification.requirements.map((req) => ({
      requirementId: req.id,
      status: 'not_started',
));

    const enrollment = new PractitionerCertificationModel({
      practitionerId,
      certificationId,
      status: 'in_progress',
      progress,
return await enrollment.save();
/**
   * Update requirement progress
   */
  async updateProgress(
    practitionerId: string,
    certificationId: string,
    requirementId: string,
    update: Partial<CertificationProgress>,
  ): Promise<PractitionerCertification> {
    const enrollment = await PractitionerCertificationModel.findOne({
      practitionerId,
      certificationId,
if (!enrollment) {
      throw new Error('Certification enrollment not found');
const requirementIndex = enrollment.progress.findIndex(
      (p) => p.requirementId === requirementId,
if (requirementIndex === -1) {
      throw new Error('Requirement not found in progress');
// Update the specific requirement progress

    enrollment.progress[requirementIndex] = {

    ...enrollment.progress[requirementIndex],
      ...update,
// Check if all requirements are completed
    const allCompleted = enrollment.progress.every((p) => p.status === 'completed');

    if (allCompleted && enrollment.status !== 'completed') {
      enrollment.status = 'completed';
      enrollment.issueDate = new Date();

      // Set expiry date if certification has validity period
      const certification = await CertificationModel.findById(certificationId);
      const validityPeriod = certification.requirements.find(
        (r) => r.validityPeriod,
      ).validityPeriod;

      if (validityPeriod) {
        const expiryDate = new Date();
        expiryDate.setMonth(expiryDate.getMonth() + validityPeriod);
        enrollment.expiryDate = expiryDate;
// Generate certificate number
      enrollment.certificateNumber = this.generateCertificateNumber(
        certification.name || '',
        enrollment._id.toString(),
// Notify practitioner
      await this.notificationService.notifyUser(practitionerId, {
        type: 'CERTIFICATION',
        title: 'Certification Completed!',
        message: `Congratulations! You have completed the ${certification.name} certification.`,
return await enrollment.save();
/**
   * Generate a unique certificate number
   */
  private generateCertificateNumber(certificationName: string, enrollmentId: string): string {
    const prefix = certificationName.substring(0, 3).toUpperCase();
    const timestamp = Date.now().toString().substring(8);
    const uniqueId = enrollmentId.substring(0, 6);
    return `${prefix}-${timestamp}-${uniqueId}`;
/**
   * Check certification validity and send expiry notifications
   */
  async checkCertificationValidity(practitionerId: string): Promise<void> {
    const enrollments = await PractitionerCertificationModel.find({
      practitionerId,
      status: 'completed',
      expiryDate: { $exists: true },
const now = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    for (const enrollment of enrollments) {
      if (enrollment.expiryDate) {
        if (enrollment.expiryDate < now) {
          // Certification has expired
          enrollment.status = 'expired';
          await enrollment.save();

          await this.notificationService.notifyUser(practitionerId, {
            type: 'CERTIFICATION',
            title: 'Certification Expired',
            message: `Your certification ${enrollment.certificationId} has expired. Please renew to maintain your credentials.`,
else if (enrollment.expiryDate < thirtyDaysFromNow) {
          // Certification is expiring soon
          await this.notificationService.notifyUser(practitionerId, {
            type: 'CERTIFICATION',
            title: 'Certification Expiring Soon',
            message: `Your certification ${enrollment.certificationId} will expire on ${enrollment.expiryDate.toLocaleDateString()}. Please renew soon.`,
/**
   * Get practitioner's certification summary
   */
  async getPractitionerCertifications(practitionerId: string) {
    const enrollments = await PractitionerCertificationModel.find({ practitionerId }).populate(
      'certificationId',
return enrollments.map((enrollment) => ({
      certification: enrollment.certificationId,
      status: enrollment.status,
      progress: this.calculateProgressPercentage(enrollment.progress),
      issueDate: enrollment.issueDate,
      expiryDate: enrollment.expiryDate,
      certificateNumber: enrollment.certificateNumber,
));
/**
   * Calculate progress percentage
   */
  private calculateProgressPercentage(progress: CertificationProgress[]): number {
    const completed = progress.filter((p) => p.status === 'completed').length;

    return Math.round((completed / progress.length) * 100);
/**
   * Get certification requirements and progress
   */
  async getCertificationDetails(practitionerId: string, certificationId: string) {
    const [certification, enrollment] = await Promise.all([
      CertificationModel.findById(certificationId),
      PractitionerCertificationModel.findOne({
        practitionerId,
        certificationId,
),
    ]);

    if (!certification) {
      throw new Error('Certification not found');
return {
      certification,
      progress: enrollment.progress || [],
      status: enrollment.status || 'not_enrolled',
      issueDate: enrollment.issueDate,
      expiryDate: enrollment.expiryDate,
      certificateNumber: enrollment.certificateNumber,
/**
   * Verify certification validity
   */
  async verifyCertification(certificateNumber: string): Promise<{
    isValid: boolean;
    certificationDetails?: any;
> {
    const enrollment = await PractitionerCertificationModel.findOne({
      certificateNumber,
      status: 'completed',
).populate('certificationId practitionerId');

    if (!enrollment || enrollment.status === 'expired') {
      return { isValid: false };
return {
      isValid: true,
      certificationDetails: {
        certification: enrollment.certificationId,
        issueDate: enrollment.issueDate,
        expiryDate: enrollment.expiryDate,
        status: enrollment.status,
