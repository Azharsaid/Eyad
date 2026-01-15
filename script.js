
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const CURRENCY_LIST = {
  USD: "US Dollar", JOD: "Jordanian Dinar", SAR: "Saudi Riyal", AED: "UAE Dirham",
  QAR: "Qatari Riyal", OMR: "Omani Rial", EUR: "Euro", GBP: "British Pound",
  BHD: "Bahraini Dinar", KWD: "Kuwaiti Dinar"
};

let exchangeData = null;
let trendChart = null;

// DOM Elements
const elements = {
  amount: document.getElementById('amount'),
  base: document.getElementById('baseCurrency'),
  target: document.getElementById('targetCurrency'),
  result: document.getElementById('resultValue'),
  targetLabel: document.getElementById('targetLabel'),
  rateInfo: document.getElementById('rateInfo'),
  swapBtn: document.getElementById('swapBtn'),
  quickStats: document.getElementById('quickStats'),
  aiContent: document.getElementById('aiContent'),
  sentimentBadge: document.getElementById('sentimentBadge'),
  refreshAi: document.getElementById('refreshAi'),
  chartCanvas: document.getElementById('trendChart')
};

// Initialize
function init() {
  // Populate selects
  Object.entries(CURRENCY_LIST).forEach(([code, name]) => {
    const opt1 = new Option(`${code} - ${name}`, code);
    const opt2 = new Option(`${code} - ${name}`, code);
    elements.base.add(opt1);
    elements.target.add(opt2);
  });

  elements.base.value = 'USD';
  elements.target.value = 'JOD';

  // Listeners
  elements.amount.oninput = updateConversion;
  elements.base.onchange = fetchRates;
  elements.target.onchange = () => {
    updateConversion();
    getAiInsight();
  };
  elements.swapBtn.onclick = swapCurrencies;
  elements.refreshAi.onclick = getAiInsight;

  fetchRates();
  initChart();
}

async function fetchRates() {
  const base = elements.base.value;
  try {
    const res = await fetch(`https://open.er-api.com/v6/latest/${base}`);
    exchangeData = await res.json();
    updateConversion();
    updateQuickStats();
    getAiInsight();
    updateChart();
  } catch (err) {
    console.error("Fetch error:", err);
    elements.rateInfo.innerText = "Error loading rates.";
  }
}

function updateConversion() {
  if (!exchangeData) return;
  const amt = parseFloat(elements.amount.value) || 0;
  const target = elements.target.value;
  const rate = exchangeData.rates[target];
  const converted = amt * rate;

  elements.result.innerText = converted.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  elements.targetLabel.innerText = target;
  elements.rateInfo.innerText = `Live Market Rate: 1 ${elements.base.value} = ${rate.toFixed(4)} ${target}`;
}

function swapCurrencies() {
  const temp = elements.base.value;
  elements.base.value = elements.target.value;
  elements.target.value = temp;
  fetchRates();
}

function updateQuickStats() {
  const codes = ['SAR', 'AED', 'EUR', 'GBP'];
  elements.quickStats.innerHTML = codes.map(code => `
    <div class="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
      <div class="text-[10px] font-bold text-slate-400 uppercase">${code} Rate</div>
      <div class="text-lg font-black text-[#0B2E4F]">${exchangeData.rates[code].toFixed(4)}</div>
    </div>
  `).join('');
}

async function getAiInsight() {
  elements.aiContent.innerHTML = `
    <div class="animate-pulse space-y-3">
      <div class="h-4 bg-slate-100 rounded w-3/4"></div>
      <div class="h-4 bg-slate-100 rounded w-full"></div>
    </div>`;
  elements.sentimentBadge.classList.add('hidden');

  const base = elements.base.value;
  const target = elements.target.value;
  const rate = exchangeData.rates[target];

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Provide a short financial insight for ${base} to ${target} at ${rate}. Mention Dar Al Dawa pharmaceutical business implications briefly. Professional tone.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            content: { type: Type.STRING },
            sentiment: { type: Type.STRING }
          },
          required: ["title", "content", "sentiment"]
        }
      }
    });

    const data = JSON.parse(response.text);
    elements.aiContent.innerHTML = `
      <p class="text-slate-800 font-bold leading-snug">${data.title}</p>
      <p class="text-slate-500 text-sm leading-relaxed">${data.content}</p>
    `;
    elements.sentimentBadge.innerText = data.sentiment;
    elements.sentimentBadge.className = `px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
      data.sentiment === 'positive' ? 'bg-green-100 text-green-700' : 
      data.sentiment === 'negative' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
    }`;
    elements.sentimentBadge.classList.remove('hidden');
  } catch (error) {
    elements.aiContent.innerHTML = `<p class="text-slate-400 text-sm italic">Insight currently unavailable.</p>`;
  }
}

function initChart() {
  const ctx = elements.chartCanvas.getContext('2d');
  trendChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: ['M', 'T', 'W', 'T', 'F', 'S', 'S'],
      datasets: [{
        label: 'Rate Index',
        data: [0,0,0,0,0,0,0],
        borderColor: '#00A88F',
        borderWidth: 3,
        pointRadius: 4,
        pointBackgroundColor: '#fff',
        tension: 0.4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { display: false },
        y: { display: false }
      }
    }
  });
}

function updateChart() {
  if (!trendChart || !exchangeData) return;
  const baseRate = exchangeData.rates[elements.target.value];
  const noise = () => (Math.random() - 0.5) * 0.02 * baseRate;
  const newData = [noise(), noise(), noise(), noise(), noise(), noise(), 0].map(n => baseRate + n);
  trendChart.data.datasets[0].data = newData;
  trendChart.update();
}

init();
