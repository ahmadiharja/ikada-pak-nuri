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
  // Use internal state for region IDs
  const [selectedProvinsiId, setSelectedProvinsiId] = useState(initialData?.provinsiId || propProvinsiId || '')
  const [selectedKabupatenId, setSelectedKabupatenId] = useState(initialData?.kabupatenId || propKabupatenId || '')
  const [selectedKecamatanId, setSelectedKecamatanId] = useState(initialData?.kecamatanId || propKecamatanId || '')
  const [selectedDesaId, setSelectedDesaId] = useState(initialData?.desaId || propDesaId || '')
  
  const [provinces, setProvinces] = useState<Province[]>([])
  const [regencies, setRegencies] = useState<Regency[]>([])
  const [districts, setDistricts] = useState<District[]>([])
  const [villages, setVillages] = useState<Village[]>([])
  const [loadingProvinces, setLoadingProvinces] = useState(true)
  const [loadingRegencies, setLoadingRegencies] = useState(false)
  const [loadingDistricts, setLoadingDistricts] = useState(false)
  const [loadingVillages, setLoadingVillages] = useState(false)

  // Sync state with props
  useEffect(() => {
    setSelectedProvinsiId(propProvinsiId || '');
    setSelectedKabupatenId(propKabupatenId || '');
    setSelectedKecamatanId(propKecamatanId || '');
    setSelectedDesaId(propDesaId || '');
  }, [propProvinsiId, propKabupatenId, propKecamatanId, propDesaId]);

  // Handle initialData changes
  useEffect(() => {
    if (initialData) {
      setSelectedProvinsiId(initialData.provinsiId || '')
      setSelectedKabupatenId(initialData.kabupatenId || '')
      setSelectedKecamatanId(initialData.kecamatanId || '')
      setSelectedDesaId(initialData.desaId || '')
    }
  }, [initialData])

  // Load regencies when initialData has provinsiId
  useEffect(() => {
    if (initialData?.provinsiId) {
      const fetchInitialRegencies = async () => {
        try {
          setLoadingRegencies(true)
          const response = await fetch(`https://www.emsifa.com/api-wilayah-indonesia/api/regencies/${initialData.provinsiId}.json`)
          if (response.ok) {
            const data = await response.json()
            setRegencies(data)
          }
        } catch (error) {
          //
        } finally {
          setLoadingRegencies(false)
        }
      }
      fetchInitialRegencies()
    }
  }, [initialData?.provinsiId])

  // Load districts when initialData has kabupatenId
  useEffect(() => {
    if (initialData?.kabupatenId && showKecamatan) {
      const fetchInitialDistricts = async () => {
        try {
          setLoadingDistricts(true)
          const response = await fetch(`https://www.emsifa.com/api-wilayah-indonesia/api/districts/${initialData.kabupatenId}.json`)
          if (response.ok) {
            const data = await response.json()
            setDistricts(data)
          }
        } catch (error) {
          //
        } finally {
          setLoadingDistricts(false)
        }
      }
      fetchInitialDistricts()
    }
  }, [initialData?.kabupatenId, showKecamatan])

  // Load villages when initialData has kecamatanId
  useEffect(() => {
    if (initialData?.kecamatanId && showDesa) {
      const fetchInitialVillages = async () => {
        try {
          setLoadingVillages(true)
          const response = await fetch(`https://www.emsifa.com/api-wilayah-indonesia/api/villages/${initialData.kecamatanId}.json`)
          if (response.ok) {
            const data = await response.json()
            setVillages(data)
          }
        } catch (error) {
          //
        } finally {
          setLoadingVillages(false)
        }
      }
      fetchInitialVillages()
    }
  }, [initialData?.kecamatanId, showDesa])

  // Fetch provinces on component mount
  useEffect(() => {
    const fetchProvinces = async () => {
      try {
        setLoadingProvinces(true)
        const response = await fetch('https://www.emsifa.com/api-wilayah-indonesia/api/provinces.json')
        if (response.ok) {
          const data = await response.json()
          setProvinces(data)
        } else {
          setProvinces([])
        }
      } catch (error) {
        setProvinces([])
      } finally {
        setLoadingProvinces(false)
      }
    }

    fetchProvinces()
  }, [])

  // Fetch regencies when province changes (but not when initialData is being processed)
  useEffect(() => {
    if (selectedProvinsiId && !initialData) {
      const fetchRegencies = async () => {
        try {
          setLoadingRegencies(true)
          setRegencies([]) // Clear previous regencies immediately
          setSelectedKabupatenId('') // Reset kabupaten selection
          setSelectedKecamatanId('') // Reset kecamatan selection
          setSelectedDesaId('') // Reset desa selection
          const response = await fetch(`https://www.emsifa.com/api-wilayah-indonesia/api/regencies/${selectedProvinsiId}.json`)
          if (response.ok) {
            const data = await response.json()
            setRegencies(data)
          } else {
            setRegencies([])
          }
        } catch (error) {
          setRegencies([])
        } finally {
          setLoadingRegencies(false)
        }
      }

      fetchRegencies()
    } else if (!selectedProvinsiId && !initialData) {
      setRegencies([])
      setDistricts([])
      setVillages([])
      setSelectedKabupatenId('')
      setSelectedKecamatanId('')
      setSelectedDesaId('')
      setLoadingRegencies(false)
    }
  }, [selectedProvinsiId, initialData])

  // Fetch districts when regency changes (but not when initialData is being processed)
  useEffect(() => {
    if (selectedKabupatenId && showKecamatan && !initialData) {
      const fetchDistricts = async () => {
        try {
          setLoadingDistricts(true)
          setDistricts([])
          setSelectedKecamatanId('')
          setSelectedDesaId('')
          const response = await fetch(`https://www.emsifa.com/api-wilayah-indonesia/api/districts/${selectedKabupatenId}.json`)
          if (response.ok) {
            const data = await response.json()
            setDistricts(data)
          } else {
            setDistricts([])
          }
        } catch (error) {
          setDistricts([])
        } finally {
          setLoadingDistricts(false)
        }
      }

      fetchDistricts()
    } else if (!selectedKabupatenId && showKecamatan && !initialData) {
      setDistricts([])
      setVillages([])
      setSelectedKecamatanId('')
      setSelectedDesaId('')
      setLoadingDistricts(false)
    }
  }, [selectedKabupatenId, showKecamatan, initialData])

  // Fetch villages when district changes (but not when initialData is being processed)
  useEffect(() => {
    if (selectedKecamatanId && showDesa && !initialData) {
      const fetchVillages = async () => {
        try {
          setLoadingVillages(true)
          setVillages([])
          setSelectedDesaId('')
          const response = await fetch(`https://www.emsifa.com/api-wilayah-indonesia/api/villages/${selectedKecamatanId}.json`)
          if (response.ok) {
            const data = await response.json()
            setVillages(data)
          } else {
            setVillages([])
          }
        } catch (error) {
          setVillages([])
        } finally {
          setLoadingVillages(false)
        }
      }

      fetchVillages()
    } else if (!selectedKecamatanId && showDesa && !initialData) {
      setVillages([])
      setSelectedDesaId('')
      setLoadingVillages(false)
    }
  }, [selectedKecamatanId, showDesa, initialData])

  const handleProvinceChange = (value: string) => {
    const realValue = value === '_ALL_' ? '' : value;
    const provinceName = provinces.find((p) => p.id === realValue)?.name || ''
    setSelectedProvinsiId(realValue)
    setSelectedKabupatenId('')
    setSelectedKecamatanId('')
    setSelectedDesaId('')
    setRegencies([])
    setDistricts([])
    setVillages([])
    
    // Callbacks
    if (onProvinsiChange) onProvinsiChange(realValue, provinceName)
    if (onRegionChange) {
      onRegionChange({
        provinsiId: realValue,
        provinsi: provinceName,
        kabupatenId: '',
        kabupaten: '',
        kecamatanId: '',
        kecamatan: '',
        desaId: '',
        desa: ''
      })
    }
  }

  const handleRegencyChange = (value: string) => {
    const realValue = value === '_ALL_' ? '' : value;
    const regencyName = regencies.find((r) => r.id === realValue)?.name || ''
    setSelectedKabupatenId(realValue)
    setSelectedKecamatanId('')
    setSelectedDesaId('')
    setDistricts([])
    setVillages([])

    if (onKabupatenChange) onKabupatenChange(realValue, regencyName)
    if (onRegionChange) {
      onRegionChange({
        provinsiId: selectedProvinsiId,
        provinsi: provinces.find((p) => p.id === selectedProvinsiId)?.name || '',
        kabupatenId: realValue,
        kabupaten: regencyName,
        kecamatanId: '',
        kecamatan: '',
        desaId: '',
        desa: ''
      })
    }
  }

  const handleDistrictChange = (value: string) => {
    const realValue = value === '_ALL_' ? '' : value;
    const districtName = districts.find((d) => d.id === realValue)?.name || ''
    setSelectedKecamatanId(realValue)
    setSelectedDesaId('')
    setVillages([])

    if (onKecamatanChange) onKecamatanChange(realValue, districtName)
    if (onRegionChange) {
      onRegionChange({
        provinsiId: selectedProvinsiId,
        provinsi: provinces.find((p) => p.id === selectedProvinsiId)?.name || '',
        kabupatenId: selectedKabupatenId,
        kabupaten: regencies.find((r) => r.id === selectedKabupatenId)?.name || '',
        kecamatanId: realValue,
        kecamatan: districtName,
        desaId: '',
        desa: ''
      })
    }
  }

  const handleVillageChange = (value: string) => {
    const realValue = value === '_ALL_' ? '' : value;
    const villageName = villages.find((v) => v.id === realValue)?.name || ''
    setSelectedDesaId(realValue)
    
    if (onDesaChange) onDesaChange(realValue, villageName)
    if (onRegionChange) {
      onRegionChange({
        provinsiId: selectedProvinsiId,
        provinsi: provinces.find((p) => p.id === selectedProvinsiId)?.name || '',
        kabupatenId: selectedKabupatenId,
        kabupaten: regencies.find((r) => r.id === selectedKabupatenId)?.name || '',
        kecamatanId: selectedKecamatanId,
        kecamatan: districts.find((d) => d.id === selectedKecamatanId)?.name || '',
        desaId: realValue,
        desa: villageName
      })
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <div>
        <Label htmlFor="provinsi">Provinsi</Label>
        <Select
          value={selectedProvinsiId}
          onValueChange={handleProvinceChange}
          disabled={disabled || loadingProvinces}
          required={required}
        >
          <SelectTrigger id="provinsi" disabled={disabled || loadingProvinces}>
            <SelectValue placeholder="Pilih Provinsi" />
          </SelectTrigger>
          <SelectContent>
            {loadingProvinces ? (
              <div className="flex items-center justify-center p-2">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                <span>Memuat...</span>
              </div>
            ) : (
              <>
                <SelectItem value="_ALL_">Semua Provinsi</SelectItem>
                {provinces.map((province) => (
                  <SelectItem key={province.id} value={province.id}>
                    {province.name}
                  </SelectItem>
                ))}
              </>
            )}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="kabupaten">Kabupaten/Kota</Label>
        <Select
          value={selectedKabupatenId}
          onValueChange={handleRegencyChange}
          disabled={disabled || !selectedProvinsiId || loadingRegencies}
          required={required}
        >
          <SelectTrigger id="kabupaten" disabled={disabled || !selectedProvinsiId || loadingRegencies}>
            <SelectValue placeholder="Pilih Kabupaten/Kota" />
          </SelectTrigger>
          <SelectContent>
            {loadingRegencies ? (
              <div className="flex items-center justify-center p-2">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                <span>Memuat...</span>
              </div>
            ) : (
              <>
                <SelectItem value="_ALL_">Semua Kabupaten/Kota</SelectItem>
                {regencies.map((regency) => (
                  <SelectItem key={regency.id} value={regency.id}>
                    {regency.name}
                  </SelectItem>
                ))}
              </>
            )}
          </SelectContent>
        </Select>
      </div>
      {showKecamatan && (
        <div>
          <Label htmlFor="kecamatan">Kecamatan</Label>
          <Select
            value={selectedKecamatanId}
            onValueChange={handleDistrictChange}
            disabled={disabled || !selectedKabupatenId || loadingDistricts}
            required={required}
          >
            <SelectTrigger id="kecamatan" disabled={disabled || !selectedKabupatenId || loadingDistricts}>
              <SelectValue placeholder="Pilih Kecamatan" />
            </SelectTrigger>
            <SelectContent>
              {loadingDistricts ? (
                <div className="flex items-center justify-center p-2">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  <span>Memuat...</span>
                </div>
              ) : (
                <>
                  <SelectItem value="_ALL_">Semua Kecamatan</SelectItem>
                  {districts.map((district) => (
                    <SelectItem key={district.id} value={district.id}>
                      {district.name}
                    </SelectItem>
                  ))}
                </>
              )}
            </SelectContent>
          </Select>
        </div>
      )}
      {showDesa && (
        <div>
          <Label htmlFor="desa">Desa/Kelurahan</Label>
          <Select
            value={selectedDesaId}
            onValueChange={handleVillageChange}
            disabled={disabled || !selectedKecamatanId || loadingVillages}
            required={required}
          >
            <SelectTrigger id="desa" disabled={disabled || !selectedKecamatanId || loadingVillages}>
              <SelectValue placeholder="Pilih Desa/Kelurahan" />
            </SelectTrigger>
            <SelectContent>
              {loadingVillages ? (
                <div className="flex items-center justify-center p-2">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  <span>Memuat...</span>
                </div>
              ) : (
                <>
                  <SelectItem value="_ALL_">Semua Desa/Kelurahan</SelectItem>
                  {villages.map((village) => (
                    <SelectItem key={village.id} value={village.id}>
                      {village.name}
                    </SelectItem>
                  ))}
                </>
              )}
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  )
}