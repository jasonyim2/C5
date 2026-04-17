import { NextResponse } from "next/server";
import { getSheet } from "@/lib/google-sheets";

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const data = await request.json();
    const sheet = await getSheet();
    const rows = await sheet.getRows();
    
    const row = rows.find((r) => r.get("task_id") === id);
    if (!row) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    // Update row
    if (data.date !== undefined) row.assign({ date: data.date });
    if (data.cutoff_date !== undefined) row.assign({ cutoff_date: data.cutoff_date });
    if (data.title !== undefined) row.assign({ title: data.title });
    if (data.priority !== undefined) row.assign({ priority: data.priority });
    if (data.status !== undefined) row.assign({ status: data.status });
    if (data.due_time !== undefined) row.assign({ due_time: data.due_time });
    if (data.category !== undefined) row.assign({ category: data.category });
    if (data.updated_at !== undefined) row.assign({ updated_at: data.updated_at });
    
    await row.save();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to update task:", error);
    return NextResponse.json({ error: "Failed to update task" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const sheet = await getSheet();
    const rows = await sheet.getRows();
    
    const row = rows.find((r) => r.get("task_id") === id);
    if (!row) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    await row.delete();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete task:", error);
    return NextResponse.json({ error: "Failed to delete task" }, { status: 500 });
  }
}
