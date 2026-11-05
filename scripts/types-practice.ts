
type LeadStatus = 'new' | 'qualified'

interface Lead {
  id: string
  companyName: string
  budget: number | null
  status: LeadStatus
  phone?: string
}

// Generic: tìm phần tử theo ID
function findById<T extends { id: string }>(
  items: T[],
  id: string
): T | undefined {
  return items.find(item => item.id === id)
}

// Type Guard: kiểm tra dữ liệu thực tế
function isLead(value: unknown): value is Lead {
  if (
    typeof value !== 'object' ||
    value === null ||
    Array.isArray(value)
  ) {
    return false
  }

  const item = value as Record<string, unknown>

  return (
    typeof item.id === 'string' &&
    typeof item.companyName === 'string' &&
    (typeof item.budget === 'number' || item.budget === null) &&
    (item.status === 'new' || item.status === 'qualified') &&
    (item.phone === undefined || typeof item.phone === 'string')
  )
}

// Dữ liệu mô phỏng nhận từ Backend
const rawData: unknown[] = [
  {
    id: 'L001',
    companyName: 'Company A',
    budget: 500,
    status: 'qualified'
  },
  {
    id: 'L002',
    companyName: 'Company B',
    budget: '800', // Sai kiểu, server trả về string
    status: 'new'
  }
]

// Chỉ lấy dữ liệu đáp ứng Lead
const validLeads = rawData.filter(isLead)

console.log('Lead hợp lệ:', validLeads.length)

const lead = findById(validLeads, 'L001')

if (lead) {
  console.log('Công ty:', lead.companyName)
  console.log('Ngân sách:', lead.budget ?? 'Chưa xác định')
} else {
  console.log('Không tìm thấy Lead')
}
