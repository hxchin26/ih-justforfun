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

const STATE_COORDS = {
  Perlis:{x:60,y:40},
  Kedah:{x:60,y:100},
  Penang:{x:110,y:140},
  Perak:{x:140,y:210},
  Selangor:{x:190,y:280},
  'Kuala Lumpur':{x:230,y:320},
  Putrajaya:{x:260,y:350},
  'Negeri Sembilan':{x:215,y:380},
  Melaka:{x:205,y:430},
  Johor:{x:205,y:500},
  Pahang:{x:320,y:300},
  Terengganu:{x:340,y:140},
  Kelantan:{x:360,y:60}
}

const ROUTE_GRAPH = {
  Perlis:['Kedah'],
  Kedah:['Perlis','Penang'],
  Penang:['Kedah','Perak'],
  Perak:['Penang','Selangor'],
  Selangor:['Perak','Kuala Lumpur'],
  'Kuala Lumpur':['Selangor','Putrajaya','Negeri Sembilan','Pahang'],
  Putrajaya:['Kuala Lumpur'],
  'Negeri Sembilan':['Kuala Lumpur','Melaka'],
  Melaka:['Negeri Sembilan','Johor'],
  Johor:['Melaka'],
  Pahang:['Kuala Lumpur','Terengganu','Kelantan'],
  Terengganu:['Pahang','Kelantan'],
  Kelantan:['Pahang','Terengganu']
}

function findRoutePath(from, to){
  if(!ROUTE_GRAPH[from] || !ROUTE_GRAPH[to]) return []
  const queue = [[from]]
  const visited = new Set([from])
  while(queue.length){
    const path = queue.shift()
    const node = path[path.length-1]
    if(node === to) return path
    for(const next of ROUTE_GRAPH[node]){
      if(!visited.has(next)){
        visited.add(next)
        queue.push([...path, next])
      }
    }
  }
  return []
}

function routeContains(path, pickup, dropoff){
  const i = path.indexOf(pickup)
  const j = path.indexOf(dropoff)
  return i >= 0 && j >= 0 && i < j
}

function routeStates(from, to){
  const path = findRoutePath(from, to)
  return path.length > 0 ? path : [from, to]
}

function routeString(from, to){
  return routeStates(from, to).join(' → ')
}

// Render functions
function renderTrucks(){
  const list = document.getElementById('truck-list')
  list.innerHTML = ''
  const trucks = load(KEY_TRUCKS)
  const cargo = load(KEY_CARGO)
  if(trucks.length===0){ list.innerHTML = '<div class="meta">No truck posts yet.</div>'; return }
  trucks.forEach(t => {
    const matches = findMatchesForTruck(t, cargo)
    const card = document.createElement('div')
    card.className = 'card'
    let matchesHtml = ''
    if(matches.length > 0){
      matchesHtml = '<div class="match-list">'
      matches.forEach(c => {
        matchesHtml += `
          <div class="match-item">
            <strong>${escapeHtml(c.company)} • ${escapeHtml(c.cargoType)}</strong>
            <div class="meta">${escapeHtml(c.pickup)} → ${escapeHtml(c.dropoff)} • ${escapeHtml(c.date)}</div>
            <div class="meta">Weight: ${c.weight} kg • Budget: RM ${c.budget}</div>
          </div>`
      })
      matchesHtml += '</div>'
    } else {
      matchesHtml = '<div class="no-match">No cargo requests match this truck yet.</div>'
    }
    card.innerHTML = `
      <h3>${escapeHtml(t.company)} — ${escapeHtml(t.truckType)}</h3>
      <div class="meta">${escapeHtml(t.from)} → ${escapeHtml(t.to)} • ${escapeHtml(t.date)}</div>
      <div class="meta">Capacity: ${t.capacity} kg • Price: RM ${t.price}</div>
      <div class="actions"><button class="delete" data-id="${t.id}" data-type="truck">Delete</button></div>
      ${matchesHtml}
    `
    list.appendChild(card)
  })
}

function routeMatches(cargo, truck){
  const route = routeStates(truck.from, truck.to)
  return routeContains(route, cargo.pickup, cargo.dropoff)
}

function findMatchesForCargo(cargo, trucks){
  return trucks.filter(t =>
    routeMatches(cargo, t)
  )
}

function findMatchesForTruck(truck, cargo){
  return cargo.filter(c =>
    routeMatches(c, truck)
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

function inDateRange(date, start, end){
  if(!date) return false
  const value = new Date(date)
  const fromDate = start ? new Date(start) : null
  const toDate = end ? new Date(end) : null
  if(fromDate && value < fromDate) return false
  if(toDate && value > toDate) return false
  return true
}

function renderStateMap(){
  const svg = document.getElementById('state-map')
  svg.innerHTML = ''
  const ns = 'http://www.w3.org/2000/svg'
  const defs = document.createElementNS(ns, 'defs')
  const marker = document.createElementNS(ns, 'marker')
  marker.setAttribute('id', 'arrowhead')
  marker.setAttribute('markerWidth', '10')
  marker.setAttribute('markerHeight', '10')
  marker.setAttribute('refX', '0')
  marker.setAttribute('refY', '3')
  marker.setAttribute('orient', 'auto')
  const arrowPath = document.createElementNS(ns, 'path')
  arrowPath.setAttribute('d', 'M0,0 L0,6 L9,3 z')
  arrowPath.setAttribute('fill', '#2563eb')
  marker.appendChild(arrowPath)
  defs.appendChild(marker)
  svg.appendChild(defs)
  const baseGroup = document.createElementNS(ns, 'g')
  baseGroup.setAttribute('id', 'base-map')
  const drawn = new Set()
  Object.entries(ROUTE_GRAPH).forEach(([from, neighbors]) => {
    const fromPos = STATE_COORDS[from]
    neighbors.forEach(neighbor => {
      const key = [from, neighbor].sort().join('|')
      if(drawn.has(key)) return
      drawn.add(key)
      const toPos = STATE_COORDS[neighbor]
      if(!toPos) return
      const line = document.createElementNS(ns, 'line')
      line.setAttribute('x1', fromPos.x)
      line.setAttribute('y1', fromPos.y)
      line.setAttribute('x2', toPos.x)
      line.setAttribute('y2', toPos.y)
      line.setAttribute('stroke', '#93c5fd')
      line.setAttribute('stroke-width', '3')
      line.setAttribute('opacity', '0.7')
      baseGroup.appendChild(line)
    })
  })
  Object.entries(STATE_COORDS).forEach(([name, pos]) => {
    const circle = document.createElementNS(ns, 'circle')
    circle.setAttribute('cx', pos.x)
    circle.setAttribute('cy', pos.y)
    circle.setAttribute('r', '11')
    circle.setAttribute('fill', '#dbeafe')
    circle.setAttribute('stroke', '#3b82f6')
    circle.setAttribute('stroke-width', '2')
    baseGroup.appendChild(circle)
    const label = document.createElementNS(ns, 'text')
    label.setAttribute('x', pos.x + 14)
    label.setAttribute('y', pos.y + 5)
    label.setAttribute('font-size', '11')
    label.setAttribute('fill', '#1f2937')
    label.setAttribute('class', 'svg-text')
    label.textContent = name
    baseGroup.appendChild(label)
  })
  svg.appendChild(baseGroup)
}

function renderMapDashboard(){
  const start = document.getElementById('map-start-date').value
  const end = document.getElementById('map-end-date').value
  const trucks = load(KEY_TRUCKS).filter(t => inDateRange(t.date, start, end))
  const svg = document.getElementById('state-map')
  const ns = 'http://www.w3.org/2000/svg'
  svg.innerHTML = ''
  renderStateMap()

  const routeGroup = document.createElementNS(ns, 'g')
  routeGroup.setAttribute('id', 'truck-routes')
  trucks.forEach((truck, index) => {
    const route = routeStates(truck.from, truck.to)
    if(route.length < 2) return
    const points = route.map(state => STATE_COORDS[state]).filter(Boolean).map(pos => `${pos.x},${pos.y}`).join(' ')
    const polyline = document.createElementNS(ns, 'polyline')
    polyline.setAttribute('points', points)
    polyline.setAttribute('fill', 'none')
    polyline.setAttribute('stroke', '#2563eb')
    polyline.setAttribute('stroke-width', '5')
    polyline.setAttribute('stroke-linecap', 'round')
    polyline.setAttribute('stroke-linejoin', 'round')
    polyline.setAttribute('class', 'route-line')
    polyline.setAttribute('data-route-id', truck.id)
    routeGroup.appendChild(polyline)
    const mid = STATE_COORDS[route[Math.floor(route.length / 2)]]
    if(mid){
      const text = document.createElementNS(ns, 'text')
      text.setAttribute('x', mid.x + 2)
      text.setAttribute('y', mid.y - 8)
      text.setAttribute('font-size', '10')
      text.setAttribute('fill', '#2563eb')
      text.setAttribute('class', 'svg-text route-label')
      text.setAttribute('data-route-id', truck.id)
      text.textContent = truck.company
      routeGroup.appendChild(text)
    }
  })
  svg.appendChild(routeGroup)
  const list = document.getElementById('map-list')
  list.innerHTML = ''
  if(trucks.length === 0){
    const emptyText = document.createElementNS(ns, 'text')
    emptyText.setAttribute('x', 210)
    emptyText.setAttribute('y', 190)
    emptyText.setAttribute('font-size', '18')
    emptyText.setAttribute('fill', '#475569')
    emptyText.setAttribute('text-anchor', 'middle')
    emptyText.setAttribute('class', 'svg-text')
    emptyText.textContent = 'No trucks available for this date range.'
    routeGroup.appendChild(emptyText)
    svg.appendChild(routeGroup)
    list.innerHTML = '<div class="map-item">No trucks available for this date range.</div>'
    return
  }
  trucks.forEach(truck => {
    const item = document.createElement('div')
    item.className = 'map-item map-item-hover'
    item.dataset.routeId = truck.id
    item.innerHTML = `
      <strong>${escapeHtml(truck.company)} — ${escapeHtml(truck.truckType)}</strong>
      <div class="meta">${escapeHtml(routeString(truck.from, truck.to))}</div>
      <div class="meta">Date: ${escapeHtml(truck.date)} • Capacity: ${truck.capacity} kg</div>
      <div class="meta">Price: RM ${truck.price}</div>
      <div class="meta">Hover to highlight route</div>
    `
    item.addEventListener('mouseenter', () => {
      if(item.classList.contains('map-item-selected')) return
      const line = svg.querySelector(`.route-line[data-route-id="${truck.id}"]`)
      const label = svg.querySelector(`.route-label[data-route-id="${truck.id}"]`)
      if(line){ line.classList.add('active') }
      if(label){ label.classList.add('active') }
    })
    item.addEventListener('mouseleave', () => {
      if(item.classList.contains('map-item-selected')) return
      const line = svg.querySelector(`.route-line[data-route-id="${truck.id}"]`)
      const label = svg.querySelector(`.route-label[data-route-id="${truck.id}"]`)
      if(line){ line.classList.remove('active') }
      if(label){ label.classList.remove('active') }
    })
    item.addEventListener('click', () => {
      const activeLine = svg.querySelector(`.route-line.active`)
      const activeLabel = svg.querySelector(`.route-label.active`)
      const activeItem = document.querySelector('.map-item-selected')
      if(activeItem && activeItem !== item){
        activeItem.classList.remove('map-item-selected')
      }
      if(activeLine && activeLine.dataset.routeId !== truck.id){
        activeLine.classList.remove('active')
      }
      if(activeLabel && activeLabel.dataset.routeId !== truck.id){
        activeLabel.classList.remove('active')
      }
      const line = svg.querySelector(`.route-line[data-route-id="${truck.id}"]`)
      const label = svg.querySelector(`.route-label[data-route-id="${truck.id}"]`)
      const isSelected = item.classList.toggle('map-item-selected')
      if(line){
        if(isSelected) line.classList.add('active')
        else line.classList.remove('active')
      }
      if(label){
        if(isSelected) label.classList.add('active')
        else label.classList.remove('active')
      }
    })
    list.appendChild(item)
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
    renderTrucks(); renderCargo(); renderMapDashboard()
  }else{
    let arr = load(KEY_CARGO)
    arr = arr.filter(x => x.id !== id)
    save(KEY_CARGO, arr)
    renderCargo(); renderTrucks(); renderMapDashboard()
  }
}

// Wire up forms
function init(){
  const today = new Date().toISOString().slice(0,10)
  const startDateInput = document.getElementById('map-start-date')
  const endDateInput = document.getElementById('map-end-date')
  startDateInput.value = today
  endDateInput.value = today

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
    renderMapDashboard()
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

  document.getElementById('map-refresh').addEventListener('click', () => {
    renderMapDashboard()
  })

  startDateInput.addEventListener('change', renderMapDashboard)
  endDateInput.addEventListener('change', renderMapDashboard)

  // Delegate delete buttons
  document.body.addEventListener('click', e => {
    if(e.target.classList.contains('delete')){
      const id = e.target.dataset.id
      const type = e.target.dataset.type
      handleDelete(id, type)
    }
  })

  // Initial render
  renderTrucks(); renderCargo(); renderStateMap(); renderMapDashboard()
}

// Start when DOM ready
document.addEventListener('DOMContentLoaded', init)
