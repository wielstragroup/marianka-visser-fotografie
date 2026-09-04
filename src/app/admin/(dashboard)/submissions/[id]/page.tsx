import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Mail, Phone, Calendar, Clock, MessageCircleQuestion } from "lucide-react";
import { PageHeader } from "@/components/admin/PageHeader";
import { Notice } from "@/components/admin/Notice";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { SubmitButton } from "@/components/admin/SubmitButton";
import { getSubmissionById } from "@/lib/data/admin";
import { formatDate, formatDateTime } from "@/lib/utils";
import { STATUS_LABELS, STATUS_OPTIONS } from "@/lib/constants/submissions";
import { updateSubmissionStatus, deleteSubmission } from "../actions";

export const metadata: Metadata = { title: "Aanvraag" };

function Field({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3">
      <Icon size={16} className="mt-0.5 shrink-0 text-brown" />
      <div>
        <p className="text-xs text-ink-soft">{label}</p>
        <p className="text-sm text-ink">{value}</p>
      </div>
    </div>
  );
}

export default async function SubmissionDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ notice?: string; type?: string }>;
}) {
  const { id } = await params;
  const { notice, type } = await searchParams;
  const submission = await getSubmissionById(id);

  if (!submission) notFound();

  const boundUpdateStatus = updateSubmissionStatus.bind(null, id);
  const boundDelete = deleteSubmission.bind(null, id);

  return (
    <div>
      <PageHeader
        title={submission.name}
        description={`Aanvraag ontvangen op ${formatDateTime(submission.created_at)}`}
        action={<DeleteButton action={boundDelete} confirmMessage="Weet je zeker dat je deze aanvraag wilt verwijderen?" />}
      />
      <Notice notice={notice} type={type} />

      <div className="grid gap-8 lg:grid-cols-[1.3fr_1fr]">
        <div className="space-y-5 rounded-sm border border-line bg-paper p-6">
          <Field icon={Mail} label="E-mail" value={submission.email} />
          <Field icon={Phone} label="Telefoon" value={submission.phone} />
          <Field
            icon={Calendar}
            label="Gewenste datum"
            value={submission.desired_date ? formatDate(submission.desired_date) : null}
          />
          <Field icon={Clock} label="Beschikbaarheid" value={submission.availability_preference} />
          <Field icon={MessageCircleQuestion} label="Hoe gevonden" value={submission.how_found} />
          <Field icon={Mail} label="Shoot" value={submission.shoot_name_snapshot} />

          {submission.message && (
            <div className="border-t border-line pt-5">
              <p className="mb-2 text-xs font-medium tracking-[0.2em] text-brown uppercase">Bericht</p>
              <p className="whitespace-pre-line text-sm leading-relaxed text-ink">{submission.message}</p>
            </div>
          )}
        </div>

        <form action={boundUpdateStatus} className="h-fit space-y-4 rounded-sm border border-line bg-paper p-6">
          <p className="text-xs font-medium tracking-[0.2em] text-brown uppercase">Status</p>
          <select
            name="status"
            defaultValue={submission.status}
            className="w-full rounded-sm border border-line bg-paper px-4 py-3 text-sm text-ink focus:border-brown focus:outline-none focus:ring-1 focus:ring-brown"
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {STATUS_LABELS[s]}
              </option>
            ))}
          </select>
          <SubmitButton className="w-full">Status bijwerken</SubmitButton>
        </form>
      </div>
    </div>
  );
}
