import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAlumniToken } from '@/lib/alumni-auth'

// POST - Create registration
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 1. Verifikasi token alumni
    const authResult = await verifyAlumniToken(request);
    if (authResult.error || !authResult.alumni) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }
    const { alumni } = authResult;
    const eventId = params.id;
    
    const body = await request.json()
    const { answers } = body

    // 2. Check jika event ada dan bisa didaftari
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: { formFields: true, _count: { select: { registrations: true } } }
    })

    if (!event) {
      return NextResponse.json({ error: 'Event tidak ditemukan' }, { status: 404 })
    }
    if (event.status !== 'PUBLISHED') {
      return NextResponse.json({ error: 'Event belum dipublikasikan' }, { status: 400 })
    }
    if (event.maxParticipants && event._count.registrations >= event.maxParticipants) {
      return NextResponse.json({ error: 'Event sudah penuh' }, { status: 400 })
    }

    // 3. Check jika alumni sudah terdaftar
    const existingRegistration = await prisma.eventRegistration.findUnique({
      where: { eventId_alumniId: { eventId, alumniId: alumni.id } }
    })
    if (existingRegistration) {
      return NextResponse.json({ error: 'Anda sudah terdaftar untuk event ini' }, { status: 400 })
    }

    // 4. Validasi field yang wajib diisi
    const requiredFields = event.formFields.filter(field => field.required)
    for (const field of requiredFields) {
      const answer = answers.find((a: any) => a.formFieldId === field.id)
      if (!answer || !answer.value || answer.value.trim() === '') {
        return NextResponse.json({ error: `Field ${field.label} wajib diisi` }, { status: 400 })
      }
    }

    // 5. Buat registrasi dan jawabannya
    const registration = await prisma.eventRegistration.create({
      data: {
        eventId: eventId,
        alumniId: alumni.id,
        answers: {
          create: answers.map((a: any) => ({
            fieldId: a.formFieldId,
            value: a.value
          }))
        }
      },
      include: {
        alumni: { select: { id: true, fullName: true, email: true, phone: true } },
        answers: { include: { field: { select: { label: true, type: true } } } }
      }
    })

    return NextResponse.json(registration)
  } catch (error) {
    console.error('Error creating registration:', error)
    return NextResponse.json({ error: 'Gagal mendaftar event' }, { status: 500 })
  }
}