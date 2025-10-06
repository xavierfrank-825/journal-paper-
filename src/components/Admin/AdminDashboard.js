// frontend/src/components/Admin/AdminDashboard.js
import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import UploadXML from './UploadXML';
import ManagePapers from './ManagePapers';
import PaperList from '../User/PaperList';
import { parseXMLToHTML } from '../../utils/xmlParser';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('upload');

  // Store preview state
  const [selectedPaper, setSelectedPaper] = useState(null);
  const [previewContent, setPreviewContent] = useState('');
  const [previewPaper, setPreviewPaper] = useState(null);

  // ✅ The critical fix: we define this handler
  const handleViewHTML = (xmlContent, paperData) => {
    console.log("Preview requested:", paperData);

    try {
      // Convert XML to HTML using the parser
      const htmlContent = parseXMLToHTML(xmlContent);
      console.log("✅ XML converted to HTML successfully");
      
      setPreviewContent(htmlContent);
      setPreviewPaper(paperData);

      // Switch tab to "view" automatically
      setActiveTab('view');
    } catch (error) {
      console.error("Error converting XML to HTML:", error);
      // Fallback to showing raw XML if conversion fails
      setPreviewContent(xmlContent);
      setPreviewPaper(paperData);
      setActiveTab('view');
    }
  };

  return (
    <div className="admin-dashboard">
      <nav className="admin-navbar">
        <div className="admin-nav-container">
          <div className="admin-nav-left">
            <h1 className="admin-nav-title">Admin Dashboard</h1>
          </div>
          <div className="admin-nav-right">
            <span className="admin-welcome-text">Welcome, {user.username}</span>
            <button onClick={logout} className="admin-logout-btn">Logout</button>
          </div>
        </div>
      </nav>

      <div className="admin-content">
        <div className="admin-tabs">
          <button
            onClick={() => setActiveTab('upload')}
            className={`admin-tab-btn ${activeTab === 'upload' ? 'admin-tab-active' : ''}`}
          >
            Upload XML
          </button>
          <button
            onClick={() => setActiveTab('manage')}
            className={`admin-tab-btn ${activeTab === 'manage' ? 'admin-tab-active' : ''}`}
          >
            Manage Papers
          </button>
          <button
            onClick={() => setActiveTab('view')}
            className={`admin-tab-btn ${activeTab === 'view' ? 'admin-tab-active' : ''}`}
          >
            View Papers
          </button>
        </div>

        <div className="admin-tab-content">
          {/* Upload tab now receives our handler */}
          {activeTab === 'upload' && (
            <UploadXML onViewHTML={handleViewHTML} />
          )}

          {activeTab === 'manage' && <ManagePapers />}

          {activeTab === 'view' && (
            <>
              {/* If previewContent is set, show the preview, otherwise PaperList */}
              {previewContent ? (
                <div className="paper-preview">
                  <div className="preview-header">
                    <h2>Preview: {previewPaper?.title || 'Untitled Paper'}</h2>
                    <button
                      onClick={() => {
                        setPreviewContent('');
                        setPreviewPaper(null);
                      }}
                      className="btn btn-secondary"
                    >
                      ← Back to papers
                    </button>
                  </div>
                  <div 
                    className="preview-content"
                    style={{
                      background: '#fff',
                      padding: '20px',
                      borderRadius: '8px',
                      border: '1px solid #e0e0e0',
                      maxHeight: '70vh',
                      overflowY: 'auto',
                      fontSize: '16px',
                      lineHeight: '1.6',
                    }}
                    dangerouslySetInnerHTML={{ __html: previewContent }}
                  />
                </div>
              ) : (
                <PaperList
                  selectedPaper={selectedPaper}
                  onSelectPaper={setSelectedPaper}
                />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;