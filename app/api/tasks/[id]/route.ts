import { NextRequest, NextResponse } from "next/server";
import { getSupabaseClient } from "@/lib/supabase";
import { UpdateTaskDto } from "@/lib/types";

// GET /api/tasks/[id]
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = getSupabaseClient();
    const { id } = await params;
    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json({ error: "Task not found" }, { status: 404 });
      }
      console.error("Error fetching task:", error);
      return NextResponse.json({ error: "Failed to fetch task" }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PATCH /api/tasks/[id]
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = getSupabaseClient();
    const { id } = await params;
    const body: UpdateTaskDto = await request.json();

    const updateData: Record<string, unknown> = {};

    if (body.title !== undefined) {
      updateData.title = body.title.trim();
      updateData.needs_enrichment = true;
    }

    if (body.status !== undefined) {
      updateData.status = body.status;
    }

    if (body.description !== undefined) {
      updateData.description = body.description;
    }

    if (body.steps !== undefined) {
      updateData.steps = body.steps;
    }

    if (body.extra_info !== undefined) {
      updateData.extra_info = body.extra_info;
    }

    if (body.needs_enrichment !== undefined) {
      updateData.needs_enrichment = body.needs_enrichment;
    }

    updateData.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from("tasks")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating task:", error);
      return NextResponse.json({ error: "Failed to update task " + error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE /api/tasks/[id]
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = getSupabaseClient();
    const { id } = await params;
    const { error } = await supabase.from("tasks").delete().eq("id", id);

    if (error) {
      console.error("Error deleting task:", error);
      return NextResponse.json({ error: "Failed to delete task" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
