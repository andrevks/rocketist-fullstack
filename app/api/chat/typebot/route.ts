import { NextRequest, NextResponse } from "next/server";
import { addCorsHeaders, createCorsPreflightResponse } from "@/lib/cors";

interface TypebotRequest {
  message: string;
  // userId removed - not used in current single-user implementation
  // If multi-user support is needed later, add userId field and filter tasks by it
}

interface TypebotResponse {
  reply: string;
  createdTaskId?: string;
  tasks?: Array<{
    id: string;
    title: string;
    status: string;
    needs_enrichment: boolean;
    short_description?: string | null;
  }>;
}

// Handle CORS preflight requests
export async function OPTIONS(request: NextRequest) {
  return createCorsPreflightResponse();
}

// POST /api/chat/typebot
// Forward to n8n workflow for LLM intent parsing (with RAG)
// n8n handles all LLM processing and returns the formatted response
export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    
    let body: any;
    try {
      body = JSON.parse(rawBody);
    } catch (e) {
      console.error("Failed to parse request body as JSON:", e);
      const response = NextResponse.json(
        { reply: "Invalid request format. Expected JSON." },
        { status: 400 }
      );
      return addCorsHeaders(response);
    }
    
    // Try multiple ways to extract the message
    // Typebot might send it as: message, text, input, userMessage, or nested
    let message: string | undefined = undefined;
    
    // Try direct fields first
    if (body.message && typeof body.message === "string") {
      message = body.message;
    } else if (body.text && typeof body.text === "string") {
      message = body.text;
    } else if (body.input && typeof body.input === "string") {
      message = body.input;
    } else if (body.userMessage && typeof body.userMessage === "string") {
      message = body.userMessage;
    } else if (body.data?.message && typeof body.data.message === "string") {
      message = body.data.message;
    } else if (body.payload?.message && typeof body.payload.message === "string") {
      message = body.payload.message;
    }
    
    if (!message || typeof message !== "string" || message.trim() === "") {
      console.error("No valid message found in request body");
      const response = NextResponse.json(
        { 
          reply: "Please provide a message. I received: " + JSON.stringify(body),
        },
        { status: 400 }
      );
      return addCorsHeaders(response);
    }

    // Forward to n8n workflow for LLM intent parsing (with RAG)
    // n8n handles all LLM processing and returns the formatted response
    // Use N8N_BASE_URL with webhook path, or fallback to full URL for backwards compatibility
    const n8nBaseUrl = process.env.N8N_BASE_URL;
    const n8nWebhookUrl = n8nBaseUrl 
      ? `${n8nBaseUrl}/webhook/typebot-chat`
      : (process.env.N8N_TYPEBOT_WEBHOOK_URL || "http://localhost:5678/webhook/typebot-chat");

    try {
      const n8nResponse = await fetch(n8nWebhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: message,
        }),
      });

      if (!n8nResponse.ok) {
        let errorText = "";
        let errorJson = null;
        
        try {
          // Try to parse as JSON first
          const contentType = n8nResponse.headers.get("content-type");
          if (contentType?.includes("application/json")) {
            errorJson = await n8nResponse.json();
            errorText = errorJson.message || JSON.stringify(errorJson);
          } else {
            errorText = await n8nResponse.text();
          }
        } catch (e) {
          errorText = `Failed to read error response: ${e instanceof Error ? e.message : String(e)}`;
        }
        
        console.error("n8n workflow error:", n8nResponse.status, n8nResponse.statusText, errorText);
        
        // Provide helpful error messages based on status code
        let userMessage = "Sorry, I couldn't process your request right now.";
        if (n8nResponse.status === 404) {
          userMessage = "The workflow service is not available. Please check if the n8n workflow is activated.";
        } else if (n8nResponse.status === 500) {
          userMessage = "The workflow service encountered an error. Please try again later.";
        }
        
        const response = NextResponse.json(
          {
            reply: userMessage,
          },
          { status: 500 }
        );
        return addCorsHeaders(response);
      }

      // Parse successful response
      let n8nResult;
      try {
        n8nResult = await n8nResponse.json();
      } catch (e) {
        console.error("Failed to parse n8n response as JSON:", e);
        const response = NextResponse.json(
          {
            reply: "The workflow service returned an invalid response. Please try again.",
          },
          { status: 500 }
        );
        return addCorsHeaders(response);
      }

      // Return the reply from n8n workflow
      // Handle both direct reply field and nested response structures
      // n8n returns { json: { reply: "..." } } when using responseMode: "lastNode"
      const reply = n8nResult.json?.reply ||
                    n8nResult.reply || 
                    n8nResult.response?.reply || 
                    n8nResult.data?.reply ||
                    n8nResult.body?.reply ||
                    (typeof n8nResult === 'string' ? n8nResult : "I couldn't process that. Please try again.");
      
      // Ensure reply is always a string
      const replyString = typeof reply === 'string' ? reply : JSON.stringify(reply);
      
      const response = NextResponse.json({
        reply: replyString,
      });
      return addCorsHeaders(response);
    } catch (error) {
      console.error("Error calling n8n workflow:", error);
      const response = NextResponse.json(
        {
          reply: `Sorry, I couldn't connect to the workflow service. Error: ${error instanceof Error ? error.message : String(error)}`,
        },
        { status: 500 }
      );
      return addCorsHeaders(response);
    }
  } catch (error) {
    console.error("Error in Typebot chat endpoint:", error);
    const response = NextResponse.json(
      {
        reply: "Sorry, something went wrong. Please try again later.",
      },
      { status: 500 }
    );
    return addCorsHeaders(response);
  }
}
