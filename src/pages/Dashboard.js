import React, { useEffect, useState, useRef } from "react";
import api from "../services/api";
import { Link } from "react-router-dom";
import * as d3 from "d3";

export default function Dashboard() {
  const [transactionData, setTransactionData] = useState([]);
  const [budgetInfo, setBudgetInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [showBudgetForm, setShowBudgetForm] = useState(false);
  const [budgetAmount, setBudgetAmount] = useState("");
  const budgetChartContainer = useRef();
  const categoryChartContainer = useRef();
  const trendChartContainer = useRef();

  useEffect(() => {
    loadDashboardData();
  }, []);

  useEffect(() => {
    if (budgetInfo) renderBudgetComparison();
  }, [budgetInfo]);

  useEffect(() => {
    if (transactionData.length > 0) {
      renderCategoryBreakdown();
      renderTransactionTrends();
    }
  }, [transactionData]);

  const loadDashboardData = async () => {
    try {
      const [transactionsResponse, budgetResponse] = await Promise.all([
        api.get("/transactions"),
        api.get("/budget/summary"),
      ]);
      setTransactionData(transactionsResponse.data);
      setBudgetInfo(budgetResponse.data);
    } catch (err) {
      console.error("Dashboard data loading error:", err);
      setErrorMsg("Failed to load data. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const performLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  const handleSetBudget = async (e) => {
    e.preventDefault();
    try {
      const currentDate = new Date();
      await api.post("/budget", {
        month: currentDate.getMonth() + 1,
        year: currentDate.getFullYear(),
        amount: parseFloat(budgetAmount)
      });
      setShowBudgetForm(false);
      setBudgetAmount("");
      loadDashboardData();
    } catch (err) {
      console.error("Budget creation error:", err);
      setErrorMsg("Failed to set budget");
    }
  };

  // Render budget vs expenses comparison chart
  const renderBudgetComparison = () => {
    const chartData = [
      { category: "Budget", amount: budgetInfo.budget, fill: "#22c55e" },
      { category: "Expenses", amount: budgetInfo.totalExpenses, fill: "#dc2626" },
    ];

    const chartWidth = 400;
    const chartHeight = 250;
    const spacing = { top: 20, right: 20, bottom: 40, left: 60 };

    d3.select(budgetChartContainer.current).selectAll("*").remove();

    const svgCanvas = d3
      .select(budgetChartContainer.current)
      .append("svg")
      .attr("width", chartWidth)
      .attr("height", chartHeight);

    const xScale = d3
      .scaleBand()
      .domain(chartData.map((item) => item.category))
      .range([spacing.left, chartWidth - spacing.right])
      .padding(0.4);

    const yScale = d3
      .scaleLinear()
      .domain([0, d3.max(chartData, (item) => item.amount) * 1.15])
      .nice()
      .range([chartHeight - spacing.bottom, spacing.top]);

    // Create hover tooltip
    const hoverBox = d3
      .select(budgetChartContainer.current)
      .append("div")
      .style("position", "absolute")
      .style("background", "#1f2937")
      .style("color", "#f9fafb")
      .style("padding", "10px")
      .style("border-radius", "6px")
      .style("font-size", "13px")
      .style("pointer-events", "none")
      .style("opacity", 0)
      .style("box-shadow", "0 4px 6px rgba(0,0,0,0.1)");

    // Render bars with smooth animation
    svgCanvas
      .append("g")
      .selectAll("rect")
      .data(chartData)
      .join("rect")
      .attr("fill", (item) => item.fill)
      .attr("x", (item) => xScale(item.category))
      .attr("y", chartHeight - spacing.bottom)
      .attr("height", 0)
      .attr("width", xScale.bandwidth())
      .attr("rx", 5)
      .on("mouseenter", function (event, item) {
        d3.select(this).style("opacity", 0.7);
        hoverBox
          .style("opacity", 1)
          .html(`<div><strong>${item.category}</strong></div><div>$${item.amount.toFixed(2)}</div>`);
      })
      .on("mousemove", function (event) {
        hoverBox
          .style("left", event.pageX + 15 + "px")
          .style("top", event.pageY - 30 + "px");
      })
      .on("mouseleave", function () {
        d3.select(this).style("opacity", 1);
        hoverBox.style("opacity", 0);
      })
      .transition()
      .duration(1000)
      .attr("y", (item) => yScale(item.amount))
      .attr("height", (item) => yScale(0) - yScale(item.amount));

    // Add value labels
    svgCanvas
      .append("g")
      .selectAll("text")
      .data(chartData)
      .join("text")
      .attr("x", (item) => xScale(item.category) + xScale.bandwidth() / 2)
      .attr("y", chartHeight - spacing.bottom)
      .attr("text-anchor", "middle")
      .style("font-size", "13px")
      .style("font-weight", "600")
      .style("fill", "#374151")
      .transition()
      .duration(1000)
      .attr("y", (item) => yScale(item.amount) - 8)
      .text((item) => `$${item.amount.toFixed(0)}`);

    // X-axis rendering
    svgCanvas
      .append("g")
      .attr("transform", `translate(0,${chartHeight - spacing.bottom})`)
      .call(d3.axisBottom(xScale))
      .selectAll("text")
      .style("font-size", "13px")
      .style("font-weight", "500");

    // Y-axis rendering
    svgCanvas
      .append("g")
      .attr("transform", `translate(${spacing.left},0)`)
      .call(d3.axisLeft(yScale).ticks(6).tickFormat((val) => `$${val}`))
      .selectAll("text")
      .style("font-size", "11px");

    // Y-axis title
    svgCanvas
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", spacing.left - 48)
      .attr("x", -(chartHeight / 2))
      .attr("text-anchor", "middle")
      .style("font-size", "13px")
      .style("fill", "#6b7280")
      .text("Amount ($)");
  };

  // Render expense category breakdown donut chart
  const renderCategoryBreakdown = () => {
    const categoryTotals = transactionData
      .filter((txn) => txn.type === "expense")
      .reduce((accumulator, current) => {
        accumulator[current.category] = (accumulator[current.category] || 0) + Number(current.amount);
        return accumulator;
      }, {});

    const pieData = Object.entries(categoryTotals).map(([cat, sum]) => ({
      category: cat,
      total: sum,
    }));

    if (pieData.length === 0) return;

    const chartWidth = 400;
    const chartHeight = 350;
    const chartRadius = Math.min(chartWidth, chartHeight - 50) / 2;

    d3.select(categoryChartContainer.current).selectAll("*").remove();

    const svgCanvas = d3
      .select(categoryChartContainer.current)
      .append("svg")
      .attr("width", chartWidth)
      .attr("height", chartHeight);

    const centerGroup = svgCanvas
      .append("g")
      .attr("transform", `translate(${chartWidth / 2},${chartHeight / 2 - 20})`);

    const colorPalette = d3.scaleOrdinal(d3.schemePastel1);

    const pieLayout = d3
      .pie()
      .value((item) => item.total)
      .sort(null);

    const pieSegments = pieLayout(pieData);

    const arcGenerator = d3
      .arc()
      .innerRadius(chartRadius * 0.55)
      .outerRadius(chartRadius);

    const expandedArc = d3
      .arc()
      .innerRadius(chartRadius * 0.55)
      .outerRadius(chartRadius * 1.12);

    // Create info tooltip
    const infoBox = d3
      .select(categoryChartContainer.current)
      .append("div")
      .style("position", "absolute")
      .style("background", "#1f2937")
      .style("color", "#f9fafb")
      .style("padding", "10px")
      .style("border-radius", "6px")
      .style("font-size", "13px")
      .style("pointer-events", "none")
      .style("opacity", 0)
      .style("box-shadow", "0 4px 6px rgba(0,0,0,0.1)");

    // Draw donut segments
    centerGroup.selectAll("path")
      .data(pieSegments)
      .join("path")
      .attr("d", arcGenerator)
      .attr("fill", (segment) => colorPalette(segment.data.category))
      .attr("stroke", "#ffffff")
      .style("stroke-width", "3px")
      .style("opacity", 0)
      .on("mouseenter", function (event, segment) {
        d3.select(this)
          .transition()
          .duration(250)
          .attr("d", expandedArc)
          .style("opacity", 1);
        
        const percent = ((segment.data.total / d3.sum(pieData, (item) => item.total)) * 100).toFixed(1);
        infoBox
          .style("opacity", 1)
          .html(`<div><strong>${segment.data.category}</strong></div><div>$${segment.data.total.toFixed(2)}</div><div>${percent}%</div>`);
      })
      .on("mousemove", function (event) {
        infoBox
          .style("left", event.pageX + 15 + "px")
          .style("top", event.pageY - 30 + "px");
      })
      .on("mouseleave", function () {
        d3.select(this)
          .transition()
          .duration(250)
          .attr("d", arcGenerator)
          .style("opacity", 0.92);
        infoBox.style("opacity", 0);
      })
      .transition()
      .duration(1000)
      .style("opacity", 0.92)
      .attrTween("d", function (segment) {
        const interpolator = d3.interpolate({ startAngle: 0, endAngle: 0 }, segment);
        return function (t) {
          return arcGenerator(interpolator(t));
        };
      });

    // Add percentage text
    centerGroup.selectAll("text")
      .data(pieSegments)
      .join("text")
      .attr("transform", (segment) => `translate(${arcGenerator.centroid(segment)})`)
      .style("text-anchor", "middle")
      .style("font-size", "12px")
      .style("font-weight", "600")
      .style("fill", "#1f2937")
      .style("opacity", 0)
      .transition()
      .delay(1000)
      .duration(500)
      .style("opacity", 1)
      .text((segment) => {
        const percent = ((segment.data.total / d3.sum(pieData, (item) => item.total)) * 100);
        return percent > 6 ? `${percent.toFixed(0)}%` : "";
      });

    // Create legend
    const legendGroup = svgCanvas
      .append("g")
      .attr("transform", `translate(20, ${chartHeight - 40})`);

    const legendEntries = legendGroup
      .selectAll(".legend-entry")
      .data(pieData)
      .join("g")
      .attr("class", "legend-entry")
      .attr("transform", (item, idx) => `translate(${(idx % 3) * 120}, ${Math.floor(idx / 3) * 22})`);

    legendEntries
      .append("rect")
      .attr("width", 14)
      .attr("height", 14)
      .attr("fill", (item) => colorPalette(item.category))
      .attr("rx", 3);

    legendEntries
      .append("text")
      .attr("x", 20)
      .attr("y", 11)
      .style("font-size", "12px")
      .style("fill", "#374151")
      .text((item) => item.category.length > 9 ? item.category.substring(0, 9) + "..." : item.category);
  };

  // Render transaction trend line chart
  const renderTransactionTrends = () => {
    const dailyTotals = transactionData.reduce((acc, txn) => {
      const dateKey = new Date(txn.date).toISOString().split('T')[0];
      if (!acc[dateKey]) acc[dateKey] = { date: dateKey, incomeAmt: 0, expenseAmt: 0 };
      if (txn.type === 'income') acc[dateKey].incomeAmt += Number(txn.amount);
      else acc[dateKey].expenseAmt += Number(txn.amount);
      return acc;
    }, {});

    const trendData = Object.values(dailyTotals)
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(-30);

    if (trendData.length === 0) return;

    const w = 600, h = 250, pad = { top: 20, right: 80, bottom: 40, left: 60 };
    d3.select(trendChartContainer.current).selectAll("*").remove();

    const canvas = d3.select(trendChartContainer.current).append("svg").attr("width", w).attr("height", h);
    const xAxis = d3.scaleTime().domain(d3.extent(trendData, d => new Date(d.date))).range([pad.left, w - pad.right]);
    const yAxis = d3.scaleLinear().domain([0, d3.max(trendData, d => Math.max(d.incomeAmt, d.expenseAmt)) * 1.1]).nice().range([h - pad.bottom, pad.top]);

    const incomePath = d3.line().x(d => xAxis(new Date(d.date))).y(d => yAxis(d.incomeAmt)).curve(d3.curveMonotoneX);
    const expensePath = d3.line().x(d => xAxis(new Date(d.date))).y(d => yAxis(d.expenseAmt)).curve(d3.curveMonotoneX);

    canvas.append("path").datum(trendData).attr("fill", "none").attr("stroke", "#22c55e").attr("stroke-width", 2.5).attr("d", incomePath)
      .attr("stroke-dasharray", function() { return this.getTotalLength() + " " + this.getTotalLength(); })
      .attr("stroke-dashoffset", function() { return this.getTotalLength(); })
      .transition().duration(1500).attr("stroke-dashoffset", 0);

    canvas.append("path").datum(trendData).attr("fill", "none").attr("stroke", "#dc2626").attr("stroke-width", 2.5).attr("d", expensePath)
      .attr("stroke-dasharray", function() { return this.getTotalLength() + " " + this.getTotalLength(); })
      .attr("stroke-dashoffset", function() { return this.getTotalLength(); })
      .transition().duration(1500).attr("stroke-dashoffset", 0);

    canvas.append("g").attr("transform", `translate(0,${h - pad.bottom})`).call(d3.axisBottom(xAxis).ticks(5).tickFormat(d3.timeFormat("%b %d")))
      .selectAll("text").style("font-size", "10px").attr("transform", "rotate(-45)").style("text-anchor", "end");
    canvas.append("g").attr("transform", `translate(${pad.left},0)`).call(d3.axisLeft(yAxis).ticks(5).tickFormat(d => `$${d}`)).selectAll("text").style("font-size", "11px");
    canvas.append("text").attr("transform", "rotate(-90)").attr("y", pad.left - 48).attr("x", -(h / 2)).attr("text-anchor", "middle").style("font-size", "13px").style("fill", "#6b7280").text("Amount ($)");

    const leg = canvas.append("g").attr("transform", `translate(${w - pad.right + 10}, ${pad.top})`);
    leg.append("line").attr("x1", 0).attr("x2", 20).attr("y1", 0).attr("y2", 0).attr("stroke", "#22c55e").attr("stroke-width", 2.5);
    leg.append("text").attr("x", 25).attr("y", 4).style("font-size", "11px").text("Income");
    leg.append("line").attr("x1", 0).attr("x2", 20).attr("y1", 20).attr("y2", 20).attr("stroke", "#dc2626").attr("stroke-width", 2.5);
    leg.append("text").attr("x", 25).attr("y", 24).style("font-size", "11px").text("Expense");
  };

  if (isLoading) return <p style={{ textAlign: "center" }}>Loading...</p>;

  return (
    <div style={{ maxWidth: 800, margin: "40px auto", textAlign: "center" }}>
      <div style={{ marginBottom: 20 }}>
        <Link to="/" style={{ marginRight: 10 }}>Dashboard</Link>
        <Link to="/transactions" style={{ marginRight: 10 }}>Transactions</Link>
        <button onClick={performLogout}>Logout</button>
      </div>

      <h2>Dashboard</h2>
      {errorMsg && <p style={{ color: "red" }}>{errorMsg}</p>}

      <div style={{ margin: "20px 0", border: "1px solid #ddd", borderRadius: 8, padding: 20, background: "#fafafa" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 15 }}>
          <h3 style={{ margin: 0 }}>Budget Summary</h3>
          <button onClick={() => setShowBudgetForm(!showBudgetForm)} style={{ padding: "8px 16px", cursor: "pointer" }}>
            {budgetInfo?.budget > 0 ? "Update Budget" : "Set Budget"}
          </button>
        </div>

        {showBudgetForm && (
          <form onSubmit={handleSetBudget} style={{ marginBottom: 15, padding: 15, background: "#f9f9f9", borderRadius: 6 }}>
            <input
              type="number"
              placeholder="Enter budget amount"
              value={budgetAmount}
              onChange={(e) => setBudgetAmount(e.target.value)}
              required
              style={{ padding: 8, marginRight: 10, width: 200 }}
            />
            <button type="submit" style={{ padding: "8px 16px", marginRight: 8 }}>Save</button>
            <button type="button" onClick={() => setShowBudgetForm(false)} style={{ padding: "8px 16px" }}>Cancel</button>
          </form>
        )}

        {budgetInfo && (
          <>
            <p><strong>Budget:</strong> ${budgetInfo.budget}</p>
            <p><strong>Total Expenses:</strong> ${budgetInfo.totalExpenses}</p>
            <p><strong>Balance:</strong> ${budgetInfo.balance}</p>
            <div ref={budgetChartContainer} style={{ marginTop: 20, position: "relative" }}></div>
          </>
        )}
      </div>

      <div style={{ margin: "40px auto", border: "1px solid #ddd", borderRadius: 8, padding: 20, background: "#fafafa", maxWidth: 450 }}>
        <h3>Expense Distribution by Category</h3>
        <div ref={categoryChartContainer} style={{ position: "relative" }}></div>
      </div>

      <div style={{ margin: "40px auto", border: "1px solid #ddd", borderRadius: 8, padding: 20, background: "#fafafa" }}>
        <h3>Transaction Trends (Last 30 Days)</h3>
        <div ref={trendChartContainer} style={{ position: "relative", overflowX: "auto" }}></div>
      </div>

      <h3>Recent Transactions</h3>
      {transactionData.length === 0 ? (
        <p>No transactions found.</p>
      ) : (
        <table width="100%" border="1" cellPadding="8" style={{ borderCollapse: "collapse", marginTop: 10 }}>
          <thead>
            <tr style={{ background: "#f2f2f2" }}>
              <th>Category</th>
              <th>Type</th>
              <th>Amount ($)</th>
            </tr>
          </thead>
          <tbody>
            {transactionData.map((t) => (
              <tr key={t._id}>
                <td>{t.category}</td>
                <td>{t.type}</td>
                <td>{t.amount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
