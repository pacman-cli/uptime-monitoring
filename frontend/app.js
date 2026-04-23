const API_URL = window.__API_URL__ || 'http://localhost:8080/api/v1'

const dashboardState = {
    monitors: [],
    alerts: [],
    incidents: [],
    selectedMonitorId: null,
    editingMonitorId: null
}

const loginForm = document.getElementById('loginForm')
const registerForm = document.getElementById('registerForm')
const monitorForm = document.getElementById('monitorForm')

const modal = document.getElementById('modal')
const modalContent = document.getElementById('modalContent')
const detailsModal = document.getElementById('detailsModal')
const detailsModalContent = document.getElementById('detailsModalContent')
const deleteConfirmModal = document.getElementById('deleteConfirmModal')
const deleteConfirmContent = document.getElementById('deleteConfirmContent')
const deleteMonitorSummary = document.getElementById('deleteMonitorSummary')
const monitorModalTitle = document.getElementById('monitorModalTitle')
const monitorSubmitButton = document.getElementById('monitorSubmitButton')
const noticeBar = document.getElementById('noticeBar')
const noticeText = document.getElementById('noticeText')

let noticeTimer = null
let pendingDeleteMonitorId = null
let pendingDeleteRequestId = null
const pendingToggleMonitorIds = new Set()
let isSavingMonitor = false

async function readErrorMessage(res, fallbackMessage) {
    const contentType = res.headers.get('Content-Type') || ''

    try {
        if (contentType.includes('application/json')) {
            const body = await res.json()
            if (body.message) {
                return body.message
            }

            if (body.errors) {
                return Object.values(body.errors).join(', ')
            }
        }

        const text = await res.text()
        return text || fallbackMessage
    } catch {
        return fallbackMessage
    }
}

function escapeHtml(value) {
    return String(value ?? '')
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#39;')
}

function formatDateTime(value) {
    if (!value) {
        return 'Not available'
    }

    const date = new Date(value)
    if (Number.isNaN(date.getTime())) {
        return 'Not available'
    }

    return date.toLocaleString()
}

function formatLatency(value) {
    if (value === null || value === undefined || Number.isNaN(Number(value))) {
        return '—'
    }

    return `${Math.round(Number(value))} ms`
}

function formatRelativeDuration(startValue, endValue = new Date()) {
    if (!startValue) {
        return 'Not available'
    }

    const startDate = new Date(startValue)
    const endDate = new Date(endValue)
    if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
        return 'Not available'
    }

    const deltaMs = Math.max(0, endDate.getTime() - startDate.getTime())
    const totalMinutes = Math.floor(deltaMs / 60000)
    const days = Math.floor(totalMinutes / 1440)
    const hours = Math.floor((totalMinutes % 1440) / 60)
    const minutes = totalMinutes % 60
    const parts = []

    if (days > 0) {
        parts.push(`${days}d`)
    }

    if (hours > 0) {
        parts.push(`${hours}h`)
    }

    if (minutes > 0 || parts.length === 0) {
        parts.push(`${minutes}m`)
    }

    return parts.join(' ')
}

function getStatusMeta(lastCheck) {
    if (!lastCheck || lastCheck.status === 'PENDING') {
        return {
            label: 'Pending',
            dotClass: 'bg-yellow-400 shadow-[0_0_12px_rgba(250,204,21,0.55)]',
            textClass: 'text-yellow-300',
            badgeClass: 'border-yellow-400/30 bg-yellow-400/10 text-yellow-200'
        }
    }

    if (lastCheck.status === 'UP') {
        return {
            label: 'UP',
            dotClass: 'bg-brand shadow-[0_0_12px_rgba(16,185,129,0.8)]',
            textClass: 'text-brand',
            badgeClass: 'border-brand/30 bg-brand/10 text-emerald-100'
        }
    }

    return {
        label: 'DOWN',
        dotClass: 'bg-red-500 shadow-[0_0_12px_rgba(239,68,68,0.8)]',
        textClass: 'text-red-400',
        badgeClass: 'border-red-500/30 bg-red-500/10 text-red-100'
    }
}

function setVisibility(element, shouldShow, displayClass = 'flex') {
    if (!element) {
        return
    }

    element.classList.toggle('hidden', !shouldShow)
    element.classList.toggle(displayClass, shouldShow)
}

function openScaleModal(container, content) {
    if (!container || !content) {
        return
    }

    setVisibility(container, true)
    requestAnimationFrame(() => {
        container.classList.remove('opacity-0')
        content.classList.remove('scale-95')
        content.classList.add('scale-100')
    })
}

function closeScaleModal(container, content, onClosed) {
    if (!container || !content) {
        return
    }

    container.classList.add('opacity-0')
    content.classList.remove('scale-100')
    content.classList.add('scale-95')

    setTimeout(() => {
        setVisibility(container, false)
        if (typeof onClosed === 'function') {
            onClosed()
        }
    }, 220)
}

function clearNotice() {
    if (!noticeBar) {
        return
    }

    if (noticeTimer) {
        clearTimeout(noticeTimer)
        noticeTimer = null
    }

    noticeBar.classList.add('hidden')
    noticeBar.classList.remove('flex')
}

function setButtonBusyState(button, busy, busyLabel) {
    if (!button) {
        return
    }

    if (busy) {
        if (!button.dataset.originalText) {
            button.dataset.originalText = button.textContent
        }

        button.disabled = true
        button.classList.add('opacity-60', 'cursor-not-allowed')
        if (busyLabel) {
            button.textContent = busyLabel
        }
        return
    }

    button.disabled = false
    button.classList.remove('opacity-60', 'cursor-not-allowed')
    if (button.dataset.originalText) {
        button.textContent = button.dataset.originalText
        delete button.dataset.originalText
    }
}

function showNotice(message, type = 'error') {
    if (!noticeBar || !noticeText) {
        return
    }

    clearNotice()

    noticeText.textContent = message

    noticeBar.classList.remove(
        'border-red-500/30',
        'bg-red-500/10',
        'text-red-100',
        'border-brand/30',
        'bg-brand/10',
        'text-emerald-100'
    )

    if (type === 'success') {
        noticeBar.classList.add('border-brand/30', 'bg-brand/10', 'text-emerald-100')
    } else {
        noticeBar.classList.add('border-red-500/30', 'bg-red-500/10', 'text-red-100')
    }

    noticeBar.classList.remove('hidden')
    noticeBar.classList.add('flex')

    noticeTimer = setTimeout(() => {
        clearNotice()
    }, 4500)
}

if (loginForm) {
    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault()

        const email = document.getElementById('email').value
        const password = document.getElementById('password').value
        const btnText = document.getElementById('btnText')
        const loader = document.getElementById('loader')
        const errorBox = document.getElementById('errorBox')

        btnText.classList.add('hidden')
        loader.classList.remove('hidden')
        errorBox.classList.add('hidden')

        try {
            const res = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            })

            if (!res.ok) {
                throw new Error(await readErrorMessage(res, 'Invalid credentials'))
            }

            const data = await res.json()
            localStorage.setItem('uptime_jwt', data.token)
            window.location.href = 'index.html'
        } catch (error) {
            errorBox.innerText = error.message || 'Server error occurred'
            errorBox.classList.remove('hidden')
        } finally {
            btnText.classList.remove('hidden')
            loader.classList.add('hidden')
        }
    })
}

if (registerForm) {
    registerForm.addEventListener('submit', async (event) => {
        event.preventDefault()

        const email = document.getElementById('regEmail').value
        const password = document.getElementById('regPassword').value
        const btnText = document.getElementById('regBtnText')
        const loader = document.getElementById('regLoader')
        const errorBox = document.getElementById('regErrorBox')

        btnText.classList.add('hidden')
        loader.classList.remove('hidden')
        errorBox.classList.add('hidden')

        try {
            const res = await fetch(`${API_URL}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            })

            if (!res.ok) {
                throw new Error(await readErrorMessage(res, 'Registration failed.'))
            }

            const data = await res.json()
            localStorage.setItem('uptime_jwt', data.token)
            window.location.href = 'index.html'
        } catch (error) {
            errorBox.innerText = error.message || 'Server error occurred'
            errorBox.classList.remove('hidden')
        } finally {
            btnText.classList.remove('hidden')
            loader.classList.add('hidden')
        }
    })
}

function logout() {
    localStorage.removeItem('uptime_jwt')
    window.location.href = 'login.html'
}

async function fetchWithAuth(url, options = {}) {
    const token = localStorage.getItem('uptime_jwt')
    if (!token) {
        logout()
        throw new Error('Authentication required')
    }

    const headers = {
        'Authorization': `Bearer ${token}`,
        ...options.headers
    }

    if (!headers['Content-Type'] && options.body) {
        headers['Content-Type'] = 'application/json'
    }

    const res = await fetch(url, { ...options, headers })
    if (res.status === 401 || res.status === 403) {
        logout()
        throw new Error('Session expired')
    }

    return res
}

function renderAlerts(alerts) {
    const container = document.getElementById('alertsContainer')
    const list = document.getElementById('alertsList')

    if (!container || !list) {
        return
    }

    if (!Array.isArray(alerts) || alerts.length === 0) {
        list.innerHTML = ''
        setVisibility(container, false)
        return
    }

    setVisibility(container, true)
    list.innerHTML = alerts.slice(0, 8).map((alert) => `
        <div class="bg-red-500/10 border border-red-500/20 rounded-xl px-5 py-4 flex items-start gap-4">
            <div class="w-3 h-3 mt-1.5 rounded-full bg-red-500 shadow-[0_0_12px_rgba(239,68,68,0.8)] animate-pulse flex-shrink-0"></div>
            <div class="flex-1 min-w-0">
                <p class="text-sm text-red-300 font-medium truncate">${escapeHtml(alert.monitorUrl)}</p>
                <p class="text-xs text-slate-300 mt-1">${escapeHtml(alert.message)}</p>
                <p class="text-[10px] text-slate-500 mt-2">${formatDateTime(alert.createdAt)}</p>
            </div>
        </div>
    `).join('')
}

function renderIncidents(incidents) {
    const container = document.getElementById('incidentsContainer')
    const list = document.getElementById('incidentsList')

    if (!container || !list) {
        return
    }

    if (!Array.isArray(incidents) || incidents.length === 0) {
        list.innerHTML = ''
        setVisibility(container, false)
        return
    }

    setVisibility(container, true)
    list.innerHTML = incidents.slice(0, 6).map((incident) => {
        const statusLabel = incident.active ? 'Open outage' : 'Resolved'
        const badgeClass = incident.active
            ? 'border-red-500/30 bg-red-500/10 text-red-100'
            : 'border-brand/30 bg-brand/10 text-emerald-100'
        const durationText = incident.active
            ? `Open for ${formatRelativeDuration(incident.openedAt)}`
            : `Lasted ${formatRelativeDuration(incident.openedAt, incident.resolvedAt)}`

        return `
            <article class="rounded-2xl border border-white/5 bg-surface/40 p-5">
                <div class="flex items-start justify-between gap-4">
                    <div class="min-w-0">
                        <p class="truncate text-sm font-semibold text-white" title="${escapeHtml(incident.monitorUrl)}">${escapeHtml(incident.monitorUrl)}</p>
                        <p class="mt-1 text-xs text-slate-400">Opened ${escapeHtml(formatDateTime(incident.openedAt))}</p>
                    </div>
                    <span class="rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] ${badgeClass}">${statusLabel}</span>
                </div>
                <div class="mt-4 grid grid-cols-1 gap-3 text-sm md:grid-cols-2">
                    <div>
                        <p class="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-500">Duration</p>
                        <p class="mt-1 text-slate-200">${durationText}</p>
                    </div>
                    <div>
                        <p class="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-500">Recovery</p>
                        <p class="mt-1 text-slate-200">${incident.resolvedAt ? escapeHtml(formatDateTime(incident.resolvedAt)) : 'Still ongoing'}</p>
                    </div>
                </div>
            </article>
        `
    }).join('')
}

function renderOverview(monitors) {
    const totalNode = document.getElementById('overviewTotal')
    const upNode = document.getElementById('overviewHealthy')
    const downNode = document.getElementById('overviewFailing')
    const pendingNode = document.getElementById('overviewPending')

    if (!totalNode || !upNode || !downNode || !pendingNode) {
        return
    }

    const summary = monitors.reduce((accumulator, monitor) => {
        const status = monitor.lastCheck?.status || 'PENDING'
        accumulator.total += 1

        if (status === 'UP') {
            accumulator.up += 1
        } else if (status === 'DOWN') {
            accumulator.down += 1
        } else {
            accumulator.pending += 1
        }

        return accumulator
    }, { total: 0, up: 0, down: 0, pending: 0 })

    totalNode.textContent = summary.total
    upNode.textContent = summary.up
    downNode.textContent = summary.down
    pendingNode.textContent = summary.pending
}

function renderMonitors(monitors) {
    const grid = document.getElementById('monitorGrid')
    const emptyState = document.getElementById('emptyState')

    if (!grid || !emptyState) {
        return
    }

    if (!Array.isArray(monitors) || monitors.length === 0) {
        grid.innerHTML = ''
        setVisibility(emptyState, true)
        renderOverview([])
        return
    }

    setVisibility(emptyState, false)
    renderOverview(monitors)

    grid.innerHTML = [...monitors]
        .sort((first, second) => second.id - first.id)
        .map((monitor) => {
            const status = getStatusMeta(monitor.lastCheck)
            const statusCode = monitor.lastCheck?.statusCode ?? '—'
            const lastCheckedAt = formatDateTime(monitor.lastCheck?.checkedAt)
            const latencyText = formatLatency(monitor.lastCheck?.responseTimeMs)
            const activityLabel = monitor.active ? 'Active' : 'Paused'
            const isToggleBusy = pendingToggleMonitorIds.has(monitor.id)
            const toggleLabel = isToggleBusy ? 'Saving...' : monitor.active ? 'Pause' : 'Resume'
            const toggleButtonClass = monitor.active
                ? 'border-amber-400/20 bg-amber-400/10 text-amber-100 hover:border-amber-400/40 hover:bg-amber-400/15'
                : 'border-brand/20 bg-brand/10 text-emerald-100 hover:border-brand/40 hover:bg-brand/15'
            const deleteDisabledClass = pendingDeleteRequestId === monitor.id ? 'opacity-60 cursor-not-allowed' : ''
            const toggleDisabledClass = isToggleBusy ? 'opacity-60 cursor-not-allowed' : ''

            return `
                <article class="bg-surface/50 border border-white/5 rounded-2xl p-5 hover:bg-surface/80 transition duration-300 group relative overflow-hidden">
                    <div class="absolute inset-0 bg-gradient-to-br from-brand/5 via-transparent to-sky-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <div class="relative z-10 flex items-start justify-between gap-4">
                        <div class="min-w-0">
                            <div class="flex items-center gap-3">
                                <span class="w-3 h-3 rounded-full ${status.dotClass} ring-4 ring-background ${status.label === 'UP' ? 'animate-pulse' : ''}"></span>
                                <span class="rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] ${status.badgeClass}">${status.label}</span>
                            </div>
                            <h3 class="mt-4 truncate text-lg font-semibold text-white" title="${escapeHtml(monitor.url)}">${escapeHtml(monitor.url)}</h3>
                            <p class="mt-1 text-xs uppercase tracking-[0.22em] text-slate-400">${escapeHtml(monitor.method)} check every ${monitor.intervalSeconds}s</p>
                        </div>
                        <button onclick="openDeleteConfirmModal(${monitor.id})" ${pendingDeleteRequestId === monitor.id ? 'disabled' : ''} class="rounded-lg bg-background/70 p-2 text-slate-500 transition hover:text-red-400 ${deleteDisabledClass}" aria-label="Delete monitor">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                        </button>
                    </div>

                    <div class="relative z-10 mt-6 grid grid-cols-2 gap-4 border-t border-white/5 pt-4 text-sm">
                        <div>
                            <p class="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-500">Latency</p>
                            <p class="mt-1 text-slate-200">${latencyText}</p>
                        </div>
                        <div>
                            <p class="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-500">HTTP Code</p>
                            <p class="mt-1 text-slate-200">${statusCode}</p>
                        </div>
                        <div>
                            <p class="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-500">Mode</p>
                            <p class="mt-1 ${monitor.active ? 'text-brand' : 'text-slate-400'}">${activityLabel}</p>
                        </div>
                        <div>
                            <p class="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-500">Last Check</p>
                            <p class="mt-1 text-slate-200">${escapeHtml(lastCheckedAt)}</p>
                        </div>
                    </div>

                    <div class="relative z-10 mt-6 flex items-center justify-between gap-3 border-t border-white/5 pt-4">
                        <div>
                            <p class="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-500">Timeout</p>
                            <p class="mt-1 text-sm text-slate-200">${monitor.timeoutSeconds}s</p>
                        </div>
                        <div class="flex items-center gap-2">
                            <button onclick="toggleMonitorActive(${monitor.id})" ${isToggleBusy ? 'disabled' : ''} class="rounded-lg border px-3 py-2 text-sm font-medium transition ${toggleButtonClass} ${toggleDisabledClass}">
                                ${toggleLabel}
                            </button>
                            <button onclick="openEditModal(${monitor.id})" class="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm font-medium text-white transition hover:border-sky-400/40 hover:bg-sky-400/10">
                                Edit
                            </button>
                            <button onclick="openMonitorDetails(${monitor.id})" class="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white transition hover:border-brand/40 hover:bg-brand/10">
                                View Details
                            </button>
                        </div>
                    </div>
                </article>
            `
        })
        .join('')
}

async function loadAlerts() {
    try {
        const [alertsRes, incidentsRes] = await Promise.all([
            fetchWithAuth(`${API_URL}/alerts`),
            fetchWithAuth(`${API_URL}/alerts/incidents`)
        ])

        if (!alertsRes.ok) {
            renderAlerts([])
        } else {
            dashboardState.alerts = await alertsRes.json()
            renderAlerts(dashboardState.alerts)
        }

        if (!incidentsRes.ok) {
            renderIncidents([])
        } else {
            dashboardState.incidents = await incidentsRes.json()
            renderIncidents(dashboardState.incidents)
        }
    } catch (error) {
        console.error('Failed to load alerts', error)
    }
}

async function loadMonitors() {
    try {
        const res = await fetchWithAuth(`${API_URL}/monitors`)
        if (!res.ok) {
            renderMonitors([])
            return
        }

        const monitors = await res.json()
        const enrichedMonitors = await Promise.all(monitors.map(async (monitor) => {
            try {
                const checkRes = await fetchWithAuth(`${API_URL}/monitors/${monitor.id}/last-check`)
                if (checkRes.ok) {
                    monitor.lastCheck = await checkRes.json()
                }
            } catch (error) {
                console.error(`Failed to fetch last check for monitor ${monitor.id}`, error)
            }

            return monitor
        }))

        dashboardState.monitors = enrichedMonitors
        renderMonitors(enrichedMonitors)
    } catch (error) {
        console.error('Failed to load monitors', error)
    }
}

async function loadDashboard() {
    await Promise.all([loadMonitors(), loadAlerts()])
}

function openModal() {
    dashboardState.editingMonitorId = null
    if (monitorModalTitle) {
        monitorModalTitle.textContent = 'Add Monitor'
    }

    if (monitorSubmitButton) {
        monitorSubmitButton.textContent = 'Save Monitor'
        monitorSubmitButton.dataset.originalText = 'Save Monitor'
        monitorSubmitButton.disabled = false
        monitorSubmitButton.classList.remove('opacity-60', 'cursor-not-allowed')
    }

    if (monitorForm) {
        monitorForm.reset()
        const activeInput = document.getElementById('monitorActive')
        if (activeInput) {
            activeInput.checked = true
        }
    }

    openScaleModal(modal, modalContent)
}

function closeModal() {
    closeScaleModal(modal, modalContent, () => {
        dashboardState.editingMonitorId = null
        if (monitorForm) {
            monitorForm.reset()
        }

        if (monitorModalTitle) {
            monitorModalTitle.textContent = 'Add Monitor'
        }

        if (monitorSubmitButton) {
            monitorSubmitButton.textContent = 'Save Monitor'
            monitorSubmitButton.dataset.originalText = 'Save Monitor'
            monitorSubmitButton.disabled = false
            monitorSubmitButton.classList.remove('opacity-60', 'cursor-not-allowed')
        }
    })
}

function openEditModal(monitorId) {
    const monitor = dashboardState.monitors.find((item) => item.id === monitorId)
    if (!monitor) {
        showNotice('Unable to load monitor for editing.', 'error')
        return
    }

    dashboardState.editingMonitorId = monitorId

    document.getElementById('monitorUrl').value = monitor.url
    document.getElementById('monitorMethod').value = monitor.method
    document.getElementById('monitorInterval').value = monitor.intervalSeconds
    document.getElementById('monitorTimeout').value = monitor.timeoutSeconds

    const activeInput = document.getElementById('monitorActive')
    if (activeInput) {
        activeInput.checked = Boolean(monitor.active)
    }

    if (monitorModalTitle) {
        monitorModalTitle.textContent = 'Edit Monitor'
    }

    if (monitorSubmitButton) {
        monitorSubmitButton.textContent = 'Update Monitor'
        monitorSubmitButton.dataset.originalText = 'Update Monitor'
        monitorSubmitButton.disabled = false
        monitorSubmitButton.classList.remove('opacity-60', 'cursor-not-allowed')
    }

    openScaleModal(modal, modalContent)
}

function closeDetailsModal() {
    closeScaleModal(detailsModal, detailsModalContent, () => {
        dashboardState.selectedMonitorId = null
    })
}

function openDeleteConfirmModal(monitorId) {
    const monitor = dashboardState.monitors.find((item) => item.id === monitorId)
    if (!monitor) {
        showNotice('Unable to load monitor details for deletion.', 'error')
        return
    }

    pendingDeleteMonitorId = monitorId

    if (deleteMonitorSummary) {
        deleteMonitorSummary.textContent = `You are about to delete ${monitor.url}`
    }

    openScaleModal(deleteConfirmModal, deleteConfirmContent)
}

function closeDeleteConfirmModal() {
    closeScaleModal(deleteConfirmModal, deleteConfirmContent, () => {
        pendingDeleteMonitorId = null
    })
}

async function confirmDeleteMonitor() {
    if (!pendingDeleteMonitorId) {
        closeDeleteConfirmModal()
        return
    }

    const monitorId = pendingDeleteMonitorId
    closeDeleteConfirmModal()
    pendingDeleteRequestId = monitorId
    renderMonitors(dashboardState.monitors)
    try {
        await deleteMonitor(monitorId)
    } finally {
        pendingDeleteRequestId = null
        renderMonitors(dashboardState.monitors)
    }
}

function renderDetailsSkeleton() {
    const titleNode = document.getElementById('detailsTitle')
    const subtitleNode = document.getElementById('detailsSubtitle')
    const metaNode = document.getElementById('detailsMeta')
    const metricsNode = document.getElementById('detailsMetrics')
    const historyNode = document.getElementById('detailsHistory')
    const notesNode = document.getElementById('detailsNotes')

    if (!titleNode || !subtitleNode || !metaNode || !metricsNode || !historyNode || !notesNode) {
        return
    }

    titleNode.textContent = 'Loading monitor details...'
    subtitleNode.textContent = 'Fetching metrics and check history'
    metaNode.innerHTML = '<div class="animate-pulse rounded-xl bg-white/5 p-4 h-24"></div>'
    metricsNode.innerHTML = '<div class="animate-pulse rounded-xl bg-white/5 p-4 h-28"></div>'
    historyNode.innerHTML = '<div class="animate-pulse rounded-xl bg-white/5 p-4 h-56"></div>'
    notesNode.innerHTML = '<div class="animate-pulse rounded-xl bg-white/5 p-4 h-24"></div>'
}

function renderMonitorDetails(monitor, metrics, history) {
    const titleNode = document.getElementById('detailsTitle')
    const subtitleNode = document.getElementById('detailsSubtitle')
    const metaNode = document.getElementById('detailsMeta')
    const metricsNode = document.getElementById('detailsMetrics')
    const historyNode = document.getElementById('detailsHistory')
    const notesNode = document.getElementById('detailsNotes')

    if (!titleNode || !subtitleNode || !metaNode || !metricsNode || !historyNode || !notesNode) {
        return
    }

    const status = getStatusMeta(monitor.lastCheck)
    const uptime = metrics?.uptimePercentage ?? 0
    const historyItems = Array.isArray(history) ? history.slice(0, 12) : []
    const relatedIncidents = dashboardState.incidents.filter((incident) => incident.monitorId === monitor.id)
    const openIncident = relatedIncidents.find((incident) => incident.active)
    const latestIncident = relatedIncidents[0] || null

    titleNode.textContent = monitor.url
    subtitleNode.textContent = `${monitor.method} monitor with ${status.label} status`

    metaNode.innerHTML = `
        <div class="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div class="rounded-2xl border border-white/10 bg-background/40 p-4">
                <p class="text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-500">Current Status</p>
                <p class="mt-2 text-lg font-semibold ${status.textClass}">${status.label}</p>
                <p class="mt-1 text-xs text-slate-400">Last checked ${escapeHtml(formatDateTime(monitor.lastCheck?.checkedAt))}</p>
            </div>
            <div class="rounded-2xl border border-white/10 bg-background/40 p-4">
                <p class="text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-500">Interval</p>
                <p class="mt-2 text-lg font-semibold text-white">${monitor.intervalSeconds}s</p>
                <p class="mt-1 text-xs text-slate-400">Timeout ${monitor.timeoutSeconds}s</p>
            </div>
            <div class="rounded-2xl border border-white/10 bg-background/40 p-4">
                <p class="text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-500">Last Latency</p>
                <p class="mt-2 text-lg font-semibold text-white">${formatLatency(monitor.lastCheck?.responseTimeMs)}</p>
                <p class="mt-1 text-xs text-slate-400">HTTP ${monitor.lastCheck?.statusCode ?? '—'}</p>
            </div>
            <div class="rounded-2xl border border-white/10 bg-background/40 p-4">
                <p class="text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-500">Lifecycle</p>
                <p class="mt-2 text-lg font-semibold ${monitor.active ? 'text-brand' : 'text-slate-300'}">${monitor.active ? 'Active' : 'Paused'}</p>
                <p class="mt-1 text-xs text-slate-400">Created ${escapeHtml(formatDateTime(monitor.createdAt))}</p>
            </div>
        </div>
    `

    metricsNode.innerHTML = `
        <div class="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
            <div class="rounded-2xl border border-brand/20 bg-brand/10 p-4">
                <p class="text-[10px] font-semibold uppercase tracking-[0.24em] text-emerald-200/70">Uptime</p>
                <p class="mt-2 text-3xl font-bold text-white">${uptime.toFixed(2)}%</p>
                <p class="mt-1 text-xs text-emerald-100/70">Across ${metrics?.totalChecks ?? 0} checks</p>
            </div>
            <div class="rounded-2xl border border-white/10 bg-background/40 p-4">
                <p class="text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-500">Average</p>
                <p class="mt-2 text-2xl font-semibold text-white">${formatLatency(metrics?.averageLatencyMs)}</p>
                <p class="mt-1 text-xs text-slate-400">Mean response time</p>
            </div>
            <div class="rounded-2xl border border-white/10 bg-background/40 p-4">
                <p class="text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-500">P50</p>
                <p class="mt-2 text-2xl font-semibold text-white">${formatLatency(metrics?.p50LatencyMs)}</p>
                <p class="mt-1 text-xs text-slate-400">Median latency</p>
            </div>
            <div class="rounded-2xl border border-white/10 bg-background/40 p-4">
                <p class="text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-500">P95</p>
                <p class="mt-2 text-2xl font-semibold text-white">${formatLatency(metrics?.p95LatencyMs)}</p>
                <p class="mt-1 text-xs text-slate-400">Tail latency</p>
            </div>
            <div class="rounded-2xl border border-white/10 bg-background/40 p-4">
                <p class="text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-500">P99</p>
                <p class="mt-2 text-2xl font-semibold text-white">${formatLatency(metrics?.p99LatencyMs)}</p>
                <p class="mt-1 text-xs text-slate-400">Worst-case trend</p>
            </div>
        </div>
    `

    historyNode.innerHTML = historyItems.length > 0
        ? `<div class="space-y-3">${historyItems.map((item) => {
            const itemStatus = getStatusMeta(item)
            return `
                <div class="rounded-2xl border border-white/10 bg-background/40 p-4">
                    <div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                        <div class="flex items-center gap-3">
                            <span class="w-3 h-3 rounded-full ${itemStatus.dotClass}"></span>
                            <div>
                                <p class="font-medium text-white">${itemStatus.label}</p>
                                <p class="text-xs text-slate-400">${escapeHtml(formatDateTime(item.checkedAt))}</p>
                            </div>
                        </div>
                        <div class="grid grid-cols-2 gap-4 text-sm md:flex md:items-center md:gap-8">
                            <div>
                                <p class="text-[10px] uppercase tracking-[0.22em] text-slate-500">Latency</p>
                                <p class="mt-1 text-slate-200">${formatLatency(item.responseTimeMs)}</p>
                            </div>
                            <div>
                                <p class="text-[10px] uppercase tracking-[0.22em] text-slate-500">Status Code</p>
                                <p class="mt-1 text-slate-200">${item.statusCode ?? '—'}</p>
                            </div>
                        </div>
                    </div>
                </div>
            `
        }).join('')}</div>`
        : '<div class="rounded-2xl border border-dashed border-white/10 bg-background/30 p-6 text-sm text-slate-400">No check history is available yet for this monitor.</div>'

    const latestDownEvent = historyItems.find((item) => item.status === 'DOWN')
    notesNode.innerHTML = `
        <div class="rounded-2xl border border-white/10 bg-background/40 p-5">
            <h3 class="text-sm font-semibold uppercase tracking-[0.24em] text-slate-400">Operational Notes</h3>
            <div class="mt-3 grid gap-3 md:grid-cols-2">
                <div>
                    <p class="text-sm font-medium text-white">Reliability signal</p>
                    <p class="mt-1 text-sm text-slate-300">${uptime >= 99 ? 'Very strong in the last 24 hours.' : uptime >= 95 ? 'Stable, but there are recoverable spikes.' : 'Needs attention based on recent failures.'}</p>
                </div>
                <div>
                    <p class="text-sm font-medium text-white">Most recent failure</p>
                    <p class="mt-1 text-sm text-slate-300">${latestDownEvent ? escapeHtml(formatDateTime(latestDownEvent.checkedAt)) : 'No DOWN event found in the current history window.'}</p>
                </div>
                <div>
                    <p class="text-sm font-medium text-white">Incident status</p>
                    <p class="mt-1 text-sm text-slate-300">${openIncident ? `Open since ${escapeHtml(formatDateTime(openIncident.openedAt))}` : latestIncident ? `Last resolved ${escapeHtml(formatDateTime(latestIncident.resolvedAt))}` : 'No incident recorded for this monitor yet.'}</p>
                </div>
                <div>
                    <p class="text-sm font-medium text-white">Outage history</p>
                    <p class="mt-1 text-sm text-slate-300">${relatedIncidents.length > 0 ? `${relatedIncidents.length} incident${relatedIncidents.length === 1 ? '' : 's'} captured in the feed.` : 'No incidents in the current incident feed.'}</p>
                </div>
            </div>
        </div>
    `
}

async function openMonitorDetails(monitorId) {
    dashboardState.selectedMonitorId = monitorId
    renderDetailsSkeleton()
    openScaleModal(detailsModal, detailsModalContent)

    try {
        const monitor = dashboardState.monitors.find((item) => item.id === monitorId)
        if (!monitor) {
            throw new Error('Monitor not found in dashboard state')
        }

        const [metricsRes, historyRes, lastCheckRes] = await Promise.all([
            fetchWithAuth(`${API_URL}/metrics/monitor/${monitorId}?hoursBack=24`),
            fetchWithAuth(`${API_URL}/monitors/${monitorId}/history?hoursBack=24`),
            fetchWithAuth(`${API_URL}/monitors/${monitorId}/last-check`)
        ])

        const metrics = metricsRes.ok ? await metricsRes.json() : null
        const history = historyRes.ok ? await historyRes.json() : []
        const lastCheck = lastCheckRes.ok ? await lastCheckRes.json() : null

        renderMonitorDetails({ ...monitor, lastCheck }, metrics, history)
    } catch (error) {
        console.error('Failed to load monitor details', error)
        const historyNode = document.getElementById('detailsHistory')
        const notesNode = document.getElementById('detailsNotes')
        const titleNode = document.getElementById('detailsTitle')
        const subtitleNode = document.getElementById('detailsSubtitle')

        if (titleNode) {
            titleNode.textContent = 'Unable to load monitor details'
        }

        if (subtitleNode) {
            subtitleNode.textContent = error.message || 'Request failed'
        }

        if (historyNode) {
            historyNode.innerHTML = '<div class="rounded-2xl border border-red-500/20 bg-red-500/10 p-6 text-sm text-red-100">The details view could not load data from the backend.</div>'
        }

        if (notesNode) {
            notesNode.innerHTML = ''
        }
    }
}

async function refreshSelectedMonitorDetails() {
    if (!dashboardState.selectedMonitorId) {
        return
    }

    await loadDashboard()
    await openMonitorDetails(dashboardState.selectedMonitorId)
}

if (monitorForm) {
    monitorForm.addEventListener('submit', async (event) => {
        event.preventDefault()

        if (isSavingMonitor) {
            return
        }

        const activeInput = document.getElementById('monitorActive')

        const payload = {
            url: document.getElementById('monitorUrl').value.trim(),
            method: document.getElementById('monitorMethod').value,
            intervalSeconds: parseInt(document.getElementById('monitorInterval').value, 10),
            timeoutSeconds: parseInt(document.getElementById('monitorTimeout').value, 10),
            active: activeInput ? activeInput.checked : true
        }

        try {
            isSavingMonitor = true
            setButtonBusyState(monitorSubmitButton, true, 'Saving...')

            const isEditing = dashboardState.editingMonitorId !== null
            const endpoint = isEditing
                ? `${API_URL}/monitors/${dashboardState.editingMonitorId}`
                : `${API_URL}/monitors`

            const res = await fetchWithAuth(endpoint, {
                method: isEditing ? 'PUT' : 'POST',
                body: JSON.stringify(payload)
            })

            if (!res.ok) {
                throw new Error(await readErrorMessage(res, isEditing ? 'Failed to update monitor.' : 'Failed to save monitor.'))
            }

            closeModal()
            await loadDashboard()
            showNotice(isEditing ? 'Monitor updated successfully.' : 'Monitor created successfully.', 'success')
        } catch (error) {
            showNotice(error.message || 'Failed to save monitor.', 'error')
        } finally {
            isSavingMonitor = false
            setButtonBusyState(monitorSubmitButton, false)
        }
    })
}

async function deleteMonitor(id) {
    try {
        const res = await fetchWithAuth(`${API_URL}/monitors/${id}`, { method: 'DELETE' })
        if (!res.ok) {
            throw new Error(await readErrorMessage(res, 'Failed to delete monitor.'))
        }

        if (dashboardState.selectedMonitorId === id) {
            closeDetailsModal()
        }

        await loadDashboard()
        showNotice('Monitor deleted successfully.', 'success')
    } catch (error) {
        showNotice(error.message || 'Failed to delete monitor.', 'error')
    }
}

async function toggleMonitorActive(id) {
    if (pendingToggleMonitorIds.has(id)) {
        return
    }

    const monitor = dashboardState.monitors.find((item) => item.id === id)
    if (!monitor) {
        showNotice('Unable to update this monitor.', 'error')
        return
    }

    pendingToggleMonitorIds.add(id)
    renderMonitors(dashboardState.monitors)

    const payload = {
        url: monitor.url,
        method: monitor.method,
        intervalSeconds: monitor.intervalSeconds,
        timeoutSeconds: monitor.timeoutSeconds,
        active: !monitor.active
    }

    try {
        const res = await fetchWithAuth(`${API_URL}/monitors/${id}`, {
            method: 'PUT',
            body: JSON.stringify(payload)
        })

        if (!res.ok) {
            throw new Error(await readErrorMessage(res, 'Failed to update monitor status.'))
        }

        if (dashboardState.selectedMonitorId === id) {
            closeDetailsModal()
        }

        await loadDashboard()
        showNotice(payload.active ? 'Monitor resumed successfully.' : 'Monitor paused successfully.', 'success')
    } catch (error) {
        showNotice(error.message || 'Failed to update monitor status.', 'error')
    } finally {
        pendingToggleMonitorIds.delete(id)
        renderMonitors(dashboardState.monitors)
    }
}

window.logout = logout
window.openModal = openModal
window.openEditModal = openEditModal
window.closeModal = closeModal
window.openMonitorDetails = openMonitorDetails
window.closeDetailsModal = closeDetailsModal
window.openDeleteConfirmModal = openDeleteConfirmModal
window.closeDeleteConfirmModal = closeDeleteConfirmModal
window.confirmDeleteMonitor = confirmDeleteMonitor
window.deleteMonitor = deleteMonitor
window.toggleMonitorActive = toggleMonitorActive
window.loadDashboard = loadDashboard
window.refreshSelectedMonitorDetails = refreshSelectedMonitorDetails
window.clearNotice = clearNotice
