<template>
    <AdminMaster>
        <AdminDashboard />
    </AdminMaster>

</template>


<script setup>
defineOptions({ name: 'DashboardView' })
import AdminMaster from '@/components/admin/AdminMaster.vue';
import AdminDashboard from '@/components/admin/AdminDashboard.vue';

</script>