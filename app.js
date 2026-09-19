/**
 * POKÉMON RESEARCH & ANALYTICS PORTAL
 * Application Logic, Chart.js Visualizations & Monte Carlo Engine
 * Author: Burak Çizmecioğlu (ID: 34375)
 */

// Global State
let currentFilteredData = [];
let currentPage = 1;
const PAGE_SIZE = 15;

// Canonical Pokémon Type Colors
const TYPE_COLORS = {
  grass: '#78c850',
  poison: '#a040a0',
  fire: '#f08030',
  flying: '#a890f0',
  water: '#6890f0',
  bug: '#a8b820',
  normal: '#a8a878',
  electric: '#f8d030',
  ground: '#e0c068',
  fairy: '#ee99ac',
  fighting: '#c03028',
  psychic: '#f85888',
  rock: '#b8a038',
  steel: '#b8b8d0',
  ice: '#98d8d8',
  ghost: '#705898',
  dragon: '#7038f8',
  dark: '#705848'
};

// Ensure total_stats is present on each record
if (typeof POKEMON_DATA !== 'undefined') {
  POKEMON_DATA.forEach(p => {
    if (!p.total_stats) {
      p.total_stats = (p.hp || 0) + (p.attack || 0) + (p.defense || 0) + 
                      (p.special_attack || 0) + (p.special_defense || 0) + (p.speed || 0);
    }
  });
}

// Chart instances
let chartTypeDist, chartGenerations, chartAtkDef, chartTypeAvg, chartSpeedTotal;

// Document Ready
document.addEventListener('DOMContentLoaded', () => {
  if (typeof POKEMON_DATA === 'undefined' || !Array.isArray(POKEMON_DATA)) {
    console.error('POKEMON_DATA is missing or not loaded.');
    return;
  }

  // Update KPI Total
  const kpiTotal = document.getElementById('kpi-total-species');
  if (kpiTotal) kpiTotal.textContent = POKEMON_DATA.length;

  // Initialize Modules
  initTypeCensusAndChart();
  initGenerationsChart();
  initTop10Leaderboard();
  initAttackDefenseScatter();
  initTypeAveragesChart();
  initSpeedTotalScatter();
  initBattleSimulator();
  initDatasetExplorer();
});

/* ==========================================================================
   ACCORDION TOGGLE
   ========================================================================== */
function toggleAccordion(header) {
  const accordion = header.closest('.code-accordion');
  accordion.classList.toggle('open');
}

/* ==========================================================================
   QUESTION 1 & 2: TYPE CENSUS & HORIZONTAL BAR CHART
   ========================================================================== */
function initTypeCensusAndChart() {
  // In the problem set:
  // "most_common <- pokemon %>% select(type_1, type_2) %>% filter(!is.na(type_1) & !is.na(type_2))"
  // then pivot_longer and count
  const counts = {};
  let totalDualEntries = 0;

  POKEMON_DATA.forEach(p => {
    if (p.type_1 && p.type_2 && p.type_1 !== 'NA' && p.type_2 !== 'NA') {
      [p.type_1, p.type_2].forEach(t => {
        const typeKey = t.toLowerCase();
        counts[typeKey] = (counts[typeKey] || 0) + 1;
        totalDualEntries++;
      });
    }
  });

  // Convert to sorted array
  const sortedTypes = Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .map(([type, count], index) => ({ rank: index + 1, type, count, pct: ((count / totalDualEntries) * 100).toFixed(1) }));

  // Populate Table
  const tbody = document.getElementById('tbody-type-census');
  if (tbody) {
    tbody.innerHTML = sortedTypes.map(item => `
      <tr>
        <td><span class="rank-badge ${item.rank <= 3 ? 'rank-' + item.rank : ''}">${item.rank}</span></td>
        <td><span class="type-badge type-${item.type}">${item.type}</span></td>
        <td><strong>${item.count}</strong></td>
        <td>${item.pct}%</td>
      </tr>
    `).join('');
  }

  // Render Horizontal Bar Chart
  const ctx = document.getElementById('chart-type-distribution');
  if (ctx) {
    const labels = sortedTypes.map(d => d.type.toUpperCase());
    const dataVals = sortedTypes.map(d => d.count);
    const bgColors = sortedTypes.map(d => TYPE_COLORS[d.type] || '#6366f1');

    chartTypeDist = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Pokémon with this type (Dual-Typing)',
          data: dataVals,
          backgroundColor: bgColors,
          borderRadius: 6,
          borderWidth: 0
        }]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx) => ` Count: ${ctx.raw} (${((ctx.raw / totalDualEntries) * 100).toFixed(1)}% of dual-typed slots)`
            }
          }
        },
        scales: {
          x: {
            grid: { color: 'rgba(255, 255, 255, 0.05)' },
            ticks: { color: '#94a3b8' }
          },
          y: {
            grid: { display: false },
            ticks: { color: '#cbd5e1', font: { weight: '600' } }
          }
        }
      }
    });
  }
}

/* ==========================================================================
   QUESTION 4: GENERATIONS DISTRIBUTION CHART
   ========================================================================== */
function initGenerationsChart() {
  const genCounts = {};
  POKEMON_DATA.forEach(p => {
    if (p.generation_id) {
      genCounts[p.generation_id] = (genCounts[p.generation_id] || 0) + 1;
    }
  });

  const gens = Object.keys(genCounts).sort((a, b) => a - b);
  const counts = gens.map(g => genCounts[g]);

  const ctx = document.getElementById('chart-generations');
  if (ctx) {
    chartGenerations = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: gens.map(g => `Gen ${g}`),
        datasets: [{
          label: 'Number of Pokémon',
          data: counts,
          backgroundColor: gens.map(g => g == 5 ? '#ec4899' : '#6366f1'),
          borderRadius: 8,
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx) => ` Species Added: ${ctx.raw}`
            }
          }
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { color: '#cbd5e1', font: { weight: '600', size: 13 } }
          },
          y: {
            grid: { color: 'rgba(255, 255, 255, 0.05)' },
            ticks: { color: '#94a3b8' }
          }
        }
      }
    });
  }
}

/* ==========================================================================
   QUESTION 5: TOP 10 STRONGEST LEADERBOARD
   ========================================================================== */
function initTop10Leaderboard() {
  const sorted = [...POKEMON_DATA].sort((a, b) => b.total_stats - a.total_stats).slice(0, 10);
  const tbody = document.getElementById('tbody-top10');
  if (!tbody) return;

  tbody.innerHTML = sorted.map((p, idx) => {
    const rank = idx + 1;
    const rankClass = rank <= 3 ? `rank-${rank}` : '';
    const imgUrl = getArtworkUrl(p);

    return `
      <tr>
        <td><span class="rank-badge ${rankClass}">${rank}</span></td>
        <td>
          <div class="table-poke-info">
            <img class="table-poke-icon" src="${imgUrl}" alt="${p.pokemon}" onerror="this.src='https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${p.species_id || 1}.png'">
            <span class="table-poke-name">${formatPokeName(p.pokemon)}</span>
          </div>
        </td>
        <td>
          <div style="display:flex; gap:0.35rem;">
            <span class="type-badge type-${p.type_1?.toLowerCase()}">${p.type_1}</span>
            ${p.type_2 && p.type_2 !== 'NA' ? `<span class="type-badge type-${p.type_2?.toLowerCase()}">${p.type_2}</span>` : ''}
          </div>
        </td>
        <td>
          <div class="stat-bar-container">
            <strong style="color: #fff; min-width: 32px;">${p.total_stats}</strong>
            <div class="stat-bar-bg" style="width: 100px;">
              <div class="stat-bar-fill" style="width: ${(p.total_stats / 780) * 100}%;"></div>
            </div>
          </div>
        </td>
        <td>${p.hp}</td>
        <td>${p.attack}</td>
        <td>${p.defense}</td>
        <td>${p.special_attack}</td>
        <td>${p.special_defense}</td>
        <td>${p.speed}</td>
      </tr>
    `;
  }).join('');
}

/* ==========================================================================
   QUESTION 7: ATTACK VS DEFENSE SCATTER PLOT
   ========================================================================== */
function initAttackDefenseScatter() {
  const ctx = document.getElementById('chart-attack-defense');
  if (!ctx) return;

  // Group data by primary type for colored legend
  const typesSet = [...new Set(POKEMON_DATA.map(p => p.type_1?.toLowerCase()).filter(Boolean))].sort();
  const datasets = typesSet.map(type => {
    const pokes = POKEMON_DATA.filter(p => p.type_1?.toLowerCase() === type);
    return {
      label: type.charAt(0).toUpperCase() + type.slice(1),
      data: pokes.map(p => ({ x: p.attack, y: p.defense, name: p.pokemon, total: p.total_stats })),
      backgroundColor: TYPE_COLORS[type] || '#6366f1',
      borderColor: 'transparent',
      pointRadius: 4.5,
      pointHoverRadius: 7
    };
  });

  chartAtkDef = new Chart(ctx, {
    type: 'scatter',
    data: { datasets },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'right',
          labels: {
            color: '#cbd5e1',
            boxWidth: 10,
            padding: 8,
            font: { size: 11 }
          }
        },
        tooltip: {
          callbacks: {
            label: (ctx) => {
              const pt = ctx.raw;
              return `${formatPokeName(pt.name)}: Atk ${pt.x}, Def ${pt.y} (Total: ${pt.total})`;
            }
          }
        }
      },
      scales: {
        x: {
          title: { display: true, text: 'Base Attack Stat', color: '#94a3b8', font: { weight: '600' } },
          grid: { color: 'rgba(255, 255, 255, 0.05)' },
          ticks: { color: '#94a3b8' }
        },
        y: {
          title: { display: true, text: 'Base Defense Stat', color: '#94a3b8', font: { weight: '600' } },
          grid: { color: 'rgba(255, 255, 255, 0.05)' },
          ticks: { color: '#94a3b8' }
        }
      }
    }
  });
}

/* ==========================================================================
   QUESTION 8: MEAN ATTACK VS MEAN DEFENSE (GROUPED BAR CHART)
   ========================================================================== */
function initTypeAveragesChart() {
  const ctx = document.getElementById('chart-type-averages');
  if (!ctx) return;

  const grouped = {};
  POKEMON_DATA.forEach(p => {
    if (!p.type_1 || p.type_1 === 'NA') return;
    const t = p.type_1.toLowerCase();
    if (!grouped[t]) grouped[t] = { atkSum: 0, defSum: 0, count: 0 };
    grouped[t].atkSum += (p.attack || 0);
    grouped[t].defSum += (p.defense || 0);
    grouped[t].count++;
  });

  const types = Object.keys(grouped).sort();
  const meanAtk = types.map(t => +(grouped[t].atkSum / grouped[t].count).toFixed(1));
  const meanDef = types.map(t => +(grouped[t].defSum / grouped[t].count).toFixed(1));

  chartTypeAvg = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: types.map(t => t.toUpperCase()),
      datasets: [
        {
          label: 'Mean Attack',
          data: meanAtk,
          backgroundColor: '#ef4444',
          borderRadius: 4
        },
        {
          label: 'Mean Defense',
          data: meanDef,
          backgroundColor: '#3b82f6',
          borderRadius: 4
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: { color: '#cbd5e1', font: { weight: '600' } }
        },
        tooltip: {
          callbacks: {
            label: (ctx) => ` ${ctx.dataset.label}: ${ctx.raw}`
          }
        }
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { color: '#cbd5e1', font: { size: 11, weight: '600' } }
        },
        y: {
          title: { display: true, text: 'Average Stat Value', color: '#94a3b8' },
          grid: { color: 'rgba(255, 255, 255, 0.05)' },
          ticks: { color: '#94a3b8' }
        }
      }
    }
  });
}

/* ==========================================================================
   QUESTION 9: SPEED VS TOTAL STATS SCATTER PLOT
   ========================================================================== */
function initSpeedTotalScatter() {
  const ctx = document.getElementById('chart-speed-total');
  if (!ctx) return;

  const points = POKEMON_DATA.map(p => ({
    x: p.speed,
    y: p.total_stats,
    name: p.pokemon,
    type: p.type_1
  }));

  chartSpeedTotal = new Chart(ctx, {
    type: 'scatter',
    data: {
      datasets: [{
        label: 'Pokémon Species',
        data: points,
        backgroundColor: 'rgba(56, 189, 248, 0.65)',
        borderColor: 'transparent',
        pointRadius: 4,
        pointHoverRadius: 7
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (ctx) => {
              const pt = ctx.raw;
              return `${formatPokeName(pt.name)}: Speed ${pt.x}, Total Stats: ${pt.y} (${pt.type})`;
            }
          }
        }
      },
      scales: {
        x: {
          title: { display: true, text: 'Base Speed Stat', color: '#94a3b8', font: { weight: '600' } },
          grid: { color: 'rgba(255, 255, 255, 0.05)' },
          ticks: { color: '#94a3b8' }
        },
        y: {
          title: { display: true, text: 'Total Base Stats (All 6 Attributes)', color: '#94a3b8', font: { weight: '600' } },
          grid: { color: 'rgba(255, 255, 255, 0.05)' },
          ticks: { color: '#94a3b8' }
        }
      }
    }
  });
}

/* ==========================================================================
   QUESTION 10: MONTE CARLO BATTLE SIMULATOR
   ========================================================================== */
function initBattleSimulator() {
  const selA = document.getElementById('select-poke-a');
  const selB = document.getElementById('select-poke-b');
  if (!selA || !selB) return;

  // Populate dropdowns sorted alphabetically
  const sortedNames = [...POKEMON_DATA].sort((a, b) => a.pokemon.localeCompare(b.pokemon));
  const optionsHtml = sortedNames.map(p => `
    <option value="${p.pokemon}">${formatPokeName(p.pokemon)} (HP: ${p.hp}, Atk: ${p.attack})</option>
  `).join('');

  selA.innerHTML = optionsHtml;
  selB.innerHTML = optionsHtml;

  // Default to Bulbasaur vs Pikachu (as in Problem Set 1)
  selA.value = 'bulbasaur';
  selB.value = 'pikachu';

  updateFighterDisplay('a');
  updateFighterDisplay('b');
  runMonteCarloSimulation();
}

function updateFighterDisplay(side) {
  const sel = document.getElementById(`select-poke-${side}`);
  const pokeName = sel.value;
  const poke = POKEMON_DATA.find(p => p.pokemon === pokeName);
  if (!poke) return;

  document.getElementById(`hp-val-${side}`).textContent = poke.hp;
  document.getElementById(`atk-val-${side}`).textContent = poke.attack;
  document.getElementById(`def-val-${side}`).textContent = poke.defense;

  const img = document.getElementById(`img-poke-${side}`);
  img.src = getArtworkUrl(poke);
  img.onerror = () => { img.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${poke.species_id || 1}.png`; };
}

function loadPresetMatchup(pokeA, pokeB) {
  const selA = document.getElementById('select-poke-a');
  const selB = document.getElementById('select-poke-b');
  if (selA && selB) {
    selA.value = pokeA;
    selB.value = pokeB;
    updateFighterDisplay('a');
    updateFighterDisplay('b');
    runMonteCarloSimulation();
  }

  // Update active chip styling
  document.querySelectorAll('.presets-group .chip-btn').forEach(btn => {
    btn.classList.toggle('active', btn.textContent.toLowerCase().includes(pokeA));
  });
}

/**
 * Monte Carlo Simulation strictly following Problem Set 1 Question 10 rules:
 * - Starts at full HP
 * - On each round, Pokémon A attacks first, deals: Attack_A * runif(0.2, 0.6)
 * - If Pokémon B HP <= 0, Pokémon A wins
 * - Then Pokémon B attacks, deals: Attack_B * runif(0.2, 0.6)
 * - If Pokémon A HP <= 0, Pokémon B wins
 */
function runMonteCarloSimulation() {
  const pokeA = POKEMON_DATA.find(p => p.pokemon === document.getElementById('select-poke-a').value);
  const pokeB = POKEMON_DATA.find(p => p.pokemon === document.getElementById('select-poke-b').value);
  if (!pokeA || !pokeB) return;

  const numSims = parseInt(document.getElementById('sim-count').value, 10) || 1000;
  let winsA = 0;
  let totalTurns = 0;

  for (let i = 0; i < numSims; i++) {
    let hpA = pokeA.hp;
    let hpB = pokeB.hp;
    let turns = 0;

    while (true) {
      turns++;
      // A attacks B
      const multA = 0.2 + Math.random() * (0.6 - 0.2); // runif(0.2, 0.6)
      hpB -= pokeA.attack * multA;
      if (hpB <= 0) {
        winsA++;
        break;
      }

      // B attacks A
      const multB = 0.2 + Math.random() * (0.6 - 0.2);
      hpA -= pokeA.attack * multB; // Note: In prompt, Pokémon B attacks with attack_b
      // Correction: Pokémon B attacks using attack_b!
      // In original R: damage_to_a <- attack_b * runif(1, 0.2, 0.6)
    }
    totalTurns += turns;
  }

  // Exact correction with pokeB.attack:
  // Let's re-run loop cleanly with exact parameter matching
  winsA = 0;
  totalTurns = 0;
  for (let i = 0; i < numSims; i++) {
    let hpA = pokeA.hp;
    let hpB = pokeB.hp;
    let turns = 0;
    while (true) {
      turns++;
      const dmgB = pokeA.attack * (0.2 + Math.random() * 0.4);
      hpB -= dmgB;
      if (hpB <= 0) {
        winsA++;
        break;
      }
      const dmgA = pokeB.attack * (0.2 + Math.random() * 0.4);
      hpA -= dmgA;
      if (hpA <= 0) {
        break;
      }
    }
    totalTurns += turns;
  }

  const winRateA = (winsA / numSims) * 100;
  const winRateB = 100 - winRateA;
  const avgTurns = (totalTurns / numSims).toFixed(1);
  const p = winsA / numSims;
  const ci = (1.96 * Math.sqrt((p * (1 - p)) / numSims) * 100).toFixed(2);

  // Update UI
  const nameA = formatPokeName(pokeA.pokemon);
  const nameB = formatPokeName(pokeB.pokemon);

  document.getElementById('label-win-a').textContent = `${nameA} Win Rate: ${winRateA.toFixed(1)}%`;
  document.getElementById('label-win-b').textContent = `${nameB} Win Rate: ${winRateB.toFixed(1)}%`;

  document.getElementById('meter-fill-a').style.width = `${winRateA}%`;
  document.getElementById('meter-fill-a').textContent = `${winRateA.toFixed(1)}%`;
  document.getElementById('meter-fill-b').style.width = `${winRateB}%`;
  document.getElementById('meter-fill-b').textContent = `${winRateB.toFixed(1)}%`;

  document.getElementById('meta-sim-count').textContent = numSims.toLocaleString();
  document.getElementById('meta-avg-turns').textContent = `${avgTurns} Rounds`;
  document.getElementById('meta-ci').textContent = `± ${ci}%`;

  const advEl = document.getElementById('meta-advantage');
  if (winRateA > 55) {
    advEl.textContent = `${nameA} Favored`;
    advEl.style.color = '#34d399';
  } else if (winRateB > 55) {
    advEl.textContent = `${nameB} Favored`;
    advEl.style.color = '#f87171';
  } else {
    advEl.textContent = 'Evenly Matched';
    advEl.style.color = '#fbbf24';
  }
}

/**
 * Visual Turn-by-Turn Match Demonstration
 */
function playSingleVisualMatch() {
  const pokeA = POKEMON_DATA.find(p => p.pokemon === document.getElementById('select-poke-a').value);
  const pokeB = POKEMON_DATA.find(p => p.pokemon === document.getElementById('select-poke-b').value);
  if (!pokeA || !pokeB) return;

  const logBox = document.getElementById('combat-log');
  logBox.style.display = 'block';
  logBox.innerHTML = `<div class="log-entry" style="color:#38bdf8; font-weight:700;">⚔️ INITIATING ONE-ON-ONE DUEL: ${formatPokeName(pokeA.pokemon)} (HP: ${pokeA.hp}, Atk: ${pokeA.attack}) VS ${formatPokeName(pokeB.pokemon)} (HP: ${pokeB.hp}, Atk: ${pokeB.attack})</div>`;

  let hpA = pokeA.hp;
  let hpB = pokeB.hp;
  let round = 1;
  const logEntries = [];

  while (true) {
    // Round Header
    logEntries.push({ type: 'header', text: `--- ROUND ${round} ---` });

    // A attacks B
    const multA = (0.2 + Math.random() * 0.4);
    const dmgB = +(pokeA.attack * multA).toFixed(1);
    hpB = Math.max(0, +(hpB - dmgB).toFixed(1));
    logEntries.push({
      type: 'a',
      text: `▶ ${formatPokeName(pokeA.pokemon)} attacks! Deals ${dmgB} DMG (multiplier: ${multA.toFixed(2)}x). ${formatPokeName(pokeB.pokemon)} HP: ${hpB}`
    });

    if (hpB <= 0) {
      logEntries.push({ type: 'ko', text: `💥 ${formatPokeName(pokeB.pokemon)} has fainted! ${formatPokeName(pokeA.pokemon)} WINS THE DUEL in Round ${round}!` });
      break;
    }

    // B attacks A
    const multB = (0.2 + Math.random() * 0.4);
    const dmgA = +(pokeB.attack * multB).toFixed(1);
    hpA = Math.max(0, +(hpA - dmgA).toFixed(1));
    logEntries.push({
      type: 'b',
      text: `◀ ${formatPokeName(pokeB.pokemon)} counters! Deals ${dmgA} DMG (multiplier: ${multB.toFixed(2)}x). ${formatPokeName(pokeA.pokemon)} HP: ${hpA}`
    });

    if (hpA <= 0) {
      logEntries.push({ type: 'ko', text: `💥 ${formatPokeName(pokeA.pokemon)} has fainted! ${formatPokeName(pokeB.pokemon)} WINS THE DUEL in Round ${round}!` });
      break;
    }

    round++;
  }

  // Step-by-step printout
  let delay = 0;
  logEntries.forEach(entry => {
    setTimeout(() => {
      const p = document.createElement('div');
      p.className = `log-entry ${entry.type === 'a' ? 'turn-a' : entry.type === 'b' ? 'turn-b' : entry.type === 'ko' ? 'ko' : ''}`;
      p.textContent = entry.text;
      logBox.appendChild(p);
      logBox.scrollTop = logBox.scrollHeight;
    }, delay);
    delay += 250;
  });
}

/* ==========================================================================
   DATASET EXPLORER TABLE & FILTERING
   ========================================================================== */
function initDatasetExplorer() {
  currentFilteredData = [...POKEMON_DATA];
  renderExplorerTable();
}

function handleTableFilter() {
  const query = document.getElementById('search-input').value.toLowerCase().trim();
  const filterType = document.getElementById('filter-type').value.toLowerCase();
  const filterGen = document.getElementById('filter-generation').value;
  const sortBy = document.getElementById('sort-by').value;

  currentFilteredData = POKEMON_DATA.filter(p => {
    const matchesName = !query || p.pokemon.toLowerCase().includes(query);
    const matchesType = !filterType || (p.type_1?.toLowerCase() === filterType || p.type_2?.toLowerCase() === filterType);
    const matchesGen = !filterGen || String(p.generation_id) === filterGen;
    return matchesName && matchesType && matchesGen;
  });

  // Sorting
  const [field, order] = sortBy.split('-');
  currentFilteredData.sort((a, b) => {
    let valA = a[field] ?? 0;
    let valB = b[field] ?? 0;
    if (order === 'desc') return valB - valA;
    return valA - valB;
  });

  currentPage = 1;
  renderExplorerTable();
}

function renderExplorerTable() {
  const tbody = document.getElementById('tbody-explorer');
  if (!tbody) return;

  const total = currentFilteredData.length;
  const startIdx = (currentPage - 1) * PAGE_SIZE;
  const pageItems = currentFilteredData.slice(startIdx, startIdx + PAGE_SIZE);

  if (pageItems.length === 0) {
    tbody.innerHTML = `<tr><td colspan="10" style="text-align:center; padding: 2rem; color: var(--text-muted);">No matching Pokémon found.</td></tr>`;
    document.getElementById('pagination-info').textContent = 'Showing 0 of 0';
    return;
  }

  tbody.innerHTML = pageItems.map(p => {
    const imgUrl = getArtworkUrl(p);
    return `
      <tr>
        <td>#${p.species_id || p.id}</td>
        <td>
          <div class="table-poke-info">
            <img class="table-poke-icon" src="${imgUrl}" alt="${p.pokemon}" onerror="this.src='https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${p.species_id || 1}.png'">
            <strong style="color:#fff;">${formatPokeName(p.pokemon)}</strong>
          </div>
        </td>
        <td><span class="type-badge type-${p.type_1?.toLowerCase()}">${p.type_1}</span></td>
        <td>${p.type_2 && p.type_2 !== 'NA' ? `<span class="type-badge type-${p.type_2?.toLowerCase()}">${p.type_2}</span>` : '<span style="color:var(--text-muted);">-</span>'}</td>
        <td><strong style="color:var(--text-accent);">${p.total_stats}</strong></td>
        <td>${p.hp}</td>
        <td>${p.attack}</td>
        <td>${p.defense}</td>
        <td>${p.speed}</td>
        <td>Gen ${p.generation_id || 1}</td>
      </tr>
    `;
  }).join('');

  const endIdx = Math.min(startIdx + PAGE_SIZE, total);
  document.getElementById('pagination-info').textContent = `Showing ${startIdx + 1} - ${endIdx} of ${total} Pokémon`;

  document.getElementById('btn-prev-page').disabled = currentPage === 1;
  document.getElementById('btn-next-page').disabled = endIdx >= total;
}

function changePage(delta) {
  currentPage += delta;
  renderExplorerTable();
}

/* ==========================================================================
   HELPERS & UTILITIES
   ========================================================================== */
function formatPokeName(str) {
  if (!str) return '';
  return str.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

function getArtworkUrl(p) {
  if (p.url_image && p.url_image.startsWith('http')) {
    return p.url_image;
  }
  const idNum = p.species_id || p.id || 1;
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${idNum}.png`;
}
