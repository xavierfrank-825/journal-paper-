// frontend/src/utils/api.js

export const API_BASE_URL = 'http://localhost:8001/api';

export const uploadPaper = async (file) => {
    const formData = new FormData();
    formData.append('xmlFile', file);

    const response = await fetch(`${API_BASE_URL}/papers/upload.php`, {
        method: 'POST',
        credentials: 'include',
        body: formData
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Upload failed');
    }

    return response.json();
};

// utils/api.js
export async function getPapers() {
  const res = await fetch("http://localhost:8001/api/auth/read.php");
  const json = await res.json();
  return json.data.map(paper => ({
    htmlContent: paper.html_content   // 🔹 rename here
  }));
}


export const getPaper = async (id) => {
    const response = await fetch(`${API_BASE_URL}/papers/get.php?id=${id}`, {
        method: 'GET',
        credentials: 'include'
    });

    if (!response.ok) {
        throw new Error('Failed to fetch paper');
    }

    return response.json();
};

export const deletePaper = async (id) => {
    const response = await fetch(`${API_BASE_URL}/papers/delete.php`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ id })
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Delete failed');
    }

    return response.json();
};