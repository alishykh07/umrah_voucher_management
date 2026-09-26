import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import VoucherDocument from '../components/VoucherDocument';
import { getPublicVoucher } from '../services/api';

export default function PublicVoucherPage() {
  const { companySlug, token } = useParams(); const [voucher, setVoucher] = useState(); const [qr, setQr] = useState(); const [error, setError] = useState('');
  useEffect(() => { getPublicVoucher(companySlug, token).then((result) => { setVoucher(result.voucher); setQr(result.qrCode); }).catch((requestError) => setError(requestError.message || 'Voucher could not be verified.')); }, [companySlug, token]);
  if (error) return <main className="public-voucher-state error"><h1>Voucher unavailable</h1><p>{error}</p></main>;
  if (!voucher) return <main className="public-voucher-state">Verifying secure Umrah voucher...</main>;
  return <main className="public-voucher-page"><div className="public-voucher-tools"><span>Secure Umrah Voucher</span><button onClick={() => window.print()}>Print Voucher</button></div><VoucherDocument voucher={voucher} qrCode={qr} className="public-document" /></main>;
}
