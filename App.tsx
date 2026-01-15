
import React, { useState, useEffect, useCallback } from 'react';
import { DadLogo, AnniversaryLogo } from './components/Logo';
import { CURRENCY_LIST, ExchangeData, AIInsight } from './types';
import { getCurrencyInsights } from './services/geminiService';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const App: React.FC = () => {
  const [amount, setAmount] = useState<number>(100);
  const [base, setBase] = useState<string>('USD');
  const [target, setTarget] = useState<string>('JOD');
  const [exchangeData, setExchangeData] = useState<ExchangeData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [aiInsight, setAiInsight] = useState<AIInsight | null>(null);
  const [insightLoading, setInsightLoading] = useState<boolean>(false);

  // Fetch rates
  const fetchRates = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`https://open.er-api.com/v6/latest/${base}`);
      const data = await res.json();
      setExchangeData(data);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, [base]);

  useEffect(() => {
    fetchRates();
  }, [fetchRates]);

  // Fetch AI Insight when pair changes
  const fetchInsight = useCallback(async () => {
    if (!exchangeData) return;
    setInsightLoading(true);
    const currentRate = exchangeData.rates[target] || 1;
    const insight = await getCurrencyInsights(base, target, currentRate);
    setAiInsight(insight);
    setInsightLoading(false);
  }, [base, target, exchangeData]);

  useEffect(() => {
    if (exchangeData) {
      fetchInsight();
    }
  }, [base, target, exchangeData, fetchInsight]);

  const convertedAmount = exchangeData ? (amount * (exchangeData.rates[target] || 0)) : 0;

  const swapCurrencies = () => {
    const oldBase = base;
    setBase(target);
    setTarget(oldBase);
  };

  // Mock historical data for visual flair
  const chartData = [
    { name: 'Mon', val: 0.98 },
    { name: 'Tue', val: 1.02 },
    { name: 'Wed', val: 1.00 },
    { name: 'Thu', val: 1.05 },
    { name: 'Fri', val: 1.03 },
    { name: 'Sat', val: 1.07 },
    { name: 'Sun', val: (exchangeData?.rates[target] || 1) / (exchangeData?.rates[target] || 1) },
  ].map(d => ({ ...d, val: d.val * (exchangeData?.rates[target] || 1) }));

  return (
    <div className="min-h-screen bg-slate-50 relative overflow-hidden flex flex-col">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-teal-500/5 blur-[120px] rounded-full -mr-48 -mt-48 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-500/5 blur-[120px] rounded-full -ml-48 -mb-48 pointer-events-none"></div>

      {/* Header */}
      <header className="px-6 py-6 border-b border-slate-200 bg-white/70 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <DadLogo />
          <div className="flex items-center gap-6">
            <AnniversaryLogo className="h-16 md:h-20" />
          </div>
        </div>
      </header>

      <main className="flex-grow p-4 md:p-8 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Converter */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-3xl p-8 shadow-xl shadow-slate-200/50 border border-slate-100 relative overflow-hidden group">
            {/* Corner Accent */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-teal-500/5 rotate-45 translate-x-12 -translate-y-12 transition-transform group-hover:scale-125"></div>
            
            <h2 className="text-2xl font-black text-slate-800 mb-6 flex items-center gap-2">
              <span className="w-2 h-8 bg-[#00A88F] rounded-full"></span>
              Currency Exchange
            </h2>

            <div className="space-y-6">
              {/* Amount Input */}
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Amount to Convert</label>
                <input 
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-2xl font-bold text-[#0B2E4F] outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-[#00A88F] transition-all"
                />
              </div>

              {/* Currency Selectors */}
              <div className="flex flex-col md:flex-row items-center gap-4">
                <div className="flex-1 w-full">
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">From</label>
                  <select 
                    value={base}
                    onChange={(e) => setBase(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-4 text-lg font-bold text-slate-700 outline-none focus:border-teal-500"
                  >
                    {Object.entries(CURRENCY_LIST).map(([code, name]) => (
                      <option key={code} value={code}>{code} - {name}</option>
                    ))}
                  </select>
                </div>

                <button 
                  onClick={swapCurrencies}
                  className="bg-[#0B2E4F] text-white p-4 rounded-full hover:scale-110 active:scale-95 transition-all shadow-lg shadow-[#0B2E4F]/20 mt-6"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                </button>

                <div className="flex-1 w-full">
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">To</label>
                  <select 
                    value={target}
                    onChange={(e) => setTarget(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-4 text-lg font-bold text-slate-700 outline-none focus:border-teal-500"
                  >
                    {Object.entries(CURRENCY_LIST).map(([code, name]) => (
                      <option key={code} value={code}>{code} - {name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Result Area */}
              <div className="mt-8 p-8 bg-gradient-to-br from-[#0B2E4F] to-[#1a4a75] rounded-3xl text-white shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <svg className="w-24 h-24" viewBox="0 0 100 100" fill="currentColor">
                    <circle cx="50" cy="50" r="40" />
                  </svg>
                </div>
                <div className="relative z-10">
                  <div className="text-sm font-bold text-teal-300 uppercase tracking-widest mb-1">Converted Amount</div>
                  <div className="flex items-baseline gap-3">
                    <span className="text-5xl font-black">{loading ? '...' : convertedAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    <span className="text-2xl font-bold text-teal-400">{target}</span>
                  </div>
                  <div className="mt-4 text-xs text-white/50 flex items-center gap-2">
                    <span className="inline-block w-2 h-2 bg-teal-400 rounded-full animate-pulse"></span>
                    Live Market Rate: 1 {base} = {exchangeData?.rates[target].toFixed(4)} {target}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {['SAR', 'AED', 'EUR', 'GBP'].map(curr => (
              <div key={curr} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="text-[10px] font-bold text-slate-400 uppercase">{curr} Rate</div>
                <div className="text-lg font-black text-[#0B2E4F]">{exchangeData?.rates[curr]?.toFixed(4) || '---'}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: AI Insights & Charts */}
        <div className="lg:col-span-5 space-y-8">
          {/* AI Insight Card */}
          <div className="bg-white rounded-3xl p-8 shadow-xl shadow-slate-200/50 border border-slate-100 min-h-[280px] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
                  <span className="p-2 bg-teal-50 rounded-lg text-teal-600">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M11.3 1.047a1 1 0 01.897.95V11h7.75a1 1 0 110 2h-7.75v7.003a1 1 0 01-1.897.051l-9-19A1 1 0 012.3.15l9 19a1 1 0 01.1.2V11H.25a1 1 0 110-2h7.75V2a1 1 0 01.897-.953z" clipRule="evenodd" />
                    </svg>
                  </span>
                  AI Market Insight
                </h3>
                <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                  aiInsight?.sentiment === 'positive' ? 'bg-green-100 text-green-700' : 
                  aiInsight?.sentiment === 'negative' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                }`}>
                  {aiInsight?.sentiment || 'Neutral'}
                </span>
              </div>

              {insightLoading ? (
                <div className="space-y-4 animate-pulse">
                  <div className="h-4 bg-slate-100 rounded w-3/4"></div>
                  <div className="h-4 bg-slate-100 rounded w-full"></div>
                  <div className="h-4 bg-slate-100 rounded w-5/6"></div>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-slate-800 font-bold leading-snug">{aiInsight?.title || "Evaluating market conditions..."}</p>
                  <p className="text-slate-500 text-sm leading-relaxed">{aiInsight?.content || "Gemini AI is analyzing the current exchange volatility for your selected currency pair."}</p>
                </div>
              )}
            </div>
            
            <div className="mt-8 pt-6 border-t border-slate-50 flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Powered by Gemini AI</span>
              <button 
                onClick={fetchInsight}
                className="text-teal-600 hover:text-teal-700 font-bold text-xs flex items-center gap-1 group"
              >
                Refresh Analysis
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 transition-transform group-hover:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            </div>
          </div>

          {/* Performance Chart */}
          <div className="bg-white rounded-3xl p-8 shadow-xl shadow-slate-200/50 border border-slate-100">
            <h3 className="text-lg font-black text-slate-800 mb-6">Price Trend (Week)</h3>
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" hide />
                  <YAxis hide domain={['auto', 'auto']} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', fontSize: '12px' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="val" 
                    stroke="#00A88F" 
                    strokeWidth={4} 
                    dot={{ r: 4, fill: '#00A88F', strokeWidth: 2, stroke: '#fff' }}
                    activeDot={{ r: 6, strokeWidth: 0 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              <span>Past 7 Days</span>
              <span className="text-teal-600">Simulated Outlook</span>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-[#0B2E4F] py-10 mt-12 text-white/60">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="flex flex-col items-center gap-4 mb-6">
            <div className="w-12 h-1 bg-teal-400 rounded-full"></div>
            <p className="text-white text-sm font-bold">Celebrating 50 Years of Excellence in Healthcare</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-xs text-left">
            <div>
              <h4 className="text-white font-bold mb-3 uppercase tracking-widest">Company</h4>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-teal-400">About Us</a></li>
                <li><a href="#" className="hover:text-teal-400">Products</a></li>
                <li><a href="#" className="hover:text-teal-400">Investor Relations</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-3 uppercase tracking-widest">Support</h4>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-teal-400">Help Center</a></li>
                <li><a href="#" className="hover:text-teal-400">API Documentation</a></li>
                <li><a href="#" className="hover:text-teal-400">Contact Us</a></li>
              </ul>
            </div>
            <div className="col-span-2 text-right">
              <p className="mb-2">© 2025 Dar Al Dawa Development & Investment Co.</p>
              <p className="text-[10px]">Exchange rates provided by Open Exchange API. All values are indicative.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
