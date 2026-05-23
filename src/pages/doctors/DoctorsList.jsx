import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { listDoctors, deleteDoctor, doctorFullName } from '../../api/doctors';
import { mediaUrl } from '../../utils/mediaUrl';
import { formatDate } from '../../utils/validation';
import Alert from '../../components/Alert';
import ConfirmDialog from '../../components/ConfirmDialog';

export default function DoctorsList() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await listDoctors(0, 100);
      setDoctors(data);
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
      await deleteDoctor(deleteId);
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
          <h1>Врачи</h1>
          <p className="muted">{doctors.length} записей</p>
        </div>
        <Link to="/doctors/new" className="btn btn-primary">
          + Добавить врача
        </Link>
      </header>

      <Alert type="error">{error}</Alert>

      {loading ? (
        <div className="page-center">
          <div className="spinner" />
        </div>
      ) : doctors.length === 0 ? (
        <div className="empty-state">
          <p>Врачей пока нет</p>
          <Link to="/doctors/new" className="btn btn-primary">
            Добавить первого врача
          </Link>
        </div>
      ) : (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Фото</th>
                <th>ФИО</th>
                <th>Должность</th>
                <th>Обновлён</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {doctors.map((d) => (
                <tr key={d.id}>
                  <td>
                    {d.avatar_url ? (
                      <img src={mediaUrl(d.avatar_url)} alt="" className="avatar-thumb" />
                    ) : (
                      <span className="avatar-placeholder">—</span>
                    )}
                  </td>
                  <td>
                    <strong>{doctorFullName(d)}</strong>
                  </td>
                  <td>{d.position}</td>
                  <td className="muted">{formatDate(d.updated_at)}</td>
                  <td className="actions-cell">
                    <Link to={`/doctors/${d.id}/edit`} className="btn btn-ghost btn-sm">
                      Изменить
                    </Link>
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm text-danger"
                      onClick={() => setDeleteId(d.id)}
                    >
                      Удалить
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmDialog
        open={Boolean(deleteId)}
        title="Удалить врача?"
        message="Запись будет удалена без возможности восстановления."
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
        loading={deleting}
      />
    </div>
  );
}
