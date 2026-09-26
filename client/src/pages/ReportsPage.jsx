import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarDays, faChartBar, faCheck, faClock, faDownload, faEye, faFileLines, faSearch, faTicket, faXmark } from '@fortawesome/free-solid-svg-icons';
import { downloadVoucherPdf, getReportPdf, getVouchers } from '../services/api';

const formatDate = (value) => value ? new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(value)) : 'Not provided';
const toInputDate = (value) => new Date(value).toISOString().slice(0, 10);
const csvCell = (value) => '"' + String(value || '').replaceAll('"', '""') + '"';
const initials = (name) => String(name || 'C').split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase();

export default function ReportsPage() {
  const navigate = useNavigate();
  const now = new Date();
  const monthStart = toInputDate(new Date(now.getFullYear(), now.getMonth(), 1));
  const monthEnd = toInputDate(new Date(now.getFullYear(), now.getMonth() + 1, 0));
  const [range, setRange] = useState({ startDate: monthStart, endDate: monthEnd });
  const [vouchers, setVouchers] = useState([]);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [pdfPreview, setPdfPreview] = useState('');
  const [pdfLoading, setPdfLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    getVouchers({ ...range, limit: 100 }).then((result) => { setVouchers(result.vouchers || []); setError(''); }).catch((item) => setError(item.message || 'Unable to load report data.')).finally(() => setLoading(false));
  }, [range.startDate, range.endDate]);

  const chooseMonth = (offset) => {
    const base = new Date(now.getFullYear(), now.getMonth() + offset, 1);
    setRange({ startDate: toInputDate(base), endDate: toInputDate(new Date(base.getFullYear(), base.getMonth() + 1, 0)) });
  };
  const totals = useMemo(() => ({ total: vouchers.length, approved: vouchers.filter((item) => item.status === 'APPROVED').length, cancelled: vouchers.filter((item) => item.status === 'CANCELLED').length, expired: vouchers.filter((item) => item.status === 'EXPIRED').length, draft: vouchers.filter((item) => item.status === 'DRAFT').length }), [vouchers]);
  const companies = useMemo(() => Object.values(vouchers.reduce((all, item) => { const name = item.company?.name || 'Unassigned'; all[name] = all[name] || { name, total: 0 }; all[name].total += 1; return all; }, {})).sort((a, b) => b.total - a.total).slice(0, 5), [vouchers]);
  const filtered = useMemo(() => vouchers.filter((item) => [item.voucherNo, item.customer?.name, item.company?.name].join(' ').toLowerCase().includes(search.toLowerCase())), [vouchers, search]);
  const percent = (value) => totals.total ? Math.round(value / totals.total * 100) : 0;
  const reportFilename = 'Voucher-Report-' + new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(new Date(range.startDate + 'T00:00:00')).replace(/\s+/g, '-') + '.pdf';
  const previewReport = async () => {
    try {
      setPdfLoading(true);
      if (pdfPreview) URL.revokeObjectURL(pdfPreview);
      setPdfPreview(await getReportPdf(range));
    } catch (requestError) {
      setError(requestError.message || 'Unable to generate report PDF.');
    } finally {
      setPdfLoading(false);
    }
  };
  const closePreview = () => { if (pdfPreview) URL.revokeObjectURL(pdfPreview); setPdfPreview(''); };
  const downloadReport = () => { const link = document.createElement('a'); link.href = pdfPreview; link.download = reportFilename; link.click(); };
  return <section className="reports-page">
    <header className="reports-heading"><div><h1><FontAwesomeIcon icon={faChartBar} /> Reports</h1><p>View detailed reports, analytics and voucher performance insights.</p></div><div className="reports-controls"><label><FontAwesomeIcon icon={faCalendarDays} /><input type="date" value={range.startDate} max={range.endDate} onChange={(event) => setRange((current) => ({ ...current, startDate: event.target.value }))} /></label><span>to</span><label><input type="date" value={range.endDate} min={range.startDate} onChange={(event) => setRange((current) => ({ ...current, endDate: event.target.value }))} /></label><button onClick={() => chooseMonth(0)}>This Month</button><button onClick={() => chooseMonth(-1)}>Last Month</button><button className="reports-export" disabled={!filtered.length || pdfLoading} onClick={previewReport}><FontAwesomeIcon icon={faFileLines} /> {pdfLoading ? 'Generating PDF...' : 'Preview Report PDF'}</button></div></header>
    {error && <div className="reports-error">{error}<button onClick={() => setError('')}><FontAwesomeIcon icon={faXmark} /></button></div>}
    <section className="reports-metrics"><Metric icon={faTicket} title="Total Vouchers" value={totals.total} tone="blue" /><Metric icon={faCheck} title="Approved Vouchers" value={totals.approved} tone="green" /><Metric icon={faXmark} title="Cancelled Vouchers" value={totals.cancelled} tone="red" /><Metric icon={faClock} title="Expired Vouchers" value={totals.expired} tone="purple" /></section>
    <section className="reports-grid">
      <article className="reports-chart"><header><div><h2>Voucher Trend</h2><p>Selected period summary</p></div><span>{formatDate(range.startDate)} – {formatDate(range.endDate)}</span></header><div className="trend-summary"><div><b>{totals.total}</b><small>Total</small></div><div><b>{totals.approved}</b><small>Approved</small></div><div><b>{totals.draft}</b><small>Draft</small></div><div><b>{totals.cancelled}</b><small>Cancelled</small></div></div></article>
      <article className="reports-company"><header><h2>Vouchers by Company</h2><span>{companies.length} companies</span></header>{companies.length ? companies.map((item, index) => <div className="report-company-row" key={item.name}><b>{item.name}</b><span><i className={'tone-' + index} style={{ width: (item.total / Math.max(...companies.map((row) => row.total))) * 100 + '%' }} /></span><strong>{item.total}</strong></div>) : <p className="reports-empty">No company data in this range.</p>}</article>
      <article className="reports-status"><h2>Voucher Status</h2><div className="report-donut" style={{ background: totals.total ? 'conic-gradient(#16b978 0 ' + percent(totals.approved) + '%, #ffb641 ' + percent(totals.approved) + '% ' + (percent(totals.approved) + percent(totals.draft)) + '%, #f34d62 ' + (percent(totals.approved) + percent(totals.draft)) + '% ' + (percent(totals.approved) + percent(totals.draft) + percent(totals.cancelled)) + '%, #914ce6 ' + (percent(totals.approved) + percent(totals.draft) + percent(totals.cancelled)) + '% 100%)' : '#edf3fb' }}><b>{totals.total}</b><small>Total</small></div><div className="report-legend"><span><i className="approved" />Approved <b>{totals.approved} ({percent(totals.approved)}%)</b></span><span><i className="draft" />Draft <b>{totals.draft} ({percent(totals.draft)}%)</b></span><span><i className="cancelled" />Cancelled <b>{totals.cancelled} ({percent(totals.cancelled)}%)</b></span><span><i className="expired" />Expired <b>{totals.expired} ({percent(totals.expired)}%)</b></span></div></article>
    </section>
    <section className="reports-table"><header><div><h2><FontAwesomeIcon icon={faFileLines} /> Recent Reports</h2><p>Vouchers matching your selected date range.</p></div><label><FontAwesomeIcon icon={faSearch} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search voucher no, customer, company..." /></label></header><div className="reports-scroll"><table><thead><tr><th>#</th><th>Voucher No</th><th>Customer</th><th>Company</th><th>Status</th><th>Voucher Date</th><th>Last Activity</th><th>Actions</th></tr></thead><tbody>{filtered.slice(0, 30).map((item, index) => <tr key={item._id}><td>{index + 1}</td><td><b>{item.voucherNo}</b></td><td><i className="report-avatar">{initials(item.customer?.name)}</i>{item.customer?.name || 'Not provided'}</td><td>{item.company?.name || 'Not provided'}</td><td><em className={String(item.status || '').toLowerCase()}>{item.status}</em></td><td>{formatDate(item.voucherDate)}</td><td>{formatDate(item.updatedAt)}</td><td><button title="View voucher" onClick={() => navigate('/admin/vouchers/' + item._id + '/preview')}><FontAwesomeIcon icon={faEye} /></button><button title="Download PDF" onClick={() => downloadVoucherPdf(item._id, item.voucherNo)}><FontAwesomeIcon icon={faDownload} /></button></td></tr>)}{loading && <tr><td colSpan="8" className="reports-empty">Loading report data...</td></tr>}{!loading && !filtered.length && <tr><td colSpan="8" className="reports-empty">No vouchers found for this date range.</td></tr>}</tbody></table></div><footer>Showing {Math.min(filtered.length, 30)} of {filtered.length} vouchers · {formatDate(range.startDate)} to {formatDate(range.endDate)}</footer></section>
    {pdfPreview && <div className="report-pdf-backdrop"><section className="report-pdf-modal"><header><div><span>REPORT PREVIEW</span><h2>{reportFilename}</h2><p>{formatDate(range.startDate)} to {formatDate(range.endDate)}</p></div><button onClick={closePreview}><FontAwesomeIcon icon={faXmark} /></button></header><iframe title="Report PDF preview" src={pdfPreview} /><footer><button onClick={closePreview}>Close</button><button className="download" onClick={downloadReport}><FontAwesomeIcon icon={faDownload} /> Download PDF</button></footer></section></div>}  </section>;
}
function Metric({ icon, title, value, tone }) { return <article className={tone}><i><FontAwesomeIcon icon={icon} /></i><span>{title}</span><b>{value}</b><small>Selected date range</small></article>; }