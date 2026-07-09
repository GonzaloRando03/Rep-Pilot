import "./KpiCard.css";

interface KpiCardProps {
  label: string;
  value: string;
  meta: string;
  loading?: boolean;
}

export function KpiCard({ label, value, meta, loading = false }: KpiCardProps) {
  return (
    <article className={`kpi-card${loading ? " kpi-card--loading" : ""}`}>
      <p className="kpi-label">{label}</p>
      <p className="kpi-value" aria-busy={loading}>
        {loading ? <span className="kpi-skeleton" aria-hidden /> : value}
      </p>
      <p className="kpi-meta">{meta}</p>
    </article>
  );
}
