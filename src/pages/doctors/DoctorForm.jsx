import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  getDoctor,
  createDoctorMultipart,
  createDoctorJson,
  updateDoctorMultipart,
  updateDoctorJson,
} from '../../api/doctors';
import { mediaUrl } from '../../utils/mediaUrl';
import { validateImageFile } from '../../utils/validation';
import Alert from '../../components/Alert';

const empty = {
  first_name: '',
  last_name: '',
  patronymic: '',
  position: '',
  description: '',
  avatar_url: '',
};

export default function DoctorForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [form, setForm] = useState(empty);
  const [avatarFile, setAvatarFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [useMultipart, setUseMultipart] = useState(true);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isEdit) return;

    (async () => {
      try {
        const d = await getDoctor(id);
        setForm({
          first_name: d.first_name,
          last_name: d.last_name,
          patronymic: d.patronymic || '',
          position: d.position,
          description: d.description || '',
          avatar_url: d.avatar_url || '',
        });
        setPreview(d.avatar_url ? mediaUrl(d.avatar_url) : '');
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [id, isEdit]);

  function updateField(name, value) {
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) {
      setAvatarFile(null);
      return;
    }
    const fileError = validateImageFile(file);
    if (fileError) {
      setError(fileError);
      e.target.value = '';
      return;
    }
    setError('');
    setAvatarFile(file);
    setUseMultipart(true);
    setPreview(URL.createObjectURL(file));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSaving(true);

    try {
      if (useMultipart && (avatarFile || !isEdit)) {
        const fd = new FormData();
        fd.append('first_name', form.first_name.trim());
        fd.append('last_name', form.last_name.trim());
        fd.append('position', form.position.trim());
        if (form.patronymic.trim()) fd.append('patronymic', form.patronymic.trim());
        if (form.description.trim()) fd.append('description', form.description.trim());
        if (avatarFile) {
          fd.append('avatar', avatarFile);
        } else if (form.avatar_url.trim()) {
          fd.append('avatar_url', form.avatar_url.trim());
        }

        if (isEdit) {
          await updateDoctorMultipart(id, fd);
        } else {
          await createDoctorMultipart(fd);
        }
      } else {
        const payload = {
          first_name: form.first_name.trim(),
          last_name: form.last_name.trim(),
          position: form.position.trim(),
          patronymic: form.patronymic.trim() || null,
          description: form.description.trim() || null,
        };
        if (form.avatar_url.trim()) {
          payload.avatar_url = form.avatar_url.trim();
        }

        if (isEdit) {
          await updateDoctorJson(id, payload);
        } else {
          await createDoctorJson(payload);
        }
      }

      navigate('/doctors');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="page-center">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <Link to="/doctors" className="back-link">
            ← К списку
          </Link>
          <h1>{isEdit ? 'Редактирование врача' : 'Новый врач'}</h1>
        </div>
      </header>

      <Alert type="error">{error}</Alert>

      <form onSubmit={handleSubmit} className="form-card">
        <div className="form-grid">
          <label className="field">
            <span>Фамилия *</span>
            <input
              value={form.last_name}
              onChange={(e) => updateField('last_name', e.target.value)}
              required
              maxLength={100}
            />
          </label>

          <label className="field">
            <span>Имя *</span>
            <input
              value={form.first_name}
              onChange={(e) => updateField('first_name', e.target.value)}
              required
              maxLength={100}
            />
          </label>

          <label className="field">
            <span>Отчество</span>
            <input
              value={form.patronymic}
              onChange={(e) => updateField('patronymic', e.target.value)}
              maxLength={100}
            />
          </label>

          <label className="field field-wide">
            <span>Должность *</span>
            <input
              value={form.position}
              onChange={(e) => updateField('position', e.target.value)}
              required
              maxLength={255}
              placeholder="Стоматолог-терапевт"
            />
          </label>

          <label className="field field-wide">
            <span>Описание</span>
            <textarea
              value={form.description}
              onChange={(e) => updateField('description', e.target.value)}
              rows={5}
            />
          </label>
        </div>

        <fieldset className="fieldset">
          <legend>Фото</legend>

          {preview && (
            <div className="image-preview">
              <img src={preview} alt="Превью" />
            </div>
          )}

          <label className="field">
            <span>Загрузить файл (JPEG, PNG, WebP, GIF, до 5 MB)</span>
            <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={handleFileChange} />
          </label>

          <label className="field">
            <span>Или URL / путь (avatar_url)</span>
            <input
              value={form.avatar_url}
              onChange={(e) => {
                updateField('avatar_url', e.target.value);
                setUseMultipart(false);
                if (e.target.value) setPreview(mediaUrl(e.target.value));
              }}
              placeholder="/uploads/doctors/....jpg"
            />
          </label>

          {isEdit && (
            <label className="checkbox">
              <input
                type="checkbox"
                checked={useMultipart}
                onChange={(e) => setUseMultipart(e.target.checked)}
              />
              Отправить multipart (с файлом или form-полями)
            </label>
          )}
        </fieldset>

        <div className="form-actions">
          <Link to="/doctors" className="btn btn-ghost">
            Отмена
          </Link>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Сохранение…' : isEdit ? 'Сохранить' : 'Создать'}
          </button>
        </div>
      </form>
    </div>
  );
}
