export {}

type LeadStatus = 'new' | 'contacted' | 'qualified'

interface Lead {
  id: string
  companyName: string
  status: LeadStatus
  budget: number | null
}

const mockData: unknown = [
  { id: 'L001', companyName: 'Orion', status: 'new', budget: 500 },
  { id: 'L002', companyName: 'Lotus', status: 'qualified', budget: 800 },
  { id: 'L003', companyName: 'Meadow', status: 'qualified', budget: 300 },
  { id: 'L004', companyName: 'Sea', status: 'contacted', budget: null },
  { id: 'L005', companyName: 'Nova', status: 'new', budget: 1000 },
  { id: 'L006', companyName: 'Invalid', status: 'qualified', budget: '900' }
]

// Interface chỉ kiểm tra lúc compile, khác với decode dữ liệu runtime trong Swift.
// Type guard giúp TypeScript thu hẹp unknown thành Lead sau khi kiểm tra thực tế.
function isLead(value: unknown): value is Lead {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return false
  }

  return (
    'id' in value && typeof value.id === 'string' &&
    'companyName' in value && typeof value.companyName === 'string' &&
    'status' in value &&
    (value.status === 'new' || value.status === 'contacted' || value.status === 'qualified') &&
    'budget' in value &&
    (value.budget === null ||
      (typeof value.budget === 'number' && Number.isFinite(value.budget) && value.budget >= 0))
  )
}

function validateLeads(data: unknown): { leads: Lead[]; rejectedCount: number } {
  if (!Array.isArray(data)) {
    throw new Error('API response must be an array')
  }

  const leads: Lead[] = []
  let rejectedCount = 0

  // Giữ từng phần tử là unknown dù Array.isArray đã kiểm tra mảng bên ngoài.
  for (const item of data) {
    const value: unknown = item
    if (isLead(value)) {
      leads.push(value)
    } else {
      rejectedCount += 1
    }
  }

  return { leads, rejectedCount }
}

function filterByStatus(leads: readonly Lead[], status: LeadStatus): Lead[] {
  return leads.filter(lead => lead.status === status)
}

function searchLeads(leads: readonly Lead[], keyword: string): Lead[] {
  const query = keyword.trim().toLowerCase()
  return leads.filter(lead => lead.companyName.toLowerCase().includes(query))
}

function totalBudget(leads: readonly Lead[]): number {
  // ?? giống xử lý giá trị nil: chỉ thay null/undefined bằng 0.
  return leads.reduce((total, lead) => total + (lead.budget ?? 0), 0)
}

function findById(leads: readonly Lead[], id: string): Lead | undefined {
  return leads.find(lead => lead.id === id)
}

function sortByBudgetDescending(leads: readonly Lead[]): Lead[] {
  // sort thay đổi mảng tại chỗ; spread tạo bản sao trước khi sort.
  return [...leads].sort((a, b) => (b.budget ?? 0) - (a.budget ?? 0))
}

function fetchLeadsMock(delayMs: number, shouldFail = false): Promise<unknown> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (shouldFail) {
        reject(new Error('Mock API failed'))
        return
      }

      resolve(mockData)
    }, delayMs)
  })
}

function assert(condition: boolean, message: string): asserts condition {
  if (!condition) {
    throw new Error(`FAIL: ${message}`)
  }
  console.log(`PASS: ${message}`)
}

async function run(): Promise<void> {
  const response: unknown = await fetchLeadsMock(0)
  const { leads, rejectedCount } = validateLeads(response)
  const qualified = filterByStatus(leads, 'qualified')

  assert(leads.length === 5, '5 bản ghi hợp lệ')
  assert(rejectedCount === 1, '1 bản ghi bị loại')
  assert(qualified.length === 2, '2 lead qualified')
  assert(totalBudget(leads) === 2600, 'Tổng budget hợp lệ = 2600')
  assert(totalBudget(qualified) === 1100, 'Tổng budget qualified = 1100')
  const matches = searchLeads(leads, '  LoTuS  ')
  assert(matches.length === 1 && matches[0]?.id === 'L002', 'Search lotus, trim và bỏ qua hoa/thường')
  assert(findById(leads, 'missing') === undefined, 'ID không tồn tại trả undefined')
  assert(findById(leads, 'L001')?.companyName === 'Orion', 'Tìm thấy ID hợp lệ')

  const originalOrder = leads.map(lead => lead.id).join(',')
  const sorted = sortByBudgetDescending(leads)
  assert(sorted !== leads && leads.map(lead => lead.id).join(',') === originalOrder,
    'Sort không đổi mảng gốc')
  assert(sorted.map(lead => lead.id).join(',') === 'L005,L002,L001,L003,L004',
    'Sort budget giảm dần, null = 0')

  const validExample = { id: 'test', companyName: 'Mock', status: 'new' }
  assert([NaN, Infinity, -Infinity, -1, '900', undefined].every(budget => {
    return !isLead({ ...validExample, budget })
  }), 'Loại budget sai kiểu, âm hoặc không hữu hạn')
  assert([0, null].every(budget => isLead({ ...validExample, budget })),
    'Chấp nhận budget 0 và null')

  let errorCaught = false
  let loading = true
  try {
    await fetchLeadsMock(0, true)
  } catch (error: unknown) {
    // JavaScript có thể throw mọi giá trị; kiểm tra Error trước khi đọc message.
    errorCaught = error instanceof Error && error.message === 'Mock API failed'
  } finally {
    loading = false
  }
  assert(errorCaught, 'Mock API lỗi được catch')
  assert(!loading, 'finally kết thúc loading cả khi lỗi')

  let latestRequestId = 0
  let acceptedLeads: Lead[] = []
  const acceptedRequests: string[] = []
  const completionOrder: string[] = []
  let searchLoading = false
  let searchError: string | undefined

  async function requestSearch(name: string, keyword: string, delayMs: number): Promise<void> {
    const requestId = ++latestRequestId
    searchLoading = true
    searchError = undefined
    try {
      const data: unknown = await fetchLeadsMock(delayMs)
      const validated = validateLeads(data)
      completionOrder.push(name)
      // await nhường luồng; request cũ vẫn có thể hoàn tất sau request mới.
      if (requestId !== latestRequestId) {
        return
      }
      acceptedLeads = searchLeads(validated.leads, keyword)
      acceptedRequests.push(name)
    } catch (error: unknown) {
      if (requestId === latestRequestId) {
        searchError = error instanceof Error ? error.message : String(error)
      }
    } finally {
      // Request cũ cũng không được tắt loading của request mới.
      if (requestId === latestRequestId) {
        searchLoading = false
      }
    }
  }

  // Gọi A trước B; cả hai chạy đồng thời vì chưa await từng request.
  const requestA = requestSearch('A', 'Orion', 500)
  const requestB = requestSearch('B', 'Lotus', 100)
  await Promise.all([requestA, requestB])

  assert(completionOrder.join(',') === 'B,A', 'B hoàn tất trước A')
  assert(acceptedRequests.join(',') === 'B' &&
    acceptedLeads.length === 1 && acceptedLeads[0]?.id === 'L002',
  'Race condition: chỉ chấp nhận B, A không ghi đè')
  assert(!searchLoading && searchError === undefined, 'Search kết thúc không lỗi')
  console.log('Tất cả assert đã pass.')
}

await run()
