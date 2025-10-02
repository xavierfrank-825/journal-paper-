import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import PaperViewer from './PaperViewer';
import { getPapers } from '../../utils/api';
import './UserDashboard.css';

const UserDashboard = () => {
    const { user, logout } = useAuth();
    const [htmlContent, setHtmlContent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [papers, setPapers] = useState([]);
    const [selectedPaper, setSelectedPaper] = useState(0);

    useEffect(() => {
        async function fetchPapers() {
            try {
                setLoading(true);
                setError(null);
                
                const fetchedPapers = await getPapers();
                
                if (fetchedPapers && fetchedPapers.length > 0) {
                    setPapers(fetchedPapers);
                    setHtmlContent(fetchedPapers[0].htmlContent || "<p>No content available</p>");
                } else {
                    setHtmlContent("<div class='no-content'><h3>No Papers Found</h3><p>You don't have any papers yet. Upload your first paper to get started!</p></div>");
                }
            } catch (err) {
                console.error('Failed to load papers:', err);
                setError('Failed to load paper content. Please try again.');
                setHtmlContent("<div class='error-content'><h3>Error Loading Content</h3><p>There was an error loading your papers. Please refresh the page or contact support.</p></div>");
            } finally {
                setLoading(false);
            }
        }
        
        fetchPapers();
    }, []);

    const handlePaperChange = (paperIndex) => {
        if (papers[paperIndex]) {
            setSelectedPaper(paperIndex);
            setHtmlContent(papers[paperIndex].htmlContent || "<p>No content available</p>");
        }
    };

    const handleRefresh = () => {
        window.location.reload();
    };

    return (
        <div className="user-dashboard">
            <nav className="dashboard-nav">
                <div className="nav-container">
                    <div className="nav-content">
                        <h1 className="nav-title">📄 MANUSCRIPT</h1>
                        <div className="nav-controls">
                            <span className="welcome-text">Welcome, <strong>{user.username}</strong></span>
                            <button onClick={logout} className="logout-btn">
                                🚪 Logout
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            <div className="dashboard-content">
                {/* Paper Selection Bar */}
                {papers.length > 1 && (
                    <div className="paper-selection-bar">
                        <div className="selection-header">
                            <h3>📚 Papers ({papers.length})</h3>
                        </div>
                        <div className="paper-tabs">
                            {papers.map((paper, index) => (
                                <button
                                    key={index}
                                    className={`paper-tab ${selectedPaper === index ? 'active' : ''}`}
                                    onClick={() => handlePaperChange(index)}
                                >
                                    <span className="tab-number">{index + 1}</span>
                                    <span className="tab-title">
                                        {paper.title || `Paper ${index + 1}`}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Error State */}
                {error && (
                    <div className="error-banner">
                        <div className="error-content">
                            <span className="error-icon">⚠️</span>
                            <span className="error-text">{error}</span>
                            <button onClick={handleRefresh} className="retry-btn">
                                🔄 Retry
                            </button>
                        </div>
                    </div>
                )}

                {/* Main Content */}
                <div className="dashboard-grid">
                    <div className="dashboard-card">
                        {loading ? (
                            <div className="loading-content">
                                <div className="loading-spinner"></div>
                                <p>Loading your papers...</p>
                                <small>This might take a few moments</small>
                            </div>
                        ) : (
                            <PaperViewer 
                                htmlContent={htmlContent} 
                                paperTitle={papers[selectedPaper]?.title}
                                paperMetadata={papers[selectedPaper]?.metadata}
                            />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserDashboard;