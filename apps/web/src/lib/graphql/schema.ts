import { gql } from 'graphql-tag';

// Define GraphQL type definitions (schema)
export const typeDefs = gql`
  # Custom scalar for JSON data
  scalar JSON

  # Base User type
  interface UserInterface {
    id: ID!
    email: String!
    fullName: String
    avatarUrl: String
    createdAt: String
    updatedAt: String
    preferences: JSON
# User types
  type User implements UserInterface {
    id: ID!
    email: String!
    fullName: String
    avatarUrl: String
    userType: String
    role: String
    createdAt: String
    updatedAt: String
    preferences: JSON
# Admin type
  type Admin implements UserInterface {
    id: ID!
    email: String!
    fullName: String
    avatarUrl: String
    createdAt: String
    updatedAt: String
    preferences: JSON

    permissions: [String]
    lastLogin: String
# Customer type
  type Customer implements UserInterface {
    id: ID!
    email: String!
    fullName: String
    avatarUrl: String
    createdAt: String
    updatedAt: String
    preferences: JSON

    bookings: [Booking]

    reviews: [Review]
# Service provider type
  type ServiceProvider implements UserInterface {
    id: ID!
    email: String!
    fullName: String
    avatarUrl: String
    createdAt: String
    updatedAt: String
    preferences: JSON
    provider: Provider

    services: [Service]
type AuthPayload {
    token: String!
    user: User!
input RegisterUserInput {
    email: String!
    password: String!
    fullName: String!
    userType: String
input UpdateProfileInput {
    fullName: String
    avatarUrl: String
    preferences: JSON
# Provider types
  type Provider {
    id: ID!
    userId: ID!
    user: User
    businessName: String!
    description: String
    address: String

    categories: [String]

    businessHours: [BusinessHour]
    contactInfo: JSON
    rating: Float
    createdAt: String
    updatedAt: String
type BusinessHour {
    day: String!
    openTime: String!
    closeTime: String!
input BusinessHourInput {
    day: String!
    openTime: String!
    closeTime: String!
input CreateProviderInput {
    businessName: String!
    description: String
    address: String

    categories: [String]

    businessHours: [BusinessHourInput]
    contactInfo: JSON
input UpdateProviderInput {
    businessName: String
    description: String
    address: String

    categories: [String]

    businessHours: [BusinessHourInput]
    contactInfo: JSON
# Service types
  type Service {
    id: ID!
    providerId: ID!
    provider: Provider
    name: String!
    description: String
    price: Float!
    duration: Int!
    category: String
    imageUrl: String
    isActive: Boolean!
    createdAt: String
    updatedAt: String
input CreateServiceInput {
    name: String!
    description: String
    price: Float!
    duration: Int!
    category: String
    imageUrl: String
    isActive: Boolean
input UpdateServiceInput {
    name: String
    description: String
    price: Float
    duration: Int
    category: String
    imageUrl: String
    isActive: Boolean
# Booking types
  type Booking {
    id: ID!
    customerId: ID!
    customer: User
    providerId: ID!
    provider: Provider
    serviceId: ID!
    service: Service
    startTime: String!
    endTime: String!
    status: String!
    notes: String
    totalAmount: Float!
    paymentStatus: String
    paymentIntent: String
    createdAt: String
    updatedAt: String
input CreateBookingInput {
    providerId: ID!
    serviceId: ID!
    startTime: String!
    endTime: String!
    notes: String
input UpdateBookingInput {
    status: String
    notes: String
    paymentStatus: String
# Review types
  type Review {
    id: ID!
    customerId: ID!
    customer: User
    providerId: ID!
    provider: Provider
    serviceId: ID!
    service: Service
    rating: Int!
    comment: String
    createdAt: String
    updatedAt: String
input CreateReviewInput {
    providerId: ID!
    serviceId: ID!
    rating: Int!
    comment: String
input UpdateReviewInput {
    rating: Int
    comment: String
# Location input type for geo-based provider search
  input LocationInput {
    lat: Float!
    lng: Float!
    radius: Float
# Query type
  type Query {
    # User queries
    me: User
    user(id: ID!): User

    # Provider queries
    provider(id: ID!): Provider
    providers(category: String, location: LocationInput, limit: Int, offset: Int): [Provider!]

    # Service queries
    service(id: ID!): Service
    services(providerId: ID, category: String, limit: Int, offset: Int): [Service!]

    # Booking queries
    booking(id: ID!): Booking
    myBookings(status: String): [Booking!]
    providerBookings(providerId: ID!, status: String): [Booking!]

    # Review queries
    review(id: ID!): Review
    reviewsByProvider(providerId: ID!, limit: Int, offset: Int): [Review!]
# Mutation type
  type Mutation {
    # Auth mutations
    registerUser(input: RegisterUserInput!): AuthPayload!
    login(email: String!, password: String!): AuthPayload!
    updateProfile(input: UpdateProfileInput!): User!

    # Provider mutations
    createProvider(input: CreateProviderInput!): Provider!
    updateProvider(id: ID!, input: UpdateProviderInput!): Provider!

    # Service mutations
    createService(input: CreateServiceInput!): Service!
    updateService(id: ID!, input: UpdateServiceInput!): Service!
    deleteService(id: ID!): Boolean!

    # Booking mutations
    createBooking(input: CreateBookingInput!): Booking!
    updateBooking(id: ID!, input: UpdateBookingInput!): Booking!
    cancelBooking(id: ID!): Boolean!

    # Review mutations
    createReview(input: CreateReviewInput!): Review!
    updateReview(id: ID!, input: UpdateReviewInput!): Review!
    deleteReview(id: ID!): Boolean!
`;

export default typeDefs;
