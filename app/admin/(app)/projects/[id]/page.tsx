import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getAdminContext } from "@/lib/admin/auth";
import { addTask, deleteProject, deleteTask, toggleTask, updateProject } from "@/lib/admin/actions/projects";
import { INVOICE_STATUSES, OVERDUE, PROJECT_STATUSES, QUOTE_STATUSES, findOption } from "@/lib/admin/constants";
import { formatDate, isOverdue } from "@/lib/admin/format";
import { getRefs } from "@/lib/admin/queries";
import { ActionForm, InlineAction } from "@/components/admin/ActionForm";
import { ProjectFields } from "@/components/admin/fields";
import { Badge, ButtonLink, Card, Field, inputClass, PageHeader } from "@/components/admin/ui";

export const metadata = { title: "Project" };

export default async function ProjectPage({ params }: PageProps<"/admin/projects/[id]">) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: project } = await supabase.from("projects").select("*, clients(id, name)").eq("id", id).maybeSingle();
  if (!project) notFound();

  const [{ data: tasks }, { data: quotes }, { data: invoices }, refs, ctx] = await Promise.all([
    supabase.from("project_tasks").select("*").eq("project_id", id).order("done").order("due_date", { nullsFirst: false }).order("created_at"),
    supabase.from("quotes").select("id, quote_number, title, status").eq("project_id", id),
    supabase.from("invoices").select("id, invoice_number, status, due_date").eq("project_id", id),
    getRefs(),
    getAdminContext(),
  ]);
  const isOwner = ctx.status === "admin" && ctx.role === "owner";
  const openTasks = (tasks ?? []).filter((t) => !t.done).length;

  return (
    <>
      <PageHeader
        title={project.name}
        description={
          <span className="inline-flex flex-wrap items-center gap-2">
            <Badge option={findOption(PROJECT_STATUSES, project.status)} />
            {project.clients && (
              <Link href={`/admin/clients/${project.clients.id}`} className="text-navy hover:underline">{project.clients.name}</Link>
            )}
            {project.due_date && <span>Due {formatDate(project.due_date)}</span>}
          </span>
        }
        back={{ href: "/admin/projects", label: "Projects" }}
        actions={
          <>
            <ButtonLink href={`/admin/quotes/new?client=${project.client_id}&project=${project.id}`} variant="secondary">New quote</ButtonLink>
            <ButtonLink href={`/admin/invoices/new?client=${project.client_id}&project=${project.id}`}>New invoice</ButtonLink>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_24rem]">
        <div className="space-y-6">
          <Card title={`Tasks (${openTasks} open)`}>
            {tasks?.length ? (
              <ul className="divide-y divide-slate-100">
                {tasks.map((t) => (
                  <li key={t.id} className="flex items-center justify-between gap-3 py-2">
                    <div className="flex min-w-0 items-center gap-3">
                      <InlineAction
                        action={toggleTask}
                        hidden={{ id: t.id, done: String(!t.done) }}
                        label={t.done ? "Reopen" : "Done"}
                        variant="secondary"
                      />
                      <span className={`truncate text-sm ${t.done ? "text-slate-400 line-through" : "text-ink"}`}>{t.title}</span>
                    </div>
                    <div className="flex shrink-0 items-center gap-3">
                      {t.due_date && <span className="text-xs text-slate-500">{formatDate(t.due_date)}</span>}
                      {isOwner && <InlineAction action={deleteTask} hidden={{ id: t.id }} label="Remove" variant="danger" />}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-slate-500">No tasks yet.</p>
            )}
            <div className="mt-4 border-t border-slate-100 pt-4">
              <ActionForm action={addTask} submitLabel="Add task" submitVariant="secondary" resetOnSuccess>
                <input type="hidden" name="project_id" value={project.id} />
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_10rem]">
                  <Field label="Task" htmlFor="title">
                    <input id="title" name="title" required className={inputClass} />
                  </Field>
                  <Field label="Due" htmlFor="task_due">
                    <input id="task_due" name="due_date" type="date" className={inputClass} />
                  </Field>
                </div>
              </ActionForm>
            </div>
          </Card>

          <Card title="Project details">
            <ActionForm action={updateProject} submitLabel="Save changes">
              <ProjectFields project={project} clients={refs.clients} />
            </ActionForm>
          </Card>
        </div>

        <div className="space-y-6">
          <Card title="Quotes">
            {quotes?.length ? (
              <ul className="space-y-2">
                {quotes.map((q) => (
                  <li key={q.id} className="flex items-center justify-between gap-2 text-sm">
                    <Link href={`/admin/quotes/${q.id}`} className="truncate font-medium text-ink hover:underline">{q.quote_number} · {q.title}</Link>
                    <Badge option={findOption(QUOTE_STATUSES, q.status)} />
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-slate-500">No quotes linked.</p>
            )}
          </Card>
          <Card title="Invoices">
            {invoices?.length ? (
              <ul className="space-y-2">
                {invoices.map((inv) => (
                  <li key={inv.id} className="flex items-center justify-between gap-2 text-sm">
                    <Link href={`/admin/invoices/${inv.id}`} className="truncate font-medium text-ink hover:underline">{inv.invoice_number}</Link>
                    <Badge option={isOverdue(inv) ? OVERDUE : findOption(INVOICE_STATUSES, inv.status)} />
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-slate-500">No invoices linked.</p>
            )}
          </Card>
          {isOwner && (
            <Card title="Danger zone">
              <InlineAction
                action={deleteProject}
                hidden={{ id: project.id }}
                label="Delete project"
                variant="danger"
                confirm="Delete this project and its tasks permanently? This can't be undone."
              />
            </Card>
          )}
        </div>
      </div>
    </>
  );
}
