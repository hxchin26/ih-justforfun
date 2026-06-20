// CargoLink - simple frontend-only demo
// Uses localStorage to save truck and cargo posts

// Storage keys
const KEY_TRUCKS = 'cargolink_trucks'
const KEY_CARGO = 'cargolink_cargo'

// Helpers for localStorage
function load(key){
  try{
    return JSON.parse(localStorage.getItem(key) || '[]')
  }catch(e){
    return []
  }
}
function save(key, arr){
  localStorage.setItem(key, JSON.stringify(arr))
}

// Simple unique id generator
function uid(prefix='id'){
  return prefix + '_' + Date.now() + '_' + Math.floor(Math.random()*10000)
}

// Render functions
function renderTrucks(){
  const list = document.getElementById('truck-list')
  list.innerHTML = ''
  const trucks = load(KEY_TRUCKS)
  if(trucks.length===0){ list.innerHTML = '<div class="meta">No truck posts yet.</div>'; return }
  trucks.forEach(t => {
    const card = document.createElement('div')
    card.className = 'card'
    card.innerHTML = `
      <h3>${escapeHtml(t.company)} — ${escapeHtml(t.truckType)}</h3>
      <div class="meta">${escapeHtml(t.from)} → ${escapeHtml(t.to)} • ${escapeHtml(t.date)}</div>
      <div class="meta">Capacity: ${t.capacity} kg • Price: RM ${t.price}</div>
      <div class="actions"><button class="delete" data-id="${t.id}" data-type="truck">Delete</button></div>
    `
    list.appendChild(card)
  })
}

function findMatchesForCargo(cargo, trucks){
  return trucks.filter(t =>
    clean(cargo.pickup) === clean(t.from) &&
    clean(cargo.dropoff) === clean(t.to) &&
    Number(cargo.weight) <= Number(t.capacity)
  )
}

function renderCargo(){
  const list = document.getElementById('cargo-list')
  list.innerHTML = ''
  const cargo = load(KEY_CARGO)
  const trucks = load(KEY_TRUCKS)
  if(cargo.length===0){ list.innerHTML = '<div class="meta">No cargo posts yet.</div>'; return }
  cargo.forEach(c => {
    const matches = findMatchesForCargo(c, trucks)
    const card = document.createElement('div')
    card.className = 'card'
    let matchesHtml = ''
    if(matches.length > 0){
      matchesHtml = '<div class="match-list">'
      matches.forEach(t => {
        matchesHtml += `
          <div class="match-item">
            <strong>${escapeHtml(t.company)} • ${escapeHtml(t.truckType)}</strong>
            <div class="meta">${escapeHtml(t.from)} → ${escapeHtml(t.to)} • ${escapeHtml(t.date)}</div>
            <div class="meta">Capacity: ${t.capacity} kg • Price: RM ${t.price}</div>
          </div>`
      })
      matchesHtml += '</div>'
    } else {
      matchesHtml = '<div class="no-match">No trucks match this cargo request yet.</div>'
    }
    card.innerHTML = `
      <h3>${escapeHtml(c.company)} — ${escapeHtml(c.cargoType)}</h3>
      <div class="meta">${escapeHtml(c.pickup)} → ${escapeHtml(c.dropoff)} • ${escapeHtml(c.date)}</div>
      <div class="meta">Weight: ${c.weight} kg • Budget: RM ${c.budget}</div>
      <div class="actions"><button class="delete" data-id="${c.id}" data-type="cargo">Delete</button></div>
      ${matchesHtml}
    `
    list.appendChild(card)
  })
}

// Utility: normalize text for matching
function clean(s){
  return String(s||'').trim().toLowerCase()
}

// Simple HTML escape
function escapeHtml(str){
  return String(str)
    .replace(/&/g,'&amp;')
    .replace(/</g,'&lt;')
    .replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;')
    .replace(/'/g,'&#39;')
}

// Delete handlers
function handleDelete(id, type){
  if(type==='truck'){
    let arr = load(KEY_TRUCKS)
    arr = arr.filter(x => x.id !== id)
    save(KEY_TRUCKS, arr)
    renderTrucks(); renderCargo()
  }else{
    let arr = load(KEY_CARGO)
    arr = arr.filter(x => x.id !== id)
    save(KEY_CARGO, arr)
    renderCargo()
  }
}

// Wire up forms
function init(){
  // Tabs
  document.querySelectorAll('.tab').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab').forEach(b => b.classList.remove('active'))
      btn.classList.add('active')
      const tab = btn.dataset.tab
      document.getElementById('truck-panel').classList.toggle('hidden', tab !== 'truck')
      document.getElementById('cargo-panel').classList.toggle('hidden', tab !== 'cargo')
    })
  })

  // Truck form submit
  document.getElementById('truck-form').addEventListener('submit', e => {
    e.preventDefault()
    const f = e.target
    const data = {
      id: uid('truck'),
      company: f.company.value,
      from: f.from.value,
      to: f.to.value,
      date: f.date.value,
      truckType: f.truckType.value,
      capacity: Number(f.capacity.value),
      price: Number(f.price.value)
    }
    const arr = load(KEY_TRUCKS)
    arr.unshift(data)
    save(KEY_TRUCKS, arr)
    f.reset()
    renderTrucks()
    renderCargo()
  })

  // Cargo form submit
  document.getElementById('cargo-form').addEventListener('submit', e => {
    e.preventDefault()
    const f = e.target
    const data = {
      id: uid('cargo'),
      company: f.company.value,
      pickup: f.pickup.value,
      dropoff: f.dropoff.value,
      date: f.date.value,
      weight: Number(f.weight.value),
      cargoType: f.cargoType.value,
      budget: Number(f.budget.value)
    }
    const arr = load(KEY_CARGO)
    arr.unshift(data)
    save(KEY_CARGO, arr)
    f.reset()
    renderCargo()
  })

  // Delegate delete buttons
  document.body.addEventListener('click', e => {
    if(e.target.classList.contains('delete')){
      const id = e.target.dataset.id
      const type = e.target.dataset.type
      handleDelete(id, type)
    }
  })

  // Initial render
  renderTrucks(); renderCargo()
}

// Start when DOM ready
document.addEventListener('DOMContentLoaded', init)
