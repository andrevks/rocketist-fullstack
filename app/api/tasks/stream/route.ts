import { NextRequest } from "next/server";
import { getSupabaseClient } from "@/lib/supabase";

// Server-Sent Events endpoint for real-time task updates
// Frontend connects here, we subscribe to Supabase Realtime server-side
export async function GET(request: NextRequest) {
  // Create a ReadableStream for SSE
  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      
      // Send initial connection message
      const send = (data: string) => {
        controller.enqueue(encoder.encode(`data: ${data}\n\n`));
      };

      try {
        const supabase = getSupabaseClient();

        // Subscribe to changes on the tasks table
        const channel = supabase
          .channel("tasks-stream")
          .on(
            "postgres_changes",
            {
              event: "*", // INSERT, UPDATE, DELETE
              schema: "public",
              table: "tasks",
            },
            (payload) => {
              // Send update to client
              send(
                JSON.stringify({
                  type: "task_updated",
                  event: payload.eventType,
                  data: payload.new || payload.old,
                })
              );
            }
          )
          .subscribe((status) => {
            if (status === "SUBSCRIBED") {
              send(JSON.stringify({ type: "connected", message: "Realtime subscription active" }));
            } else if (status === "CHANNEL_ERROR") {
              console.error("Supabase Realtime subscription error");
              send(JSON.stringify({ type: "error", message: "Realtime subscription failed" }));
            }
          });

        // Keep connection alive
        const keepAlive = setInterval(() => {
          try {
            send(JSON.stringify({ type: "ping" }));
          } catch (error) {
            clearInterval(keepAlive);
          }
        }, 30000); // Send ping every 30 seconds

        // Handle client disconnect
        request.signal.addEventListener("abort", () => {
          clearInterval(keepAlive);
          supabase.removeChannel(channel);
          controller.close();
        });

        // Send initial message
        send(JSON.stringify({ type: "connected", message: "Stream started" }));
      } catch (error) {
        console.error("Error in SSE stream:", error);
        try {
          send(JSON.stringify({ type: "error", message: String(error) }));
        } catch (e) {
          // Connection already closed
        }
        controller.close();
      }
    },
  });

  // Return SSE response
  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
    },
  });
}

