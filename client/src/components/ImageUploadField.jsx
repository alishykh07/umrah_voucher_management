import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faImage, faSpinner, faUpload } from '@fortawesome/free-solid-svg-icons';
import { uploadImage } from '../services/api';

export default function ImageUploadField({ label, value, onChange, help = 'JPG, PNG or WEBP • Max 5 MB', className = '', folder = 'misc' }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const choose = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploading(true); setError('');
    try { onChange((await uploadImage(file, folder)).url); } catch (requestError) { setError(requestError.message || 'Image upload failed.'); } finally { setUploading(false); event.target.value = ''; }
  };
  return <div className={`image-upload-field ${className}`}><span>{label}</span><div className="image-upload-control">{value ? <img src={value} alt="Selected upload" /> : <FontAwesomeIcon icon={faImage} />}<label className="image-upload-button"><input type="file" accept="image/png,image/jpeg,image/webp" onChange={choose} disabled={uploading} />{uploading ? <><FontAwesomeIcon icon={faSpinner} spin /> Uploading...</> : <><FontAwesomeIcon icon={faUpload} /> Choose Image</>}</label>{value && <button type="button" onClick={() => onChange('')}>Remove</button>}</div><small>{error || help}</small></div>;
}