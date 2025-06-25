'use client'

import { useState, useEffect, useMemo } from 'react'
import { Check, ChevronDown, Search, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'

interface ProductCategory {
  id: string
  name: string
  slug: string
  description?: string
  icon?: string
  color: string
  level: number
  parentId?: string | null
  children?: ProductCategory[]
}

interface CategorySelectorProps {
  categories: ProductCategory[]
  value?: string
  onValueChange: (value: string) => void
  placeholder?: string
  className?: string
  disabled?: boolean
}

export function CategorySelector({
  categories,
  value,
  onValueChange,
  placeholder = "Pilih kategori...",
  className,
  disabled = false
}: CategorySelectorProps) {
  const [open, setOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedPath, setSelectedPath] = useState<ProductCategory[]>([])
  const [currentLevel, setCurrentLevel] = useState(0)

  // Flatten categories for search
  const flatCategories = useMemo(() => {
    const flatten = (cats: ProductCategory[], path: ProductCategory[] = []): Array<{category: ProductCategory, path: ProductCategory[]}> => {
      const result: Array<{category: ProductCategory, path: ProductCategory[]}> = []
      
      cats.forEach(cat => {
        const currentPath = [...path, cat]
        result.push({ category: cat, path: currentPath })
        
        if (cat.children && cat.children.length > 0) {
          result.push(...flatten(cat.children, currentPath))
        }
      })
      
      return result
    }
    
    return flatten(categories)
  }, [categories])

  // Filter categories based on search term
  const filteredCategories = useMemo(() => {
    if (!searchTerm) return flatCategories
    
    return flatCategories.filter(({ category, path }) => {
      const searchLower = searchTerm.toLowerCase()
      return (
        category.name.toLowerCase().includes(searchLower) ||
        path.some(p => p.name.toLowerCase().includes(searchLower))
      )
    })
  }, [flatCategories, searchTerm])

  // Get categories for current level
  const getCurrentLevelCategories = () => {
    if (searchTerm) {
      return filteredCategories
    }

    if (currentLevel === 0) {
      return categories
        .filter(cat => cat.level === 1)
        .map(cat => ({ category: cat, path: [cat] }))
    }

    const parentCategory = selectedPath[currentLevel - 1]
    if (parentCategory && parentCategory.children) {
      return parentCategory.children.map(cat => ({ 
        category: cat, 
        path: [...selectedPath.slice(0, currentLevel), cat] 
      }))
    }

    return []
  }

  // Find selected category
  const selectedCategory = useMemo(() => {
    return flatCategories.find(({ category }) => category.id === value)?.category
  }, [flatCategories, value])

  // Build breadcrumb path for selected category
  const selectedCategoryPath = useMemo(() => {
    if (!selectedCategory) return []
    return flatCategories.find(({ category }) => category.id === value)?.path || []
  }, [flatCategories, selectedCategory, value])

  const handleCategorySelect = (category: ProductCategory, path: ProductCategory[]) => {
    if (category.children && category.children.length > 0) {
      // Has children, navigate to next level
      setSelectedPath(path)
      setCurrentLevel(path.length)
      setSearchTerm('')
    } else {
      // No children, select this category
      onValueChange(category.id)
      setOpen(false)
      setSearchTerm('')
      setCurrentLevel(0)
      setSelectedPath([])
    }
  }

  const handleBackToLevel = (level: number) => {
    setCurrentLevel(level)
    setSelectedPath(prev => prev.slice(0, level))
    setSearchTerm('')
  }

  const handleClearSelection = () => {
    onValueChange('')
    setCurrentLevel(0)
    setSelectedPath([])
    setSearchTerm('')
  }

  const currentCategories = getCurrentLevelCategories()

  // Debug logging
  console.log('CategorySelector Debug:', {
    categoriesCount: categories.length,
    currentLevel,
    searchTerm,
    selectedPath,
    currentCategoriesCount: currentCategories.length,
    firstCategory: categories[0],
    level1Categories: categories.filter(cat => cat.level === 1)
  })

  return (
    <div className={cn("relative", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
            disabled={disabled}
          >
            <div className="flex items-center gap-2 flex-1 min-w-0">
              {selectedCategory ? (
                <div className="flex items-center gap-1 flex-1 min-w-0">
                  <div className="flex items-center gap-1 flex-wrap">
                    {selectedCategoryPath.map((cat, index) => (
                      <div key={cat.id} className="flex items-center gap-1">
                        {index > 0 && <span className="text-muted-foreground">/</span>}
                        <Badge 
                          variant="secondary" 
                          className="text-xs"
                          style={{ backgroundColor: cat.color + '20', color: cat.color }}
                        >
                          {cat.name}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <span className="text-muted-foreground">{placeholder}</span>
              )}
            </div>
            <div className="flex items-center gap-1">
              {selectedCategory && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleClearSelection()
                  }}
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
              <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
            </div>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[400px] p-0" align="start">
          <Command>
            <div className="flex items-center border-b px-3">
              <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
              <Input
                placeholder="Cari kategori..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
              />
            </div>
            <CommandList>
              {!searchTerm && currentLevel > 0 && (
                <CommandGroup>
                  <div className="px-2 py-1.5">
                    <div className="flex items-center gap-1 mb-2">
                      {selectedPath.map((cat, index) => (
                        <div key={cat.id} className="flex items-center gap-1">
                          {index > 0 && <span className="text-muted-foreground text-xs">/</span>}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 px-2 text-xs"
                            onClick={() => handleBackToLevel(index)}
                          >
                            {cat.name}
                          </Button>
                        </div>
                      ))}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full justify-start"
                      onClick={() => handleBackToLevel(currentLevel - 1)}
                    >
                      ← Kembali
                    </Button>
                  </div>
                </CommandGroup>
              )}
              
              <CommandEmpty>
                {searchTerm ? 'Kategori tidak ditemukan.' : 'Tidak ada kategori.'}
              </CommandEmpty>
              
              <CommandGroup>
                {currentCategories.map(({ category, path }) => {
                  const isSelected = category.id === value
                  const hasChildren = category.children && category.children.length > 0
                  
                  return (
                    <CommandItem
                      key={category.id}
                      value={category.id}
                      onSelect={() => handleCategorySelect(category, path)}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: category.color }}
                        />
                        <div className="flex flex-col">
                          <span className="font-medium">{category.name}</span>
                          {searchTerm && path.length > 1 && (
                            <span className="text-xs text-muted-foreground">
                              {path.slice(0, -1).map(p => p.name).join(' / ')}
                            </span>
                          )}
                          {category.description && (
                            <span className="text-xs text-muted-foreground">
                              {category.description}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        {hasChildren && (
                          <Badge variant="outline" className="text-xs">
                            {category.children?.length} sub
                          </Badge>
                        )}
                        {isSelected && <Check className="h-4 w-4" />}
                        {hasChildren && !isSelected && <ChevronDown className="h-4 w-4" />}
                      </div>
                    </CommandItem>
                  )
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  )
}