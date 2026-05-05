<template>
    <div class="users-index">
        <div class="header">
            <h1>Users Management</h1>
            <p>All registered customers</p>
        </div>

        <div class="panel">
            <div class="panel-header">
                <h3>All Users</h3>
                <div class="search">
                    <i class="fas fa-search"></i>
                    <input v-model="search" placeholder="Search by name, email, mobile..." />
                </div>
            </div>

            <div v-if="loading" class="empty">Loading users...</div>

            <table v-else class="table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Mobile</th>
                        <th>Role</th>
                        <th>Status</th>
                        <th>Joined</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="user in filteredUsers" :key="user.id">
                        <td>#{{ user.id }}</td>
                        <td>{{ user.name }}</td>
                        <td>{{ user.email || '-' }}</td>
                        <td>{{ user.mobile }}</td>
                        <td>
                            <span :class="roleBadgeClass(user.role)">
                                {{ user.role || 'customer' }}
                            </span>
                        </td>
                        <td>
                            <span :class="user.is_active ? 'badge success' : 'badge danger'">
                                {{ user.is_active ? 'Active' : 'Inactive' }}
                            </span>
                        </td>
                        <td>{{ formatDate(user.created_at) }}</td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import api from '@/utils/axios'

const users = ref([])
const loading = ref(true)
const search = ref('')

const filteredUsers = computed(() => {
    if (!search.value) return users.value
    const term = search.value.toLowerCase()
    return users.value.filter(u =>
        u.name?.toLowerCase().includes(term) ||
        u.email?.toLowerCase().includes(term) ||
        u.mobile?.includes(term)
    )
})

const roleBadgeClass = (role) => {
    const map = {
        admin: 'badge primary',
        moderator: 'badge info',
        customer: 'badge'
    }
    return map[role] || 'badge'
}

const formatDate = (date) => {
    if (!date) return '-'
    return new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

const loadUsers = async () => {
    loading.value = true
    try {
        // Use the appropriate API endpoint – adjust if your backend uses a different path
        const response = await api.get('admin/users')
        users.value = response.data.data || response.data
    } catch (error) {
        console.error('Failed to load users', error)
        // Fallback mock data for testing (remove when real endpoint works)
        users.value = [
            { id: 1, name: 'John Doe', email: 'john@example.com', mobile: '01711111111', role: 'customer', is_active: true, created_at: '2025-01-15' },
            { id: 2, name: 'Jane Smith', email: 'jane@example.com', mobile: '01722222222', role: 'moderator', is_active: true, created_at: '2025-02-20' },
            { id: 3, name: 'Admin User', email: 'admin@example.com', mobile: '01733333333', role: 'admin', is_active: true, created_at: '2025-01-01' },
        ]
    } finally {
        loading.value = false
    }
}

onMounted(loadUsers)
</script>

<style scoped>
/* reuse same styles as ProductIndex (or copy from dashboard) */
.users-index {
    display: flex;
    flex-direction: column;
    gap: 24px;
}

.header h1 {
    font-size: 22px;
    font-weight: 600;
    color: var(--text);
}

.header p {
    color: var(--muted);
    font-size: 13px;
}

.panel {
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 10px;
}

.panel-header {
    padding: 14px;
    border-bottom: 1px solid var(--border);
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 12px;
}

.panel-header h3 {
    font-size: 15px;
    color: var(--text);
}

.search {
    display: flex;
    align-items: center;
    gap: 8px;
    background: var(--bg);
    padding: 6px 12px;
    border-radius: 8px;
}

.search input {
    background: transparent;
    border: none;
    outline: none;
    color: var(--text);
}

.table {
    width: 100%;
    border-collapse: collapse;
}

.table th {
    text-align: left;
    font-size: 12px;
    color: var(--muted);
    padding: 12px 10px;
}

.table td {
    padding: 10px;
    border-top: 1px solid var(--border);
    color: var(--text);
}

.badge {
    padding: 4px 8px;
    border-radius: 6px;
    font-size: 12px;
    background: #e2e8f0;
    color: #1e293b;
}

.badge.success {
    background: #dcfce7;
    color: #166534;
}

.badge.danger {
    background: #fee2e2;
    color: #991b1b;
}

.badge.primary {
    background: #dbeafe;
    color: #1e40af;
}

.badge.info {
    background: #e0f2fe;
    color: #075985;
}

.dark .badge {
    background: #334155;
    color: #e2e8f0;
}

.dark .badge.success {
    background: #14532d;
    color: #bbf7d0;
}

.dark .badge.danger {
    background: #7f1d1d;
    color: #fecaca;
}

.dark .badge.primary {
    background: #1e3a8a;
    color: #bfdbfe;
}

.dark .badge.info {
    background: #0c4a6e;
    color: #bae6fd;
}

.empty {
    padding: 40px;
    text-align: center;
    color: var(--muted);
}
</style>