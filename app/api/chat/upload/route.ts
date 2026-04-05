import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import { PDFParse } from "pdf-parse";
import mammoth from "mammoth";
import * as xlsx from "xlsx";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const mimeType = file.type;
    const fileName = file.name;
    const fileSize = file.size;

    let text = "";

    if (mimeType === "application/pdf") {
      const parser = new PDFParse({ data: buffer });
      const result = await parser.getText();
      text = result.text;
    } else if (
      mimeType ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      const result = await mammoth.extractRawText({
        buffer: buffer,
      });
      text = result.value;
    } else if (
      mimeType ===
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
      mimeType === "application/vnd.ms-excel"
    ) {
      const workbook = xlsx.read(buffer, { type: "buffer" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      text = xlsx.utils.sheet_to_csv(worksheet);
    } else if (mimeType.startsWith("text/") || mimeType === "application/json") {
      text = buffer.toString("utf-8");
    } else if (mimeType.startsWith("image/")) {
      // For images, we might just return the base64 preview or a placeholder
      // The previous code had a preview field
      text = "[Image Content]";
    } else {
      text = buffer.toString("utf-8");
    }

    return NextResponse.json({
      text,
      fileName,
      mimeType,
      fileSize,
      preview: mimeType.startsWith("image/") 
        ? `data:${mimeType};base64,${buffer.toString("base64")}` 
        : null
    });
  } catch (error: unknown) {
    console.error("Upload API Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to process file" },
      { status: 500 }
    );
  }
}
