import { gql } from 'graphql-tag';

export const typeDefs = gql`
  type User {
    id: ID!
    name: String
    email: String
    image: String
    createdAt: String
    updatedAt: String
  }

  type Product {
    id: ID!
    name: String!
    description: String
    price: Float
    category: String
    image: String
    createdAt: String
    updatedAt: String
  }

  type Query {
    getUser(id: ID!): User
    getUsers: [User]
    getProduct(id: ID!): Product
    getProducts(category: String): [Product]
  }

  type Mutation {
    createUser(name: String!, email: String!): User
    updateUser(id: ID!, name: String, email: String): User
    deleteUser(id: ID!): Boolean
    
    createProduct(name: String!, description: String, price: Float, category: String, image: String): Product
    updateProduct(id: ID!, name: String, description: String, price: Float, category: String, image: String): Product
    deleteProduct(id: ID!): Boolean
  }
`;

export const resolvers = {
  Query: {
    getUser: async (_, { id }, { prisma }) => {
      return prisma.user.findUnique({
        where: { id },
      });
    },
    getUsers: async (_, __, { prisma }) => {
      return prisma.user.findMany();
    },
    getProduct: async (_, { id }, { prisma }) => {
      return prisma.product.findUnique({
        where: { id },
      });
    },
    getProducts: async (_, { category }, { prisma }) => {
      if (category) {
        return prisma.product.findMany({
          where: { category },
        });
      }
      return prisma.product.findMany();
    },
  },
  Mutation: {
    createUser: async (_, { name, email }, { prisma }) => {
      return prisma.user.create({
        data: {
          name,
          email,
        },
      });
    },
    updateUser: async (_, { id, ...data }, { prisma }) => {
      return prisma.user.update({
        where: { id },
        data,
      });
    },
    deleteUser: async (_, { id }, { prisma }) => {
      await prisma.user.delete({
        where: { id },
      });
      return true;
    },
    createProduct: async (_, { name, description, price, category, image }, { prisma }) => {
      return prisma.product.create({
        data: {
          name,
          description,
          price,
          category,
          image,
        },
      });
    },
    updateProduct: async (_, { id, ...data }, { prisma }) => {
      return prisma.product.update({
        where: { id },
        data,
      });
    },
    deleteProduct: async (_, { id }, { prisma }) => {
      await prisma.product.delete({
        where: { id },
      });
      return true;
    },
  },
}; 