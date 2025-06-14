import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET - Fetch single organization member
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const member = await prisma.organizationMember.findUnique({
      where: { id: params.id }
    })

    if (!member) {
      return NextResponse.json(
        { error: 'Organization member not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(member)
  } catch (error) {
    console.error('Error fetching organization member:', error)
    return NextResponse.json(
      { error: 'Failed to fetch organization member' },
      { status: 500 }
    )
  }
}

// PUT - Update organization member
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Check if member exists
    const existingMember = await prisma.organizationMember.findUnique({
      where: { id: params.id }
    })

    if (!existingMember) {
      return NextResponse.json(
        { error: 'Organization member not found' },
        { status: 404 }
      )
    }

    // Validate required fields
    if (!name || !position || !department) {
      return NextResponse.json(
        { error: 'Name, position, and department are required' },
        { status: 400 }
      )
    }

    const updatedMember = await prisma.organizationMember.update({
      where: { id: params.id },
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

    return NextResponse.json(updatedMember)
  } catch (error) {
    console.error('Error updating organization member:', error)
    return NextResponse.json(
      { error: 'Failed to update organization member' },
      { status: 500 }
    )
  }
}

// DELETE - Delete organization member
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check if member exists
    const existingMember = await prisma.organizationMember.findUnique({
      where: { id: params.id }
    })

    if (!existingMember) {
      return NextResponse.json(
        { error: 'Organization member not found' },
        { status: 404 }
      )
    }

    await prisma.organizationMember.delete({
      where: { id: params.id }
    })

    return NextResponse.json(
      { message: 'Organization member deleted successfully' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error deleting organization member:', error)
    return NextResponse.json(
      { error: 'Failed to delete organization member' },
      { status: 500 }
    )
  }
}