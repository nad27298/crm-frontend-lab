
<script setup lang="ts">
import { ref, computed } from 'vue'

type LeadStatus = 'new' | 'qualified'

interface Lead {
  id: string
  companyName: string
  budget: number
  status: LeadStatus
}

// Reactive state: dữ liệu thay đổi sẽ cập nhật giao diện
const leads = ref<Lead[]>([
  { id: 'L001', companyName: 'Company A', budget: 500, status: 'new' },
  { id: 'L002', companyName: 'Company B', budget: 800, status: 'qualified' },
  { id: 'L003', companyName: 'Company C', budget: 300, status: 'qualified' }
])

// Derived state: tính lại khi danh sách Lead thay đổi
const qualifiedCount = computed(() => {
  return leads.value.filter(
    lead => lead.status === 'qualified'
  ).length
})

// Event handler: cập nhật trạng thái một Lead
function markQualified(id: string): void {
  const lead = leads.value.find(item => item.id === id)

  if (!lead || lead.status === 'qualified') {
    return
  }

  lead.status = 'qualified'
}
</script>

<template>
  <main>
    <h1>CRM Frontend Lab</h1>

    <p>Tổng Lead: {{ leads.length }}</p>
    <p>Lead đủ điều kiện: {{ qualifiedCount }}</p>

    <h2>Danh sách Lead</h2>

    <ul>
      <li v-for="lead in leads" :key="lead.id">
        {{ lead.companyName }} —
        {{ lead.budget }} —
        {{ lead.status }}

        <button
          v-if="lead.status !== 'qualified'"
          type="button"
          @click="markQualified(lead.id)"
        >
          Đánh dấu qualified
        </button>
      </li>
    </ul>
  </main>
</template>

<style scoped>
main {
  max-width: 800px;
  margin: 40px auto;
  padding: 16px;
  font-family: Arial, sans-serif;
}

li {
  margin-bottom: 12px;
}

button {
  margin-left: 12px;
  cursor: pointer;
}
</style>
