// Import required modules from LangChain ecosystem
import { ChatGoogleGenerativeAI } from "@langchain/google-genai" // Google's Gemini AI model
import { AIMessage, BaseMessage, HumanMessage } from "@langchain/core/messages" // Message types for conversations
import {
  ChatPromptTemplate,      // For creating structured prompts with placeholders
  MessagesPlaceholder,     // Placeholder for dynamic message history
} from "@langchain/core/prompts"
import { StateGraph } from "@langchain/langgraph"              // State-based workflow orchestration
import { Annotation } from "@langchain/langgraph"              // Type annotations for state management
import { ToolNode } from "@langchain/langgraph/prebuilt"       // Pre-built node for executing tools
import { MongoDBSaver } from "@langchain/langgraph-checkpoint-mongodb" // For saving conversation state
import { MongoClient } from "mongodb"                          // MongoDB database client
import "dotenv/config"   

import {createCourseLookupTool,createSaveCustomerTool} from "./tools"
import { retryWithBackoff } from "./utils/retryWithBackoff"

// Main function that creates and runs the AI agent
export async function callAgent(client: MongoClient, query: string, thread_id: string) {
  try {
    // Database configuration
    const dbName = "inventory_database"        // Name of the MongoDB database
    const db = client.db(dbName)              // Get database instance
    const collection = db.collection("courses") // Get the 'courses' collection

    // Define the state structure for the agent workflow
   const GraphState = Annotation.Root({
      messages: Annotation<BaseMessage[]>({
        default: () => [],
        reducer: (prev, next) => [...prev, ...next],
      }),

      // customerInfo: Annotation<{ name?: string; phone?: string; level?: string }>({
      //   reducer: (prev, next) => ({ ...prev, ...next }), 
      // }),

      // saved: Annotation<boolean>({
      //   default: () => false,
      //   reducer: (prev, next) => next ?? prev,
      // }),

      recursionCount: Annotation<number>({
        default: () => 0,
        reducer: (prev, next) => next !== undefined ? next : prev,
      })
      
    })

    // Create a custom tool for searching furniture inventory
    const courseLookupTool = createCourseLookupTool(collection);
    // Create a custom tool for saving customer information
    // const saveCustomerTool = createSaveCustomerTool(db.collection("customers"));

    // Array of all available tools (just one in this case)
     const tools = [courseLookupTool]
        // Create a tool execution node for the workflow
        const toolNode = new ToolNode<typeof GraphState.State>(tools)
    
        // Initialize the AI model (Google's Gemini)
        const model = new ChatGoogleGenerativeAI({
          model: "gemini-1.5-flash",         //  Use Gemini 1.5 Flash model
          temperature: 0,                    // Deterministic responses (no randomness)
          maxRetries: 0,                     // Disable built-in retries (we handle our own)
          apiKey: process.env.GOOGLE_API_KEY, // Google API key from environment
        }).bindTools(tools)                  // Bind our custom tools to the model
    
        // Decision function: determines next step in the workflow
        function shouldContinue(state: typeof GraphState.State) {
          const messages = state.messages                               // Get all messages
          const lastMessage = messages[messages.length - 1] as AIMessage // Get the most recent message
    
          // If the AI wants to use tools, go to tools node; otherwise end
          if (lastMessage.tool_calls?.length) {
            return "tools"  // Route to tool execution
          }
          return "__end__"  // End the workflow
        }
    
        // Function that calls the AI model with retry logic
        async function callModel(state: typeof GraphState.State) {
          return retryWithBackoff(async () => { // Wrap in retry logic
            // Create a structured prompt template
            const prompt = ChatPromptTemplate.fromMessages([
              [
                "system",
                `You are an AI Learning Assistant for an online education platform. 
            Your primary role is to guide, support, and assist students with their learning journey.
    
            IMPORTANT: You have access to a course_lookup tool that searches the course catalog database. 
            - ALWAYS use this tool whenever students ask about available courses, subjects, or training programs — even if the tool returns errors or no results.  
            - If results are found, summarize the key details (title, subject, difficulty, and short description).  
            - If no results or errors occur, acknowledge it and politely offer help in other ways (e.g., recommend general study tips, direct them to support).  
            - If the database appears empty, inform the student that the catalog may be updating and suggest they check back later.
    
            Guidelines:
            - Be polite, supportive, and encouraging.  
            - Keep answers concise but informative.  
            - When asked general learning questions (not course search), respond directly without using the tool.  
    
            Current time: {time}`,
              ],
              new MessagesPlaceholder("messages"),
            ])
    
            // Fill in the prompt template with actual values
            const formattedPrompt = await prompt.formatMessages({
              time: new Date().toISOString(), // Current timestamp
              messages: state.messages,       // All previous messages
            })
    
            // Call the AI model with the formatted prompt
            const result = await model.invoke(formattedPrompt)
            // Return new state with the AI's response added
            return { messages: [result] }
          })
        }
    
        // Build the workflow graph
        const workflow = new StateGraph(GraphState)
          .addNode("agent", callModel)                    // Add AI model node
          .addNode("tools", toolNode)                     // Add tool execution node
          .addEdge("__start__", "agent")                  // Start workflow at agent
          .addConditionalEdges("agent", shouldContinue)   // Agent decides: tools or end
          .addEdge("tools", "agent")                      // After tools, go back to agent
    
        // Initialize conversation state persistence
        const checkpointer = new MongoDBSaver({ client, dbName })
        // Compile the workflow with state saving
        const app = workflow.compile({ checkpointer })
    
        // Execute the workflow
        const finalState = await app.invoke(
          {
            messages: [new HumanMessage(query)], // Start with user's question
          },
          { 
            recursionLimit: 15,                   // Prevent infinite loops
            configurable: { thread_id: thread_id } // Conversation thread identifier
          }
        )
    
        // Extract the final response from the conversation
        const response = finalState.messages[finalState.messages.length - 1].content
        console.log("Agent response:", response)
    
        return response // Return the AI's final response
    
      } catch (error: any) {
        // Handle different types of errors with user-friendly messages
        console.error("Error in callAgent:", error.message)
        
        if (error.status === 429) { // Rate limit error
          throw new Error("Service temporarily unavailable due to rate limits. Please try again in a minute.")
        } else if (error.status === 401) { // Authentication error
          throw new Error("Authentication failed. Please check your API configuration.")
        } else { // Generic error
          throw new Error(`Agent failed: ${error.message}`)
        }
      }
    }