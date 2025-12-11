import { NextRequest, NextResponse } from "next/server";
import { getSupabaseClient } from "@/lib/supabase";
import { CreateTaskDto } from "@/lib/types";

// GET /api/tasks
export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get("status");
    const needsEnrichment = searchParams.get("needsEnrichment");
    const limitParam = searchParams.get("limit");
    const limit = limitParam ? parseInt(limitParam, 10) : undefined;

    let query = supabase
      .from("tasks")
      .select("*")
      .order("created_at", { ascending: false });

    if (status) {
      query = query.eq("status", status);
    }

    if (needsEnrichment === "true") {
      query = query.eq("needs_enrichment", true);
    } else if (needsEnrichment === "false") {
      query = query.eq("needs_enrichment", false);
    }

    if (limit && limit > 0) {
      query = query.limit(limit);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching tasks:", error);
      return NextResponse.json(
        { error: "Failed to fetch tasks" },
        { status: 500 }
      );
    }

    // Return array directly (frontend expects this format)
    return NextResponse.json(data ?? []);
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/tasks
export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const body: CreateTaskDto = await request.json();

    if (!body.title || body.title.trim() === "") {
      return NextResponse.json(
        { error: "Title is required" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("tasks")
      .insert({
        title: body.title.trim(),
        status: "pending",
        needs_enrichment: true,
        source: body.source || "web",
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating task:", error);
      return NextResponse.json(
        { error: "Failed to create task" },
        { status: 500 }
      );
    }

    // Use N8N_BASE_URL with webhook path, or fallback to full N8N_WEBHOOK_URL for backwards compatibility
    const n8nBaseUrl = process.env.N8N_BASE_URL;
    const n8nWebhookUrl = n8nBaseUrl 
      ? `${n8nBaseUrl}/webhook/task-created`
      : process.env.N8N_WEBHOOK_URL;
    
    if (n8nWebhookUrl && data) {
      fetch(n8nWebhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          taskId: data.id,
          title: data.title,
        }),
      }).catch((err) => {
        console.error("Failed to notify n8n:", err);
      });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
