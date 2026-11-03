
<script setup lang="ts">
type LeadStatus = 'new' | 'qualified'

interface Lead {
  id: string
  companyName: string
  budget: number
  status: LeadStatus
}

const leads: Lead[] = [
  { id: 'L001', companyName: 'Company A', budget: 500, status: 'new' },
  { id: 'L002', companyName: 'Company B', budget: 800, status: 'qualified' },
  { id: 'L003', companyName: 'Company C', budget: 300, status: 'qualified' }
]

// Lọc lead đã đủ điều kiện
const qualifiedLeads = leads.filter(
  lead => lead.status === 'qualified'
)

// Lấy danh sách tên công ty
const companyNames = leads.map(
  lead => lead.companyName
)

// Tổng ngân sách các lead đạt điều kiện
const totalBudget = qualifiedLeads.reduce(
  (sum, lead) => sum + lead.budget,
  0
)
</script>

<template>
  <main>
    <h1>CRM Frontend Lab</h1>

    <h2>Danh sách Lead</h2>

    <ul>
      <li v-for="lead in leads" :key="lead.id">
        {{ lead.companyName }} —
        {{ lead.budget }} —
        {{ lead.status }}
      </li>
    </ul>

    <p>Tổng Lead: {{ leads.length }}</p>
    <p>Lead đạt điều kiện: {{ qualifiedLeads.length }}</p>
    <p>Tổng ngân sách đạt điều kiện: {{ totalBudget }}</p>
    <p>Danh sách công ty: {{ companyNames.join(', ') }}</p>
  </main>
</template>
