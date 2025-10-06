// frontend/src/components/Admin/UploadXML.js
import React, { useState, useRef } from 'react';
import { uploadPaper} from '../../utils/api';
import './UploadXML.css';

const UploadXML = ({ onViewHTML }) => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');
  const [uploadedData, setUploadedData] = useState(null);
  const [xmlContent, setXmlContent] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [paperTitle, setPaperTitle] = useState('');
  const [paperVolume, setPaperVolume] = useState('');
  const fileInputRef = useRef(null);

  const handleFileSelect = (selectedFile) => {
    // Check if file is valid
    if (!selectedFile) {
      setUploadStatus('No file selected.');
      return;
    }

    // Check file type - be more flexible with file type detection
    const fileName = selectedFile.name.toLowerCase();
    const isXML = selectedFile.type === 'text/xml' || 
                  selectedFile.type === 'application/xml' || 
                  fileName.endsWith('.xml');

    if (isXML) {
      setFile(selectedFile);
      setUploadStatus('');
      setUploadedData(null);
      
      // Read the XML content
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target.result;
        setXmlContent(content);
        
        // Extract title from XML if available
        try {
          const parser = new DOMParser();
          const xmlDoc = parser.parseFromString(content, 'text/xml');
          const titleNode = xmlDoc.getElementsByTagName('title')[0];
          if (titleNode && titleNode.textContent) {
            setPaperTitle(titleNode.textContent.trim());
          } else {
            setPaperTitle(selectedFile.name.replace('.xml', ''));
          }
        } catch (error) {
          setPaperTitle(selectedFile.name.replace('.xml', ''));
        }
        
        // Basic XML validation
        if (content.trim().startsWith('<?xml') || content.trim().startsWith('<')) {
          setUploadStatus('XML file loaded successfully. Ready to upload or preview.');
        } else {
          setUploadStatus('Warning: File does not appear to be valid XML.');
        }
      };
      reader.onerror = () => {
        setUploadStatus('Error reading file. Please try again.');
      };
      reader.readAsText(selectedFile);
    } else {
      setUploadStatus('Please select a valid XML file. Only .xml files are accepted.');
      setFile(null);
      setXmlContent('');
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];
    handleFileSelect(selectedFile);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

const handleUpload = async () => {
  if (!file) {
    setUploadStatus('Please select a file first.');
    return;
  }

  if (!xmlContent.trim()) {
    setUploadStatus('File appears to be empty. Please select a valid XML file.');
    return;
  }

  if (!paperTitle.trim()) {
    setUploadStatus('Please enter a title for the paper.');
    return;
  }

  if (!paperVolume.trim()) {
    setUploadStatus('Please enter a volume for the paper.');
    return;
  }

  setUploading(true);
  setUploadStatus('Uploading file to server...');

  try {
    // Create FormData and append the additional fields
    const formData = new FormData();
    formData.append('xmlFile', file);
    formData.append('title', paperTitle.trim());
    formData.append('volume', paperVolume.trim());

    const result = await uploadPaper(formData); // pass FormData instead of just file
    setUploadStatus('File uploaded successfully!');
    setUploadedData(result);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  } catch (error) {
    console.error('Upload error:', error);
    setUploadStatus(`Upload failed: ${error.message || 'Unknown error'}`);
  } finally {
    setUploading(false);
  }
};


  const handlePreviewHTML = () => {
    if (!xmlContent) {
      setUploadStatus('No XML content available for preview.');
      return;
    }

    if (!onViewHTML) {
      setUploadStatus('HTML viewer is not available.');
      return;
    }

    const paperData = {
      title: paperTitle || file?.name.replace('.xml', '') || 'Uploaded Paper',
      volume: paperVolume,
      filename: file?.name || 'unknown.xml',
      fileSize: file?.size || 0,
      uploadDate: new Date().toISOString(),
      ...uploadedData
    };

    try {
      onViewHTML(xmlContent, paperData);
    } catch (error) {
      console.error('Preview error:', error);
      setUploadStatus('Error opening HTML preview. Please check the console for details.');
    }
  };

  const clearFile = () => {
    setFile(null);
    setXmlContent('');
    setUploadStatus('');
    setUploadedData(null);
    setPaperTitle('');
    setPaperVolume('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const validateXMLContent = (content) => {
    try {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(content, 'text/xml');
      const parseError = xmlDoc.getElementsByTagName('parsererror');
      return parseError.length === 0;
    } catch (error) {
      return false;
    }
  };

  return (
    <div className="upload-xml-container">
      <div className="upload-header">
        <h2>📤 Upload JATS XML File</h2>
        <p>Upload a JATS XML file to convert it to HTML format and make it available for viewing.</p>
      </div>

      {/* File Upload Area */}
      <div 
        className={`file-upload-area ${dragActive ? 'drag-active' : ''} ${file ? 'has-file' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".xml,text/xml,application/xml"
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />
        
        {!file ? (
          <div className="upload-prompt">
            <div className="upload-icon">📄</div>
            <h3>Drop your XML file here</h3>
            <p>or click to browse and select a file</p>
            <small>Only XML files are accepted (.xml)</small>
          </div>
        ) : (
          <div className="file-selected">
            <div className="file-info">
              <div className="file-icon">📄</div>
              <div className="file-details">
                <h4>{file.name}</h4>
                <p>Size: {(file.size / 1024).toFixed(2)} KB</p>
                <p>Type: {file.type || 'XML file'}</p>
                {xmlContent && (
                  <p className={`validation-status ${validateXMLContent(xmlContent) ? 'valid' : 'invalid'}`}>
                    {validateXMLContent(xmlContent) ? '✅ Valid XML' : '⚠️ Invalid XML'}
                  </p>
                )}
              </div>
            </div>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                clearFile();
              }}
              className="btn btn-danger btn-sm clear-file-btn"
            >
              ✕ Remove
            </button>
          </div>
        )}
      </div>

      {/* Paper Details Form */}
      {file && (
        <div className="paper-details-form">
          <h3>📝 Paper Details</h3>
          <div className="form-group">
            <label htmlFor="paperTitle">
              Title <span className="required">*</span>
            </label>
            <input
              type="text"
              id="paperTitle"
              className="form-control"
              value={paperTitle}
              onChange={(e) => setPaperTitle(e.target.value)}
              placeholder="Enter paper title"
              disabled={uploading}
              required
            />
            <small className="form-text">The title will be extracted from XML if available</small>
          </div>

          <div className="form-group">
            <label htmlFor="paperVolume">
              Volume <span className="required">*</span>
            </label>
            <input
              type="text"
              id="paperVolume"
              className="form-control"
              value={paperVolume}
              onChange={(e) => setPaperVolume(e.target.value)}
              placeholder="Enter volume (e.g., Vol. 1, Issue 2)"
              disabled={uploading}
              required
            />
            <small className="form-text">Enter the volume/issue information for this paper</small>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      {file && (
        <div className="upload-actions">
          <div className="action-buttons">
            <button
              onClick={handleUpload}
              disabled={uploading || !validateXMLContent(xmlContent) || !paperTitle.trim() || !paperVolume.trim()}
              className="btn btn-primary btn-lg"
              title={!validateXMLContent(xmlContent) ? 'Please fix XML validation errors first' : !paperTitle.trim() || !paperVolume.trim() ? 'Please fill in all required fields' : ''}
            >
              {uploading ? (
                <>
                  <div className="loading-spinner"></div>
                  Uploading...
                </>
              ) : (
                <>
                  ☁️ Upload to Server
                </>
              )}
            </button>
            
            {xmlContent && (
              <button
                onClick={handlePreviewHTML}
                className="btn btn-success btn-lg"
                disabled={uploading}
                title="Preview how the XML will look as HTML"
              >
                🎨 Preview HTML
              </button>
            )}
            
            <button
              onClick={clearFile}
              className="btn btn-outline btn-sm"
              disabled={uploading}
            >
              🗑️ Clear File
            </button>
          </div>
        </div>
      )}

      {/* Status Messages */}
      {uploadStatus && (
        <div className={`upload-status ${
          uploadStatus.includes('success') ? 'success' : 
          uploadStatus.includes('failed') || uploadStatus.includes('Error') ? 'error' : 
          uploadStatus.includes('Warning') ? 'warning' : 'info'
        }`}>
          <div className="status-icon">
            {uploadStatus.includes('success') ? '✅' : 
             uploadStatus.includes('failed') || uploadStatus.includes('Error') ? '❌' : 
             uploadStatus.includes('Warning') ? '⚠️' : 'ℹ️'}
          </div>
          <span>{uploadStatus}</span>
        </div>
      )}

      {/* Upload Success Info */}
      {uploadedData && (
        <div className="upload-success-info">
          <h3>🎉 Upload Successful!</h3>
          <div className="success-details">
            <div className="success-item">
              <strong>File ID:</strong> {uploadedData.id || 'N/A'}
            </div>
            <div className="success-item">
              <strong>Title:</strong> {paperTitle}
            </div>
            <div className="success-item">
              <strong>Volume:</strong> {paperVolume}
            </div>
            <div className="success-item">
              <strong>Uploaded:</strong> {new Date().toLocaleString()}
            </div>
            <div className="success-item">
              <strong>Status:</strong> Ready for conversion
            </div>
            {uploadedData.message && (
              <div className="success-item">
                <strong>Message:</strong> {uploadedData.message}
              </div>
            )}
          </div>
          <div className="post-upload-actions">
            <button
              onClick={clearFile}
              className="btn btn-secondary"
            >
              Upload Another File
            </button>
            {xmlContent && (
              <button
                onClick={handlePreviewHTML}
                className="btn btn-success"
              >
                🎨 View HTML Preview
              </button>
            )}
          </div>
        </div>
      )}

      {/* File Requirements */}
      <div className="file-requirements">
        <h3>📋 File Requirements</h3>
        <ul>
          <li>✅ File must be in JATS XML format</li>
          <li>✅ Maximum file size: 50MB</li>
          <li>✅ File extension should be .xml</li>
          <li>✅ Must contain valid XML structure</li>
          <li>✅ JATS schema compliance recommended</li>
          <li>✅ Title and Volume information required</li>
        </ul>
        
        <div className="help-text">
          <h4>Need Help?</h4>
          <p>
            JATS (Journal Article Tag Suite) is a NISO standard for academic papers. 
            Make sure your XML file follows the JATS schema for best conversion results.
          </p>
          <p>
            Common JATS elements include: &lt;article&gt;, &lt;front&gt;, &lt;body&gt;, 
            &lt;back&gt;, &lt;title-group&gt;, &lt;abstract&gt;, etc.
          </p>
        </div>
      </div>
    </div>
  );
};

export default UploadXML;