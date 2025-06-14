"use client"

import { useState, useEffect } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"

interface Province {
  id: string
  name: string
}

interface Regency {
  id: string
  name: string
  province_id: string
}

interface District {
  id: string
  name: string
  regency_id: string
}

interface Village {
  id: string
  name: string
  district_id: string
}

interface RegionData {
  provinsi?: string
  provinsiId?: string
  kabupaten?: string
  kabupatenId?: string
  kecamatan?: string
  kecamatanId?: string
  desa?: string
  desaId?: string
}

interface RegionSelectorProps {
  provinsiId?: string
  kabupatenId?: string
  kecamatanId?: string
  desaId?: string
  onProvinsiChange?: (provinsiId: string, provinsiName: string) => void
  onKabupatenChange?: (kabupatenId: string, kabupatenName: string) => void
  onKecamatanChange?: (kecamatanId: string, kecamatanName: string) => void
  onDesaChange?: (desaId: string, desaName: string) => void
  onRegionChange?: (regionData: RegionData) => void
  initialData?: RegionData
  disabled?: boolean
  required?: boolean
  showKecamatan?: boolean
  showDesa?: boolean
}

export function RegionSelector({
  provinsiId: propProvinsiId,
  kabupatenId: propKabupatenId,
  kecamatanId: propKecamatanId,
  desaId: propDesaId,
  onProvinsiChange,
  onKabupatenChange,
  onKecamatanChange,
  onDesaChange,
  onRegionChange,
  initialData,
  disabled = false,
  required = false,
  showKecamatan = false,
  showDesa = false
}: RegionSelectorProps) {
  // Use initialData if provided, otherwise use individual props
  const provinsiId = initialData?.provinsiId || propProvinsiId
  const kabupatenId = initialData?.kabupatenId || propKabupatenId
  const kecamatanId = initialData?.kecamatanId || propKecamatanId
  const desaId = initialData?.desaId || propDesaId
  const [provinces, setProvinces] = useState<Province[]>([])
  const [regencies, setRegencies] = useState<Regency[]>([])
  const [districts, setDistricts] = useState<District[]>([])
  const [villages, setVillages] = useState<Village[]>([])
  const [loadingProvinces, setLoadingProvinces] = useState(true)
  const [loadingRegencies, setLoadingRegencies] = useState(false)
  const [loadingDistricts, setLoadingDistricts] = useState(false)
  const [loadingVillages, setLoadingVillages] = useState(false)

  // Fetch provinces on component mount
  useEffect(() => {
    const fetchProvinces = async () => {
      try {
        setLoadingProvinces(true)
        const response = await fetch('https://www.emsifa.com/api-wilayah-indonesia/api/provinces.json')
        if (response.ok) {
          const data = await response.json()
          setProvinces(data)
        }
      } catch (error) {
        console.error('Error fetching provinces:', error)
      } finally {
        setLoadingProvinces(false)
      }
    }

    fetchProvinces()
  }, [])

  // Fetch regencies when province changes
  useEffect(() => {
    if (provinsiId) {
      const fetchRegencies = async () => {
        try {
          setLoadingRegencies(true)
          setRegencies([]) // Clear previous regencies immediately
          const response = await fetch(`https://www.emsifa.com/api-wilayah-indonesia/api/regencies/${provinsiId}.json`)
          if (response.ok) {
            const data = await response.json()
            setRegencies(data)
          } else {
            console.error('Failed to fetch regencies:', response.status)
            setRegencies([])
          }
        } catch (error) {
          console.error('Error fetching regencies:', error)
          setRegencies([])
        } finally {
          setLoadingRegencies(false)
        }
      }

      fetchRegencies()
    } else {
      setRegencies([])
      setDistricts([])
      setVillages([])
      setLoadingRegencies(false)
    }
  }, [provinsiId])

  // Fetch districts when regency changes
  useEffect(() => {
    if (kabupatenId && showKecamatan) {
      const fetchDistricts = async () => {
        try {
          setLoadingDistricts(true)
          setDistricts([]) // Clear previous districts immediately
          const response = await fetch(`https://www.emsifa.com/api-wilayah-indonesia/api/districts/${kabupatenId}.json`)
          if (response.ok) {
            const data = await response.json()
            setDistricts(data)
          } else {
            console.error('Failed to fetch districts:', response.status)
            setDistricts([])
          }
        } catch (error) {
          console.error('Error fetching districts:', error)
          setDistricts([])
        } finally {
          setLoadingDistricts(false)
        }
      }

      fetchDistricts()
    } else {
      setDistricts([])
      setVillages([])
      setLoadingDistricts(false)
    }
  }, [kabupatenId, showKecamatan])

  // Fetch villages when district changes
  useEffect(() => {
    if (kecamatanId && showDesa) {
      const fetchVillages = async () => {
        try {
          setLoadingVillages(true)
          setVillages([]) // Clear previous villages immediately
          const response = await fetch(`https://www.emsifa.com/api-wilayah-indonesia/api/villages/${kecamatanId}.json`)
          if (response.ok) {
            const data = await response.json()
            setVillages(data)
          } else {
            console.error('Failed to fetch villages:', response.status)
            setVillages([])
          }
        } catch (error) {
          console.error('Error fetching villages:', error)
          setVillages([])
        } finally {
          setLoadingVillages(false)
        }
      }

      fetchVillages()
    } else {
      setVillages([])
      setLoadingVillages(false)
    }
  }, [kecamatanId, showDesa])

  const handleProvinceChange = (value: string) => {
    console.log('Province changed:', value)
    const selectedProvince = provinces.find(p => p.id === value)
    if (selectedProvince) {
      console.log('Selected province:', selectedProvince)
      // Reset all dependent selections
      const regionData = {
        provinsi: selectedProvince.name,
        provinsiId: selectedProvince.id,
        kabupaten: '',
        kabupatenId: '',
        kecamatan: '',
        kecamatanId: '',
        desa: '',
        desaId: ''
      }
      
      // Use onRegionChange if available, otherwise use individual callbacks
      if (onRegionChange) {
        onRegionChange(regionData)
      } else {
        // Only call individual callbacks if onRegionChange is not available
        if (onProvinsiChange) onProvinsiChange(selectedProvince.id, selectedProvince.name)
        if (onKabupatenChange) onKabupatenChange('', '')
        if (onKecamatanChange) onKecamatanChange('', '')
        if (onDesaChange) onDesaChange('', '')
      }
    }
  }

  const handleRegencyChange = (value: string) => {
    console.log('Regency changed:', value)
    const selectedRegency = regencies.find(r => r.id === value)
    if (selectedRegency) {
      console.log('Selected regency:', selectedRegency)
      // Reset dependent selections
      const selectedProvince = provinces.find(p => p.id === selectedRegency.province_id)
      const provinceName = selectedProvince ? selectedProvince.name : ''
      
      const regionData = {
        provinsi: provinceName,
        provinsiId: selectedRegency.province_id,
        kabupaten: selectedRegency.name,
        kabupatenId: selectedRegency.id,
        kecamatan: '',
        kecamatanId: '',
        desa: '',
        desaId: ''
      }
      
      // Use onRegionChange if available, otherwise use individual callbacks
      if (onRegionChange) {
        onRegionChange(regionData)
      } else {
        // Only call individual callbacks if onRegionChange is not available
        if (onKabupatenChange) onKabupatenChange(selectedRegency.id, selectedRegency.name)
        if (onKecamatanChange) onKecamatanChange('', '')
        if (onDesaChange) onDesaChange('', '')
      }
    }
  }

  const handleDistrictChange = (value: string) => {
    console.log('District changed:', value)
    const selectedDistrict = districts.find(d => d.id === value)
    if (selectedDistrict) {
      console.log('Selected district:', selectedDistrict)
      // Reset dependent selections
      const selectedRegency = regencies.find(r => r.id === selectedDistrict.regency_id)
      const selectedProvince = selectedRegency ? provinces.find(p => p.id === selectedRegency.province_id) : null
      
      const regionData = {
        provinsi: selectedProvince ? selectedProvince.name : '',
        provinsiId: selectedProvince ? selectedProvince.id : '',
        kabupaten: selectedRegency ? selectedRegency.name : '',
        kabupatenId: selectedRegency ? selectedRegency.id : '',
        kecamatan: selectedDistrict.name,
        kecamatanId: selectedDistrict.id,
        desa: '',
        desaId: ''
      }
      
      // Use onRegionChange if available, otherwise use individual callbacks
      if (onRegionChange) {
        onRegionChange(regionData)
      } else {
        // Only call individual callbacks if onRegionChange is not available
        if (onKecamatanChange) onKecamatanChange(selectedDistrict.id, selectedDistrict.name)
        if (onDesaChange) onDesaChange('', '')
      }
    }
  }

  const handleVillageChange = (value: string) => {
    console.log('Village changed:', value)
    const selectedVillage = villages.find(v => v.id === value)
    if (selectedVillage) {
      console.log('Selected village:', selectedVillage)
      
      const selectedDistrict = districts.find(d => d.id === selectedVillage.district_id)
      const selectedRegency = selectedDistrict ? regencies.find(r => r.id === selectedDistrict.regency_id) : null
      const selectedProvince = selectedRegency ? provinces.find(p => p.id === selectedRegency.province_id) : null
      
      const regionData = {
        provinsi: selectedProvince ? selectedProvince.name : '',
        provinsiId: selectedProvince ? selectedProvince.id : '',
        kabupaten: selectedRegency ? selectedRegency.name : '',
        kabupatenId: selectedRegency ? selectedRegency.id : '',
        kecamatan: selectedDistrict ? selectedDistrict.name : '',
        kecamatanId: selectedDistrict ? selectedDistrict.id : '',
        desa: selectedVillage.name,
        desaId: selectedVillage.id
      }
      
      // Use onRegionChange if available, otherwise use individual callbacks
      if (onRegionChange) {
        onRegionChange(regionData)
      } else {
        // Only call individual callbacks if onRegionChange is not available
        if (onDesaChange) onDesaChange(selectedVillage.id, selectedVillage.name)
      }
    }
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="provinsi">
          Provinsi {required && <span className="text-red-500">*</span>}
        </Label>
        <Select
          value={provinsiId || ""}
          onValueChange={handleProvinceChange}
          disabled={disabled || loadingProvinces}
        >
          <SelectTrigger>
            <SelectValue placeholder={loadingProvinces ? "Memuat provinsi..." : "Pilih Provinsi"} />
          </SelectTrigger>
          <SelectContent>
            {loadingProvinces ? (
              <SelectItem value="loading" disabled>
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Memuat provinsi...
                </div>
              </SelectItem>
            ) : (
              provinces.map((province) => (
                <SelectItem key={province.id} value={province.id}>
                  {province.name}
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="kabupaten">
          Kabupaten/Kota {required && <span className="text-red-500">*</span>}
        </Label>
        <Select
          value={kabupatenId || ""}
          onValueChange={handleRegencyChange}
          disabled={disabled || !provinsiId || loadingRegencies}
        >
          <SelectTrigger>
            <SelectValue 
              placeholder={
                !provinsiId 
                  ? "Pilih provinsi terlebih dahulu" 
                  : loadingRegencies 
                  ? "Memuat kabupaten..." 
                  : "Pilih Kabupaten/Kota"
              } 
            />
          </SelectTrigger>
          <SelectContent>
            {loadingRegencies ? (
              <SelectItem value="loading" disabled>
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Memuat kabupaten...
                </div>
              </SelectItem>
            ) : (
              regencies.map((regency) => (
                <SelectItem key={regency.id} value={regency.id}>
                  {regency.name}
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
      </div>

      {showKecamatan && (
        <div className="space-y-2">
          <Label htmlFor="kecamatan">
            Kecamatan {required && <span className="text-red-500">*</span>}
          </Label>
          <Select
            value={kecamatanId || ""}
            onValueChange={handleDistrictChange}
            disabled={disabled || !kabupatenId || loadingDistricts}
          >
            <SelectTrigger>
              <SelectValue 
                placeholder={
                  !kabupatenId 
                    ? "Pilih kabupaten terlebih dahulu" 
                    : loadingDistricts 
                    ? "Memuat kecamatan..." 
                    : "Pilih Kecamatan"
                } 
              />
            </SelectTrigger>
            <SelectContent>
              {loadingDistricts ? (
                <SelectItem value="loading" disabled>
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Memuat kecamatan...
                  </div>
                </SelectItem>
              ) : (
                districts.map((district) => (
                  <SelectItem key={district.id} value={district.id}>
                    {district.name}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>
      )}

      {showDesa && (
        <div className="space-y-2">
          <Label htmlFor="desa">
            Desa/Kelurahan {required && <span className="text-red-500">*</span>}
          </Label>
          <Select
            value={desaId || ""}
            onValueChange={handleVillageChange}
            disabled={disabled || !kecamatanId || loadingVillages}
          >
            <SelectTrigger>
              <SelectValue 
                placeholder={
                  !kecamatanId 
                    ? "Pilih kecamatan terlebih dahulu" 
                    : loadingVillages 
                    ? "Memuat desa/kelurahan..." 
                    : "Pilih Desa/Kelurahan"
                } 
              />
            </SelectTrigger>
            <SelectContent>
              {loadingVillages ? (
                <SelectItem value="loading" disabled>
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Memuat desa/kelurahan...
                  </div>
                </SelectItem>
              ) : (
                villages.map((village) => (
                  <SelectItem key={village.id} value={village.id}>
                    {village.name}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  )
}