import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import "../styles/transactions.css";

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });
  
  // Form state
  const [form, setForm] = useState({
    type: "expense",
    category: "",
    amount: "",
    description: "",
    date: new Date().toISOString().split('T')[0], // Format as YYYY-MM-DD
  });
  
  // Filter state
  const [filters, setFilters] = useState({
    type: "",
    category: "",
    startDate: '',
    endDate: '',
    minAmount: "",
    maxAmount: "",
  });

  // Edit state
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({
    type: "expense",
    category: "",
    amount: "",
    description: "",
    date: new Date().toISOString().split('T')[0],
  });

  // Fetch transactions with filters and pagination
  const fetchTransactions = async (page = 1) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page,
        limit: pagination.limit,
        ...(filters.type && { type: filters.type }),
        ...(filters.category && { category: filters.category }),
        ...(filters.startDate && { startDate: filters.startDate }),
        ...(filters.endDate && { endDate: filters.endDate }),
        ...(filters.minAmount && { minAmount: filters.minAmount }),
        ...(filters.maxAmount && { maxAmount: filters.maxAmount }),
      });
      
      const res = await api.get(`/transactions?${params}`);
      setTransactions(res.data.data);
      setPagination({
        ...pagination,
        page,
        total: res.data.pagination.total,
        totalPages: res.data.pagination.totalPages,
      });
    } catch (err) {
      console.error("Error fetching transactions", err);
      setError("Failed to load transactions.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const res = await api.get("/transactions/categories");
      setCategories(res.data);
    } catch (err) {
      console.error("Error fetching categories", err);
    }
  };

  // Initial data load
  useEffect(() => {
    fetchTransactions();
    fetchCategories();
  }, [filters]);

  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle date input changes
  const handleDateChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Reset all filters
  const resetFilters = () => {
    setFilters({
      type: "",
      category: "",
      startDate: null,
      endDate: null,
      minAmount: "",
      maxAmount: "",
    });
  };

  // Handle pagination
  const handlePageChange = (page) => {
    if (page >= 1 && page <= pagination.totalPages) {
      fetchTransactions(page);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await api.post("/transactions", form);
      setForm({ 
        type: "expense", 
        category: "", 
        amount: "", 
        description: "",
        date: new Date() 
      });
      fetchTransactions();
    } catch (err) {
      console.error("Error adding transaction", err);
      setError("Failed to add transaction.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this transaction?")) {
      return;
    }
    try {
      await api.delete(`/transactions/${id}`);
      fetchTransactions();
    } catch (err) {
      console.error("Error deleting transaction", err);
      setError("Failed to delete transaction.");
    }
  };

  const handleEdit = (transaction) => {
    setEditingId(transaction._id);
    setEditForm({
      type: transaction.type,
      category: transaction.category,
      amount: transaction.amount,
      description: transaction.description,
      date: new Date(transaction.date).toISOString().split('T')[0],
    });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await api.put(`/transactions/${editingId}`, editForm);
      setEditingId(null);
      setEditForm({
        type: "expense",
        category: "",
        amount: "",
        description: "",
        date: new Date().toISOString().split('T')[0],
      });
      fetchTransactions();
    } catch (err) {
      console.error("Error updating transaction", err);
      setError("Failed to update transaction.");
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({
      type: "expense",
      category: "",
      amount: "",
      description: "",
      date: new Date().toISOString().split('T')[0],
    });
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  return (
    <div style={{ maxWidth: 700, margin: "40px auto", textAlign: "center" }}>
      {/* Navigation Bar */}
      <div style={{ marginBottom: 20 }}>
        <Link to="/" style={{ marginRight: 10 }}>
          Dashboard
        </Link>
        <Link to="/transactions" style={{ marginRight: 10 }}>
          Transactions
        </Link>
        <button onClick={handleLogout}>Logout</button>
      </div>

      <h2>Manage Transactions</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}

      {/* 🔹 Add Transaction Form */}
      <form
        onSubmit={handleSubmit}
        style={{
          marginBottom: 20,
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: "8px",
        }}
      >
        <select
          value={form.type}
          onChange={(e) => setForm({ ...form, type: e.target.value })}
        >
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </select>

        <input
          type="date"
          name="date"
          value={form.date}
          onChange={(e) => setForm({ ...form, date: e.target.value })}
          max={new Date().toISOString().split('T')[0]}
        />
        <input
          placeholder="Category"
          value={form.category}
          onChange={(e) => setForm({ ...form, category: e.target.value })}
          required
        />
        <input
          type="number"
          placeholder="Amount"
          value={form.amount}
          onChange={(e) => setForm({ ...form, amount: e.target.value })}
          required
        />
        <input
          placeholder="Description"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />
        <button type="submit">Add</button>
      </form>

      {/* 🔹 Filter Section */}
      <div
        style={{
          marginBottom: 20,
          padding: "15px",
          border: "1px solid #ddd",
          borderRadius: 8,
          background: "#f9f9f9",
        }}
      >
        <h3 style={{ marginBottom: 10 }}>Filter Transactions</h3>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "10px",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <select
            name="type"
            value={filters.type}
            onChange={handleFilterChange}
            style={{ padding: "6px", borderRadius: 4 }}
          >
            <option value="">All Types</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>

          <select
            name="category"
            value={filters.category}
            onChange={handleFilterChange}
            style={{ padding: "6px", borderRadius: 4 }}
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          <input
            type="date"
            name="startDate"
            placeholder="Start Date"
            value={filters.startDate}
            onChange={handleDateChange}
            style={{ padding: "6px", borderRadius: 4 }}
          />

          <input
            type="date"
            name="endDate"
            placeholder="End Date"
            value={filters.endDate}
            onChange={handleDateChange}
            style={{ padding: "6px", borderRadius: 4 }}
          />

          <input
            type="number"
            name="minAmount"
            placeholder="Min Amount"
            value={filters.minAmount}
            onChange={handleFilterChange}
            style={{ padding: "6px", borderRadius: 4, width: "100px" }}
          />

          <input
            type="number"
            name="maxAmount"
            placeholder="Max Amount"
            value={filters.maxAmount}
            onChange={handleFilterChange}
            style={{ padding: "6px", borderRadius: 4, width: "100px" }}
          />

          <button
            onClick={resetFilters}
            style={{
              padding: "6px 12px",
              background: "#6c757d",
              color: "#fff",
              border: "none",
              borderRadius: 4,
              cursor: "pointer",
            }}
          >
            Reset Filters
          </button>
        </div>
      </div>

      {/* 🔹 Transactions Table */}
      {loading ? (
        <p>Loading...</p>
      ) : transactions.length === 0 ? (
        <p>No transactions found.</p>
      ) : (
        <>
          <div style={{ marginBottom: 10, textAlign: "left" }}>
            <strong>Total: {pagination.total} transactions</strong>
          </div>
          <table
            width="100%"
            border="1"
            cellPadding="8"
            style={{ borderCollapse: "collapse", marginTop: 10 }}
          >
            <thead>
              <tr style={{ background: "#f2f2f2" }}>
                <th>Date</th>
                <th>Type</th>
                <th>Category</th>
                <th>Amount ($)</th>
                <th>Description</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((t) => (
                editingId === t._id ? (
                  <tr key={t._id} style={{ background: "#fffacd" }}>
                    <td colSpan="6">
                      <form
                        onSubmit={handleUpdate}
                        style={{
                          display: "flex",
                          flexWrap: "wrap",
                          gap: "8px",
                          justifyContent: "center",
                          padding: "10px",
                        }}
                      >
                        <input
                          type="date"
                          value={editForm.date}
                          onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
                          required
                          style={{ padding: "6px" }}
                        />
                        <select
                          value={editForm.type}
                          onChange={(e) => setEditForm({ ...editForm, type: e.target.value })}
                          style={{ padding: "6px" }}
                        >
                          <option value="income">Income</option>
                          <option value="expense">Expense</option>
                        </select>
                        <input
                          placeholder="Category"
                          value={editForm.category}
                          onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                          required
                          style={{ padding: "6px" }}
                        />
                        <input
                          type="number"
                          placeholder="Amount"
                          value={editForm.amount}
                          onChange={(e) => setEditForm({ ...editForm, amount: e.target.value })}
                          required
                          style={{ padding: "6px" }}
                        />
                        <input
                          placeholder="Description"
                          value={editForm.description}
                          onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                          style={{ padding: "6px" }}
                        />
                        <button
                          type="submit"
                          style={{
                            padding: "6px 12px",
                            background: "#28a745",
                            color: "#fff",
                            border: "none",
                            cursor: "pointer",
                            borderRadius: 4,
                          }}
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          onClick={cancelEdit}
                          style={{
                            padding: "6px 12px",
                            background: "#6c757d",
                            color: "#fff",
                            border: "none",
                            cursor: "pointer",
                            borderRadius: 4,
                          }}
                        >
                          Cancel
                        </button>
                      </form>
                    </td>
                  </tr>
                ) : (
                  <tr key={t._id}>
                    <td>{new Date(t.date).toLocaleDateString()}</td>
                    <td style={{ textTransform: "capitalize" }}>{t.type}</td>
                    <td>{t.category}</td>
                    <td style={{ color: t.type === "income" ? "green" : "red" }}>
                      ${Number(t.amount).toFixed(2)}
                    </td>
                    <td>{t.description}</td>
                    <td>
                      <button
                        onClick={() => handleEdit(t)}
                        style={{
                          background: "#007bff",
                          color: "#fff",
                          border: "none",
                          cursor: "pointer",
                          padding: "4px 8px",
                          marginRight: "5px",
                          borderRadius: 4,
                        }}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(t._id)}
                        style={{
                          background: "#dc3545",
                          color: "#fff",
                          border: "none",
                          cursor: "pointer",
                          padding: "4px 8px",
                          borderRadius: 4,
                        }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                )
              ))}
            </tbody>
          </table>

          {/* 🔹 Pagination Controls */}
          <div
            style={{
              marginTop: 20,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <button
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
              style={{
                padding: "8px 16px",
                background: pagination.page === 1 ? "#ccc" : "#007bff",
                color: "#fff",
                border: "none",
                borderRadius: 4,
                cursor: pagination.page === 1 ? "not-allowed" : "pointer",
              }}
            >
              Previous
            </button>

            <span style={{ fontWeight: "bold" }}>
              Page {pagination.page} of {pagination.totalPages}
            </span>

            <button
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page === pagination.totalPages}
              style={{
                padding: "8px 16px",
                background: pagination.page === pagination.totalPages ? "#ccc" : "#007bff",
                color: "#fff",
                border: "none",
                borderRadius: 4,
                cursor: pagination.page === pagination.totalPages ? "not-allowed" : "pointer",
              }}
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
}