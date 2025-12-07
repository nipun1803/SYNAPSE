
import React, { useState, useEffect, useMemo } from 'react';
import 'chart.js/auto'; // Auto-register all components
import { Line, Doughnut } from 'react-chartjs-2';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, BarChart3, Clock, PieChart, TrendingUp, Users, Wallet } from 'lucide-react';

const DashboardChart = ({ data, allAppointments, isAdmin = false }) => {
    const [filter, setFilter] = useState('Month'); // 'Day', 'Week', 'Month', 'Quarter', 'Year'
    const [viewMode, setViewMode] = useState('time'); // 'time', 'doctor', 'speciality'
    const [isDark, setIsDark] = useState(false);

    useEffect(() => {
        setIsDark(document.documentElement.classList.contains('dark'));
        const observer = new MutationObserver(() => {
            setIsDark(document.documentElement.classList.contains('dark'));
        });
        observer.observe(document.documentElement, { attributes: true });
        return () => observer.disconnect();
    }, []);

    // Helper functions
    const getWeekNumber = (d) => {
        d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
        d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
        const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
        return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
    };

    const parseDate = (appt) => {
        if (appt.slotDate) {
            let d, m, y;
            if (appt.slotDate.includes('_')) [d, m, y] = appt.slotDate.split('_').map(Number);
            else if (appt.slotDate.includes('-')) [d, m, y] = appt.slotDate.split('-').map(Number);
            else if (appt.slotDate.includes('/')) [d, m, y] = appt.slotDate.split('/').map(Number);

            if (d && m && y) return new Date(y, m - 1, d);
        }
        if (appt.date) return new Date(appt.date);
        return null;
    };

    const generatePalette = (count) => {
        const palette = [
            '#3b82f6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
            '#EC4899', '#6366F1', '#14B8A6', '#F97316', '#06B6D4'
        ];
        return Array.from({ length: count }, (_, i) => palette[i % palette.length]);
    };

    const [customRange, setCustomRange] = useState({
        start: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
        end: new Date().toISOString().split('T')[0]
    });

    const processedData = useMemo(() => {
        // Fallback or Empty check
        if (!allAppointments && (!data || data.length === 0)) {
            return { labels: [], datasets: [], stats: { totalRev: 0, totalAppts: 0, list: [] } };
        }

        const today = new Date();
        const result = { appointments: {}, revenue: {} };
        const labelSet = new Set();
        let totalRev = 0;
        let totalAppts = 0;

        // Use pre-calc data if fallback needed for Month view
        if ((!allAppointments || allAppointments.length === 0) && data && viewMode === 'time' && filter === 'Month') {
            const labels = data.map(d => d.name || d.monthKey);
            const revs = data.map(d => d.revenue || 0);
            const appts = data.map(d => d.appointments || 0);
            totalRev = revs.reduce((a, b) => a + b, 0);
            totalAppts = appts.reduce((a, b) => a + b, 0);

            // Create list for stats panel
            const list = labels.map((l, i) => ({ label: l, value: revs[i], sub: appts[i] })).sort((a, b) => b.value - a.value);

            return {
                labels,
                datasets: [
                    { label: 'Revenue', data: revs, borderColor: '#3b82f6', backgroundColor: 'rgba(59, 130, 246, 0.1)', fill: true, tension: 0.4, pointRadius: 4 },
                    { label: 'Appointments', data: appts, borderColor: '#10B981', backgroundColor: 'rgba(16, 185, 129, 0.1)', fill: true, tension: 0.4, pointRadius: 4, yAxisID: 'y1' }
                ],
                stats: { totalRev, totalAppts, list }
            };
        }

        // 1. Determine Time Range
        let startDate = new Date();
        startDate.setHours(0, 0, 0, 0);
        let endDate = new Date();
        endDate.setHours(23, 59, 59, 999);

        // Determine effective start/end based on filter
        if (viewMode === 'time') {
            if (filter === 'Day') startDate.setDate(today.getDate() - 30);
            else if (filter === 'Week') startDate.setDate(today.getDate() - 84);
            else if (filter === 'Month') startDate.setMonth(today.getMonth() - 11);
            else if (filter === 'Quarter') startDate.setMonth(today.getMonth() - 12);
            else if (filter === 'Year') startDate.setFullYear(today.getFullYear() - 5);
            else if (filter === 'Custom') {
                const [sy, sm, sd] = customRange.start.split('-').map(Number);
                startDate = new Date(sy, sm - 1, sd); // Local Midnight

                const [ey, em, ed] = customRange.end.split('-').map(Number);
                endDate = new Date(ey, em - 1, ed); // Local Midnight
                endDate.setHours(23, 59, 59, 999); // End of Local Day
            }
        }

        // 2. Aggregate Data
        allAppointments.forEach(appt => {
            let key = '';

            if (viewMode === 'time') {
                const dateObj = parseDate(appt);
                // Skip invalid or out of range dates
                if (!dateObj || isNaN(dateObj.getTime())) return;

                // Strict Range Check
                if (dateObj < startDate || dateObj > endDate) return;

                if (filter === 'Day' || filter === 'Custom') {
                    // Group by Day for 'Day' and 'Custom'
                    const d = dateObj.getDate().toString().padStart(2, '0');
                    const m = (dateObj.getMonth() + 1).toString().padStart(2, '0');
                    const y = dateObj.getFullYear();
                    key = `${y}-${m}-${d}`;
                } else if (filter === 'Week') {
                    const w = getWeekNumber(dateObj);
                    key = `${dateObj.getFullYear()}-W${w}`;
                } else if (filter === 'Month') {
                    const m = dateObj.toLocaleString('en-US', { month: 'short' });
                    key = `${m} ${dateObj.getFullYear()}`;
                } else if (filter === 'Quarter') {
                    const q = Math.floor(dateObj.getMonth() / 3) + 1;
                    key = `Q${q} ${dateObj.getFullYear()}`;
                } else if (filter === 'Year') {
                    key = dateObj.getFullYear().toString();
                }
            } else if (viewMode === 'doctor') {
                if (filter === 'Custom') {
                    const dateObj = parseDate(appt);
                    if (dateObj && (dateObj < startDate || dateObj > endDate)) return;
                }
                key = appt.docData?.name || 'Unknown Doctor';
            } else if (viewMode === 'speciality') {
                if (filter === 'Custom') {
                    const dateObj = parseDate(appt);
                    if (dateObj && (dateObj < startDate || dateObj > endDate)) return;
                }
                key = appt.docData?.speciality || 'General';
            }

            if (!key) return;

            if (!result.appointments[key]) result.appointments[key] = 0;
            if (!result.revenue[key]) result.revenue[key] = 0;

            result.appointments[key] += 1;
            totalAppts += 1;

            if (!appt.cancelled) {
                const amt = (appt.amount || 0);
                result.revenue[key] += amt;
                totalRev += amt;
            }

            labelSet.add(key);
        });

        // 3. Prepare Labels & List
        let labels = Array.from(labelSet);

        // List for Stats Panel (always sorted by high revenue)
        const list = labels.map(l => ({
            label: l,
            value: result.revenue[l] || 0,
            sub: result.appointments[l] || 0
        })).sort((a, b) => b.value - a.value);

        if (viewMode === 'time') {
            // Sort chronologically
            labels.sort((a, b) => a.localeCompare(b));

            // Zero-fill for continuous timeline if Day or Custom (and range isn't too large)
            if (filter === 'Day' || (filter === 'Custom' && (endDate - startDate) / (1000 * 60 * 60 * 24) <= 60)) {
                const continuousLabels = [];
                const tempDate = new Date(startDate);

                while (tempDate <= endDate) {
                    const d = tempDate.getDate().toString().padStart(2, '0');
                    const m = (tempDate.getMonth() + 1).toString().padStart(2, '0');
                    const y = tempDate.getFullYear();
                    continuousLabels.push(`${y}-${m}-${d}`);
                    tempDate.setDate(tempDate.getDate() + 1);
                }
                // Merge existing data into continuous labels
                labels = continuousLabels;
            }
        } else {
            // Sort by Revenue DESC for Doughnut
            labels.sort((a, b) => (result.revenue[b] || 0) - (result.revenue[a] || 0));
        }

        // Format Labels
        const displayLabels = labels.map(l => {
            if (viewMode === 'time' && (filter === 'Day' || filter === 'Custom')) {
                const parts = l.split('-');
                if (parts.length === 3) {
                    const [y, m, d] = parts;
                    const date = new Date(y, m - 1, d);
                    return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
                }
            }
            return l;
        });

        const revData = labels.map(l => result.revenue[l] || 0);

        const output = {
            labels: displayLabels,
            datasets: [],
            stats: { totalRev, totalAppts, list: list.slice(0, 5) } // Top 5 for list
        };

        // Return Datasets based on View Mode
        if (viewMode === 'time') {
            const apptData = labels.map(l => result.appointments[l] || 0);
            output.datasets = [
                {
                    label: 'Revenue',
                    data: revData,
                    borderColor: '#3b82f6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    fill: true,
                    tension: 0.4,
                    pointRadius: 4,
                    pointHoverRadius: 6,
                    yAxisID: 'y'
                },
                {
                    label: 'Appointments',
                    data: apptData,
                    borderColor: '#10B981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    fill: true,
                    tension: 0.4,
                    pointRadius: 4,
                    pointHoverRadius: 6,
                    yAxisID: 'y1'
                }
            ];
        } else {
            // Doughnut Data (Revenue Only usually sufficient, or switchable)
            output.datasets = [
                {
                    label: 'Revenue',
                    data: revData,
                    backgroundColor: generatePalette(labels.length),
                    borderColor: isDark ? '#1f2937' : '#ffffff',
                    borderWidth: 2,
                    hoverOffset: 4
                }
            ];
        }

        return output;

    }, [filter, viewMode, allAppointments, data, isDark, customRange]);

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
            mode: 'index',
            intersect: false,
        },
        plugins: {
            legend: {
                position: viewMode === 'time' ? 'top' : 'bottom', // Side legend for Doughnut
                labels: { color: isDark ? '#9CA3AF' : '#4B5563', usePointStyle: true, boxWidth: 8 }
            },
            title: { display: false },
            tooltip: {
                backgroundColor: isDark ? '#1f2937' : '#ffffff',
                titleColor: isDark ? '#f3f4f6' : '#111827',
                bodyColor: isDark ? '#d1d5db' : '#4b5563',
                borderColor: isDark ? '#374151' : '#e5e7eb',
                borderWidth: 1,
                padding: 10,
                callbacks: {
                    label: (context) => {
                        let label = context.dataset.label || '';
                        if (context.parsed.y !== null) { // Line Chart
                            if (label.includes('Revenue') || viewMode !== 'time') label += ` ₹${context.parsed.y || context.parsed}`;
                            else label += `: ${context.parsed.y}`;
                        }
                        return label;
                    }
                }
            }
        },
        scales: viewMode === 'time' ? {
            x: {
                grid: { display: false },
                ticks: { color: isDark ? '#9CA3AF' : '#6B7280' }
            },
            y: {
                type: 'linear',
                display: true,
                position: 'left',
                grid: { color: isDark ? '#374151' : '#E5E7EB', borderDash: [2, 4] },
                ticks: { color: isDark ? '#9CA3AF' : '#6B7280', callback: (val) => `₹${val}` }
            },
            y1: {
                type: 'linear',
                display: true,
                position: 'right',
                grid: { display: false },
                ticks: { color: isDark ? '#9CA3AF' : '#6B7280' }
            }
        } : {
            x: { display: false },
            y: { display: false }
        }
    };

    return (
        <Card className='shadow-sm border-gray-200 dark:border-gray-700 dark:bg-gray-800 transition-colors duration-200'>
            <CardHeader className='flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0 pb-4 border-b border-gray-100 dark:border-gray-700'>
                <CardTitle className='text-lg font-semibold flex items-center gap-2 text-gray-900 dark:text-white'>
                    {viewMode === 'time' ? <TrendingUp className='w-5 h-5 text-blue-600 dark:text-blue-400' /> : <PieChart className='w-5 h-5 text-purple-600 dark:text-purple-400' />}
                    {viewMode === 'time' ? 'Analytics Overview' : viewMode === 'doctor' ? 'Doctor Performance' : 'Speciality Insights'}
                </CardTitle>

                <div className='flex flex-wrap items-center gap-2'>
                    {/* View Switcher */}
                    {isAdmin && (
                        <div className='flex items-center gap-1 bg-gray-100 dark:bg-gray-700/50 p-1 rounded-lg mr-2'>
                            <button onClick={() => setViewMode('time')} className={`p-1.5 rounded-md ${viewMode === 'time' ? 'bg-white dark:bg-gray-600 shadow-sm text-blue-600' : 'text-gray-500'}`} title="Trend"><Activity className="w-4 h-4" /></button>
                            <button onClick={() => setViewMode('doctor')} className={`p-1.5 rounded-md ${viewMode === 'doctor' ? 'bg-white dark:bg-gray-600 shadow-sm text-purple-600' : 'text-gray-500'}`} title="By Doctor"><Users className="w-4 h-4" /></button>
                            <button onClick={() => setViewMode('speciality')} className={`p-1.5 rounded-md ${viewMode === 'speciality' ? 'bg-white dark:bg-gray-600 shadow-sm text-green-600' : 'text-gray-500'}`} title="By Speciality"><BarChart3 className="w-4 h-4" /></button>
                        </div>
                    )}

                    {/* Time Filters */}
                    {viewMode === 'time' && (
                        <div className='flex items-center gap-1 bg-gray-100 dark:bg-gray-700/50 p-1 rounded-lg flex-wrap'>
                            {['Day', 'Week', 'Month', 'Year', 'Custom'].map((f) => (
                                <button
                                    key={f}
                                    onClick={() => setFilter(f)}
                                    className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${filter === f ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-300 shadow-sm' : 'text-gray-500 dark:text-gray-400'}`}
                                >
                                    {f}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </CardHeader>
            {/* Custom Range Inputs */}
            {viewMode === 'time' && filter === 'Custom' && (
                <div className='px-4 py-2 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/20 flex gap-4 items-center animate-in slide-in-from-top-2'>
                    <div className='flex items-center gap-2'>
                        <span className='text-xs text-gray-500'>From:</span>
                        <input
                            type="date"
                            value={customRange.start}
                            onChange={(e) => setCustomRange(prev => ({ ...prev, start: e.target.value }))}
                            className='text-xs p-1.5 rounded border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500'
                        />
                    </div>
                    <div className='flex items-center gap-2'>
                        <span className='text-xs text-gray-500'>To:</span>
                        <input
                            type="date"
                            value={customRange.end}
                            onChange={(e) => setCustomRange(prev => ({ ...prev, end: e.target.value }))}
                            className='text-xs p-1.5 rounded border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500'
                        />
                    </div>
                </div>
            )}
            <CardContent className='pt-6'>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Stats Panel */}
                    <div className="col-span-1 space-y-6">
                        {/* Key Metrics */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl">
                                <p className="text-xs text-blue-600 dark:text-blue-400 font-medium mb-1 flex items-center gap-1"><Wallet className="w-3 h-3" /> Revenue</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">₹{processedData.stats?.totalRev || 0}</p>
                            </div>
                            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-xl">
                                <p className="text-xs text-green-600 dark:text-green-400 font-medium mb-1 flex items-center gap-1"><Activity className="w-3 h-3" /> Appts</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{processedData.stats?.totalAppts || 0}</p>
                            </div>
                        </div>

                        {/* Top Performers List */}
                        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4">
                            <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3 uppercase tracking-wider text-xs">Top {viewMode === 'time' ? 'Periods' : 'Performers'}</h4>
                            <div className="space-y-3">
                                {processedData.stats?.list.length > 0 ? (
                                    processedData.stats.list.map((item, i) => (
                                        <div key={i} className="flex items-center justify-between text-sm">
                                            <div className="flex items-center gap-2">
                                                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${i === 0 ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-200 text-gray-600'}`}>{i + 1}</span>
                                                <span className="text-gray-700 dark:text-gray-300 font-medium truncate max-w-[120px]">{item.label}</span>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-gray-900 dark:text-gray-100 font-semibold">₹{item.value}</p>
                                                <p className="text-[10px] text-gray-500">{item.sub} appts</p>
                                            </div>
                                        </div>
                                    ))
                                ) : <p className="text-sm text-gray-400 text-center py-2">No data recorded</p>}
                            </div>
                        </div>
                    </div>

                    {/* Chart Panel */}
                    <div className="col-span-1 lg:col-span-2 min-h-[300px] bg-white dark:bg-gray-800 rounded-xl flex flex-col items-center justify-center border border-gray-100 dark:border-gray-700 p-2 relative">
                        {processedData.datasets.length > 0 ? (
                            viewMode === 'time' ? <div className='w-full h-[300px]'><Line options={options} data={processedData} /></div> : <div className="w-full h-[300px] max-w-[320px]"><Doughnut options={options} data={processedData} /></div>
                        ) : (
                            <div className='flex flex-col items-center justify-center text-gray-400 dark:text-gray-500 h-[300px]'>
                                <Activity className='w-12 h-12 mb-3 opacity-20' />
                                <p>No data to visualize</p>
                            </div>
                        )}
                        <div className="absolute bottom-1 right-2 text-[10px] text-gray-300 dark:text-gray-600">
                            Analyzing {allAppointments?.length || 0} records
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default DashboardChart;