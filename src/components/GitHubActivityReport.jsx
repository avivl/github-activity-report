// src/components/GitHubActivityReport.js
import React, { useState } from 'react';

const GitHubActivityReport = () => {
  const [token, setToken] = useState('');
  const [org, setOrg] = useState('');
  const [username, setUsername] = useState('');
  const [limit, setLimit] = useState(50);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [weekStart, setWeekStart] = useState(() => {
    const now = new Date();
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
    startOfWeek.setHours(0, 0, 0, 0);
    return startOfWeek;
  });

  const formatDate = date => new Date(date).toLocaleDateString();
  const moveWeek = (direction) => {
    setWeekStart(prev => {
      const newDate = new Date(prev);
      newDate.setDate(newDate.getDate() + (direction * 7));
      return newDate;
    });
  };

  const buttonStyle = {
    padding: '8px 16px',
    borderRadius: '6px',
    cursor: 'pointer',
    border: '1px solid #e2e8f0',
    backgroundColor: 'white',
    transition: 'all 0.2s',
  };

  const fetchData = async (e) => {
    e?.preventDefault();
    if (!token) return;
    setLoading(true);

    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    const dateFilter = `created:${weekStart.toISOString().split('T')[0]}..${weekEnd.toISOString().split('T')[0]}`;

    try {
      const response = await fetch('https://api.github.com/graphql', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: `query {
            openedPRs: search(query: "org:${org} is:pr author:${username} ${dateFilter}", type: ISSUE, first: ${limit}) {
              nodes { ... on PullRequest { title url state createdAt } }
            }
            reviewedPRs: search(query: "org:${org} is:pr reviewed-by:${username} ${dateFilter}", type: ISSUE, first: ${limit}) {
              nodes { ... on PullRequest { title url author { login } } }
            }
            commentedPRs: search(query: "org:${org} is:pr commenter:${username} ${dateFilter}", type: ISSUE, first: ${limit}) {
              nodes { ... on PullRequest { title url } }
            }
          }`
        })
      });

      const result = await response.json();
      if (result.errors) throw new Error(result.errors[0].message);
      setData(result.data);
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const exportToHtml = () => {
    if (!data) return;
    
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>GitHub Report - ${formatDate(weekStart)}</title>
          <style>
            body { font-family: system-ui; max-width: 800px; margin: 2rem auto; padding: 0 1rem; line-height: 1.5; }
            .header { background-color: #1f2937; color: white; padding: 2rem; border-radius: 8px; margin-bottom: 2rem; }
            .header h1 { margin: 0; font-size: 1.5rem; }
            .section { margin-bottom: 2rem; padding: 1.5rem; background: #f8fafc; border-radius: 8px; }
            .item { margin-bottom: 1rem; padding-bottom: 1rem; border-bottom: 1px solid #e2e8f0; }
            .item:last-child { border-bottom: none; }
            a { color: #2563eb; text-decoration: none; }
            .state { display: inline-block; padding: 0.25rem 0.5rem; border-radius: 9999px; font-size: 0.875rem; margin-left: 0.5rem; }
            .state-OPEN { background: #dcfce7; color: #166534; }
            .state-CLOSED { background: #fee2e2; color: #991b1b; }
            .state-MERGED { background: #f3e8ff; color: #6b21a8; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>GitHub Activity Report - Week of ${formatDate(weekStart)}</h1>
          </div>
          
          <div class="section">
            <h2>Opened PRs</h2>
            ${data.openedPRs.nodes.map(pr => `
              <div class="item">
                <a href="${pr.url}">${pr.title}</a>
                <span class="state state-${pr.state}">${pr.state}</span>
              </div>
            `).join('')}
          </div>
          
          <div class="section">
            <h2>Reviewed PRs</h2>
            ${data.reviewedPRs.nodes.map(pr => `
              <div class="item">
                <a href="${pr.url}">${pr.title}</a>
                <span>by ${pr.author.login}</span>
              </div>
            `).join('')}
          </div>
          
          <div class="section">
            <h2>Commented PRs</h2>
            ${data.commentedPRs.nodes.map(pr => `
              <div class="item">
                <a href="${pr.url}">${pr.title}</a>
              </div>
            `).join('')}
          </div>
        </body>
      </html>
    `;

    const blob = new Blob([html], { type: 'text/html' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `github-report-${weekStart.toISOString().split('T')[0]}.html`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div style={{ maxWidth: '800px', margin: '20px auto', padding: '20px', fontFamily: 'system-ui' }}>
      {/* Week Selection and Navigation */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <button onClick={() => moveWeek(-1)} style={buttonStyle}>← Previous</button>
        <span style={{ fontWeight: '500' }}>Week of {formatDate(weekStart)}</span>
        <button onClick={() => moveWeek(1)} style={buttonStyle}>Next →</button>
      </div>

      {/* Configuration Section */}
      <div style={{ marginBottom: '20px' }}>
        <h2 style={{ fontSize: '1.2em', marginBottom: '12px', color: '#334155' }}>Configuration</h2>
        <form onSubmit={fetchData}>
          <div style={{ marginBottom: '16px', backgroundColor: '#f8fafc', padding: '12px', borderRadius: '6px' }}>
            <p style={{ marginBottom: '8px', fontSize: '14px', color: '#64748b' }}>
              Configure your report settings below. All fields are required.
            </p>
            <ul style={{ fontSize: '14px', color: '#64748b', marginLeft: '20px', marginBottom: '12px' }}>
              <li>Organization name: The GitHub organization to fetch data from</li>
              <li>GitHub username: The user whose activities you want to track</li>
              <li>Items per section: Number of items to fetch (1-100, default: 50)</li>
              <li>GitHub Token: Personal access token with repo and user scopes</li>
            </ul>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '10px' }}>
            <input
              type="text"
              value={org}
              onChange={e => setOrg(e.target.value)}
              placeholder="Organization name"
              style={{
                padding: '10px',
                borderRadius: '6px',
                border: '1px solid #e2e8f0',
              }}
            />
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="GitHub username"
              style={{
                padding: '10px',
                borderRadius: '6px',
                border: '1px solid #e2e8f0',
              }}
            />
            <input
              type="number"
              value={limit}
              onChange={e => setLimit(Math.max(1, Math.min(100, parseInt(e.target.value) || 50)))}
              placeholder="Items per section"
              style={{
                padding: '10px',
                borderRadius: '6px',
                border: '1px solid #e2e8f0',
              }}
            />
          </div>

          <input
            type="password"
            value={token}
            onChange={e => setToken(e.target.value)}
            placeholder="GitHub Token"
            style={{
              width: '100%',
              padding: '10px',
              marginBottom: '10px',
              borderRadius: '6px',
              border: '1px solid #e2e8f0',
            }}
          />
          
          <button 
            type="submit" 
            disabled={loading}
            style={{
              ...buttonStyle,
              backgroundColor: loading ? '#cbd5e1' : '#2563eb',
              color: 'white',
              border: 'none',
              width: '100%',
            }}
          >
            {loading ? 'Loading...' : 'Load Data'}
          </button>
        </form>
      </div>

      {/* Results and Export */}
      {data && (
        <div>
          <button 
            onClick={exportToHtml}
            style={{
              ...buttonStyle,
              backgroundColor: '#059669',
              color: 'white',
              border: 'none',
              width: '100%',
              marginBottom: '20px',
            }}
          >
            Export Report for {weekStart.toISOString().split('T')[0]}
          </button>

          {['openedPRs', 'reviewedPRs', 'commentedPRs'].map((section) => (
            <div key={section} style={{
              backgroundColor: '#f8fafc',
              padding: '20px',
              borderRadius: '8px',
              marginBottom: '20px',
            }}>
              <h2 style={{ margin: '0 0 16px', color: '#334155' }}>
                {section.replace('PRs', ' Pull Requests')}
              </h2>
              {data[section].nodes.map((pr, i) => (
                <div key={i} style={{ 
                  marginBottom: '12px',
                  paddingBottom: '12px',
                  borderBottom: i < data[section].nodes.length - 1 ? '1px solid #e2e8f0' : 'none',
                }}>
                  <a href={pr.url} style={{ color: '#2563eb', textDecoration: 'none' }}>{pr.title}</a>
                  {pr.state && (
                    <span style={{
                      display: 'inline-block',
                      padding: '2px 8px',
                      borderRadius: '9999px',
                      fontSize: '12px',
                      marginLeft: '8px',
                      backgroundColor: 
                        pr.state === 'OPEN' ? '#dcfce7' :
                        pr.state === 'CLOSED' ? '#fee2e2' : '#f3e8ff',
                      color:
                        pr.state === 'OPEN' ? '#166534' :
                        pr.state === 'CLOSED' ? '#991b1b' : '#6b21a8',
                    }}>
                      {pr.state}
                    </span>
                  )}
                  {pr.author && (
                    <span style={{ marginLeft: '8px', color: '#64748b' }}>
                      by {pr.author.login}
                    </span>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default GitHubActivityReport;