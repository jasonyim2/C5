import { NextResponse } from "next/server";
import { getSheet } from "@/lib/google-sheets";
import { Task } from "@/lib/types";

export async function GET() {
  try {
    const sheet = await getSheet();
    const rows = await sheet.getRows();
    
    // Convert rows to Task objects
    const tasks = rows.map((row) => ({
      task_id: row.get("task_id"),
      date: row.get("date"),
      cutoff_date: row.get("cutoff_date") || "",
      title: row.get("title"),
      priority: row.get("priority"),
      status: row.get("status"),
      due_time: row.get("due_time") || "",
      category: row.get("category"),
      created_at: row.get("created_at"),
      updated_at: row.get("updated_at"),
    }));

    return NextResponse.json(tasks);
  } catch (error) {
    console.error("Failed to fetch tasks:", error);
    return NextResponse.json({ error: "Failed to fetch tasks" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data: Task = await request.json();
    const sheet = await getSheet();
    
    // Add new row
    await sheet.addRow({
      task_id: data.task_id,
      date: data.date,
      cutoff_date: data.cutoff_date || "",
      title: data.title,
      priority: data.priority,
      status: data.status,
      due_time: data.due_time || "",
      category: data.category,
      created_at: data.created_at,
      updated_at: data.updated_at,
    });

    return NextResponse.json({ success: true, task: data });
  } catch (error) {
    console.error("Failed to create task:", error);
    return NextResponse.json({ error: "Failed to create task" }, { status: 500 });
  }
}
