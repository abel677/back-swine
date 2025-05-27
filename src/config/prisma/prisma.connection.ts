import { PrismaClient } from "@prisma/client";

export class PrismaConnection {
  static #prisma: PrismaClient;

  static getInstance(): PrismaClient {
    if (!PrismaConnection.#prisma) {
      PrismaConnection.#prisma = new PrismaClient();
    }
    return PrismaConnection.#prisma;
  }

  static async connect() {
    try {
      await PrismaConnection.getInstance().$connect();
      console.log("Database connection");
    } catch (error) {
      console.log("Database connection error");
      throw error;
    }
  }
}
