// frontend/src/components/Admin/ManagePapers.js
import React, { useEffect, useState } from 'react';
import { getPapers, deletePaper } from '../../utils/api'; // ✅ FIXED
// import './ManagePapers.css';


const ManagePapers = () => {
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    fetchPapers();
  }, []);

  const fetchPapers = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await getPapers();
      console.log('📦 ManagePapers - Raw getPapers() response:', response);

      let data = [];

      if (Array.isArray(response)) {
        data = response;
      } else if (Array.isArray(response?.papers)) {
        data = response.papers;
      } else if (Array.isArray(response?.data)) {
        data = response.data;
      } else {
        throw new Error('Invalid response format. Expected an array.');
      }

      setPapers(data);
    } catch (err) {
      console.error('❌ Error in ManagePapers:', err);
      setError(`Failed to fetch papers: ${err.message}`);
      setPapers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (paperId) => {
    if (!window.confirm('Are you sure you want to delete this paper?')) return;

    try {
      setDeletingId(paperId);
      await deletePaper(paperId); // ✅ FIXED
      setPapers((prev) => prev.filter(p => (p.id || p._id) !== paperId));
    } catch (err) {
      console.error('❌ Error deleting paper:', err);
      alert('Failed to delete paper.');
    } finally {
      setDeletingId(null);
    }
  };

  const handleEdit = (paper) => {
    alert(`Edit functionality for "${paper.title}" not yet implemented.`);
  };

  const handleView = (paper) => {
    alert(`Viewing paper: \n\n${JSON.stringify(paper, null, 2)}`);
  };

  if (loading) {
    return <div>Loading papers...</div>;
  }

  if (error) {
    return (
      <div>
        <p>{error}</p>
        <button onClick={fetchPapers}>Retry</button>
      </div>
    );
  }

  return (
    <div className="manage-papers">
      <h2>Manage Papers ({papers.length})</h2>
      {papers.length === 0 ? (
        <p>No papers found.</p>
      ) : (
        <ul className="paper-list-admin">
          {papers.map((paper) => {
            const paperId = paper.id || paper._id;

            return (
              <li key={paperId} className="paper-item-admin">
                <div className="paper-info">
                  <strong>{paper.title || 'Untitled Paper'}</strong> (ID: {paperId})
                </div>
                <div className="paper-actions">
                  <button onClick={() => handleView(paper)}>👁 View</button>
                  <button onClick={() => handleEdit(paper)}>✏️ Edit</button>
                  <button
                    onClick={() => handleDelete(paperId)}
                    disabled={deletingId === paperId}
                    className="delete-btn"
                  >
                    {deletingId === paperId ? 'Deleting...' : '🗑 Delete'}
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default ManagePapers;
