import { ContractDetailResponse } from '../types';

/**
 * Mock data cho chi tiết hợp đồng
 */
export const contractDetailMock: ContractDetailResponse = {
  status: 'success',
  code: 200,
  data: {
    contract: {
      id: 1,
      contractCode: 'HD-2025-001',
      name: 'Phát triển hệ thống quản lý nhân sự ABC',
      customerName: 'Công ty TNHH ABC',
      contractType: 'FixedPrice',
      amount: 500000000,
      signDate: '2025-01-15',
      startDate: '2025-02-01',
      endDate: '2025-08-31',
      status: 'Active',
      salesPerson: {
        id: 5,
        name: 'Nguyễn Văn Sales'
      },
      relatedOpportunity: {
        id: 12,
        code: 'OPP-2024-056',
        name: 'Dự án phát triển phần mềm ABC'
      },
      description: 'Hợp đồng phát triển hệ thống quản lý nhân sự toàn diện cho công ty ABC, bao gồm các module quản lý nhân sự, chấm công, tính lương và đánh giá hiệu suất.',
      paymentTerms: [
        {
          id: 101,
          termNumber: 1,
          dueDate: '2025-02-15',
          amount: 150000000,
          description: 'Đặt cọc khi ký hợp đồng',
          status: 'paid',
          paidDate: '2025-02-14',
          paidAmount: 150000000
        },
        {
          id: 102,
          termNumber: 2,
          dueDate: '2025-04-15',
          amount: 150000000,
          description: 'Hoàn thành giai đoạn 1 - Phân tích yêu cầu và thiết kế',
          status: 'paid',
          paidDate: '2025-04-20',
          paidAmount: 150000000
        },
        {
          id: 103,
          termNumber: 3,
          dueDate: '2025-06-15',
          amount: 100000000,
          description: 'Hoàn thành giai đoạn 2 - Phát triển module nhân sự và chấm công',
          status: 'unpaid',
          paidDate: null,
          paidAmount: 0
        },
        {
          id: 104,
          termNumber: 4,
          dueDate: '2025-08-31',
          amount: 100000000,
          description: 'Nghiệm thu và bàn giao sản phẩm',
          status: 'unpaid',
          paidDate: null,
          paidAmount: 0
        }
      ],
      employeeAssignments: [
        {
          id: 201,
          employee: {
            id: 10,
            name: 'Trần Văn A',
            position: 'Senior Developer',
            team: {
              id: 3,
              name: 'Team Java'
            }
          },
          startDate: '2025-02-01',
          endDate: '2025-08-31',
          allocationPercentage: 100,
          billRate: 30000000
        },
        {
          id: 202,
          employee: {
            id: 11,
            name: 'Nguyễn Thị B',
            position: 'Business Analyst',
            team: {
              id: 2,
              name: 'Team BA'
            }
          },
          startDate: '2025-02-01',
          endDate: '2025-04-30',
          allocationPercentage: 70,
          billRate: 25000000
        },
        {
          id: 203,
          employee: {
            id: 15,
            name: 'Lê Văn C',
            position: 'Frontend Developer',
            team: {
              id: 4,
              name: 'Team Frontend'
            }
          },
          startDate: '2025-03-15',
          endDate: '2025-07-31',
          allocationPercentage: 80,
          billRate: 20000000
        },
        {
          id: 204,
          employee: {
            id: 18,
            name: 'Phạm Thị D',
            position: 'QA Engineer',
            team: {
              id: 5,
              name: 'Team QA'
            }
          },
          startDate: '2025-04-15',
          endDate: '2025-08-31',
          allocationPercentage: 50,
          billRate: 18000000
        }
      ],
      files: [
        {
          id: 301,
          name: 'Hợp đồng ABC - đã ký.pdf',
          type: 'application/pdf',
          size: 3500000,
          uploadedAt: '2025-01-16T10:30:00Z',
          uploadedBy: {
            id: 5,
            name: 'Nguyễn Văn Sales'
          },
          url: 'https://example.com/files/contract-abc-signed.pdf'
        },
        {
          id: 302,
          name: 'Phụ lục 1 - Đặc tả kỹ thuật.docx',
          type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          size: 2100000,
          uploadedAt: '2025-01-16T10:35:00Z',
          uploadedBy: {
            id: 5,
            name: 'Nguyễn Văn Sales'
          },
          url: 'https://example.com/files/annex1-technical-specs.docx'
        },
        {
          id: 303,
          name: 'Timeline dự án.xlsx',
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          size: 1800000,
          uploadedAt: '2025-02-05T08:15:00Z',
          uploadedBy: {
            id: 11,
            name: 'Nguyễn Thị B'
          },
          url: 'https://example.com/files/project-timeline.xlsx'
        }
      ],
      paymentStatus: {
        status: 'partial',
        paidAmount: 300000000,
        totalAmount: 500000000,
        paidPercentage: 60,
        nextDueDate: '2025-06-15',
        nextDueAmount: 100000000,
        totalTerms: 4,
        paidTerms: 2,
        remainingAmount: 200000000
      },
      tags: ['Phát triển phần mềm', 'Nhân sự', 'Java', 'React'],
      createdBy: {
        id: 5,
        name: 'Nguyễn Văn Sales'
      },
      createdAt: '2025-01-15T08:00:00Z',
      updatedBy: {
        id: 2,
        name: 'Trần Văn Manager'
      },
      updatedAt: '2025-04-21T14:30:00Z'
    }
  }
}; 