"use client";
import { useState, useRef } from "react";
import { Upload, FileText, CheckCircle2, XCircle, ArrowLeft, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";

type Row = Record<string, string>;

const COLUMNS = ["nombre","categoria","ciudad","telefono","whatsapp","email","sitio_web","instagram","facebook","descripcion","descripcion_corta","direccion"];
const REQUIRED = ["nombre","categoria","ciudad"];

const CSV_TEMPLATE = COLUMNS.join(",") + "\n" +
  "Café del Volcán,cafeterias,puerto-varas,+56912345678,,hola@cafe.cl,https://cafe.cl,@cafedelvolcan,,,El mejor café con vista al lago,Café en Puerto Varas,Av. Principal 123";

function parseCSVLine(line: string, sep: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') { current += '"'; i++; }
      else { inQuotes = !inQuotes; }
    } else if (ch === sep && !inQuotes) {
      result.push(current.trim()); current = "";
    } else {
      current += ch;
    }
  }
  result.push(current.trim());
  return result;
}

function detectSeparator(firstLine: string): string {
  const commas = (firstLine.match(/,/g) ?? []).length;
  const semis  = (firstLine.match(/;/g) ?? []).length;
  return semis > commas ? ";" : ",";
}

function parseCSV(text: string): Row[] {
  const lines = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n").trim().split("\n");
  if (lines.length < 2) return [];
  const sep = detectSeparator(lines[0]);
  const headers = parseCSVLine(lines[0], sep).map(h => h.toLowerCase().replace(/\s+/g, "_"));
  return lines
    .slice(1)
    .map(line => {
      const vals = parseCSVLine(line, sep);
      const row: Row = {};
      headers.forEach((h, i) => { row[h] = vals[i] ?? ""; });
      return row;
    })
    .filter(row => row["nombre"]?.trim()); // skip rows with no name (empty rows)
}

function downloadTemplate() {
  const blob = new Blob([CSV_TEMPLATE], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a"); a.href = url; a.download = "plantilla_locales.csv"; a.click();
  URL.revokeObjectURL(url);
}

export default function ImportBusinessesPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [sheetsUrl, setSheetsUrl] = useState("");
  const [loadingSheets, setLoadingSheets] = useState(false);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<{ created: number; errors: { row: number; name: string; error: string }[] } | null>(null);
  const [parseError, setParseError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; if (!file) return;
    setParseError(""); setResult(null);
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const parsed = parseCSV(ev.target?.result as string);
        if (!parsed.length) { setParseError("El archivo está vacío o no tiene filas de datos."); return; }
        setRows(parsed);
      } catch { setParseError("No se pudo leer el archivo. Asegúrate que sea CSV."); }
    };
    reader.readAsText(file, "UTF-8");
  }

  async function handleSheets() {
    if (!sheetsUrl.trim()) return;
    setLoadingSheets(true); setParseError(""); setResult(null);
    try {
      // Convert Sheets URL to CSV export URL
      let csvUrl = sheetsUrl;
      const match = sheetsUrl.match(/\/d\/([a-zA-Z0-9-_]+)/);
      if (match) csvUrl = `https://docs.google.com/spreadsheets/d/${match[1]}/export?format=csv`;
      const res = await fetch(`/api/admin/fetch-csv?url=${encodeURIComponent(csvUrl)}`);
      if (!res.ok) throw new Error("No se pudo obtener el archivo. Asegúrate que el sheet sea público.");
      const text = await res.text();
      const parsed = parseCSV(text);
      if (!parsed.length) throw new Error("El sheet no tiene filas de datos.");
      setRows(parsed);
    } catch (e) {
      setParseError(e instanceof Error ? e.message : "Error al cargar el sheet.");
    } finally { setLoadingSheets(false); }
  }

  async function handleImport() {
    setImporting(true); setResult(null);
    const res = await fetch("/api/admin/businesses/import", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rows }),
    });
    const data = await res.json();
    setResult(data);
    if (data.created > 0) setRows([]);
    setImporting(false);
  }

  const hasErrors = rows.some(r => REQUIRED.some(c => !r[c]));

  return (
    <div className="p-6 max-w-4xl">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/businesses"><Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button></Link>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Importar locales</h1>
          <p className="text-xs text-gray-400 mt-0.5">Carga múltiples locales desde CSV o Google Sheets</p>
        </div>
      </div>

      {/* Result */}
      {result && (
        <div className={`rounded-2xl border p-4 mb-6 ${result.errors.length === 0 ? "bg-emerald-50 border-emerald-200" : "bg-amber-50 border-amber-200"}`}>
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            <span className="font-semibold text-sm text-emerald-800">{result.created} local{result.created !== 1 ? "es" : ""} creado{result.created !== 1 ? "s" : ""} correctamente</span>
          </div>
          {result.errors.length > 0 && (
            <div className="mt-2 space-y-1">
              {result.errors.map((e, i) => (
                <div key={i} className="flex items-start gap-2 text-xs text-red-700">
                  <XCircle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                  <span>Fila {e.row} ({e.name}): {e.error}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Sources */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        {/* CSV upload */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-gray-700 flex items-center gap-2"><FileText className="h-4 w-4" /> Subir archivo CSV</h2>
            <button onClick={downloadTemplate} className="text-xs text-emerald-600 hover:text-emerald-700 flex items-center gap-1">
              <Download className="h-3 w-3" /> Plantilla
            </button>
          </div>
          <Button variant="outline" size="sm" className="w-full gap-2" onClick={() => fileRef.current?.click()}>
            <Upload className="h-4 w-4" /> Elegir archivo .csv
          </Button>
          <input ref={fileRef} type="file" accept=".csv,text/csv" className="hidden" onChange={handleFile} />
        </div>

        {/* Google Sheets */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <h2 className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-3">
            <span className="text-base">📊</span> Google Sheets
          </h2>
          <p className="text-xs text-gray-400 mb-2">El sheet debe estar publicado como CSV (Archivo → Compartir → Publicar en la web)</p>
          <div className="flex gap-2">
            <Input placeholder="URL del Google Sheet" value={sheetsUrl} onChange={e => setSheetsUrl(e.target.value)} className="flex-1 text-xs" />
            <Button size="sm" variant="outline" onClick={handleSheets} disabled={loadingSheets || !sheetsUrl} className="shrink-0">
              {loadingSheets ? "..." : "Cargar"}
            </Button>
          </div>
        </div>
      </div>

      {parseError && <p className="text-sm text-red-500 mb-4 bg-red-50 px-3 py-2 rounded-xl">{parseError}</p>}

      {/* Preview */}
      {rows.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden mb-6">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h2 className="text-sm font-semibold text-gray-700">{rows.length} filas detectadas</h2>
            {hasErrors && <span className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded-lg">Algunas filas tienen campos requeridos vacíos</span>}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-3 py-2 text-left text-gray-500 font-medium">#</th>
                  {COLUMNS.map(c => (
                    <th key={c} className={`px-3 py-2 text-left font-medium ${REQUIRED.includes(c) ? "text-gray-800" : "text-gray-400"}`}>
                      {c}{REQUIRED.includes(c) ? " *" : ""}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {rows.map((row, i) => {
                  const missingRequired = REQUIRED.filter(c => !row[c]);
                  return (
                    <tr key={i} className={missingRequired.length ? "bg-red-50" : ""}>
                      <td className="px-3 py-2 text-gray-400">{i + 1}</td>
                      {COLUMNS.map(c => (
                        <td key={c} className={`px-3 py-2 max-w-[150px] truncate ${REQUIRED.includes(c) && !row[c] ? "text-red-500 font-medium" : "text-gray-700"}`}>
                          {row[c] || <span className="text-gray-300">—</span>}
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {rows.length > 0 && (
        <Button onClick={handleImport} disabled={importing || hasErrors} size="lg" className="w-full gap-2">
          {importing ? "Importando..." : `Importar ${rows.length} local${rows.length !== 1 ? "es" : ""}`}
        </Button>
      )}

      {/* Column guide */}
      <div className="mt-6 bg-gray-50 rounded-2xl border border-gray-100 p-5">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Columnas del CSV</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {COLUMNS.map(c => (
            <div key={c} className="flex items-center gap-2 text-xs">
              <span className={`font-mono px-1.5 py-0.5 rounded ${REQUIRED.includes(c) ? "bg-gray-900 text-white" : "bg-gray-200 text-gray-600"}`}>{c}</span>
              {REQUIRED.includes(c) && <span className="text-gray-400">requerido</span>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
