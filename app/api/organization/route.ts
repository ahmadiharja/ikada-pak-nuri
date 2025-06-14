import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET - Fetch all organization members
export async function GET() {
  try {
    const members = await prisma.organizationMember.findMany({
      orderBy: [
        { level: 'asc' },
        { department: 'asc' },
        { position: 'asc' }
      ]
    })
    
    return NextResponse.json(members)
  } catch (error) {
    console.error('Error fetching organization members:', error)
    return NextResponse.json(
      { error: 'Failed to fetch organization members' },
      { status: 500 }
    )
  }
}

// POST - Create new organization member
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      name,
      position,
      department,
      level,
      parentId,
      city,
      photo,
      description,
      email,
      phone,
      isActive
    } = body

    // Validate required fields
    if (!name || !position || !department) {
      return NextResponse.json(
        { error: 'Name, position, and department are required' },
        { status: 400 }
      )
    }

    const member = await prisma.organizationMember.create({
      data: {
        name,
        position,
        department,
        level: level || 1,
        parentId: parentId || null,
        city: city || null,
        photo: photo || null,
        description: description || null,
        email: email || null,
        phone: phone || null,
        isActive: isActive !== undefined ? isActive : true
      }
    })

    return NextResponse.json(member, { status: 201 })
  } catch (error) {
    console.error('Error creating organization member:', error)
    return NextResponse.json(
      { error: 'Failed to create organization member' },
      { status: 500 }
    )
  }
}