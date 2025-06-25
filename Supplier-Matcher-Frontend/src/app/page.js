'use client';

import { useState } from 'react';
import styles from './page.module.css';

export default function Home() {
  const [showForm, setShowForm] = useState(false);
  const [pdfFile, setPdfFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [responseData, setResponseData] = useState(null);

  const handleFileChange = (e) => {
    setPdfFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!pdfFile) {
      alert('Please attach a PDF file.');
      return;
    }

    const formData = new FormData();
    formData.append('file', pdfFile);

    try {
      setLoading(true);
      setResponseData(null); 

      const res = await fetch('http://127.0.0.1:8000/upload', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        console.error('Upload failed with status:', res.status);
        alert('Upload failed.');
        setLoading(false);
        return;
      }

      const data = await res.json();
      console.log('API response:', data);
      setResponseData(data); 
      setLoading(false);
    } catch (err) {
      console.error(err);
      alert('An error occurred.');
      setLoading(false);
    }
  };

  return (
    <main
      style={{
        backgroundImage: "url('/background.jpg')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        minHeight: '100vh',
        margin: 0,
        padding: 0,
      }}
      className={styles.main}
    >
      {!showForm ? (
        <div className={styles.container}>
          <h1 className={styles.heading}>AI-Powered Supplier Matching</h1>
          <p className={styles.description}>
            The AI-Powered Supplier Matcher helps you match sourcing events with the best suppliers from your database.
            Upload a PDF detailing your sourcing event, and get supplier recommendations ranked by relevance.
          </p>
          <button className={styles.button} onClick={() => setShowForm(true)}>
            Get Started
          </button>
        </div>
      ) : (
        <div className={styles.container} style={{ position: 'relative' }}>
          <button
            type="button"
            onClick={() => {
              setShowForm(false);
              setResponseData(null);
              setPdfFile(null);
            }}
            style={{
              position: 'absolute',
              top: '18px',
              left: '20px',
              padding: '5px 10px',
              fontSize: '12px',
              backgroundColor: '#004797',
              color: '#ffffff',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Back
          </button>
          <form
            onSubmit={handleSubmit}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              marginTop: '15px',
            }}
          >
            <p className={styles.description}>Please add your PDF file below:</p>
            <input
              type="file"
              accept="application/pdf"
              onChange={handleFileChange}
              required
              className={styles.input}
              style={{ marginBottom: '25px', marginLeft: '60px' }}
            />
            <button type="submit" className={styles.button} disabled={loading}>
              {loading ? 'Uploading...' : 'Submit'}
            </button>
          </form>

          {loading && (
            <p style={{ marginTop: '10px', color: '#004797' }}>Loading, please wait...</p>
          )}

          {responseData && (
            <div
              style={{
                marginTop: '20px',
                padding: '10px',
                backgroundColor: 'rgba(148, 176, 187, 0.8)',
                borderRadius: '5px',
                maxWidth: '100%',
                wordBreak: 'break-word',
              }}
            >
              <h3 style={{ color: '#004797' }}>Event: {responseData.Event}</h3>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th >Rank</th>
                    <th >Supplier Name</th>
                    <th >Match Score</th>
                  </tr>
                </thead>
                <tbody>
                  {responseData.Matches.map((match, index) => (
                    <tr key={index}>
                      <td >{match.Rank}</td>
                      <td >{match.SupplierName}</td>
                      <td >{match.MatchScore}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </main>
  );
}
