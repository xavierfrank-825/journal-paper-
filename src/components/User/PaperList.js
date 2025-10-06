// frontend/src/components/User/PaperList.js
import React, { useState, useEffect } from 'react';
import { getPapers } from '../../utils/api';
import './PaperList.css';

const PaperList = ({ onSelectPaper, selectedPaper }) => {
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPapers();
  }, []);

  const fetchPapers = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await getPapers();
      console.log('📦 Raw getPapers() response:', response);

      // Normalize the data into an array
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
      console.error('❌ Error fetching papers:', err);
      setError(`Failed to fetch papers: ${err.message}`);
      setPapers([]); // fallback to empty array to prevent .map error
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="paper-list">
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading papers...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="paper-list">
        <div className="error">
          <p>{error}</p>
          <button onClick={fetchPapers} className="retry-btn">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="paper-list">
      <div className="paper-list-header">
        <h3>Available Papers ({papers.length})</h3>
        <button onClick={fetchPapers} className="refresh-btn" title="Refresh">
          ↻
        </button>
      </div>

      {papers.length === 0 ? (
        <div className="no-papers">
          <p>No papers available in database</p>
          <p className="debug-info">Check API connection and database</p>
        </div>
      ) : (
        <div className="papers-container">
          {papers.map((paper) => (
            <div
              key={paper.id || paper._id || Math.random()}
              className={`paper-item ${selectedPaper?.id === paper.id ? 'selected' : ''}`}
              onClick={() => onSelectPaper(paper)}
            >
              <div className="paper-title">{paper.title || 'Untitled Paper'}</div>
              <div className="paper-meta">
                <span className="paper-id">ID: {paper.id || paper._id}</span>
                <span className="paper-date">
                  {paper.created_at ? new Date(paper.created_at).toLocaleDateString() : ''}
                </span>
              </div>
              {paper.filename && <div className="paper-filename">{paper.filename}</div>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PaperList;
