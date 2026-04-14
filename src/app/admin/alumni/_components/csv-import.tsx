"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { importAlumniFromCSV } from "@/server/actions/alumni.actions";
import type { AlumniCSVRow } from "@/server/actions/alumni.actions";
import { Upload, X } from "lucide-react";

interface CSVImportProps {
  onClose: () => void;
}

function parseCSV(text: string): AlumniCSVRow[] {
  const lines = text.trim().split("\n");
  if (lines.length < 2) return [];

  const headers = lines[0]
    .split(",")
    .map((h) => h.trim().replace(/^"|"$/g, "").trim());

  const findCol = (name: string) => {
    const idx = headers.findIndex(
      (h) => h.toLowerCase() === name.toLowerCase()
    );
    return idx;
  };

  const cols = {
    firstName: findCol("firstName"),
    lastName: findCol("lastName"),
    email: findCol("email"),
    phone: findCol("phone"),
    graduationYear: findCol("graduationYear"),
    programCompleted: findCol("programCompleted"),
  };

  if (cols.firstName === -1 || cols.lastName === -1 || cols.graduationYear === -1) {
    throw new Error(
      "CSV must include columns: firstName, lastName, graduationYear"
    );
  }

  const rows: AlumniCSVRow[] = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Simple CSV parse (handles quoted fields)
    const values: string[] = [];
    let current = "";
    let inQuotes = false;
    for (const char of line) {
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === "," && !inQuotes) {
        values.push(current.trim());
        current = "";
      } else {
        current += char;
      }
    }
    values.push(current.trim());

    const get = (idx: number) =>
      idx >= 0 && idx < values.length ? values[idx] : "";

    const year = parseInt(get(cols.graduationYear), 10);
    if (isNaN(year)) continue;

    rows.push({
      firstName: get(cols.firstName),
      lastName: get(cols.lastName),
      email: get(cols.email) || undefined,
      phone: get(cols.phone) || undefined,
      graduationYear: year,
      programCompleted: get(cols.programCompleted) || undefined,
    });
  }

  return rows;
}

export function CSVImport({ onClose }: CSVImportProps) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [rows, setRows] = useState<AlumniCSVRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ imported: number } | null>(null);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    setResult(null);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const text = evt.target?.result as string;
        const parsed = parseCSV(text);
        if (parsed.length === 0) {
          setError("No valid rows found in CSV.");
          return;
        }
        setRows(parsed);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to parse CSV");
      }
    };
    reader.readAsText(file);
  }

  async function handleImport() {
    if (!rows.length) return;
    setLoading(true);
    setError(null);

    try {
      const res = await importAlumniFromCSV(rows);
      setResult(res);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Import failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Import Alumni from CSV</h3>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="size-4" />
        </Button>
      </div>

      <div className="rounded-lg border border-dashed p-6 text-center">
        <Upload className="mx-auto size-8 text-muted-foreground mb-2" />
        <p className="text-sm text-muted-foreground mb-3">
          Expected columns: firstName, lastName, email, phone, graduationYear,
          programCompleted
        </p>
        <input
          ref={fileRef}
          type="file"
          accept=".csv"
          onChange={handleFile}
          className="hidden"
        />
        <Button variant="outline" onClick={() => fileRef.current?.click()}>
          Choose CSV File
        </Button>
      </div>

      {error && (
        <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {result && (
        <div className="rounded-lg bg-green-500/10 p-3 text-sm text-green-700 dark:text-green-400">
          Successfully imported {result.imported} alumni records.
        </div>
      )}

      {rows.length > 0 && !result && (
        <>
          <div className="max-h-64 overflow-y-auto rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>First Name</TableHead>
                  <TableHead>Last Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Year</TableHead>
                  <TableHead>Program</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.slice(0, 50).map((row, i) => (
                  <TableRow key={i}>
                    <TableCell>{row.firstName}</TableCell>
                    <TableCell>{row.lastName}</TableCell>
                    <TableCell>{row.email ?? "-"}</TableCell>
                    <TableCell>{row.phone ?? "-"}</TableCell>
                    <TableCell>{row.graduationYear}</TableCell>
                    <TableCell>{row.programCompleted ?? "-"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {rows.length > 50 && (
            <p className="text-xs text-muted-foreground">
              Showing first 50 of {rows.length} rows
            </p>
          )}
          <div className="flex gap-3">
            <Button onClick={handleImport} disabled={loading}>
              {loading
                ? "Importing..."
                : `Import ${rows.length} Alumni`}
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setRows([]);
                setResult(null);
                if (fileRef.current) fileRef.current.value = "";
              }}
            >
              Clear
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
