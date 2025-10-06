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

    // Show only white screen with loading spinner during initial load
    if (loading) {
        return (
            <div className="loading-fullscreen">
                <div className="spinner"></div>
                <h2>Loading your papers...</h2>
                <p>This might take a few moments</p>
            </div>
        );
    }

    return (
        <div className="user-dashboard">
            {/* Fixed Top Header */}
            <header className="top-header">
                <div className="header-container">
                    <div className="header-left">
                        <span className="date-badge">Friday, Oct 03, 2025</span>
                        <span className="divider">|</span>
                        <span className="edition-badge">TODAY'S PAPER</span>
                    </div>
                    
                    <div className="header-center">
                        <h1 className="site-logo">
                            The <span className="logo-highlight">MANUSCRIPT</span>
                        </h1>
                        <p className="site-tagline">JOURNALISM OF COURAGE</p>
                    </div>
                    
                    <div className="header-right">
                        <button className="btn-subscribe">Subscribe</button>
                        <button className="btn-signin" onClick={logout}>Sign In</button>
                    </div>
                </div>
            </header>

            {/* Navigation Bar */}
            <nav className="main-navigation">
                <div className="nav-container">
                    <div className="nav-tabs">
                        {papers.length > 0 ? (
                            papers.map((paper, index) => (
                                <button
                                    key={index}
                                    className={`nav-tab ${selectedPaper === index ? 'active' : ''}`}
                                    onClick={() => handlePaperChange(index)}
                                >
                                    {paper.title || `Paper ${index + 1}`}
                                </button>
                            ))
                        ) : (
                            <>
                                <button className="nav-tab active">PAPER 1</button>
                                <button className="nav-tab">PAPER 2</button>
                                <button className="nav-tab">PAPER 3</button>
                                <button className="nav-tab">PAPER 4</button>
                            </>
                        )}
                    </div>
                    
                    <div className="nav-user-section">
                        <span className="user-welcome">
                            Welcome, <strong>{user.username}</strong>
                        </span>
                        <button onClick={logout} className="btn-logout">
                            Logout
                        </button>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="main-content">
                <div className="content-wrapper">
                    
                    {/* Error Banner */}
                    {error && (
                        <div className="error-alert">
                            <span className="error-icon">⚠️</span>
                            <span className="error-message">{error}</span>
                            <button onClick={handleRefresh} className="btn-retry">
                                Retry
                            </button>
                        </div>
                    )}

                    {/* Advertisement Banner */}
                    <aside className="ad-banner">
                        <span className="ad-label">ADVERTISEMENT</span>
                        <div className="ad-content">
                            <div className="ad-image"></div>
                            <div className="ad-text">
                                <h3>Where facts matter. Always.</h3>
                                <p>For readers who don't settle for noise. Get access to premium research papers and academic content.</p>
                                <button className="btn-ad">LEARN MORE</button>
                            </div>
                        </div>
                    </aside>

                    {/* Paper Content Area */}
                    <section className="paper-section">
                        <div className="paper-content">
                            <PaperViewer 
                                htmlContent={htmlContent} 
                                paperTitle={papers[selectedPaper]?.title}
                                paperMetadata={papers[selectedPaper]?.metadata}
                            />
                        </div>
                    </section>
                </div>
            </main>
        </div>
    );
};

export default UserDashboard;