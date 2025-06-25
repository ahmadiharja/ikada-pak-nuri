import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const querySchema = z.object({
  programId: z.string().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  type: z.enum(['wajib', 'sukarela', 'program']).optional(),
  export: z.string().optional()
})

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user has admin role
    const isAdmin = session.user.role === 'admin' || session.user.role === 'super_admin'
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Tidak memiliki izin untuk mengakses laporan' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const query = querySchema.parse({
      programId: searchParams.get('programId') || undefined,
      dateFrom: searchParams.get('dateFrom') || undefined,
      dateTo: searchParams.get('dateTo') || undefined,
      type: searchParams.get('type') as any || undefined,
      export: searchParams.get('export') || undefined
    })

    const where: any = {
      status: 'approved' // Only include approved transactions in reports
    }

    if (query.programId) {
      where.programId = query.programId
    }

    if (query.type) {
      where.program = {
        type: query.type
      }
    }

    if (query.dateFrom || query.dateTo) {
      where.createdAt = {}
      if (query.dateFrom) {
        where.createdAt.gte = new Date(query.dateFrom)
      }
      if (query.dateTo) {
        where.createdAt.lte = new Date(query.dateTo + 'T23:59:59.999Z')
      }
    }

    if (query.export === 'true') {
      // Export functionality would go here
      // For now, return a simple response
      return NextResponse.json({ message: 'Export functionality not implemented yet' })
    }

    // Get dashboard stats
    const [totalStats, statusStats, donorCount] = await Promise.all([
      prisma.donationTransaction.aggregate({
        where,
        _sum: { amount: true },
        _count: { id: true }
      }),
      prisma.donationTransaction.groupBy({
        by: ['status'],
        _count: { id: true },
        where: query.programId || query.type ? {
          ...where,
          status: undefined // Remove status filter for this query
        } : {}
      }),
      prisma.donationTransaction.findMany({
        where,
        select: { alumniId: true },
        distinct: ['alumniId']
      })
    ])

    // Calculate monthly growth
    const currentMonth = new Date()
    const lastMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1)
    const currentMonthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1)
    
    const [currentMonthStats, lastMonthStats] = await Promise.all([
      prisma.donationTransaction.aggregate({
        where: {
          ...where,
          createdAt: {
            gte: currentMonthStart
          }
        },
        _sum: { amount: true }
      }),
      prisma.donationTransaction.aggregate({
        where: {
          ...where,
          createdAt: {
            gte: lastMonth,
            lt: currentMonthStart
          }
        },
        _sum: { amount: true }
      })
    ])

    const currentAmount = currentMonthStats._sum.amount || 0
    const lastAmount = lastMonthStats._sum.amount || 0
    const monthlyGrowth = lastAmount > 0 ? ((currentAmount - lastAmount) / lastAmount) * 100 : 0

    const stats = {
      totalDonations: totalStats._count.id,
      totalAmount: totalStats._sum.amount || 0,
      totalDonors: donorCount.length,
      pendingTransactions: statusStats.find(s => s.status === 'pending')?._count.id || 0,
      approvedTransactions: statusStats.find(s => s.status === 'approved')?._count.id || 0,
      rejectedTransactions: statusStats.find(s => s.status === 'rejected')?._count.id || 0,
      monthlyGrowth
    }

    // Get program stats
    const programStats = await prisma.donationProgram.findMany({
      where: query.programId ? { id: query.programId } : {},
      include: {
        _count: {
          select: {
            transactions: {
              where: {
                status: 'approved',
                ...(query.dateFrom || query.dateTo ? {
                  createdAt: where.createdAt
                } : {})
              }
            }
          }
        },
        transactions: {
          where: {
            status: 'approved',
            ...(query.dateFrom || query.dateTo ? {
              createdAt: where.createdAt
            } : {})
          },
          select: {
            amount: true,
            alumniId: true
          }
        }
      }
    })

    const programStatsFormatted = programStats.map(program => {
      const currentAmount = program.transactions.reduce((sum, t) => sum + t.amount, 0)
      const donorCount = new Set(program.transactions.map(t => t.alumniId)).size
      const completionPercentage = program.targetAmount 
        ? (currentAmount / program.targetAmount) * 100 
        : 0

      return {
        id: program.id,
        title: program.title,
        type: program.type,
        targetAmount: program.targetAmount,
        currentAmount,
        donorCount,
        transactionCount: program._count.transactions,
        completionPercentage
      }
    })

    // Get monthly data for the last 12 months
    const monthlyData = []
    for (let i = 11; i >= 0; i--) {
      const date = new Date()
      date.setMonth(date.getMonth() - i)
      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1)
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59)

      const monthStats = await prisma.donationTransaction.aggregate({
        where: {
          ...where,
          createdAt: {
            gte: monthStart,
            lte: monthEnd
          }
        },
        _sum: { amount: true },
        _count: { id: true }
      })

      monthlyData.push({
        month: date.toLocaleDateString('id-ID', { month: 'short', year: 'numeric' }),
        amount: monthStats._sum.amount || 0,
        transactions: monthStats._count.id
      })
    }

    // Get type distribution
    const typeDistribution = await prisma.donationProgram.groupBy({
      by: ['type'],
      _sum: {
        transactions: {
          where: {
            status: 'approved',
            ...(query.dateFrom || query.dateTo ? {
              createdAt: where.createdAt
            } : {})
          }
        }
      },
      _count: {
        transactions: {
          where: {
            status: 'approved',
            ...(query.dateFrom || query.dateTo ? {
              createdAt: where.createdAt
            } : {})
          }
        }
      }
    })

    // Since Prisma doesn't support nested aggregations in groupBy,
    // we need to calculate type distribution manually
    const typeStats = await Promise.all([
      prisma.donationTransaction.aggregate({
        where: {
          ...where,
          program: { type: 'wajib' }
        },
        _sum: { amount: true },
        _count: { id: true }
      }),
      prisma.donationTransaction.aggregate({
        where: {
          ...where,
          program: { type: 'sukarela' }
        },
        _sum: { amount: true },
        _count: { id: true }
      }),
      prisma.donationTransaction.aggregate({
        where: {
          ...where,
          program: { type: 'program' }
        },
        _sum: { amount: true },
        _count: { id: true }
      })
    ])

    const totalTypeAmount = typeStats.reduce((sum, stat) => sum + (stat._sum.amount || 0), 0)
    const typeDistributionFormatted = [
      {
        type: 'Wajib',
        amount: typeStats[0]._sum.amount || 0,
        count: typeStats[0]._count.id,
        percentage: totalTypeAmount > 0 ? ((typeStats[0]._sum.amount || 0) / totalTypeAmount) * 100 : 0
      },
      {
        type: 'Sukarela',
        amount: typeStats[1]._sum.amount || 0,
        count: typeStats[1]._count.id,
        percentage: totalTypeAmount > 0 ? ((typeStats[1]._sum.amount || 0) / totalTypeAmount) * 100 : 0
      },
      {
        type: 'Kampanye',
        amount: typeStats[2]._sum.amount || 0,
        count: typeStats[2]._count.id,
        percentage: totalTypeAmount > 0 ? ((typeStats[2]._sum.amount || 0) / totalTypeAmount) * 100 : 0
      }
    ].filter(item => item.amount > 0)

    return NextResponse.json({
      stats,
      programStats: programStatsFormatted,
      monthlyData,
      typeDistribution: typeDistributionFormatted
    })
  } catch (error) {
    console.error('Error fetching donation reports:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: error.errors },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}