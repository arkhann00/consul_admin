import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { listNews, deleteNews } from '../../api/news';
import { mediaUrl } from '../../utils/mediaUrl';
import { formatDate } from '../../utils/validation';
import Alert from '../../components/Alert';
import ConfirmDialog from '../../components/ConfirmDialog';

export default function NewsList() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await listNews(0, 100);
      setItems(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleDelete() {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await deleteNews(deleteId);
      setDeleteId(null);
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h1>Новости</h1>
          <p className="muted">{items.length} записей · новые сверху</p>
        </div>
        <Link to="/news/new" className="btn btn-primary">
          + Добавить новость
        </Link>
      </header>

      <Alert type="error">{error}</Alert>

      {loading ? (
        <div className="page-center">
          <div className="spinner" />
        </div>
      ) : items.length === 0 ? (
        <div className="empty-state">
          <p>Новостей пока нет</p>
          <Link to="/news/new" className="btn btn-primary">
            Добавить первую новость
          </Link>
        </div>
      ) : (
        <div className="news-grid">
          {items.map((n) => (
            <article key={n.id} className="news-card">
              {n.image && (
                <img src={mediaUrl(n.image)} alt="" className="news-card-image" />
              )}
              <div className="news-card-body">
                <time className="muted">{formatDate(n.created_at)}</time>
                <h2>{n.title}</h2>
                <p className="news-excerpt">
                  {n.description.length > 120 ? `${n.description.slice(0, 120)}…` : n.description}
                </p>
                <div className="news-card-actions">
                  <Link to={`/news/${n.id}/edit`} className="btn btn-ghost btn-sm">
                    Изменить
                  </Link>
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm text-danger"
                    onClick={() => setDeleteId(n.id)}
                  >
                    Удалить
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={Boolean(deleteId)}
        title="Удалить новость?"
        message="Запись будет удалена без возможности восстановления."
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
        loading={deleting}
      />
    </div>
  );
}
