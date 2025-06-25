'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useToast } from '@/components/ui/use-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Checkbox } from '@/components/ui/checkbox'
import { ArrowLeft, Send } from 'lucide-react'

interface Event {
  id: string
  title: string
}

interface EventFormField {
  id: string
  label: string
  type: 'TEXT' | 'TEXTAREA' | 'SELECT' | 'CHECKBOX' | 'RADIO' | 'EMAIL' | 'PHONE' | 'NUMBER' | 'DATE'
  required: boolean
  options: string[] | null
}

interface EventRegistrationFormProps {
  event: Event
  fields: EventFormField[]
  onBack: () => void
  onSuccess: () => void
}

export default function EventRegistrationForm({ event, fields, onBack, onSuccess }: EventRegistrationFormProps) {
  const [formData, setFormData] = useState<{ [key: string]: any }>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  const { toast } = useToast()

  const handleInputChange = (fieldId: string, value: any) => {
    setFormData(prev => ({ ...prev, [fieldId]: value }))
    if (errors[fieldId]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[fieldId]
        return newErrors
      })
    }
  }

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {}
    fields.forEach(field => {
      if (field.required && !formData[field.id]) {
        newErrors[field.id] = `${field.label} wajib diisi.`
      }
    })
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) {
      toast({
        title: 'Form Tidak Lengkap',
        description: 'Mohon isi semua field yang wajib diisi.',
        variant: 'destructive',
      })
      return
    }

    setIsSubmitting(true)
    try {
      const answers = Object.entries(formData).map(([fieldId, value]) => ({
        formFieldId: fieldId,
        value: Array.isArray(value) ? JSON.stringify(value) : String(value),
      }))

      const response = await fetch(`/api/events/${event.id}/registrations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('alumni_token')}`,
        },
        body: JSON.stringify({ answers }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Gagal mendaftar event.')
      }

      toast({
        title: 'Pendaftaran Berhasil!',
        description: `Anda berhasil mendaftar untuk event "${event.title}".`,
        className: 'bg-green-600 text-white',
      })
      onSuccess()
    } catch (error: any) {
      toast({
        title: 'Terjadi Kesalahan',
        description: error.message,
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderField = (field: EventFormField) => {
    const error = errors[field.id]
    const baseInputClass = error ? 'border-red-500' : ''

    const hasInvalidOptions = ['SELECT', 'RADIO', 'CHECKBOX'].includes(field.type) && (!Array.isArray(field.options) || field.options.length === 0)
    
    if (hasInvalidOptions) {
      return <p className="text-sm text-red-500">Pilihan untuk field ini tidak tersedia.</p>;
    }

    switch (field.type) {
      case 'TEXT':
      case 'EMAIL':
      case 'PHONE':
      case 'NUMBER':
      case 'DATE':
        return (
          <Input
            type={{
              TEXT: 'text', EMAIL: 'email', PHONE: 'tel',
              NUMBER: 'number', DATE: 'date'
            }[field.type]}
            value={formData[field.id] || ''}
            onChange={e => handleInputChange(field.id, e.target.value)}
            className={baseInputClass}
          />
        )
      case 'TEXTAREA':
        return (
          <Textarea
            value={formData[field.id] || ''}
            onChange={e => handleInputChange(field.id, e.target.value)}
            className={baseInputClass}
          />
        )
      case 'SELECT':
        return (
          <Select onValueChange={value => handleInputChange(field.id, value)} value={formData[field.id]}>
            <SelectTrigger className={baseInputClass}>
              <SelectValue placeholder={`Pilih ${field.label}...`} />
            </SelectTrigger>
            <SelectContent>
              {field.options!.map((option, index) => (
                <SelectItem key={`${field.id}-${index}`} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )
      case 'RADIO':
        return (
          <RadioGroup
            onValueChange={value => handleInputChange(field.id, value)}
            value={formData[field.id]}
            className="space-y-2"
          >
            {field.options!.map((option, index) => {
              const optionId = `${field.id}-option-${index}`
              return (
                <div key={optionId} className="flex items-center space-x-2">
                  <RadioGroupItem value={option} id={optionId} />
                  <Label htmlFor={optionId}>{option}</Label>
                </div>
              )
            })}
          </RadioGroup>
        )
      case 'CHECKBOX':
        return (
          <div className="space-y-2">
            {field.options!.map((option, index) => {
              const optionId = `${field.id}-option-${index}`
              return (
                <div key={optionId} className="flex items-center space-x-2">
                  <Checkbox
                    id={optionId}
                    checked={formData[field.id]?.includes(option)}
                    onCheckedChange={checked => {
                      const currentValues = formData[field.id] || []
                      const newValues = checked
                        ? [...currentValues, option]
                        : currentValues.filter((v: string) => v !== option)
                      handleInputChange(field.id, newValues)
                    }}
                  />
                  <Label htmlFor={optionId}>{option}</Label>
                </div>
              )
            })}
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className="p-4 pt-0">
      <div className="flex items-center gap-4 mb-4">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h3 className="text-xl font-bold text-gray-900">Form Pendaftaran</h3>
          <p className="text-sm text-gray-500">{event.title}</p>
        </div>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        {fields.map((field) => (
          <div key={field.id} className="space-y-2">
            <Label>
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </Label>
            {renderField(field)}
            {errors[field.id] && <p className="text-sm text-red-500 mt-1">{errors[field.id]}</p>}
          </div>
        ))}
        <div className="flex flex-col gap-3 pt-4 pb-6">
          <Button type="submit" disabled={isSubmitting} className="w-full bg-green-600 hover:bg-green-700 py-3">
            {isSubmitting ? 'Mengirim...' : 'Kirim Pendaftaran'}
          </Button>
        </div>
      </form>
    </div>
  )
} 