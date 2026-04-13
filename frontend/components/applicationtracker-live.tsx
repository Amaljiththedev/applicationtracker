"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardToolbar } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Briefcase, MapPin, DollarSign, ExternalLink, Plus, Search, Clock, CheckCircle2, XCircle, Ghost, CalendarDays, SlidersHorizontal, LogOut } from "lucide-react";
import { apiClient } from "@/lib/api";
import { supabase } from "@/lib/supabaseClient";
import { cn } from "@/lib/utils";

type Status = "Applied" | "Interview" | "Offer" | "Rejected" | "Ghosted";
interface Application { id: string; company: string; role: string; status: Status; location: string; salary: string; job_link: string; notes: string; created_at: string; }

const PAGE_SIZE = 4;
const ALL_STATUSES: Status[] = ["Applied", "Interview", "Offer", "Rejected", "Ghosted"];
const SORT_OPTIONS = [{ value: "date_desc", label: "Newest first" }, { value: "date_asc", label: "Oldest first" }, { value: "company", label: "Company A-Z" }, { value: "status", label: "By status" }];
const STATUS_DESCRIPTION: Record<Status, string> = {
  Applied: "Application submitted, waiting for response.",
  Interview: "You are in interview rounds or scheduling.",
  Offer: "Offer received, review and decide next steps.",
  Rejected: "Application closed after rejection.",
  Ghosted: "No response from recruiter for a long time.",
};
const STATUS_CONFIG: Record<Status, { color: string; bg: string; border: string; icon: React.ElementType }> = {
  Applied: { color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-950/40", border: "border-blue-200 dark:border-blue-900", icon: Clock },
  Interview: { color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-950/40", border: "border-amber-200 dark:border-amber-900", icon: CalendarDays },
  Offer: { color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-950/40", border: "border-emerald-200 dark:border-emerald-900", icon: CheckCircle2 },
  Rejected: { color: "text-red-600 dark:text-red-400", bg: "bg-red-50 dark:bg-red-950/40", border: "border-red-200 dark:border-red-900", icon: XCircle },
  Ghosted: { color: "text-zinc-500 dark:text-zinc-400", bg: "bg-zinc-100 dark:bg-zinc-800/40", border: "border-zinc-200 dark:border-zinc-700", icon: Ghost },
};

const emptyForm = { company: "", role: "", status: "Applied" as Status, location: "", salary: "", job_link: "", notes: "" };
const formatDate = (iso: string) => new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "2-digit" });

function StatusBadge({ status }: { status: Status }) {
  const cfg = STATUS_CONFIG[status];
  const Icon = cfg.icon;
  return <span className={cn("inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full border", cfg.color, cfg.bg, cfg.border)}><Icon className="size-3" />{status}</span>;
}

export default function ApplicationTrackerLive() {
  const [apps, setApps] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<Status | "All">("All");
  const [sort, setSort] = useState("date_desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  async function loadApps() {
    try { setLoading(true); setError(""); setApps((await apiClient.listApplications()) as Application[]); }
    catch (e) { setError(e instanceof Error ? e.message : "Failed to load applications"); }
    finally { setLoading(false); }
  }
  useEffect(() => { loadApps(); }, []);

  const filteredApps = useMemo(() => {
    const q = search.toLowerCase();
    let list = apps.filter((a) => (a.company.toLowerCase().includes(q) || a.role.toLowerCase().includes(q) || a.location.toLowerCase().includes(q)) && (filterStatus === "All" || a.status === filterStatus));
    if (sort === "date_desc") list = [...list].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    if (sort === "date_asc") list = [...list].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    if (sort === "company") list = [...list].sort((a, b) => a.company.localeCompare(b.company));
    if (sort === "status") list = [...list].sort((a, b) => ALL_STATUSES.indexOf(a.status) - ALL_STATUSES.indexOf(b.status));
    return list;
  }, [apps, search, filterStatus, sort]);

  const totalPages = Math.max(1, Math.ceil(filteredApps.length / PAGE_SIZE));
  useEffect(() => { setCurrentPage(1); }, [search, filterStatus, sort]);
  useEffect(() => { if (currentPage > totalPages) setCurrentPage(totalPages); }, [currentPage, totalPages]);
  const paginatedApps = useMemo(() => filteredApps.slice((currentPage - 1) * PAGE_SIZE, (currentPage - 1) * PAGE_SIZE + PAGE_SIZE), [filteredApps, currentPage]);
  const stats = useMemo(() => ({ total: apps.length, active: apps.filter((a) => a.status === "Applied" || a.status === "Interview").length, offers: apps.filter((a) => a.status === "Offer").length }), [apps]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    try {
      setSaving(true);
      if (editingId) await apiClient.updateApplication(editingId, form); else await apiClient.createApplication(form);
      setForm(emptyForm); setEditingId(null); setShowForm(false); await loadApps();
    } catch (e) { setError(e instanceof Error ? e.message : "Failed to save"); } finally { setSaving(false); }
  }
  function editApp(app: Application) { setEditingId(app.id); setForm({ company: app.company, role: app.role, status: app.status, location: app.location, salary: app.salary, job_link: app.job_link, notes: app.notes }); setShowForm(true); }
  async function deleteApp(id: string) { try { await apiClient.deleteApplication(id); await loadApps(); } catch (e) { setError(e instanceof Error ? e.message : "Failed to delete"); } }
  async function logout() { await supabase.auth.signOut(); window.location.href = "/"; }

  return (
    <div className="w-full min-h-screen bg-background flex flex-col items-center justify-start py-6 sm:py-10 px-3 sm:px-4 lg:px-8">
      <div className="w-full max-w-6xl mb-6 sm:mb-8">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div><p className="text-[11px] uppercase tracking-[0.18em] font-semibold text-muted-foreground mb-1.5">Career - Job Search</p><h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground leading-tight">Application Tracker</h1></div>
          <div className="flex w-full sm:w-auto items-center gap-2 pt-1">
            <button onClick={() => { setShowForm(true); setEditingId(null); setForm(emptyForm); }} className="inline-flex items-center justify-center gap-1.5 h-9 px-4 rounded-full bg-primary text-primary-foreground text-xs font-semibold shadow-sm flex-1 sm:flex-none"><Plus className="size-3.5" />New application</button>
            <button onClick={logout} className="inline-flex items-center justify-center gap-1.5 h-9 px-4 rounded-full border border-border bg-background text-xs font-semibold text-foreground flex-1 sm:flex-none"><LogOut className="size-3.5" />Sign out</button>
          </div>
        </div>
      </div>

      <Card className="w-full max-w-6xl overflow-hidden border-white/50 dark:border-white/10 shadow-xl shadow-black/5">
        <div className="grid grid-cols-1 sm:grid-cols-3 border-b border-border/60 bg-background/80">
          <div className="px-4 sm:px-6 py-4 sm:py-5 sm:border-r border-border/60"><p className="text-[11px] text-muted-foreground uppercase tracking-wide">Total</p><p className="text-2xl font-bold text-foreground">{stats.total}</p></div>
          <div className="px-4 sm:px-6 py-4 sm:py-5 sm:border-r border-border/60 border-t sm:border-t-0 border-border/60"><p className="text-[11px] text-muted-foreground uppercase tracking-wide">Active</p><p className="text-2xl font-bold text-foreground">{stats.active}</p></div>
          <div className="px-4 sm:px-6 py-4 sm:py-5 border-t sm:border-t-0 border-border/60"><p className="text-[11px] text-muted-foreground uppercase tracking-wide">Offers</p><p className="text-2xl font-bold text-foreground">{stats.offers}</p></div>
        </div>

        <CardHeader className="border-b border-border/60 py-3.5 px-5 gap-3">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 flex-1 min-w-0">
            <div className="relative flex-1 w-full sm:max-w-xs"><Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search companies, roles..." className="w-full h-9 pl-8 pr-3 rounded-xl border border-border/80 bg-background text-sm text-foreground" /></div>
            <div className="flex items-center gap-1.5 flex-wrap">{(["All", ...ALL_STATUSES] as const).map((s) => <button key={s} onClick={() => setFilterStatus(s)} className={cn("text-[11px] font-semibold px-2.5 py-1 rounded-full border transition-all", filterStatus === s ? "bg-foreground text-background border-foreground" : "text-muted-foreground bg-transparent border-border")}>{s}</button>)}</div>
          </div>
          <CardToolbar className="w-full sm:w-auto justify-between sm:justify-end"><SlidersHorizontal className="size-3.5 text-muted-foreground" /><Select value={sort} onValueChange={setSort}><SelectTrigger className="h-9 text-xs w-[170px] sm:w-[150px] rounded-xl"><SelectValue /></SelectTrigger><SelectContent align="end">{SORT_OPTIONS.map((o) => <SelectItem key={o.value} value={o.value} className="text-xs">{o.label}</SelectItem>)}</SelectContent></Select></CardToolbar>
        </CardHeader>

        <CardContent className="p-4 sm:p-5 bg-gradient-to-b from-transparent to-muted/20">
          {showForm && <form onSubmit={onSubmit} className="mb-4 grid gap-3 rounded-xl border border-border bg-card p-4 sm:grid-cols-2"><input required value={form.company} onChange={(e) => setForm((f) => ({ ...f, company: e.target.value }))} className="h-9 rounded-lg border border-border bg-background px-3 text-sm" placeholder="Company" /><input required value={form.role} onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))} className="h-9 rounded-lg border border-border bg-background px-3 text-sm" placeholder="Role" /><select value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as Status }))} className="h-9 rounded-lg border border-border bg-background px-3 text-sm">{ALL_STATUSES.map((s) => <option key={s}>{s}</option>)}</select><input value={form.location} onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))} className="h-9 rounded-lg border border-border bg-background px-3 text-sm" placeholder="Location" /><input value={form.salary} onChange={(e) => setForm((f) => ({ ...f, salary: e.target.value }))} className="h-9 rounded-lg border border-border bg-background px-3 text-sm" placeholder="Salary" /><input value={form.job_link} onChange={(e) => setForm((f) => ({ ...f, job_link: e.target.value }))} className="h-9 rounded-lg border border-border bg-background px-3 text-sm" placeholder="Job link" /><textarea value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} className="sm:col-span-2 rounded-lg border border-border bg-background px-3 py-2.5 text-sm" placeholder="Notes" rows={3} /><div className="sm:col-span-2 flex gap-2"><button disabled={saving} className="h-9 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-semibold">{editingId ? "Save changes" : "Add application"}</button><button type="button" onClick={() => { setShowForm(false); setEditingId(null); setForm(emptyForm); }} className="h-9 px-4 rounded-lg border border-border bg-background text-sm">Cancel</button></div></form>}
          {loading && <p className="text-sm text-muted-foreground">Loading applications...</p>}
          {error && <p className="mb-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">{error}</p>}
          {filteredApps.length === 0 ? <div className="flex flex-col items-center justify-center py-16 gap-2"><Briefcase className="size-8 text-muted-foreground/30" /><p className="text-sm text-muted-foreground">No applications found</p></div> : <div className="grid grid-cols-1 gap-4">{paginatedApps.map((app) => <div key={app.id} className="w-full p-4 sm:p-6 rounded-2xl border border-border/70 bg-background/90 hover:border-primary/30 transition-all"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="text-lg sm:text-xl font-semibold text-foreground truncate">{app.company}</p><p className="text-sm text-muted-foreground mt-1 truncate">{app.role}</p></div><StatusBadge status={app.status} /></div><p className="mt-2 text-xs sm:text-sm text-muted-foreground">{STATUS_DESCRIPTION[app.status]}</p><div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2.5"><div className="rounded-xl bg-muted/40 px-3.5 py-3"><p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1">Location</p><p className="text-sm text-foreground truncate inline-flex items-center gap-1"><MapPin className="size-3" />{app.location || "-"}</p></div><div className="rounded-xl bg-muted/40 px-3.5 py-3"><p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1">Salary</p><p className="text-sm text-foreground inline-flex items-center gap-1"><DollarSign className="size-3" />{app.salary || "-"}</p></div></div><div className="mt-3 text-xs text-muted-foreground inline-flex items-center gap-1"><CalendarDays className="size-3" />Added {formatDate(app.created_at)}</div>{app.notes && <p className="mt-3 text-sm text-muted-foreground whitespace-pre-wrap break-words">{app.notes}</p>}<div className="mt-4 grid grid-cols-2 sm:flex gap-2"><button onClick={() => editApp(app)} className="h-9 px-3 rounded-lg border border-border bg-background text-sm">Edit</button><button onClick={() => deleteApp(app.id)} className="h-9 px-3 rounded-lg border border-red-200 bg-red-50 text-red-600 text-sm">Delete</button>{app.job_link && <a href={app.job_link} target="_blank" rel="noreferrer" className="h-9 col-span-2 sm:col-span-1 px-3 rounded-lg border border-border bg-background text-sm inline-flex items-center justify-center gap-1 sm:ml-auto"><ExternalLink className="size-3" />Open</a>}</div></div>)}</div>}
          {filteredApps.length > PAGE_SIZE && <div className="pt-4 flex items-center justify-center sm:justify-end gap-2"><button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1} className="h-9 px-4 rounded-xl border border-border bg-background text-sm disabled:opacity-50">Previous</button><span className="text-xs text-muted-foreground min-w-20 text-center">Page {currentPage} / {totalPages}</span><button onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="h-9 px-4 rounded-xl border border-border bg-background text-sm disabled:opacity-50">Next</button></div>}
        </CardContent>
      </Card>
    </div>
  );
}
