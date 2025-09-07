import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { MongoDBAtlasVectorSearch } from "@langchain/mongodb";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { Collection } from "mongodb";

// Factory function: nhận collection để tạo tool
export function createCourseLookupTool(collection: Collection) {
  return (tool as any)(
    // Hàm chạy khi tool được gọi
    async ({ query, n = 10 }: { query: string; n?: number }) => {
      try {
        console.log("Item lookup tool called with query:", query);

        // Kiểm tra collection có dữ liệu không
        const totalCount = await collection.countDocuments();
        if (totalCount === 0) {
          return JSON.stringify({
            error: "No items found in inventory",
            message: "The inventory database appears to be empty",
            count: 0,
          });
        }

        // Tạo vector store (dùng Google Gemini embeddings)
        const vectorStore = new MongoDBAtlasVectorSearch(
          new GoogleGenerativeAIEmbeddings({
            apiKey: process.env.GOOGLE_API_KEY!,
            model: "text-embedding-004",
          }),
          {
            collection: collection,
            indexName: "vector_index",   // Index bạn đã tạo trong MongoDB Atlas
            textKey: "embedding_text",
            embeddingKey: "embedding",
          }
        );

        console.log("Performing vector search...");
        const result = await vectorStore.similaritySearchWithScore(query, n);
        console.log(`Vector search returned ${result.length} results`);

        // Nếu không có kết quả thì fallback sang text search
        if (result.length === 0) {
          console.log("No vector results, fallback to text search...");
          const textResults = await collection
            .find({
              $or: [
                { item_name: { $regex: query, $options: "i" } },
                { item_description: { $regex: query, $options: "i" } },
                { categories: { $regex: query, $options: "i" } },
                { embedding_text: { $regex: query, $options: "i" } },
              ],
            })
            .limit(n)
            .toArray();

          return JSON.stringify({
            results: textResults,
            searchType: "text",
            query,
            count: textResults.length,
          });
        }

        // Trả về kết quả vector search
        return JSON.stringify({
          results: result,
          searchType: "vector",
          query,
          count: result.length,
        });
      } catch (error: any) {
        console.error("Error in item lookup:", error);
        return JSON.stringify({
          error: "Failed to search inventory",
          details: error.message,
          query: query,
        });
      }
    },
    // Metadata cho tool
    {
      name: "course_lookup",
      description:
        "Gathers furniture item details from the Inventory database",
      schema: z.object({
        query: z.string().describe("The search query"),
        n: z.number().optional().default(10).describe("Number of results to return"),
      }),
    }
  );
}
