// ─── Base Config ───────────────────────────────────────────────────────────────
// ✅ بدّل هاد الـ BASE_URL لما يجي الـ API
const BASE_URL = 'https://your-api.com/api'

// ─── HTTP Helper ────────────────────────────────────────────────────────────────
async function http(path, options = {}) {
    const token = localStorage.getItem('token') // ✅ أو من أي مكان عندك الـ token

    const res = await fetch(`${BASE_URL}${path}`, {
        headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...options.headers,
        },
        ...options,
    })

    if (!res.ok) {
        const error = await res.json().catch(() => ({}))
        throw new Error(error?.message || `HTTP ${res.status}`)
    }

    return res.json()
}

// ─── Beneficiaries Service ──────────────────────────────────────────────────────
export const beneficiariesService = {

    /**
     * GET /beneficiaries
     * @returns {{ data: Beneficiary[], total: number }}
     */
    getList({ status = '', category = '', search = '', page = 1, limit = 10 } = {}) {
        const params = new URLSearchParams()
        if (status) params.set('status', status)
        if (category) params.set('category', category)
        if (search) params.set('search', search)
        params.set('page', String(page))
        params.set('limit', String(limit))

        return http(`/beneficiaries?${params}`)
    },

    /**
     * GET /beneficiaries/:id
     * @returns {Beneficiary}
     */
    getById(id) {
        return http(`/beneficiaries/${id}`)
    },

    /**
     * POST /beneficiaries
     * @returns {Beneficiary}
     */
    create(payload) {
        return http('/beneficiaries', {
            method: 'POST',
            body: JSON.stringify(payload),
        })
    },

    /**
     * PUT /beneficiaries/:id
     * @returns {Beneficiary}
     */
    update(id, payload) {
        return http(`/beneficiaries/${id}`, {
            method: 'PUT',
            body: JSON.stringify(payload),
        })
    },

    /**
     * PATCH /beneficiaries/:id/status
     * @returns {Beneficiary}
     */
    changeStatus(id, status) {
        return http(`/beneficiaries/${id}/status`, {
            method: 'PATCH',
            body: JSON.stringify({ status }),
        })
    },

    /**
     * PATCH /beneficiaries/:id/archive
     * @returns {{ success: boolean }}
     */
    archive(id) {
        return http(`/beneficiaries/${id}/archive`, {
            method: 'PATCH',
        })
    },

    /**
     * DELETE /beneficiaries/:id
     * @returns {{ success: boolean }}
     */
    delete(id) {
        return http(`/beneficiaries/${id}`, {
            method: 'DELETE',
        })
    },
}