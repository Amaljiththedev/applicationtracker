"use client";

import { useEffect, useMemo, useState } from "react";
import { Briefcase, CalendarDays, LogOut, Plus, Trash2 } from "lucide-react";
import { apiClient } from "@/lib/api";
import { supabase } from "@/lib/supabaseClient";

type Status = "Applied" | "Interview" | "Offer" | "Rejected" | "Ghosted";
type Filter = Status | "All";

type Application = {
  id: string;
  company: string;
  role: string;
  status: Status;
  location: string;
  salary: string;
  job_link: string;
  notes: string;
  created_at: string;
};

const PAGE_SIZE = 4;
const ALL_STATUSES: Status[] = ["Applied", "Interview", "Offer", "Rejected", "Ghosted"];

const emptyForm = {
  company: "",
  role: "",
  status: "Applied" as Status,
  location: "",
  salary: "",
  job_link: "",
  notes: "",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "2-digit" });
}

export default function ApplicationTrackerLive() {
  const [apps, setApps] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<Filter>("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  async function loadApps() {
    try {
      setLoading(true);
      setError("");
      const data = (await apiClient.listApplications()) as Application[];
      setApps(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load applications");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadApps();
  }, []);

  const filteredApps = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = apps.filter((app) => {
      const matchesSearch =
        app.company.toLowerCase().includes(q) ||
        app.role.toLowerCase().includes(q) ||
        app.location.toLowerCase().includes(q);
      const matchesFilter = filter === "All" || app.status === filter;
      return matchesSearch && matchesFilter;
    });
    return [...list].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }, [apps, search, filter]);

  const totalPages = Math.max(1, Math.ceil(filteredApps.length / PAGE_SIZE));

  useEffect(() => {
    setCurrentPage(1);
  }, [search, filter]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const paginatedApps = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredApps.slice(start, start + PAGE_SIZE);
  }, [filteredApps, currentPage]);

  const stats = useMemo(
    () => ({
      total: apps.length,
      active: apps.filter((a) => a.status === "Applied" || a.status === "Interview").length,
      offers: apps.filter((a) => a.status === "Offer").length,
    }),
    [apps],
  );

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    try {
      setSaving(true);
      if (editingId) {
        await apiClient.updateApplication(editingId, form);
      } else {
        await apiClient.createApplication(form);
      }
      setForm(emptyForm);
      setEditingId(null);
      setShowForm(false);
      await loadApps();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  function editApp(app: Application) {
    setEditingId(app.id);
    setForm({
      company: app.company,
      role: app.role,
      status: app.status,
      location: app.location,
      salary: app.salary,
      job_link: app.job_link,
      notes: app.notes,
    });
    setShowForm(true);
  }

  async function deleteApp(id: string) {
    try {
      await apiClient.deleteApplication(id);
      await loadApps();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to delete");
    }
  }

  async function logout() {
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  return (
    <div className="mx-auto w-full max-w-6xl p-4 sm:p-6 text-zinc-100">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-zinc-400">Career dashboard</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight">Application Tracker</h1>
          <p className="mt-1 text-sm text-zinc-400">A clean, card-based pipeline for your job search.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => { setShowForm(true); setEditingId(null); setForm(emptyForm); }} className="inline-flex items-center gap-1 rounded-lg bg-white px-3 py-2 text-sm font-semibold text-black">
            <Plus className="size-4" /> New
          </button>
          <button onClick={logout} className="inline-flex items-center gap-1 rounded-lg border border-zinc-700 px-3 py-2 text-sm">
            <LogOut className="size-4" /> Sign out
          </button>
        </div>
      </div>

      <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">Total: <span className="font-semibold">{stats.total}</span></div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">Active: <span className="font-semibold">{stats.active}</span></div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">Offers: <span className="font-semibold">{stats.offers}</span></div>
      </div>

      <div className="mb-5 flex flex-col gap-3 rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 sm:flex-row sm:items-center">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search company, role, location..."
          className="h-10 flex-1 rounded-lg border border-zinc-700 bg-zinc-950 px-3 text-sm outline-none ring-0 focus:border-zinc-500"
        />
        <div className="flex flex-wrap gap-2">
          {(["All", ...ALL_STATUSES] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`rounded-full border px-3 py-1 text-xs ${filter === status ? "border-white bg-white text-black" : "border-zinc-700 text-zinc-300"}`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {showForm && (
        <form onSubmit={onSubmit} className="mb-5 grid gap-3 rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 sm:grid-cols-2">
          <input required value={form.company} onChange={(e) => setForm((f) => ({ ...f, company: e.target.value }))} className="h-10 rounded-lg bg-zinc-950 px-3 text-sm" placeholder="Company" />
          <input required value={form.role} onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))} className="h-10 rounded-lg bg-zinc-950 px-3 text-sm" placeholder="Role" />
          <select value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as Status }))} className="h-10 rounded-lg bg-zinc-950 px-3 text-sm">
            {ALL_STATUSES.map((status) => <option key={status}>{status}</option>)}
          </select>
          <input value={form.location} onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))} className="h-10 rounded-lg bg-zinc-950 px-3 text-sm" placeholder="Location" />
          <input value={form.salary} onChange={(e) => setForm((f) => ({ ...f, salary: e.target.value }))} className="h-10 rounded-lg bg-zinc-950 px-3 text-sm" placeholder="Salary" />
          <input value={form.job_link} onChange={(e) => setForm((f) => ({ ...f, job_link: e.target.value }))} className="h-10 rounded-lg bg-zinc-950 px-3 text-sm" placeholder="Job link" />
          <textarea value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} className="sm:col-span-2 min-h-[90px] rounded-lg bg-zinc-950 px-3 py-2 text-sm" placeholder="Notes" />
          <div className="sm:col-span-2 flex gap-2">
            <button disabled={saving} className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-black">{editingId ? "Save changes" : "Add application"}</button>
            <button type="button" onClick={() => { setShowForm(false); setEditingId(null); setForm(emptyForm); }} className="rounded-lg border border-zinc-700 px-4 py-2 text-sm">Cancel</button>
          </div>
        </form>
      )}

      {loading && <p className="text-sm text-zinc-400">Loading applications...</p>}
      {error && <p className="mb-3 rounded-lg border border-red-900 bg-red-950/30 p-3 text-sm text-red-300">{error}</p>}

      <div className="grid gap-4 sm:grid-cols-2">
        {paginatedApps.map((app) => (
          <div key={app.id} className="rounded-xl border border-zinc-800 bg-zinc-900/70 p-4 shadow-lg shadow-black/10">
            <div className="mb-3 flex items-start justify-between gap-2">
              <div>
                <p className="text-lg font-semibold">{app.company}</p>
                <p className="text-sm text-zinc-400">{app.role}</p>
              </div>
              <span className="rounded-full border border-zinc-700 px-2 py-1 text-xs">{app.status}</span>
            </div>
            <div className="space-y-1 text-sm text-zinc-300">
              <p className="inline-flex items-center gap-1"><Briefcase className="size-3.5" /> {app.location || "No location"}</p>
              <p>{app.salary || "Salary not provided"}</p>
              <p className="inline-flex items-center gap-1 text-zinc-400"><CalendarDays className="size-3.5" /> {formatDate(app.created_at)}</p>
            </div>
            {app.notes && <p className="mt-3 text-sm text-zinc-400">{app.notes}</p>}
            <div className="mt-4 flex gap-2">
              <button onClick={() => editApp(app)} className="rounded-lg border border-zinc-700 px-3 py-1.5 text-sm">Edit</button>
              <button onClick={() => deleteApp(app.id)} className="inline-flex items-center gap-1 rounded-lg border border-red-900 px-3 py-1.5 text-sm text-red-300"><Trash2 className="size-3.5" /> Delete</button>
            </div>
          </div>
        ))}
      </div>

      {!loading && filteredApps.length === 0 && (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-8 text-center text-zinc-400">No applications found.</div>
      )}

      {filteredApps.length > PAGE_SIZE && (
        <div className="mt-5 flex items-center justify-end gap-2">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="rounded-lg border border-zinc-700 px-3 py-1.5 text-sm disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-sm text-zinc-400">Page {currentPage} / {totalPages}</span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="rounded-lg border border-zinc-700 px-3 py-1.5 text-sm disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
