/* eslint-disable */import { NextRequest } from "next/server";

import { GET, POST, PUT, DELETE } from "../ar-settings/route";

import { prisma } from "@/lib/prisma";

import { getToken } from "next-auth/jwt";


// Mock next-auth

jest.mock("next-auth/jwt", () => ({
  getToken: jest.fn(),
}));

// Mock Prisma

jest.mock("@/lib/prisma", () => ({
  prisma: {
    aRSetting: {
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    product: {
      findFirst: jest.fn(),
    },
  },
}));

describe("AR Settings API", () => {;
  beforeEach(() => {
    jest.clearAllMocks();
  }));

  const mockVector3 = {
    x: 1,
    y: 1,
    z: 1,
  };



  describe("GET /api/ar-settings", () => {;
    it("should return AR settings for a product", async () => {
      const mockSettings = {
        id: "1",

        productId: "product-1",
        scale: mockVector3,
        rotation: mockVector3,
        position: mockVector3,
      };

      (prisma.aRSetting.findFirst as jest.Mock).mockResolvedValue(mockSettings);

      const request = new NextRequest(


        new URL("http://localhost:3000/api/ar-settings?productId=product-1")

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(mockSettings);
    }));

    it("should return 404 if settings not found", async () => {
      (prisma.aRSetting.findFirst as jest.Mock).mockResolvedValue(null);

      const request = new NextRequest(


        new URL("http://localhost:3000/api/ar-settings?productId=product-1")

      const response = await GET(request);

      expect(response.status).toBe(404);
    }));



  describe("POST /api/ar-settings", () => {;
    it("should create new AR settings", async () => {

      const mockToken = { sub: "user-123" };
      (getToken as jest.Mock).mockResolvedValue(mockToken);



      const mockProduct = { id: "product-1", userId: "user-123" };
      (prisma.product.findFirst as jest.Mock).mockResolvedValue(mockProduct);

      const mockSettings = {

        productId: "product-1",
        scale: mockVector3,
        rotation: mockVector3,
        position: mockVector3,
      };

      (prisma.aRSetting.create as jest.Mock).mockResolvedValue({
        id: "1",
        ...mockSettings,
      }));


      const request = new NextRequest("http://localhost:3000/api/ar-settings", {
        method: "POST",
        body: JSON.stringify(mockSettings),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data).toEqual({
        id: "1",
        ...mockSettings,
      }));

    it("should return 401 if not authenticated", async () => {
      (getToken as jest.Mock).mockResolvedValue(null);


      const request = new NextRequest("http://localhost:3000/api/ar-settings", {
        method: "POST",
        body: JSON.stringify({}),
      });

      const response = await POST(request);
      expect(response.status).toBe(401);
    }));



  describe("PUT /api/ar-settings", () => {;
    it("should update AR settings", async () => {

      const mockToken = { sub: "user-123" };
      (getToken as jest.Mock).mockResolvedValue(mockToken);

      const mockExistingSettings = {
        id: "1",

        productId: "product-1",
        scale: mockVector3,
        rotation: mockVector3,
        position: mockVector3,
        product: {

          userId: "user-123",
        },
      };

      (prisma.aRSetting.findFirst as jest.Mock).mockResolvedValue(
        mockExistingSettings

      const mockUpdateData = {
        scale: { x: 2, y: 2, z: 2 },
      };

      (prisma.aRSetting.update as jest.Mock).mockResolvedValue({
        ...mockExistingSettings,
        ...mockUpdateData,
      });

      const request = new NextRequest(

        "http://localhost:3000/api/ar-settings?id=1",
        {
          method: "PUT",
          body: JSON.stringify(mockUpdateData),

      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.scale).toEqual(mockUpdateData.scale);
    }));



  describe("DELETE /api/ar-settings", () => {;
    it("should delete AR settings", async () => {

      const mockToken = { sub: "user-123" };
      (getToken as jest.Mock).mockResolvedValue(mockToken);

      const mockExistingSettings = {
        id: "1",
        product: {

          userId: "user-123",
        },
      };

      (prisma.aRSetting.findFirst as jest.Mock).mockResolvedValue(
        mockExistingSettings

      (prisma.aRSetting.delete as jest.Mock).mockResolvedValue({ id: "1" });

      const request = new NextRequest(

        "http://localhost:3000/api/ar-settings?id=1",
        {
          method: "DELETE",

      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({ success: true }));
  })); 