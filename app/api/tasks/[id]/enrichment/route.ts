import { NextRequest, NextResponse } from "next/server";
import { getSupabaseClient } from "@/lib/supabase";
import { UpdateTaskEnrichmentDto } from "@/lib/types";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = getSupabaseClient();
    const { id } = await params;
    const body: UpdateTaskEnrichmentDto = await request.json();

    const updateData: Record<string, unknown> = {
      needs_enrichment: false,
      updated_at: new Date().toISOString(),
    };

    if (body.description !== undefined) {
      updateData.description = body.description;
    }

    if (body.steps !== undefined) {
      updateData.steps = body.steps;
    }

    if (body.extra_info !== undefined) {
      updateData.extra_info = body.extra_info;
    }

    updateData.ai_last_run_at = body.ai_last_run_at ?? new Date().toISOString();

    const { data, error } = await supabase
      .from("tasks")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating task enrichment:", error);
      return NextResponse.json(
        { error: "Failed to update task enrichment" },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
