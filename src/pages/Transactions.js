import React, { useState, useEffect, useCallback } from "react";
import api from "../services/api";
import { 
  Plus, 
  Search, 
  Filter, 
  Trash2, 
  Edit2, 
  ChevronLeft, 
  ChevronRight, 
  Download, 
  X,
  Check,
  Calendar,
  DollarSign,
  Tag
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const PAGE_SIZE = 10;

  const [showAddForm, setShowAddForm] = useState(false);
  const [form, setForm] = useState({
    type: "expense",
    category: "",
    amount: "",
    description: "",
    date: new Date().toISOString().split("T")[0],
  });

  const [filters, setFilters] = useState({
    type: "",
    category: "",
    start_date: "",
    end_date: "",
    min_amount: "",
    max_amount: "",
  });

  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({
    type: "expense",
    category: "",
    amount: "",
    description: "",
    date: new Date().toISOString().split("T")[0],
  });

  const buildQuery = useCallback(
    (page) => {
      const params = new URLSearchParams({ page, page_size: PAGE_SIZE });
      if (filters.type) params.append("type", filters.type);
      if (filters.category) params.append("category", filters.category);
      if (filters.start_date) params.append("start_date", filters.start_date);
      if (filters.end_date) params.append("end_date", filters.end_date);
      if (filters.min_amount) params.append("min_amount", filters.min_amount);
      if (filters.max_amount) params.append("max_amount", filters.max_amount);
      return params.toString();
    },
    [filters]
  );

  const fetchTransactions = useCallback(
    async (page = 1) => {
      setLoading(true);
      setError("");
      try {
        const data = await api.get(`/transactions/?${buildQuery(page)}`);
        const results = Array.isArray(data) ? data : data.results || [];
        const count = data.count || results.length;
        setTransactions(results);
        setTotalCount(count);
        setTotalPages(Math.ceil(count / PAGE_SIZE) || 1);
        setCurrentPage(page);
      } catch {
        setError("Failed to load transactions.");
      } finally {
        setLoading(false);
      }
    },
    [buildQuery]
  );

  const fetchCategories = async () => {
    try {
      const data = await api.get("/categories/");
      const cats = Array.isArray(data) ? data : data.results || [];
      setCategories(cats);
    } catch {
      setCategories([]);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchTransactions(1);
  }, [filters, fetchTransactions]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const resetFilters = () => {
    setFilters({ type: "", category: "", start_date: "", end_date: "", min_amount: "", max_amount: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.category) {
      setError("Please select a category.");
      return;
    }
    setError("");
    try {
      const payload = {
        type: form.type,
        amount: parseFloat(form.amount),
        description: form.description,
        date: form.date,
        category: parseInt(form.category)
      };
      await api.post("/transactions/", payload);
      setForm({ type: "expense", category: "", amount: "", description: "", date: new Date().toISOString().split("T")[0] });
      setShowAddForm(false);
      fetchTransactions(1);
    } catch (err) {
      const msg = err.data?.detail || "Failed to add transaction.";
      setError(msg);
    }
  };

  const [newCatName, setNewCatName] = useState("");
  const handleAddCategory = async (type) => {
    if (!newCatName) return;
    try {
      await api.post("/categories/", { name: newCatName, type });
      setNewCatName("");
      fetchCategories();
    } catch {
      setError("Failed to add category.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this transaction?")) return;
    try {
      await api.delete(`/transactions/${id}/`);
      fetchTransactions(currentPage);
    } catch {
      setError("Failed to delete transaction.");
    }
  };

  const startEdit = (t) => {
    setEditingId(t.id);
    setEditForm({
      type: t.type,
      category: t.category || "",
      amount: t.amount,
      description: t.description || "",
      date: t.date ? t.date.split("T")[0] : "",
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const payload = {
        type: editForm.type,
        amount: parseFloat(editForm.amount),
        description: editForm.description,
        date: editForm.date,
      };
      if (editForm.category) payload.category = parseInt(editForm.category) || editForm.category;
      await api.put(`/transactions/${editingId}/`, payload);
      setEditingId(null);
      fetchTransactions(currentPage);
    } catch {
      setError("Failed to update transaction.");
    }
  };

  return (
    <div className="animate-fade-in">
      <header style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 style={{ fontSize: '1.875rem', marginBottom: '8px' }}>Transactions</h1>
          <p style={{ color: '#64748b' }}>Manage and track every dollar with precision.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button 
            className="btn-primary" 
            onClick={() => setShowAddForm(!showAddForm)}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px' }}
          >
            {showAddForm ? <X size={20} /> : <Plus size={20} />}
            {showAddForm ? "Cancel" : "Add Transaction"}
          </button>
        </div>
      </header>

      {error && <div style={{ padding: '16px', backgroundColor: '#fef2f2', color: '#dc2626', borderRadius: '12px', marginBottom: '24px', border: '1px solid #fee2e2', fontSize: '0.875rem' }}>{error}</div>}

      <AnimatePresence>
        {showAddForm && (
          <motion.div 
            initial={{ height: 0, opacity: 0, marginBottom: 0 }}
            animate={{ height: 'auto', opacity: 1, marginBottom: 32 }}
            exit={{ height: 0, opacity: 0, marginBottom: 0 }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '24px' }}>
              <div className="card" style={{ border: '2px solid #6366f1' }}>
                <h3 style={{ fontSize: '1rem', marginBottom: '20px' }}>New Transaction</h3>
                <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', marginBottom: '6px' }}>TYPE</label>
                    <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                      <option value="expense">Expense</option>
                      <option value="income">Income</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', marginBottom: '6px' }}>CATEGORY</label>
                    <select required value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                      <option value="">Select Category</option>
                      {categories.filter(c => c.type === form.type).map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', marginBottom: '6px' }}>DATE</label>
                    <input type="date" value={form.date} max={new Date().toISOString().split("T")[0]} onChange={(e) => setForm({ ...form, date: e.target.value })} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', marginBottom: '6px' }}>AMOUNT ($)</label>
                    <input type="number" placeholder="0.00" value={form.amount} min="0.01" step="0.01" required onChange={(e) => setForm({ ...form, amount: e.target.value })} />
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', marginBottom: '6px' }}>DESCRIPTION</label>
                    <input placeholder="What was this for?" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                  </div>
                  <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
                    <button type="submit" className="btn-primary" style={{ padding: '10px 32px' }}>Save Transaction</button>
                  </div>
                </form>
              </div>

              <div className="card" style={{ border: '1px solid #e2e8f0', backgroundColor: '#f8fafc' }}>
                <h3 style={{ fontSize: '0.875rem', marginBottom: '16px', color: '#475569' }}>Quick Add Category</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <input 
                    placeholder="Category Name" 
                    value={newCatName} 
                    onChange={(e) => setNewCatName(e.target.value)}
                    style={{ backgroundColor: 'white' }} 
                  />
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button 
                      onClick={() => handleAddCategory('expense')}
                      style={{ flex: 1, padding: '8px', fontSize: '0.75rem', fontWeight: 600, borderRadius: '8px', border: '1px solid #ef4444', color: '#ef4444', backgroundColor: 'transparent' }}
                    >
                      + Expense
                    </button>
                    <button 
                      onClick={() => handleAddCategory('income')}
                      style={{ flex: 1, padding: '8px', fontSize: '0.75rem', fontWeight: 600, borderRadius: '8px', border: '1px solid #10b981', color: '#10b981', backgroundColor: 'transparent' }}
                    >
                      + Income
                    </button>
                  </div>
                  <p style={{ fontSize: '0.7rem', color: '#94a3b8', textAlign: 'center' }}>Create "Salary", "Food", etc. first.</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="card" style={{ marginBottom: '32px', padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#1e293b' }}>
            <Filter size={18} />
            <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>Filters</h3>
          </div>
          <button onClick={resetFilters} style={{ fontSize: '0.8125rem', color: '#6366f1', fontWeight: 600, background: 'none' }}>Reset Filters</button>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.65rem', fontWeight: 700, color: '#94a3b8', marginBottom: '4px', textTransform: 'uppercase' }}>TYPE</label>
            <select name="type" value={filters.type} onChange={handleFilterChange}>
              <option value="">All Types</option>
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.65rem', fontWeight: 700, color: '#94a3b8', marginBottom: '4px', textTransform: 'uppercase' }}>CATEGORY</label>
            <select name="category" value={filters.category} onChange={handleFilterChange}>
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.65rem', fontWeight: 700, color: '#94a3b8', marginBottom: '4px', textTransform: 'uppercase' }}>FROM DATE</label>
            <input type="date" name="start_date" value={filters.start_date} onChange={handleFilterChange} />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.65rem', fontWeight: 700, color: '#94a3b8', marginBottom: '4px', textTransform: 'uppercase' }}>TO DATE</label>
            <input type="date" name="end_date" value={filters.end_date} onChange={handleFilterChange} />
          </div>
          
          <div>
            <label style={{ display: 'block', fontSize: '0.65rem', fontWeight: 700, color: '#94a3b8', marginBottom: '4px', textTransform: 'uppercase' }}>MIN ($)</label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: '0.875rem' }}>$</span>
              <input type="number" name="min_amount" placeholder="0.00" value={filters.min_amount} onChange={handleFilterChange} style={{ paddingLeft: '24px' }} />
            </div>
          </div>
          
          <div>
            <label style={{ display: 'block', fontSize: '0.65rem', fontWeight: 700, color: '#94a3b8', marginBottom: '4px', textTransform: 'uppercase' }}>MAX ($)</label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: '0.875rem' }}>$</span>
              <input type="number" name="max_amount" placeholder="0.00" value={filters.max_amount} onChange={handleFilterChange} style={{ paddingLeft: '24px' }} />
            </div>
          </div>
        </div>
      </div>

      <div className="table-container">
        {loading ? (
          <div style={{ padding: '60px', textAlign: 'center' }}>
            <div className="animate-spin" style={{ width: '32px', height: '32px', border: '3px solid #f3f4f6', borderTopColor: '#6366f1', borderRadius: '50%', margin: '0 auto' }}></div>
          </div>
        ) : transactions.length === 0 ? (
          <div style={{ padding: '80px 40px', textAlign: 'center', color: '#64748b' }}>
            <Search size={48} style={{ margin: '0 auto 16px', opacity: 0.1 }} />
            <p style={{ fontSize: '1.125rem', fontWeight: 500 }}>No transactions found</p>
            <p style={{ fontSize: '0.875rem', marginTop: '4px' }}>Try adjusting your filters or add a new transaction.</p>
          </div>
        ) : (
          <>
            <table>
              <thead>
                <tr>
                  <th>DATE</th>
                  <th>DESCRIPTION</th>
                  <th>CATEGORY</th>
                  <th>TYPE</th>
                  <th style={{ textAlign: 'right' }}>AMOUNT</th>
                  <th style={{ textAlign: 'center' }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((t) => (
                  <tr key={t.id} style={{ backgroundColor: editingId === t.id ? '#f5f7ff' : 'transparent' }}>
                    {editingId === t.id ? (
                      <td colSpan="6" style={{ padding: '20px' }}>
                        <form onSubmit={handleUpdate} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px', alignItems: 'flex-end' }}>
                          <input type="date" value={editForm.date} onChange={(e) => setEditForm({ ...editForm, date: e.target.value })} required />
                          <select value={editForm.type} onChange={(e) => setEditForm({ ...editForm, type: e.target.value })}>
                            <option value="expense">Expense</option>
                            <option value="income">Income</option>
                          </select>
                          <select value={editForm.category} onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}>
                            <option value="">Category</option>
                            {categories.map((c) => (
                              <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                          </select>
                          <input type="number" value={editForm.amount} step="0.01" required onChange={(e) => setEditForm({ ...editForm, amount: e.target.value })} />
                          <input placeholder="Description" value={editForm.description} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} />
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button type="submit" style={{ backgroundColor: '#10b981', color: 'white', padding: '8px', borderRadius: '8px', flex: 1 }}><Check size={18} /></button>
                            <button type="button" onClick={cancelEdit} style={{ backgroundColor: '#f1f5f9', color: '#64748b', padding: '8px', borderRadius: '8px', flex: 1 }}><X size={18} /></button>
                          </div>
                        </form>
                      </td>
                    ) : (
                      <>
                        <td style={{ fontWeight: 600, color: '#1e293b' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{ padding: '8px', borderRadius: '10px', backgroundColor: '#f8fafc', color: '#64748b' }}>
                              <Calendar size={16} />
                            </div>
                            {t.date ? new Date(t.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : "—"}
                          </div>
                        </td>
                        <td>
                          <div style={{ fontWeight: 500, color: '#1e293b' }}>{t.description || "—"}</div>
                        </td>
                        <td>
                          <span style={{ 
                            display: 'inline-flex', 
                            alignItems: 'center', 
                            gap: '6px',
                            backgroundColor: '#f1f5f9', 
                            padding: '4px 10px', 
                            borderRadius: '8px', 
                            fontSize: '0.75rem', 
                            fontWeight: 600, 
                            color: '#475569' 
                          }}>
                            <Tag size={12} />
                            {t.category_name || t.category || "General"}
                          </span>
                        </td>
                        <td>
                          <span style={{ 
                            color: t.type === "income" ? '#10b981' : '#ef4444',
                            backgroundColor: t.type === "income" ? '#f0fdf4' : '#fef2f2',
                            padding: '4px 10px', 
                            borderRadius: '8px', 
                            fontSize: '0.75rem', 
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            letterSpacing: '0.025em'
                          }}>
                            {t.type}
                          </span>
                        </td>
                        <td style={{ textAlign: 'right', fontWeight: 800, color: '#1e293b', fontSize: '1rem' }}>
                          <span style={{ color: t.type === 'income' ? '#10b981' : '#1e293b' }}>
                            {t.type === "income" ? "+" : "-"}${parseFloat(t.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </span>
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                            <button onClick={() => startEdit(t)} style={{ padding: '8px', borderRadius: '8px', color: '#6366f1', backgroundColor: '#f5f7ff' }}>
                              <Edit2 size={16} />
                            </button>
                            <button onClick={() => handleDelete(t.id)} style={{ padding: '8px', borderRadius: '8px', color: '#ef4444', backgroundColor: '#fef2f2' }}>
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>

            <div style={{ padding: '20px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <p style={{ fontSize: '0.875rem', color: '#64748b' }}>
                Showing <strong>{(currentPage - 1) * PAGE_SIZE + 1}</strong> to <strong>{Math.min(currentPage * PAGE_SIZE, totalCount)}</strong> of <strong>{totalCount}</strong> transactions
              </p>
              
              <div style={{ display: 'flex', gap: '8px' }}>
                <button 
                  onClick={() => fetchTransactions(currentPage - 1)} 
                  disabled={currentPage === 1}
                  className="card"
                  style={{ padding: '8px 12px', display: 'flex', alignItems: 'center', gap: '4px', opacity: currentPage === 1 ? 0.5 : 1, cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}
                >
                  <ChevronLeft size={18} />
                  Prev
                </button>
                <div style={{ display: 'flex', alignItems: 'center', padding: '0 12px', fontSize: '0.875rem', fontWeight: 600, color: '#1e293b' }}>
                  {currentPage} / {totalPages}
                </div>
                <button 
                  onClick={() => fetchTransactions(currentPage + 1)} 
                  disabled={currentPage === totalPages}
                  className="card"
                  style={{ padding: '8px 12px', display: 'flex', alignItems: 'center', gap: '4px', opacity: currentPage === totalPages ? 0.5 : 1, cursor: currentPage === totalPages ? 'not-allowed' : 'pointer' }}
                >
                  Next
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}