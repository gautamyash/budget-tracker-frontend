import React, { useEffect, useState, useRef } from "react";
import api from "../services/api";
import { Link } from "react-router-dom";
import * as d3 from "d3";
import { TrendingUp, TrendingDown, Wallet, Plus, Calendar, Filter } from "lucide-react";
import StatCard from "../components/StatCard";
import { motion, AnimatePresence } from "framer-motion";

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [budgetSummary, setBudgetSummary] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [showBudgetForm, setShowBudgetForm] = useState(false);
  const [budgetAmount, setBudgetAmount] = useState("");
  const [budgetMonth, setBudgetMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  });

  const budgetChartRef = useRef();
  const categoryChartRef = useRef();
  const trendChartRef = useRef();

  useEffect(() => {
    loadAll();
  }, []);

  useEffect(() => {
    if (budgetSummary) renderBudgetChart();
  }, [budgetSummary]);

  useEffect(() => {
    if (transactions.length > 0) {
      renderCategoryChart();
      renderTrendChart();
    }
  }, [transactions]);

  const loadAll = async () => {
    setIsLoading(true);
    try {
      const [summaryData, budgetData, txData] = await Promise.all([
        api.get("/summary/"),
        api.get("/budget-summary/"),
        api.get("/transactions/"),
      ]);
      setSummary(summaryData);
      setBudgetSummary(budgetData);
      const txList = Array.isArray(txData) ? txData : txData.results || [];
      setTransactions(txList);
    } catch {
      setErrorMsg("Failed to load dashboard data.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetBudget = async (e) => {
    e.preventDefault();
    try {
      const [year, month] = budgetMonth.split("-");
      await api.post("/budgets/", {
        month: parseInt(month),
        year: parseInt(year),
        amount: parseFloat(budgetAmount),
      });
      setShowBudgetForm(false);
      setBudgetAmount("");
      loadAll();
    } catch {
      setErrorMsg("Failed to set budget.");
    }
  };

  const renderBudgetChart = () => {
    const budget = parseFloat(budgetSummary.budget_amount) || 0;
    const spent = parseFloat(budgetSummary.total_spent) || 0;

    const data = [
      { label: "Budget", value: budget, color: "#6366f1" },
      { label: "Spent", value: spent, color: "#ef4444" },
    ];

    const w = 400, h = 250, pad = { top: 20, right: 20, bottom: 40, left: 60 };
    d3.select(budgetChartRef.current).selectAll("*").remove();

    const svg = d3.select(budgetChartRef.current).append("svg").attr("width", w).attr("height", h);
    const x = d3.scaleBand().domain(data.map((d) => d.label)).range([pad.left, w - pad.right]).padding(0.4);
    const y = d3.scaleLinear().domain([0, d3.max(data, (d) => d.value) * 1.2 || 100]).nice().range([h - pad.bottom, pad.top]);

    const tooltip = d3.select(budgetChartRef.current).append("div")
      .style("position", "absolute").style("background", "#1e293b").style("color", "#f8fafc")
      .style("padding", "8px 12px").style("border-radius", "8px").style("font-size", "12px")
      .style("pointer-events", "none").style("opacity", 0).style("box-shadow", "0 10px 15px -3px rgba(0,0,0,0.1)");

    svg.append("g").selectAll("rect").data(data).join("rect")
      .attr("fill", (d) => d.color).attr("x", (d) => x(d.label))
      .attr("y", h - pad.bottom).attr("height", 0).attr("width", x.bandwidth()).attr("rx", 6)
      .on("mouseenter", function (event, d) {
        d3.select(this).style("filter", "brightness(110%)");
        tooltip.style("opacity", 1).html(`<strong>${d.label}</strong><br/>$${d.value.toLocaleString()}`);
      })
      .on("mousemove", function (event) {
        tooltip.style("left", event.pageX + 12 + "px").style("top", event.pageY - 28 + "px");
      })
      .on("mouseleave", function () {
        d3.select(this).style("filter", "none");
        tooltip.style("opacity", 0);
      })
      .transition().duration(800)
      .attr("y", (d) => y(d.value))
      .attr("height", (d) => y(0) - y(d.value));

    svg.append("g").attr("transform", `translate(0,${h - pad.bottom})`).call(d3.axisBottom(x).tickSize(0).tickPadding(10))
      .selectAll("text").style("font-family", "Inter").style("font-size", "12px").style("color", "#64748b");

    svg.append("g").attr("transform", `translate(${pad.left},0)`)
      .call(d3.axisLeft(y).ticks(5).tickFormat((v) => `$${v}`).tickSize(-w + pad.left + pad.right).tickPadding(10));
    
    svg.selectAll(".domain").remove();
    svg.selectAll(".tick line").attr("stroke", "#e2e8f0").attr("stroke-dasharray", "2,2");
    svg.selectAll(".tick text").style("font-family", "Inter").style("font-size", "11px").style("color", "#64748b");
  };

  const renderCategoryChart = () => {
    const catTotals = transactions
      .filter((t) => t.type === "expense")
      .reduce((acc, t) => {
        const cat = t.category_name || t.category || "Other";
        acc[cat] = (acc[cat] || 0) + parseFloat(t.amount);
        return acc;
      }, {});

    const pieData = Object.entries(catTotals).map(([name, total]) => ({ name, total }));
    if (pieData.length === 0) return;

    const w = 400, h = 340, r = Math.min(w, h - 80) / 2;
    d3.select(categoryChartRef.current).selectAll("*").remove();

    const svg = d3.select(categoryChartRef.current).append("svg").attr("width", w).attr("height", h);
    const g = svg.append("g").attr("transform", `translate(${w / 2},${h / 2 - 20})`);
    
    const modernColors = ["#6366f1", "#10b981", "#f59e0b", "#ef4444", "#3b82f6", "#8b5cf6", "#ec4899", "#06b6d4"];
    const colors = d3.scaleOrdinal(modernColors);
    const pie = d3.pie().value((d) => d.total).sort(null);
    const arc = d3.arc().innerRadius(r * 0.6).outerRadius(r).cornerRadius(4);
    const arcHover = d3.arc().innerRadius(r * 0.6).outerRadius(r * 1.05).cornerRadius(6);

    const tooltip = d3.select(categoryChartRef.current).append("div")
      .style("position", "absolute").style("background", "#1e293b").style("color", "#f8fafc")
      .style("padding", "8px 12px").style("border-radius", "8px").style("font-size", "12px")
      .style("pointer-events", "none").style("opacity", 0);

    const total = d3.sum(pieData, (d) => d.total);

    g.selectAll("path").data(pie(pieData)).join("path")
      .attr("d", arc)
      .attr("fill", (d) => colors(d.data.name))
      .attr("stroke", "#fff").style("stroke-width", "3px").style("opacity", 0)
      .on("mouseenter", function (event, d) {
        d3.select(this).transition().duration(200).attr("d", arcHover).style("opacity", 1);
        const pct = ((d.data.total / total) * 100).toFixed(1);
        tooltip.style("opacity", 1).html(`<strong>${d.data.name}</strong><br/>$${d.data.total.toLocaleString()}<br/>${pct}%`);
      })
      .on("mousemove", function (event) {
        tooltip.style("left", event.pageX + 12 + "px").style("top", event.pageY - 28 + "px");
      })
      .on("mouseleave", function () {
        d3.select(this).transition().duration(200).attr("d", arc).style("opacity", 0.9);
        tooltip.style("opacity", 0);
      })
      .transition().duration(1000).style("opacity", 0.9)
      .attrTween("d", function (d) {
        const i = d3.interpolate({ startAngle: 0, endAngle: 0 }, d);
        return (t) => arc(i(t));
      });

    const legend = svg.append("g").attr("transform", `translate(20,${h - 45})`);
    pieData.forEach((d, i) => {
      const row = legend.append("g").attr("transform", `translate(${(i % 4) * 95},${Math.floor(i / 4) * 20})`);
      row.append("rect").attr("width", 10).attr("height", 10).attr("fill", colors(d.name)).attr("rx", 2);
      row.append("text").attr("x", 15).attr("y", 9).style("font-size", "10px").style("fill", "#64748b").style("font-family", "Inter")
        .text(d.name.length > 10 ? d.name.slice(0, 10) + "…" : d.name);
    });
  };

  const renderTrendChart = () => {
    const byDay = transactions.reduce((acc, t) => {
      const day = t.date ? t.date.split("T")[0] : "";
      if (!day) return acc;
      if (!acc[day]) acc[day] = { date: day, income: 0, expense: 0 };
      if (t.type === "income") acc[day].income += parseFloat(t.amount);
      else acc[day].expense += parseFloat(t.amount);
      return acc;
    }, {});

    const trendData = Object.values(byDay).sort((a, b) => new Date(a.date) - new Date(b.date)).slice(-30);
    if (trendData.length === 0) return;

    const w = 700, h = 240, pad = { top: 20, right: 80, bottom: 40, left: 55 };
    d3.select(trendChartRef.current).selectAll("*").remove();

    const svg = d3.select(trendChartRef.current).append("svg").attr("width", w).attr("height", h);
    const xScale = d3.scaleTime().domain(d3.extent(trendData, (d) => new Date(d.date))).range([pad.left, w - pad.right]);
    const yMax = d3.max(trendData, (d) => Math.max(d.income, d.expense)) * 1.1 || 10;
    const yScale = d3.scaleLinear().domain([0, yMax]).nice().range([h - pad.bottom, pad.top]);

    const lineIncome = d3.line().x((d) => xScale(new Date(d.date))).y((d) => yScale(d.income)).curve(d3.curveMonotoneX);
    const lineExpense = d3.line().x((d) => xScale(new Date(d.date))).y((d) => yScale(d.expense)).curve(d3.curveMonotoneX);

    const drawLine = (pathData, color, gradientId) => {
      const gradient = svg.append("defs").append("linearGradient").attr("id", gradientId).attr("x1", "0%").attr("y1", "0%").attr("x2", "0%").attr("y2", "100%");
      gradient.append("stop").attr("offset", "0%").attr("style", `stop-color:${color};stop-opacity:0.2`);
      gradient.append("stop").attr("offset", "100%").attr("style", `stop-color:${color};stop-opacity:0`);

      const area = d3.area().x((d) => xScale(new Date(d.date))).y0(h - pad.bottom).y1((d) => yScale(pathData === lineIncome ? d.income : d.expense)).curve(d3.curveMonotoneX);
      svg.append("path").datum(trendData).attr("fill", `url(#${gradientId})`).attr("d", area).style("opacity", 0).transition().duration(1400).style("opacity", 1);

      const p = svg.append("path").datum(trendData).attr("fill", "none").attr("stroke", color).attr("stroke-width", 3).attr("stroke-linecap", "round").attr("d", pathData);
      const len = p.node().getTotalLength();
      p.attr("stroke-dasharray", `${len} ${len}`).attr("stroke-dashoffset", len).transition().duration(1400).attr("stroke-dashoffset", 0);
    };

    drawLine(lineIncome, "#10b981", "incomeGrad");
    drawLine(lineExpense, "#ef4444", "expenseGrad");

    svg.append("g").attr("transform", `translate(0,${h - pad.bottom})`).call(d3.axisBottom(xScale).ticks(5).tickFormat(d3.timeFormat("%b %d")).tickSize(0).tickPadding(12))
      .selectAll("text").style("font-family", "Inter").style("font-size", "10px").style("color", "#64748b");

    svg.append("g").attr("transform", `translate(${pad.left},0)`).call(d3.axisLeft(yScale).ticks(5).tickFormat((v) => `$${v}`).tickSize(-w + pad.left + pad.right).tickPadding(10));
    
    svg.selectAll(".domain").remove();
    svg.selectAll(".tick line").attr("stroke", "#e2e8f0").attr("stroke-dasharray", "2,2");
    svg.selectAll(".tick text").style("font-family", "Inter").style("font-size", "10px").style("color", "#64748b");
  };

  if (isLoading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
      <div className="animate-spin" style={{ width: '40px', height: '40px', border: '4px solid #e2e8f0', borderTopColor: '#6366f1', borderRadius: '50%' }}></div>
    </div>
  );

  return (
    <div className="animate-fade-in">
      <header style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 style={{ fontSize: '1.875rem', marginBottom: '8px' }}>Dashboard</h1>
          <p style={{ color: '#64748b' }}>Welcome back! Here's what's happening with your money.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="card" style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.875rem', fontWeight: 600 }}>
            <Calendar size={18} />
            This Month
          </button>
        </div>
      </header>

      {errorMsg && <div style={{ padding: '16px', backgroundColor: '#fef2f2', color: '#dc2626', borderRadius: '8px', marginBottom: '24px', border: '1px solid #fee2e2' }}>{errorMsg}</div>}

      {summary && (
        <div className="stats-grid">
          <StatCard title="Total Income" value={summary.total_income} color="#10b981" icon={TrendingUp} trend={12} />
          <StatCard title="Total Expenses" value={summary.total_expenses} color="#ef4444" icon={TrendingDown} trend={-5} />
          <StatCard title="Total Balance" value={summary.balance} color="#6366f1" icon={Wallet} />
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px', marginBottom: '32px' }}>
        <div className="card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
            <h3 style={{ fontSize: '1.125rem' }}>Budget vs Expenses</h3>
            <button
              onClick={() => setShowBudgetForm(!showBudgetForm)}
              style={{ color: "#6366f1", backgroundColor: "#f5f7ff", padding: '6px 12px', fontSize: '0.8125rem', fontWeight: 600 }}
            >
              {budgetSummary?.budget_amount > 0 ? "Update Budget" : "Set Budget"}
            </button>
          </div>

          <AnimatePresence>
            {showBudgetForm && (
              <motion.form 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                onSubmit={handleSetBudget} 
                style={{ display: "flex", gap: "12px", marginBottom: "24px", overflow: 'hidden' }}
              >
                <input
                  type="month"
                  value={budgetMonth}
                  onChange={(e) => setBudgetMonth(e.target.value)}
                  required
                />
                <input
                  type="number"
                  placeholder="Amount"
                  value={budgetAmount}
                  onChange={(e) => setBudgetAmount(e.target.value)}
                  required
                  min="0"
                  step="0.01"
                />
                <button type="submit" className="btn-primary" style={{ padding: '8px 16px' }}>Save</button>
              </motion.form>
            )}
          </AnimatePresence>

          {budgetSummary && (
            <div>
              <div style={{ display: "flex", gap: "24px", marginBottom: "20px" }}>
                <div>
                  <p style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 500 }}>REMAINING</p>
                  <p style={{ fontSize: '1.25rem', fontWeight: 700, color: parseFloat(budgetSummary.remaining) < 0 ? '#ef4444' : '#10b981' }}>
                    ${parseFloat(budgetSummary.remaining || 0).toLocaleString()}
                  </p>
                </div>
                <div style={{ width: '1px', backgroundColor: '#e2e8f0' }} />
                <div>
                  <p style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 500 }}>BUDGET LIMIT</p>
                  <p style={{ fontSize: '1.25rem', fontWeight: 700 }}>
                    ${parseFloat(budgetSummary.budget_amount || 0).toLocaleString()}
                  </p>
                </div>
              </div>
              <div ref={budgetChartRef} style={{ width: '100%', overflow: 'hidden' }}></div>
            </div>
          )}
        </div>

          <div className="card">
          <h3 style={{ fontSize: '1.125rem', marginBottom: '24px' }}>Expenses by Category</h3>
          <div ref={categoryChartRef} style={{ width: '100%', display: 'flex', justifyContent: 'center' }}></div>
          {transactions.filter((t) => t.type === "expense").length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px 0', color: '#94a3b8' }}>
              <Filter size={40} style={{ margin: '0 auto 12px', opacity: 0.2 }} />
              <p>No expense data for this period.</p>
            </div>
          )}
        </div>
      </div>

      <div className="card" style={{ marginBottom: '32px' }}>
        <h3 style={{ fontSize: '1.125rem', marginBottom: '24px' }}>Finance Trend</h3>
        <div ref={trendChartRef} style={{ width: '100%', overflowX: 'auto' }}></div>
      </div>

      <section>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ fontSize: '1.125rem' }}>Recent Transactions</h3>
          <Link to="/transactions" style={{ fontSize: '0.875rem', fontWeight: 600 }}>View All</Link>
        </div>
        
        <div className="table-container">
          {transactions.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>No transactions found.</div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Category</th>
                  <th>Type</th>
                  <th style={{ textAlign: 'right' }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {transactions.slice(0, 5).map((t) => (
                  <tr key={t.id}>
                    <td>{t.date ? new Date(t.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : "—"}</td>
                    <td>
                      <span style={{ backgroundColor: '#f1f5f9', padding: '4px 8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600, color: '#475569' }}>
                        {t.category_name || t.category || "General"}
                      </span>
                    </td>
                    <td style={{ textTransform: "capitalize" }}>
                      <span style={{ 
                        color: t.type === "income" ? '#10b981' : '#ef4444',
                        backgroundColor: t.type === "income" ? '#f0fdf4' : '#fef2f2',
                        padding: '4px 8px',
                        borderRadius: '6px',
                        fontSize: '0.75rem',
                        fontWeight: 600
                      }}>
                        {t.type}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: 700, color: '#1e293b' }}>
                      {t.type === "income" ? "+" : "-"}${parseFloat(t.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </div>
  );
}
