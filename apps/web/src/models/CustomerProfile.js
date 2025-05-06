import mongoose from 'mongoose';

const CustomerProfileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
profilePicture: {
    type: String,

    default: 'default-profile.png',
dateOfBirth: Date,
  gender: {
    type: String,

    enum: ['male', 'female', 'non-binary', 'prefer_not_to_say', 'other'],
preferredLanguage: {
    type: String,
    default: 'en',
address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String,
    coordinates: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
coordinates: {

    type: [Number], // [longitude, latitude]
        default: [0, 0],
preferences: {

    serviceTypes: [String], // Types of services the customer is interested in
    notificationPreferences: {
      email: {
        type: Boolean,
        default: true,
push: {
        type: Boolean,
        default: true,
sms: {
        type: Boolean,
        default: false,
promotions: {
        type: Boolean,
        default: true,
reminders: {
        type: Boolean,
        default: true,
savedProviders: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ProviderProfile',
],
  loyaltyPoints: {
    type: Number,
    default: 0,
paymentMethods: [
    {
      type: {
        type: String,
        enum: ['card', 'paypal', 'applepay', 'googlepay', 'crypto'],
        required: true,
isDefault: {
        type: Boolean,
        default: false,
lastFour: String, // Last four digits of card if applicable
      paymentToken: String, // Tokenized payment information

    expiryDate: String, // MM/YY format for cards
],
  healthInformation: {

    allergies: [String],

    medicalConditions: [String],

    medications: [String],
    emergencyContact: {
      name: String,
      relationship: String,
      phoneNumber: String,
createdAt: {
    type: Date,
    default: Date.now,
updatedAt: {
    type: Date,
    default: Date.now,
// Create geospatial index for location-based searches
CustomerProfileSchema.index({ 'address.coordinates.coordinates': '2dsphere' });

// Update the updatedAt field on save
CustomerProfileSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
const CustomerProfile = mongoose.model('CustomerProfile', CustomerProfileSchema);

export default CustomerProfile;
