
interface Lead {
  id: string
  companyName: string
  status: 'new' | 'qualified'
}

const mockLeads: Lead[] = [
  { id: 'L001', companyName: 'Company A', status: 'new' },
  { id: 'L002', companyName: 'Company B', status: 'qualified' },
  { id: 'L003', companyName: 'Company C', status: 'qualified' }
]

// Mô phỏng API mất 1 giây để phản hồi
function fetchLeadsMock(shouldFail = false): Promise<Lead[]> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (shouldFail) {
        reject(new Error('Server error'))
        return
      }

      resolve([...mockLeads])
    }, 1000)
  })
}

// Gọi API và xử lý kết quả
async function loadLeads(): Promise<void> {
  console.log('Đang tải dữ liệu...')

  try {
    const leads = await fetchLeadsMock()

    console.log('API thành công')
    console.log('Tổng Lead:', leads.length)

    const qualified = leads.filter(
      lead => lead.status === 'qualified'
    )

    console.log('Lead đủ điều kiện:', qualified.length)
  } catch (error) {
    console.error('API thất bại:', error)
  } finally {
    console.log('Kết thúc loading')
  }
}

const leads = await fetchLeadsMock(true)
