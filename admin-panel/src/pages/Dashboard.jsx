import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import client from '../api/client';
import { Plus, Edit2, Trash2, Eye, EyeOff, Search, Filter, Loader } from 'lucide-react';
import '../styles/Dashboard.css';

export default function Dashboard() {
  const navigate = useNavigate();
  const [problems, setProblems] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [difficulty, setDifficulty] = useState('all');
  const [topic, setTopic] = useState('all');
  const [status, setStatus] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [topics, setTopics] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    difficulty: 'easy',
    tags: [],
    constraints: '',
    examples: [],
    testCases: [],
    starterCode: {
      javascript: '',
      python: '',
      cpp: '',
      java: '',
      typescript: '',
    },
  });

  // Fetch stats and problems on mount
  useEffect(() => {
    fetchStats();
    fetchProblems();
  }, [page, searchTerm, difficulty, topic, status]);

  const fetchStats = async () => {
    try {
      const { data } = await client.get('/admin/stats');
      setStats(data.stats);
      const topicList = data.stats.byTopic?.map(t => t._id) || [];
      setTopics(topicList);
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  const fetchProblems = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page,
        limit: 10,
        search: searchTerm,
        difficulty: difficulty !== 'all' ? difficulty : '',
        topic: topic !== 'all' ? topic : '',
        status: status !== 'all' ? status : '',
      });

      const { data } = await client.get(`/admin/problems?${params}`);
      setProblems(data.problems);
      setTotalPages(data.pages);
    } catch (err) {
      showMessage('Error fetching problems', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (msg, type = 'success') => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => setMessage(''), 3000);
  };

  const handleAddTopic = () => {
    const newTopic = prompt('Enter topic name:');
    if (newTopic) {
      setFormData({
        ...formData,
        tags: [...formData.tags, newTopic],
      });
    }
  };

  const handleRemoveTopic = (index) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter((_, i) => i !== index),
    });
  };

  const handleAddExample = () => {
    setFormData({
      ...formData,
      examples: [
        ...formData.examples,
        { input: '', output: '', explanation: '' },
      ],
    });
  };

  const handleUpdateExample = (index, field, value) => {
    const updated = [...formData.examples];
    updated[index][field] = value;
    setFormData({ ...formData, examples: updated });
  };

  const handleRemoveExample = (index) => {
    setFormData({
      ...formData,
      examples: formData.examples.filter((_, i) => i !== index),
    });
  };

  const handleAddTestCase = () => {
    setFormData({
      ...formData,
      testCases: [
        ...formData.testCases,
        { input: '', expectedOutput: '', isSample: false },
      ],
    });
  };

  const handleUpdateTestCase = (index, field, value) => {
    const updated = [...formData.testCases];
    updated[index][field] = value;
    setFormData({ ...formData, testCases: updated });
  };

  const handleRemoveTestCase = (index) => {
    setFormData({
      ...formData,
      testCases: formData.testCases.filter((_, i) => i !== index),
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await client.put(`/admin/problems/${editingId}`, formData);
        showMessage('Problem updated successfully!');
      } else {
        await client.post('/admin/problems', formData);
        showMessage('Problem created successfully!');
      }
      setShowForm(false);
      resetForm();
      fetchProblems();
      fetchStats();
    } catch (err) {
      showMessage(err.response?.data?.message || 'Error saving problem', 'error');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      difficulty: 'easy',
      tags: [],
      constraints: '',
      examples: [],
      testCases: [],
      starterCode: {
        javascript: '',
        python: '',
        cpp: '',
        java: '',
        typescript: '',
      },
    });
    setEditingId(null);
  };

  const handleEdit = async (id) => {
    try {
      const { data } = await client.get(`/admin/problems/${id}`);
      setFormData(data.problem);
      setEditingId(id);
      setShowForm(true);
    } catch (err) {
      showMessage('Error fetching problem', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this problem?')) {
      try {
        await client.delete(`/admin/problems/${id}`);
        showMessage('Problem deleted!');
        fetchProblems();
        fetchStats();
      } catch (err) {
        showMessage('Error deleting problem', 'error');
      }
    }
  };

  const handleToggleActive = async (id, currentStatus) => {
    try {
      await client.patch(`/admin/problems/${id}/toggle`);
      showMessage(currentStatus ? 'Problem disabled' : 'Problem enabled');
      fetchProblems();
    } catch (err) {
      showMessage('Error updating problem', 'error');
    }
  };

  if (!stats) {
    return <div style={{ padding: '20px' }}>Loading...</div>;
  }

  return (
    <div className="dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <div>
          <h1>Problem Management</h1>
          <p>Create, edit, and manage coding problems for your game</p>
        </div>
        <button className="btn btn-cyan" onClick={() => { resetForm(); setShowForm(true); }}>
          <Plus size={18} /> Add New Problem
        </button>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{stats.problems.active}</div>
          <div className="stat-label">Active Problems</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.problems.inactive}</div>
          <div className="stat-label">Inactive</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{topics.length}</div>
          <div className="stat-label">Topics</div>
        </div>
      </div>

      {/* Message Alert */}
      {message && (
        <div className={`alert alert-${messageType}`}>
          {message}
        </div>
      )}

      {/* Problem Form Modal */}
      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingId ? 'Edit Problem' : 'Add New Problem'}</h2>
              <button className="close-btn" onClick={() => setShowForm(false)}>×</button>
            </div>

            <form onSubmit={handleSubmit} className="problem-form">
              {/* Basic Info */}
              <div className="form-section">
                <h3>Basic Information</h3>
                <div className="form-group">
                  <label>Title *</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g., Two Sum"
                  />
                </div>

                <div className="form-group">
                  <label>Description *</label>
                  <textarea
                    required
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Detailed problem description..."
                    rows="4"
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Difficulty *</label>
                    <select
                      value={formData.difficulty}
                      onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                    >
                      <option value="easy">Easy</option>
                      <option value="medium">Medium</option>
                      <option value="hard">Hard</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Constraints</label>
                    <textarea
                      value={formData.constraints}
                      onChange={(e) => setFormData({ ...formData, constraints: e.target.value })}
                      placeholder="e.g., 1 <= n <= 10^5"
                      rows="2"
                    />
                  </div>
                </div>
              </div>

              {/* Topics/Tags */}
              <div className="form-section">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3>Topics/Tags</h3>
                  <button type="button" className="btn btn-small" onClick={handleAddTopic}>
                    + Add Topic
                  </button>
                </div>
                <div className="tags-container">
                  {formData.tags.map((tag, idx) => (
                    <div key={idx} className="tag">
                      {tag}
                      <button type="button" onClick={() => handleRemoveTopic(idx)}>×</button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Examples */}
              <div className="form-section">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3>Examples</h3>
                  <button type="button" className="btn btn-small" onClick={handleAddExample}>
                    + Add Example
                  </button>
                </div>
                {formData.examples.map((example, idx) => (
                  <div key={idx} className="nested-form">
                    <div className="form-group">
                      <label>Input</label>
                      <input
                        type="text"
                        value={example.input}
                        onChange={(e) => handleUpdateExample(idx, 'input', e.target.value)}
                      />
                    </div>
                    <div className="form-group">
                      <label>Output</label>
                      <input
                        type="text"
                        value={example.output}
                        onChange={(e) => handleUpdateExample(idx, 'output', e.target.value)}
                      />
                    </div>
                    <div className="form-group">
                      <label>Explanation</label>
                      <textarea
                        value={example.explanation}
                        onChange={(e) => handleUpdateExample(idx, 'explanation', e.target.value)}
                        rows="2"
                      />
                    </div>
                    <button type="button" className="btn btn-danger-small" onClick={() => handleRemoveExample(idx)}>
                      Remove
                    </button>
                  </div>
                ))}
              </div>

              {/* Test Cases */}
              <div className="form-section">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3>Test Cases</h3>
                  <button type="button" className="btn btn-small" onClick={handleAddTestCase}>
                    + Add Test Case
                  </button>
                </div>
                {formData.testCases.map((testCase, idx) => (
                  <div key={idx} className="nested-form">
                    <div className="form-group">
                      <label>Input</label>
                      <textarea
                        value={testCase.input}
                        onChange={(e) => handleUpdateTestCase(idx, 'input', e.target.value)}
                        placeholder="Input data"
                        rows="2"
                      />
                    </div>
                    <div className="form-group">
                      <label>Expected Output</label>
                      <textarea
                        value={testCase.expectedOutput}
                        onChange={(e) => handleUpdateTestCase(idx, 'expectedOutput', e.target.value)}
                        placeholder="Expected output"
                        rows="2"
                      />
                    </div>
                    <label>
                      <input
                        type="checkbox"
                        checked={testCase.isSample}
                        onChange={(e) => handleUpdateTestCase(idx, 'isSample', e.target.checked)}
                      />
                      Sample Test Case
                    </label>
                    <button type="button" className="btn btn-danger-small" onClick={() => handleRemoveTestCase(idx)}>
                      Remove
                    </button>
                  </div>
                ))}
              </div>

              {/* Starter Code */}
              <div className="form-section">
                <h3>Starter Code (Optional)</h3>
                {Object.keys(formData.starterCode).map((lang) => (
                  <div key={lang} className="form-group">
                    <label>{lang.charAt(0).toUpperCase() + lang.slice(1)}</label>
                    <textarea
                      value={formData.starterCode[lang]}
                      onChange={(e) => setFormData({
                        ...formData,
                        starterCode: { ...formData.starterCode, [lang]: e.target.value }
                      })}
                      placeholder={`Starter code for ${lang}...`}
                      rows="3"
                    />
                  </div>
                ))}
              </div>

              {/* Buttons */}
              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-cyan">
                  {editingId ? 'Update Problem' : 'Create Problem'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="filters">
        <div className="filter-group">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search problems..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
          />
        </div>

        <select value={difficulty} onChange={(e) => { setDifficulty(e.target.value); setPage(1); }}>
          <option value="all">All Difficulties</option>
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>

        <select value={topic} onChange={(e) => { setTopic(e.target.value); setPage(1); }}>
          <option value="all">All Topics</option>
          {topics.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>

        <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}>
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {/* Problems Table */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <Loader size={32} className="spinner" />
        </div>
      ) : problems.length === 0 ? (
        <div className="empty-state">
          <p>No problems found. Create your first problem!</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="problems-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Difficulty</th>
                <th>Topics</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {problems.map((problem) => (
                <tr key={problem._id}>
                  <td className="title-cell">{problem.title}</td>
                  <td>
                    <span className={`difficulty ${problem.difficulty}`}>
                      {problem.difficulty}
                    </span>
                  </td>
                  <td>
                    <div className="tags">
                      {problem.tags.map((tag) => (
                        <span key={tag} className="tag-badge">{tag}</span>
                      ))}
                    </div>
                  </td>
                  <td>
                    <button
                      className={`status-btn ${problem.isActive ? 'active' : 'inactive'}`}
                      onClick={() => handleToggleActive(problem._id, problem.isActive)}
                      title={problem.isActive ? 'Click to deactivate' : 'Click to activate'}
                    >
                      {problem.isActive ? <Eye size={16} /> : <EyeOff size={16} />}
                      {problem.isActive ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className="actions-cell">
                    <button className="btn-icon" onClick={() => handleEdit(problem._id)} title="Edit">
                      <Edit2 size={16} />
                    </button>
                    <button className="btn-icon delete" onClick={() => handleDelete(problem._id)} title="Delete">
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
            Previous
          </button>
          <span>Page {page} of {totalPages}</span>
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
            Next
          </button>
        </div>
      )}
    </div>
  );
}
