
import { NextRequest } from "next/server";

import { GET, POST, PUT, DELETE } from "../products/route";

import { prisma } from "@/lib/prisma";

import { getToken } from "next-auth/jwt";


// Mock next-auth

jest.mock("next-auth/jwt", () => ({
  getToken: jest.fn(),
}));

// Mock Prisma

jest.mock("@/lib/prisma", () => ({
  prisma: {
    product: {
      findMany: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

describe("Products API", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });


  describe("GET /api/products", () => {
    it("should return products with pagination", async () => {
      const mockProducts = [
        {
          id: "1",
          name: "Test Product",
          description: "Test Description",
          price: 99.99,
          category: "MAKEUP",
          type: "VIRTUAL_TRY_ON",
        },
      ];

      (prisma.product.findMany as jest.Mock).mockResolvedValue(mockProducts);
      (prisma.product.count as jest.Mock).mockResolvedValue(1);


      const request = new NextRequest(new URL("http://localhost:3000/api/products"));
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.products).toEqual(mockProducts);
      expect(data.pagination).toEqual({
        total: 1,
        pages: 1,
        page: 1,
        limit: 10,
      });
    });
  });


  describe("POST /api/products", () => {
    it("should create a new product", async () => {

      const mockToken = { sub: "user-123" };
      (getToken as jest.Mock).mockResolvedValue(mockToken);

      const mockProduct = {
        name: "New Product",
        description: "New Description",
        price: 149.99,
        category: "SKINCARE",
        type: "SKIN_ANALYSIS",
      };

      (prisma.product.create as jest.Mock).mockResolvedValue({
        id: "2",
        ...mockProduct,
      });


      const request = new NextRequest("http://localhost:3000/api/products", {
        method: "POST",
        body: JSON.stringify(mockProduct),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data).toEqual({
        id: "2",
        ...mockProduct,
      });
    });

    it("should return 401 if not authenticated", async () => {
      (getToken as jest.Mock).mockResolvedValue(null);


      const request = new NextRequest("http://localhost:3000/api/products", {
        method: "POST",
        body: JSON.stringify({}),
      });

      const response = await POST(request);
      expect(response.status).toBe(401);
    });
  });


  describe("PUT /api/products", () => {
    it("should update a product", async () => {

      const mockToken = { sub: "user-123" };
      (getToken as jest.Mock).mockResolvedValue(mockToken);

      const mockProduct = {
        name: "Updated Product",
        price: 199.99,
      };

      (prisma.product.update as jest.Mock).mockResolvedValue({
        id: "1",
        ...mockProduct,
      });

      const request = new NextRequest(

        "http://localhost:3000/api/products?id=1",
        {
          method: "PUT",
          body: JSON.stringify(mockProduct),
        }
      );

      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({
        id: "1",
        ...mockProduct,
      });
    });
  });


  describe("DELETE /api/products", () => {
    it("should delete a product", async () => {

      const mockToken = { sub: "user-123" };
      (getToken as jest.Mock).mockResolvedValue(mockToken);

      (prisma.product.delete as jest.Mock).mockResolvedValue({ id: "1" });

      const request = new NextRequest(

        "http://localhost:3000/api/products?id=1",
        {
          method: "DELETE",
        }
      );

      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({ success: true });
    });
  });
}); 