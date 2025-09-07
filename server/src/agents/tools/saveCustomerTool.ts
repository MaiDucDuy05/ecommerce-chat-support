import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { Collection } from "mongodb";

// Factory function: nhận collection (ví dụ: customers)
export function createSaveCustomerTool(collection: Collection) {
  return (tool as any)(
    // Hàm chạy khi tool được gọi
    async ({
      name,
      level,
      phone,
      courseInterest,
      note,
    }: {
      name: string;
      level: string;
      phone: string;
      courseInterest?: string;
      note?: string;
    }) => {
      try {
        console.log("SaveCustomerTool called with:", {
          name,
          level,
          phone,
          courseInterest,
          note,
        });

        // Insert vào MongoDB
        const result = await collection.insertOne({
          name,
          level,
          phone,
          courseInterest,
          note,
          createdAt: new Date(),
        });

        return JSON.stringify({
          success: true,
          message: "Customer information saved successfully",
          customerId: result.insertedId,
        });
      } catch (error: any) {
        console.error("Error saving customer:", error);
        return JSON.stringify({
          success: false,
          error: error.message,
        });
      }
    },
    // Metadata cho tool
    {
      name: "save_customer",
      description:
        "Save customer information into the database for follow-up by sales team",
      schema: z.object({
        name: z.string().describe("Full name of the customer"),
        level: z.string().describe("Customer's target course level or IELTS band score"),
        phone: z.string().describe("Customer's phone number"),
        courseInterest: z
          .string()
          .optional()
          .describe("The course the customer is interested in"),
        note: z
          .string()
          .optional()
          .describe("Additional notes about the customer"),
      }),
    }
  );
}
