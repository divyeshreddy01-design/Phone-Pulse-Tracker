import React, { useState, useRef } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { 
  Printer, 
  Download, 
  FileText, 
  Calendar, 
  User, 
  Clock, 
  Target, 
  CheckCircle, 
  AlertCircle, 
  Sparkles,
  Smartphone,
  PieChart as PieIcon,
  BarChart2,
  Loader2,
  Check
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Cell, 
  PieChart, 
  Pie 
} from 'recharts';
import { Person, DailyUsageRecord } from '../../types';
import { 
  calculateDailyRecord, 
  calculateWeeklyAnalytics, 
  calculateMonthlyAnalytics, 
  calculateUsageTrends, 
  generateSmartRecommendations, 
  calculateWellbeingScore, 
  formatMinutes, 
  CATEGORY_COLORS 
} from '../../utils/calculations';
import { CategoryBadge, GoalBadge, UserTypeBadge } from '../common/Badge';

interface ReportViewProps {
  people: Person[];
  records: DailyUsageRecord[];
  initialPersonId?: string | null;
  initialDate?: string | null;
}

export const ReportView: React.FC<ReportViewProps> = ({
  people,
  records,
  initialPersonId,
  initialDate,
}) => {
  const [selectedPersonId, setSelectedPersonId] = useState<string>(
    initialPersonId || (people.length > 0 ? people[0].id : '')
  );
  const [rangeType, setRangeType] = useState<'Daily' | 'Weekly' | 'Monthly'>('Weekly');
  const [selectedDate, setSelectedDate] = useState<string>(
    initialDate || new Date().toISOString().split('T')[0]
  );
  const [isGeneratingPdf, setIsGeneratingPdf] = useState<boolean>(false);
  const [downloadSuccess, setDownloadSuccess] = useState<boolean>(false);

  const reportRef = useRef<HTMLDivElement>(null);

  const selectedPerson = people.find(p => p.id === selectedPersonId);

  // Trigger Native Browser Print (which also allows Save as PDF formatted for A4)
  const handlePrint = () => {
    window.print();
  };

  // High quality PDF generation using html2canvas and jspdf
  const handleDownloadPdf = async () => {
    if (!reportRef.current || !selectedPerson) return;
    
    setIsGeneratingPdf(true);
    setDownloadSuccess(false);

    try {
      const element = reportRef.current;

      // Small delay to allow any pending layout / svg render pass
      await new Promise(resolve => setTimeout(resolve, 150));

      const canvas = await html2canvas(element, {
        scale: 2, // 2x scale for crisp 300dpi-equivalent resolution
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        windowWidth: 1024,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pdfPageWidth = pdf.internal.pageSize.getWidth();
      const pdfPageHeight = pdf.internal.pageSize.getHeight();
      
      const margin = 10;
      const contentWidth = pdfPageWidth - (margin * 2);
      const contentHeight = (canvas.height * contentWidth) / canvas.width;

      if (contentHeight <= pdfPageHeight - (margin * 2)) {
        // Fits comfortably on 1 page
        pdf.addImage(imgData, 'PNG', margin, margin, contentWidth, contentHeight, undefined, 'FAST');
      } else {
        // Multi-page slice rendering
        let heightRemaining = contentHeight;
        let pagePosition = margin;
        const pageContentHeight = pdfPageHeight - (margin * 2);
        let pageNumber = 1;

        while (heightRemaining > 0) {
          if (pageNumber > 1) {
            pdf.addPage();
          }
          pdf.addImage(
            imgData, 
            'PNG', 
            margin, 
            pagePosition - ((pageNumber - 1) * pageContentHeight), 
            contentWidth, 
            contentHeight, 
            undefined, 
            'FAST'
          );
          heightRemaining -= pageContentHeight;
          pageNumber++;
        }
      }

      const safeName = selectedPerson.name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
      const filename = `PhonePulse_${safeName}_${rangeType.toLowerCase()}_report_${selectedDate}.pdf`;
      pdf.save(filename);

      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 4000);
    } catch (err) {
      console.error('Error generating PDF report:', err);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  if (!selectedPerson) {
    return (
      <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <FileText className="w-10 h-10 text-indigo-500 mx-auto mb-2" />
        <h3 className="text-base font-bold text-slate-900 dark:text-white">No person profile selected for reporting</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Please select or add a person profile to generate comprehensive reports.</p>
      </div>
    );
  }

  // Calculate stats based on rangeType
  const personRecords = records.filter(r => r.personId === selectedPerson.id);
  const dailyRecord = personRecords.find(r => r.date === selectedDate);
  const dailyCalc = dailyRecord ? calculateDailyRecord(dailyRecord, selectedPerson) : null;
  const weeklyCalc = calculateWeeklyAnalytics(records, selectedPerson, selectedDate);
  const monthlyCalc = calculateMonthlyAnalytics(records, selectedPerson, selectedDate);
  const trends = calculateUsageTrends(records, selectedPerson);
  const recommendations = generateSmartRecommendations(records, selectedPerson);
  const wellbeing = calculateWellbeingScore(records, selectedPerson);

  // Unified data extraction for report presentation
  const isDaily = rangeType === 'Daily';
  const isWeekly = rangeType === 'Weekly';
  const isMonthly = rangeType === 'Monthly';

  const reportTotalMinutes = isDaily 
    ? (dailyCalc?.totalScreenMinutes || 0) 
    : isWeekly 
    ? weeklyCalc.totalMinutes 
    : monthlyCalc.totalMinutes;

  const reportAvgMinutes = isDaily 
    ? (dailyCalc?.totalScreenMinutes || 0) 
    : isWeekly 
    ? weeklyCalc.avgMinutes 
    : monthlyCalc.avgMinutes;

  const reportApps = isDaily
    ? (dailyCalc?.apps || [])
    : isWeekly
    ? weeklyCalc.topApps
    : monthlyCalc.topApps;

  const reportCategories = isDaily
    ? (dailyCalc?.categoryBreakdown || [])
    : isWeekly
    ? weeklyCalc.categories
    : monthlyCalc.categories;

  // Category chart items
  const categoryChartData = reportCategories.map(cat => ({
    name: cat.category,
    value: cat.minutes,
    percentage: cat.percentage,
    formatted: formatMinutes(cat.minutes),
    color: CATEGORY_COLORS[cat.category]?.hex || '#6366f1',
  }));

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Controls Bar (Hidden during print) */}
      <div className="no-print p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Person and Range Selection */}
        <div className="flex flex-wrap items-center gap-3">
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
              Select Person:
            </label>
            <select
              id="report-person-select"
              value={selectedPersonId}
              onChange={e => setSelectedPersonId(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-white focus:outline-hidden cursor-pointer"
            >
              {people.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.userType})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
              Report Range:
            </label>
            <div className="inline-flex p-0.5 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
              {(['Daily', 'Weekly', 'Monthly'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setRangeType(tab)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    rangeType === tab
                      ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
              Reference Date:
            </label>
            <input
              id="report-date-input"
              type="date"
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-white"
            />
          </div>
        </div>

        {/* Action Buttons: Download as PDF (jspdf + html2canvas) & Browser Print */}
        <div className="flex flex-wrap items-center gap-2.5 self-end md:self-auto">
          <button
            id="download-pdf-button"
            onClick={handleDownloadPdf}
            disabled={isGeneratingPdf}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-xs font-bold shadow-xs transition-all cursor-pointer ${
              downloadSuccess 
                ? 'bg-emerald-600 hover:bg-emerald-700' 
                : 'bg-indigo-600 hover:bg-indigo-700 active:scale-95'
            } ${isGeneratingPdf ? 'opacity-75 cursor-not-allowed' : ''}`}
          >
            {isGeneratingPdf ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Capturing PDF...</span>
              </>
            ) : downloadSuccess ? (
              <>
                <Check className="w-4 h-4" />
                <span>PDF Downloaded!</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Download as PDF</span>
              </>
            )}
          </button>

          <button
            id="print-report-button"
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold shadow-xs transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4 text-slate-500" />
            <span>Print</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* A4 REPORT CONTAINER (Captured by html2canvas & jsPDF) */}
      {/* ========================================================================= */}
      <div
        id="printable-report-card"
        ref={reportRef}
        className="print-container bg-white text-slate-900 p-8 sm:p-10 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-md print:border-none print:shadow-none print:p-0 space-y-7"
        style={{ color: '#0f172a', backgroundColor: '#ffffff' }}
      >
        {/* Document Header */}
        <div className="border-b-2 border-slate-900 pb-5 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] uppercase tracking-widest font-extrabold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded border border-indigo-100">
                Official Analytical Assessment
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 font-display mt-2">
              PHONE USAGE REPORT
            </h1>
            <p className="text-xs sm:text-sm font-semibold text-slate-600 mt-0.5">
              PhonePulse Tracker • Daily Habits, Category Balance & Digital Wellbeing
            </p>
          </div>

          <div className="text-right text-xs text-slate-500">
            <span className="block font-bold text-slate-900">Generated On</span>
            <span>{new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
            <span className="block mt-1 font-mono text-[10px] text-slate-400">ID: PPT-{selectedPerson.id.slice(-6)}</span>
          </div>
        </div>

        {/* Section 1: Person Details & Scope */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase block">Person Name</span>
            <span className="text-sm font-bold text-slate-900">{selectedPerson.name}</span>
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase block">Demographic</span>
            <span className="font-semibold text-slate-800">{selectedPerson.userType} ({selectedPerson.age} yrs)</span>
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase block">Device Model</span>
            <span className="font-semibold text-slate-800">{selectedPerson.phoneModel || 'Android Device'}</span>
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase block">Daily Target Goal</span>
            <span className="font-bold text-indigo-600">{formatMinutes(selectedPerson.dailyGoalMinutes)}</span>
          </div>
        </div>

        {/* Section 2: Executive Summary KPIs */}
        <div>
          <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-900 mb-3 font-display">
            1. Screen-Time Summary & Scope ({rangeType} Report)
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            <div className="p-4 rounded-xl border border-slate-200 bg-white">
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Total Screen Time</span>
              <span className="text-2xl font-black text-slate-900 font-display">
                {formatMinutes(reportTotalMinutes)}
              </span>
              <span className="text-[10px] text-slate-500 block mt-0.5">Recorded across cycle</span>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-white">
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Daily Average</span>
              <span className="text-2xl font-black text-indigo-600 font-display">
                {formatMinutes(reportAvgMinutes)}
              </span>
              <span className="text-[10px] text-slate-500 block mt-0.5">Per active day</span>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-white">
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Goal Status</span>
              <div className="text-sm font-bold text-slate-900 mt-1">
                {reportAvgMinutes <= selectedPerson.dailyGoalMinutes ? (
                  <span className="text-emerald-600 font-bold">Goal Achieved</span>
                ) : (
                  <span className="text-rose-600 font-bold">Exceeded (+{formatMinutes(reportAvgMinutes - selectedPerson.dailyGoalMinutes)})</span>
                )}
              </div>
              <span className="text-[10px] text-slate-500 block mt-0.5">Target: {formatMinutes(selectedPerson.dailyGoalMinutes)}</span>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-white">
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Digital Wellbeing</span>
              <span className="text-2xl font-black text-slate-900 font-display">
                {wellbeing.score} / 100
              </span>
              <span className="text-[10px] text-slate-500 block mt-0.5">Rating: {wellbeing.grade}</span>
            </div>
          </div>
        </div>

        {/* Section 3: Visual Analytics & Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Chart 1: Daily Trend / Weekly Screen Time */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                <BarChart2 className="w-3.5 h-3.5 text-indigo-600" />
                <span>Weekly Activity Cycle</span>
              </h3>
              <span className="text-[10px] text-slate-500 font-medium">Minutes per day</span>
            </div>

            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={weeklyCalc.dailyChartData}
                  margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
                >
                  <XAxis 
                    dataKey="shortDay" 
                    tick={{ fontSize: 10, fill: '#64748b', fontWeight: 600 }}
                    axisLine={{ stroke: '#cbd5e1' }}
                    tickLine={false}
                  />
                  <YAxis 
                    unit="m" 
                    tick={{ fontSize: 10, fill: '#64748b' }} 
                    axisLine={false}
                    tickLine={false}
                  />
                  <Bar dataKey="minutes" radius={[4, 4, 0, 0]}>
                    {weeklyCalc.dailyChartData.map((entry, index) => (
                      <Cell
                        key={`report-bar-${index}`}
                        fill={entry.minutes > entry.goalMinutes ? '#f43f5e' : '#6366f1'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 2: Category Breakdown Donut / Visual Distribution */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                <PieIcon className="w-3.5 h-3.5 text-purple-600" />
                <span>Category Distribution</span>
              </h3>
              <span className="text-[10px] text-slate-500 font-medium">{reportCategories.length} categories</span>
            </div>

            {categoryChartData.length > 0 ? (
              <div className="flex items-center gap-3">
                <div className="h-40 w-1/2">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryChartData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={32}
                        outerRadius={52}
                        paddingAngle={3}
                      >
                        {categoryChartData.map((entry, index) => (
                          <Cell key={`report-pie-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="w-1/2 space-y-1.5 text-[11px]">
                  {categoryChartData.slice(0, 4).map(cat => (
                    <div key={cat.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 truncate">
                        <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                        <span className="text-slate-700 truncate">{cat.name}</span>
                      </div>
                      <span className="font-bold text-slate-900 shrink-0">{cat.percentage}%</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="h-40 flex items-center justify-center text-xs text-slate-400">
                No category data
              </div>
            )}
          </div>
        </div>

        {/* Section 4: App Usage Table */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-900 font-display">
              2. Individual Application Usage Breakdown
            </h2>
            <span className="text-xs text-slate-500 font-medium">
              Top {reportApps.length} applications logged
            </span>
          </div>

          <table className="w-full text-left text-xs border border-slate-200 rounded-lg overflow-hidden">
            <thead className="bg-slate-100 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px]">
              <tr>
                <th className="py-2.5 px-3">#</th>
                <th className="py-2.5 px-3">Application Name</th>
                <th className="py-2.5 px-3">Category</th>
                <th className="py-2.5 px-3">Recorded Time</th>
                <th className="py-2.5 px-3 text-right">% Share</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {reportApps.length > 0 ? (
                reportApps.map((app: any, idx) => (
                  <tr key={app.id || app.appName || idx} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-mono text-slate-400">{idx + 1}</td>
                    <td className="py-2.5 px-3 font-bold text-slate-900">{app.appName}</td>
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium text-[11px]">
                        {app.category}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-slate-800">
                      {app.formattedTime || formatMinutes(app.minutes)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold text-slate-900">
                      {app.percentage}%
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-4 text-center text-slate-400 italic">
                    No application breakdown recorded for this range.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Section 5: Trends & Recommendations */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Trend Statement */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
            <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
              3. Habit Shift & Trend Analysis
            </span>
            <div className="text-xs sm:text-sm font-bold text-slate-900 mt-1">
              {trends.statement}
            </div>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Comparison between latest logging window and previous baseline demonstrates a {trends.direction.toLowerCase()} velocity.
            </p>
          </div>

          {/* Smart Recommendations */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
            <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
              4. Key Recommendation
            </span>
            {recommendations.length > 0 ? (
              <div>
                <div className="text-xs font-bold text-slate-900">{recommendations[0].title}</div>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  {recommendations[0].description}
                </p>
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic">No warnings active.</p>
            )}
          </div>
        </div>

        {/* Report Footer / Signature Area */}
        <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 gap-2">
          <div>
            <strong>PhonePulse Analytics Platform</strong> • Android Phone Usage Study
          </div>
          <div>
            Report verified & formatted for A4 standard documentation.
          </div>
        </div>
      </div>
    </div>
  );
};
