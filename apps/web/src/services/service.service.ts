import { PrismaClient, Service } from '@prisma/client';

import { AppError, handleError } from '@/utils/error';

import { CreateServiceDTO, ServiceWithRelations, UpdateServiceDTO } from '@/types/service.types';

export class ServiceService {
  constructor(private prisma: PrismaClient) {}

  async createService(data: CreateServiceDTO): Promise<ServiceWithRelations> {
    try {
      const { practitionerIds, ...serviceData } = data;
      
      const service = await this.prisma.service.create({
        data: {
          ...serviceData,
          practitioners: practitionerIds ? {
            connect: practitionerIds.map(id => ({ id }))
: undefined
include: {
          business: true,
          practitioners: true,
          customPricing: true
return service;
catch (error) {
      throw handleError(error);
async getServiceById(id: string): Promise<ServiceWithRelations> {
    try {
      const service = await this.prisma.service.findUnique({
        where: { id },
        include: {
          business: true,
          practitioners: true,
          customPricing: true
if (!service) {
        throw new AppError('Service not found', 404);
return service;
catch (error) {
      throw handleError(error);
async updateService(id: string, data: UpdateServiceDTO): Promise<ServiceWithRelations> {
    try {
      const { practitionerIds, ...updateData } = data;
      
      const service = await this.prisma.service.update({
        where: { id },
        data: {
          ...updateData,
          practitioners: practitionerIds ? {
            set: practitionerIds.map(id => ({ id }))
: undefined
include: {
          business: true,
          practitioners: true,
          customPricing: true
return service;
catch (error) {
      throw handleError(error);
async deleteService(id: string): Promise<void> {
    try {
      await this.prisma.service.delete({
        where: { id }
catch (error) {
      throw handleError(error);
async getServicesByBusiness(businessId: string): Promise<ServiceWithRelations[]> {
    try {
      const services = await this.prisma.service.findMany({
        where: { businessId },
        include: {
          business: true,
          practitioners: true,
          customPricing: true
return services;
catch (error) {
      throw handleError(error);
async getServicesByPractitioner(practitionerId: string): Promise<ServiceWithRelations[]> {
    try {
      const services = await this.prisma.service.findMany({
        where: {
          practitioners: {
            some: {
              id: practitionerId
include: {
          business: true,
          practitioners: true,
          customPricing: true
return services;
catch (error) {
      throw handleError(error);
async getActiveServices(businessId: string): Promise<ServiceWithRelations[]> {
    try {
      const services = await this.prisma.service.findMany({
        where: {
          businessId,
          isActive: true
include: {
          business: true,
          practitioners: true,
          customPricing: true
return services;
catch (error) {
      throw handleError(error);
async getServicesByCategory(businessId: string, category: string): Promise<ServiceWithRelations[]> {
    try {
      const services = await this.prisma.service.findMany({
        where: {
          businessId,
          category
include: {
          business: true,
          practitioners: true,
          customPricing: true
return services;
catch (error) {
      throw handleError(error);
