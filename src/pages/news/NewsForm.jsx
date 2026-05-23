import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  getNewsItem,
  createNewsMultipart,
  createNewsJson,
  updateNewsMultipart,
  updateNewsJson,
} from '../../api/news';
import { mediaUrl } from '../../utils/mediaUrl';
import { validateImageFile } from '../../utils/validation';
import Alert from '../../components/Alert';

const empty = {
  title: '',
  description: '',
  image: '',
};

export default function NewsForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [form, setForm] = useState(empty);
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [useMultipart, setUseMultipart] = useState(true);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isEdit) return;

    (async () => {
      try {
        const n = await getNewsItem(id);
        setForm({
          title: n.title,
          description: n.description,
          image: n.image || '',
        });
        setPreview(n.image ? mediaUrl(n.image) : '');
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
      setImageFile(null);
      return;
    }
    const fileError = validateImageFile(file);
    if (fileError) {
      setError(fileError);
      e.target.value = '';
      return;
    }
    setError('');
    setImageFile(file);
    setUseMultipart(true);
    setPreview(URL.createObjectURL(file));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSaving(true);

    try {
      if (useMultipart && (imageFile || !isEdit)) {
        const fd = new FormData();
        fd.append('title', form.title.trim());
        fd.append('description', form.description.trim());
        if (imageFile) {
          fd.append('image', imageFile);
        } else if (form.image.trim()) {
          fd.append('image_url', form.image.trim());
        }

        if (isEdit) {
          await updateNewsMultipart(id, fd);
        } else {
          await createNewsMultipart(fd);
        }
      } else {
        const payload = {
          title: form.title.trim(),
          description: form.description.trim(),
        };
        if (form.image.trim()) {
          payload.image = form.image.trim();
        }

        if (isEdit) {
          await updateNewsJson(id, payload);
        } else {
          await createNewsJson(payload);
        }
      }

      navigate('/news');
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
          <Link to="/news" className="back-link">
            ← К списку
          </Link>
          <h1>{isEdit ? 'Редактирование новости' : 'Новая новость'}</h1>
        </div>
      </header>

      <Alert type="error">{error}</Alert>

      <form onSubmit={handleSubmit} className="form-card">
        <label className="field">
          <span>Заголовок *</span>
          <input
            value={form.title}
            onChange={(e) => updateField('title', e.target.value)}
            required
            maxLength={255}
          />
        </label>

        <label className="field">
          <span>Текст *</span>
          <textarea
            value={form.description}
            onChange={(e) => updateField('description', e.target.value)}
            required
            rows={8}
          />
        </label>

        <fieldset className="fieldset">
          <legend>Изображение</legend>

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
            <span>Или URL / путь (поле image в JSON)</span>
            <input
              value={form.image}
              onChange={(e) => {
                updateField('image', e.target.value);
                setUseMultipart(false);
                if (e.target.value) setPreview(mediaUrl(e.target.value));
              }}
              placeholder="/uploads/news/....jpg"
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
          <Link to="/news" className="btn btn-ghost">
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
