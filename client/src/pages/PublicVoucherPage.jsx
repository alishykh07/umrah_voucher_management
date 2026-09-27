import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import VoucherDocument from '../components/VoucherDocument';
import { getPublicVoucher } from '../services/api';

export default function PublicVoucherPage() {
  const { companySlug, token } = useParams();
  const [voucher, setVoucher] = useState();
  const [qr, setQr] = useState();
  const [error, setError] = useState('');
  const [fitView, setFitView] = useState(true);
  const [fit, setFit] = useState({ scale: 1, height: 'auto' });
  const stageRef = useRef(null);

  useEffect(() => {
    getPublicVoucher(companySlug, token)
      .then((result) => { setVoucher(result.voucher); setQr(result.qrCode); })
      .catch((requestError) => setError(requestError.message || 'Voucher could not be verified.'));
  }, [companySlug, token]);

  useEffect(() => {
    if (!voucher || !stageRef.current) return undefined;
    const stage = stageRef.current;
    let frame;
    const updateFit = () => {
      const mobile = window.matchMedia('(max-width: 700px)').matches;
      const document = stage.querySelector('.voucher-document');
      if (!mobile || !fitView || !document) { setFit({ scale: 1, height: 'auto' }); return; }
      const availableWidth = Math.max(1, window.innerWidth - 24);
      const availableHeight = Math.max(320, window.innerHeight - 118);
      const scale = Math.min(1, availableWidth / document.offsetWidth, availableHeight / document.offsetHeight);
      setFit({ scale: Number(scale.toFixed(3)), height: `${Math.ceil(document.offsetHeight * scale)}px` });
    };
    const schedule = () => { cancelAnimationFrame(frame); frame = requestAnimationFrame(updateFit); };
    const observer = new ResizeObserver(schedule);
    observer.observe(stage);
    window.addEventListener('resize', schedule);
    schedule();
    return () => { cancelAnimationFrame(frame); observer.disconnect(); window.removeEventListener('resize', schedule); };
  }, [voucher, fitView]);

  if (error) return <main className="public-voucher-state error"><h1>Voucher unavailable</h1><p>{error}</p></main>;
  if (!voucher) return <main className="public-voucher-state">Verifying secure Umrah voucher...</main>;

  return <main className="public-voucher-page">
    <div className="public-voucher-tools">
      <span>Secure Umrah Voucher</span>
      <div><button className="fit-toggle" onClick={() => setFitView((value) => !value)}>{fitView ? 'Read Details' : 'Fit Full Voucher'}</button><button onClick={() => window.print()}>Print Voucher</button></div>
    </div>
    <div ref={stageRef} className={`public-voucher-stage ${fitView ? 'fit-view' : ''}`} style={fitView ? { '--voucher-fit-scale': fit.scale, height: fit.height } : undefined}>
      <div className="public-voucher-canvas"><VoucherDocument voucher={voucher} qrCode={qr} className="public-document" /></div>
    </div>
  </main>;
}