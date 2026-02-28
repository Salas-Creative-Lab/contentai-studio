'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, Users, Palette, Image, Video, Settings, FolderOpen,
  Plus, Edit3, Trash2, Eye, Copy, Download, Upload, Sparkles, Wand2,
  ChevronLeft, ChevronRight, Menu, X, Check, AlertCircle, Loader2,
  Zap, RefreshCw, Save, Send, Camera, Type, Layers, Play, Pause,
  Square, Circle, Sun, Moon, Globe, DollarSign, Package, Tag,
  FileText, Share2, ArrowRight, Bot, Cpu, HardDrive, Monitor, Clock
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { toast } from 'sonner'
import { useAppStore, type Client, type Preset, type GeneratedContent } from '@/lib/store'
import { cn, formatCurrency, formatDate, formatDateTime, generateId } from '@/lib/utils'

// ================================
// TIPOS LOCALES
// ================================
interface Notification {
  id: string
  type: 'success' | 'error' | 'info' | 'warning'
  message: string
}

// ================================
// COMPONENTE PRINCIPAL
// ================================
export default function ContentAIStudio() {
  // Estado global
  const store = useAppStore()
  
  // Estado local
  const [mounted, setMounted] = useState(false)
  const [activeSection, setActiveSection] = useState('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [operationMode, setOperationMode] = useState<'manual' | 'automatic'>('manual')
  
  // Estados de datos
  const [clients, setClients] = useState<Client[]>([])
  const [currentClient, setCurrentClient] = useState<Client | null>(null)
  const [presets, setPresets] = useState<Preset[]>([])
  const [currentPreset, setCurrentPreset] = useState<Preset | null>(null)
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null)
  const [contentHistory, setContentHistory] = useState<GeneratedContent[]>([])
  
  // Estados de UI
  const [isLoading, setIsLoading] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  
  // Estados de modales
  const [showClientModal, setShowClientModal] = useState(false)
  const [showPresetModal, setShowPresetModal] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<{ type: string; id: string } | null>(null)
  
  // Estados de generación
  const [productData, setProductData] = useState({
    title: '',
    description: '',
    price: '',
    productType: '',
    originalImage: null as string | null
  })
  const [generatedTexts, setGeneratedTexts] = useState<{
    title: string
    subtitle: string
    benefits: string[]
    claims: string[]
    callToAction: string
    shortText: string
    longText: string
    hashtags: string[]
  } | null>(null)
  const [processingStep, setProcessingStep] = useState(0)
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [processedImages, setProcessedImages] = useState<{
    original: string | null
    noBackground: string | null
    withBackground: string | null
    enhanced: string | null
  }>({
    original: null,
    noBackground: null,
    withBackground: null,
    enhanced: null
  })
  
  // Formularios
  const [clientForm, setClientForm] = useState({
    name: '',
    rubro: '',
    primaryColor: '#3B82F6',
    secondaryColor: '#1E40AF',
    accentColor: '#F59E0B',
    aiTone: 'professional',
    operationMode: 'manual'
  })
  
  const [presetForm, setPresetForm] = useState({
    name: '',
    description: '',
    styleType: 'template',
    primaryColor: '#3B82F6',
    secondaryColor: '#1E40AF',
    backgroundColor: '#FFFFFF',
    headingFont: 'Inter',
    bodyFont: 'Inter',
    textLayout: 'center',
    backgroundStyle: 'solid',
    compositionStyle: 'standard',
    reelStyle: 'fade',
    reelDuration: 3,
    textTone: 'professional',
    textLength: 'medium',
    exportFormat: 'jpg'
  })
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // Efectos
  useEffect(() => {
    setMounted(true)
    fetchClients()
    fetchContentHistory()
  }, [])
  
  useEffect(() => {
    if (currentClient) {
      fetchPresets(currentClient.id)
    }
  }, [currentClient])
  
  // Funciones de API
  const fetchClients = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/clients')
      const data = await response.json()
      setClients(data)
    } catch (error) {
      addNotification('error', 'Error al cargar clientes')
    } finally {
      setIsLoading(false)
    }
  }
  
  const fetchPresets = async (clientId: string) => {
    try {
      const response = await fetch(`/api/presets?clientId=${clientId}`)
      const data = await response.json()
      setPresets(data)
    } catch (error) {
      addNotification('error', 'Error al cargar presets')
    }
  }
  
  const fetchContentHistory = async () => {
    try {
      // Simular historial por ahora
      setContentHistory([])
    } catch (error) {
      console.error('Error fetching content history:', error)
    }
  }
  
  // Funciones de Cliente
  const createClient = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(clientForm)
      })
      const newClient = await response.json()
      setClients([newClient, ...clients])
      setCurrentClient(newClient)
      setShowClientModal(false)
      resetClientForm()
      addNotification('success', 'Cliente creado exitosamente')
    } catch (error) {
      addNotification('error', 'Error al crear cliente')
    } finally {
      setIsLoading(false)
    }
  }
  
  const updateClient = async (id: string, data: Partial<Client>) => {
    try {
      const response = await fetch('/api/clients', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...data })
      })
      const updatedClient = await response.json()
      setClients(clients.map(c => c.id === id ? updatedClient : c))
      if (currentClient?.id === id) {
        setCurrentClient(updatedClient)
      }
      addNotification('success', 'Cliente actualizado')
    } catch (error) {
      addNotification('error', 'Error al actualizar cliente')
    }
  }
  
  const deleteClient = async (id: string) => {
    try {
      await fetch(`/api/clients?id=${id}`, { method: 'DELETE' })
      setClients(clients.filter(c => c.id !== id))
      if (currentClient?.id === id) {
        setCurrentClient(null)
      }
      setShowDeleteDialog(false)
      setItemToDelete(null)
      addNotification('success', 'Cliente eliminado')
    } catch (error) {
      addNotification('error', 'Error al eliminar cliente')
    }
  }
  
  // Funciones de Preset
  const createPreset = async () => {
    if (!currentClient) {
      addNotification('warning', 'Selecciona un cliente primero')
      return
    }
    
    try {
      setIsLoading(true)
      const response = await fetch('/api/presets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...presetForm, clientId: currentClient.id })
      })
      const newPreset = await response.json()
      setPresets([newPreset, ...presets])
      setCurrentPreset(newPreset)
      setShowPresetModal(false)
      resetPresetForm()
      addNotification('success', 'Preset creado exitosamente')
    } catch (error) {
      addNotification('error', 'Error al crear preset')
    } finally {
      setIsLoading(false)
    }
  }
  
  const deletePreset = async (id: string) => {
    try {
      await fetch(`/api/presets?id=${id}`, { method: 'DELETE' })
      setPresets(presets.filter(p => p.id !== id))
      if (currentPreset?.id === id) {
        setCurrentPreset(null)
      }
      setShowDeleteDialog(false)
      setItemToDelete(null)
      addNotification('success', 'Preset eliminado')
    } catch (error) {
      addNotification('error', 'Error al eliminar preset')
    }
  }
  
  // Funciones de IA
  const detectProductType = async () => {
    if (!productData.title && !productData.description) {
      addNotification('warning', 'Ingresa título o descripción del producto')
      return
    }
    
    try {
      setIsProcessing(true)
      setProcessingStep(1)
      
      const response = await fetch('/api/ai/detect-product', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productName: productData.title,
          description: productData.description
        })
      })
      
      const data = await response.json()
      
      if (data.success) {
        setProductData(prev => ({
          ...prev,
          productType: data.detection.detectedType
        }))
        addNotification('success', `Producto detectado: ${data.detection.detectedType}`)
      }
    } catch (error) {
      addNotification('error', 'Error en la detección')
    } finally {
      setIsProcessing(false)
      setProcessingStep(0)
    }
  }
  
  const generateTexts = async () => {
    if (!productData.title) {
      addNotification('warning', 'Ingresa el título del producto')
      return
    }
    
    try {
      setIsProcessing(true)
      setProcessingStep(2)
      
      const response = await fetch('/api/ai/generate-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productTitle: productData.title,
          productDescription: productData.description,
          productType: productData.productType,
          price: productData.price ? parseFloat(productData.price) : undefined,
          tone: currentClient?.aiTone || 'professional',
          language: 'es',
          textLength: currentPreset?.textLength || 'medium',
          brandName: currentClient?.name
        })
      })
      
      const data = await response.json()
      
      if (data.success) {
        setGeneratedTexts(data.texts)
        addNotification('success', 'Textos generados exitosamente')
      }
    } catch (error) {
      addNotification('error', 'Error al generar textos')
    } finally {
      setIsProcessing(false)
      setProcessingStep(0)
    }
  }
  
  const generateBackground = async () => {
    try {
      setIsProcessing(true)
      setProcessingStep(3)
      
      const response = await fetch('/api/ai/generate-background', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productType: productData.productType,
          primaryColor: currentClient?.primaryColor || currentPreset?.primaryColor,
          secondaryColor: currentClient?.secondaryColor || currentPreset?.secondaryColor,
          style: currentPreset?.backgroundStyle || 'modern',
          size: '1024x1024'
        })
      })
      
      const data = await response.json()
      
      if (data.success) {
        setProcessedImages(prev => ({
          ...prev,
          withBackground: data.imageUrl
        }))
        addNotification('success', 'Fondo generado exitosamente')
      }
    } catch (error) {
      addNotification('error', 'Error al generar fondo')
    } finally {
      setIsProcessing(false)
      setProcessingStep(0)
    }
  }
  
  const runAutomaticPipeline = async () => {
    if (!currentClient || !productData.title) {
      addNotification('warning', 'Selecciona un cliente e ingresa datos del producto')
      return
    }
    
    try {
      setIsProcessing(true)
      
      // Paso 1: Detectar tipo de producto
      setProcessingStep(1)
      await detectProductType()
      
      // Paso 2: Generar textos
      setProcessingStep(2)
      await generateTexts()
      
      // Paso 3: Generar fondo
      setProcessingStep(3)
      await generateBackground()
      
      // Paso 4: Crear contenido final
      setProcessingStep(4)
      
      const response = await fetch('/api/generate-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId: currentClient.id,
          presetId: currentPreset?.id,
          productData: {
            title: productData.title,
            description: productData.description,
            price: productData.price ? parseFloat(productData.price) : undefined,
            productType: productData.productType,
            originalImage: uploadedImage
          },
          mode: 'automatic',
          options: {
            generateReel: true,
            generateEcommerce: true,
            generateSocial: true
          }
        })
      })
      
      const data = await response.json()
      
      if (data.success) {
        setGeneratedContent(data.content)
        setContentHistory([data.content, ...contentHistory])
        addNotification('success', 'Contenido generado exitosamente')
      }
    } catch (error) {
      addNotification('error', 'Error en el pipeline automático')
    } finally {
      setIsProcessing(false)
      setProcessingStep(0)
    }
  }
  
  // Funciones de imagen
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        setUploadedImage(result)
        setProcessedImages(prev => ({
          ...prev,
          original: result
        }))
      }
      reader.readAsDataURL(file)
    }
  }
  
  // Utilidades
  const resetClientForm = () => {
    setClientForm({
      name: '',
      rubro: '',
      primaryColor: '#3B82F6',
      secondaryColor: '#1E40AF',
      accentColor: '#F59E0B',
      aiTone: 'professional',
      operationMode: 'manual'
    })
  }
  
  const resetPresetForm = () => {
    setPresetForm({
      name: '',
      description: '',
      styleType: 'template',
      primaryColor: '#3B82F6',
      secondaryColor: '#1E40AF',
      backgroundColor: '#FFFFFF',
      headingFont: 'Inter',
      bodyFont: 'Inter',
      textLayout: 'center',
      backgroundStyle: 'solid',
      compositionStyle: 'standard',
      reelStyle: 'fade',
      reelDuration: 3,
      textTone: 'professional',
      textLength: 'medium',
      exportFormat: 'jpg'
    })
  }
  
  const addNotification = (type: Notification['type'], message: string) => {
    const id = generateId()
    setNotifications(prev => [...prev, { id, type, message }])
    toast[type](message)
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id))
    }, 5000)
  }
  
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    addNotification('success', 'Copiado al portapapeles')
  }
  
  // Secciones del sidebar
  const sidebarSections = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'clients', label: 'Clientes', icon: Users },
    { id: 'presets', label: 'Presets', icon: Palette },
    { id: 'generate', label: 'Generar', icon: Sparkles },
    { id: 'history', label: 'Historial', icon: FolderOpen },
    { id: 'settings', label: 'Configuración', icon: Settings },
  ]
  
  if (!mounted) {
    return (
      <div className="flex h-screen items-center justify-center bg-zinc-950">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    )
  }
  
  return (
    <div className="flex h-screen bg-zinc-950 text-zinc-100">
      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: sidebarOpen ? 280 : 80 }}
        className="flex flex-col border-r border-zinc-800 bg-zinc-900/50 backdrop-blur-xl"
      >
        {/* Logo */}
        <div className="flex h-16 items-center justify-between border-b border-zinc-800 px-4">
          <AnimatePresence mode="wait">
            {sidebarOpen ? (
              <motion.div
                key="full-logo"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-2"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-600">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
                <span className="text-lg font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  ContentAI
                </span>
              </motion.div>
            ) : (
              <motion.div
                key="icon-logo"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="mx-auto flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-600"
              >
                <Sparkles className="h-5 w-5 text-white" />
              </motion.div>
            )}
          </AnimatePresence>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className={cn("text-zinc-400 hover:text-zinc-100", !sidebarOpen && "absolute -right-3")}
          >
            {sidebarOpen ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </Button>
        </div>
        
        {/* Navigation */}
        <nav className="flex-1 space-y-1 p-3">
          {sidebarSections.map((section) => {
            const Icon = section.icon
            const isActive = activeSection === section.id
            return (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                  isActive
                    ? "bg-gradient-to-r from-blue-600/20 to-purple-600/20 text-white border border-blue-500/30"
                    : "text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100"
                )}
              >
                <Icon className={cn("h-5 w-5 flex-shrink-0", isActive && "text-blue-400")} />
                <AnimatePresence mode="wait">
                  {sidebarOpen && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: 'auto' }}
                      exit={{ opacity: 0, width: 0 }}
                    >
                      {section.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>
            )
          })}
        </nav>
        
        {/* Mode Toggle */}
        <div className="border-t border-zinc-800 p-4">
          <AnimatePresence mode="wait">
            {sidebarOpen ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-3"
              >
                <Label className="text-xs text-zinc-500 uppercase tracking-wider">Modo de Operación</Label>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant={operationMode === 'manual' ? 'default' : 'outline'}
                    onClick={() => setOperationMode('manual')}
                    className={cn(
                      "flex-1",
                      operationMode === 'manual' && "bg-blue-600 hover:bg-blue-700"
                    )}
                  >
                    <Monitor className="h-4 w-4 mr-1" />
                    Manual
                  </Button>
                  <Button
                    size="sm"
                    variant={operationMode === 'automatic' ? 'default' : 'outline'}
                    onClick={() => setOperationMode('automatic')}
                    className={cn(
                      "flex-1",
                      operationMode === 'automatic' && "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    )}
                  >
                    <Zap className="h-4 w-4 mr-1" />
                    Auto
                  </Button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex justify-center"
              >
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => setOperationMode(operationMode === 'manual' ? 'automatic' : 'manual')}
                  className={cn(
                    operationMode === 'automatic' && "text-yellow-400"
                  )}
                >
                  {operationMode === 'manual' ? <Monitor className="h-5 w-5" /> : <Zap className="h-5 w-5" />}
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        {/* Current Client */}
        {currentClient && sidebarOpen && (
          <div className="border-t border-zinc-800 p-4">
            <Label className="text-xs text-zinc-500 uppercase tracking-wider">Cliente Activo</Label>
            <div className="mt-2 flex items-center gap-2 rounded-lg bg-zinc-800/50 p-2">
              <div
                className="h-8 w-8 rounded-lg flex items-center justify-center text-white font-bold text-sm"
                style={{ backgroundColor: currentClient.primaryColor }}
              >
                {currentClient.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{currentClient.name}</p>
                <p className="text-xs text-zinc-500 truncate">{currentClient.rubro || 'Sin rubro'}</p>
              </div>
            </div>
          </div>
        )}
      </motion.aside>
      
      {/* Main Content */}
      <main className="flex-1 overflow-hidden flex flex-col">
        {/* Header */}
        <header className="h-16 border-b border-zinc-800 bg-zinc-900/30 backdrop-blur-sm flex items-center justify-between px-6">
          <div>
            <h1 className="text-xl font-semibold">
              {sidebarSections.find(s => s.id === activeSection)?.label || 'Dashboard'}
            </h1>
            <p className="text-sm text-zinc-500">
              {operationMode === 'automatic' ? 'Procesamiento automático activado' : 'Modo manual'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {isProcessing && (
              <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/30">
                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                Procesando...
              </Badge>
            )}
            <Button
              onClick={() => setShowClientModal(true)}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Cliente
            </Button>
          </div>
        </header>
        
        {/* Content Area */}
        <ScrollArea className="flex-1 p-6">
          {/* Dashboard Section */}
          {activeSection === 'dashboard' && (
            <div className="space-y-6">
              {/* Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="bg-zinc-900/50 border-zinc-800">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-zinc-400">Clientes</CardTitle>
                    <Users className="h-4 w-4 text-blue-400" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{clients.length}</div>
                    <p className="text-xs text-zinc-500 mt-1">Total registrados</p>
                  </CardContent>
                </Card>
                <Card className="bg-zinc-900/50 border-zinc-800">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-zinc-400">Presets</CardTitle>
                    <Palette className="h-4 w-4 text-purple-400" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{presets.length}</div>
                    <p className="text-xs text-zinc-500 mt-1">Configuraciones</p>
                  </CardContent>
                </Card>
                <Card className="bg-zinc-900/50 border-zinc-800">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-zinc-400">Contenidos</CardTitle>
                    <Image className="h-4 w-4 text-green-400" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{contentHistory.length}</div>
                    <p className="text-xs text-zinc-500 mt-1">Generados</p>
                  </CardContent>
                </Card>
                <Card className="bg-zinc-900/50 border-zinc-800">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-zinc-400">Modo</CardTitle>
                    <Zap className="h-4 w-4 text-yellow-400" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold capitalize">{operationMode}</div>
                    <p className="text-xs text-zinc-500 mt-1">Operación actual</p>
                  </CardContent>
                </Card>
              </div>
              
              {/* Quick Actions */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-gradient-to-br from-blue-600/20 to-blue-800/20 border-blue-500/30 cursor-pointer hover:from-blue-600/30 hover:to-blue-800/30 transition-all"
                  onClick={() => setActiveSection('generate')}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-xl bg-blue-500/20">
                        <Sparkles className="h-6 w-6 text-blue-400" />
                      </div>
                      <div>
                        <h3 className="font-semibold">Generar Contenido</h3>
                        <p className="text-sm text-zinc-400">Crea imágenes y textos con IA</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-gradient-to-br from-purple-600/20 to-purple-800/20 border-purple-500/30 cursor-pointer hover:from-purple-600/30 hover:to-purple-800/30 transition-all"
                  onClick={() => setActiveSection('clients')}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-xl bg-purple-500/20">
                        <Users className="h-6 w-6 text-purple-400" />
                      </div>
                      <div>
                        <h3 className="font-semibold">Gestionar Clientes</h3>
                        <p className="text-sm text-zinc-400">{clients.length} clientes activos</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-gradient-to-br from-green-600/20 to-green-800/20 border-green-500/30 cursor-pointer hover:from-green-600/30 hover:to-green-800/30 transition-all"
                  onClick={() => setActiveSection('presets')}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-xl bg-green-500/20">
                        <Palette className="h-6 w-6 text-green-400" />
                      </div>
                      <div>
                        <h3 className="font-semibold">Configurar Presets</h3>
                        <p className="text-sm text-zinc-400">{presets.length} presets disponibles</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {/* Recent Activity */}
              <Card className="bg-zinc-900/50 border-zinc-800">
                <CardHeader>
                  <CardTitle>Actividad Reciente</CardTitle>
                  <CardDescription>Últimos contenidos generados</CardDescription>
                </CardHeader>
                <CardContent>
                  {contentHistory.length === 0 ? (
                    <div className="text-center py-8 text-zinc-500">
                      <Image className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p>No hay contenido generado aún</p>
                      <Button variant="link" onClick={() => setActiveSection('generate')} className="mt-2">
                        Crear primer contenido
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {contentHistory.slice(0, 5).map((content, i) => (
                        <div key={content.id || i} className="flex items-center justify-between p-3 rounded-lg bg-zinc-800/50">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg bg-zinc-700 flex items-center justify-center">
                              <FileText className="h-5 w-5 text-zinc-400" />
                            </div>
                            <div>
                              <p className="font-medium">{content.title || 'Sin título'}</p>
                              <p className="text-sm text-zinc-500">{formatDateTime(content.createdAt)}</p>
                            </div>
                          </div>
                          <Badge variant={content.status === 'completed' ? 'default' : 'secondary'}>
                            {content.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
          
          {/* Clients Section */}
          {activeSection === 'clients' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold">Gestión de Clientes</h2>
                  <p className="text-zinc-500">Administra los clientes y su branding</p>
                </div>
                <Button onClick={() => setShowClientModal(true)} className="bg-gradient-to-r from-blue-600 to-purple-600">
                  <Plus className="h-4 w-4 mr-2" />
                  Nuevo Cliente
                </Button>
              </div>
              
              {clients.length === 0 ? (
                <Card className="bg-zinc-900/50 border-zinc-800">
                  <CardContent className="py-12 text-center">
                    <Users className="h-16 w-16 mx-auto mb-4 text-zinc-600" />
                    <h3 className="text-lg font-medium mb-2">No hay clientes</h3>
                    <p className="text-zinc-500 mb-4">Crea tu primer cliente para comenzar</p>
                    <Button onClick={() => setShowClientModal(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Crear Cliente
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {clients.map((client) => (
                    <Card
                      key={client.id}
                      className={cn(
                        "bg-zinc-900/50 border-zinc-800 cursor-pointer transition-all hover:border-zinc-700",
                        currentClient?.id === client.id && "border-blue-500 ring-1 ring-blue-500/50"
                      )}
                      onClick={() => setCurrentClient(client)}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div
                              className="h-12 w-12 rounded-xl flex items-center justify-center text-white font-bold text-lg"
                              style={{ backgroundColor: client.primaryColor }}
                            >
                              {client.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <CardTitle className="text-lg">{client.name}</CardTitle>
                              <p className="text-sm text-zinc-500">{client.rubro || 'Sin rubro'}</p>
                            </div>
                          </div>
                          {currentClient?.id === client.id && (
                            <Badge className="bg-blue-500">Activo</Badge>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent className="pb-3">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="flex -space-x-1">
                            <div className="h-5 w-5 rounded-full border-2 border-zinc-900" style={{ backgroundColor: client.primaryColor }} />
                            <div className="h-5 w-5 rounded-full border-2 border-zinc-900" style={{ backgroundColor: client.secondaryColor }} />
                            <div className="h-5 w-5 rounded-full border-2 border-zinc-900" style={{ backgroundColor: client.accentColor }} />
                          </div>
                          <span className="text-xs text-zinc-500 ml-2">Paleta de marca</span>
                        </div>
                        <div className="flex gap-2">
                          <Badge variant="outline" className="text-xs">
                            {client.aiTone}
                          </Badge>
                          <Badge variant="outline" className="text-xs capitalize">
                            {client.operationMode}
                          </Badge>
                        </div>
                      </CardContent>
                      <CardFooter className="pt-0">
                        <div className="flex gap-2 w-full">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={(e) => {
                              e.stopPropagation()
                              setCurrentClient(client)
                              setActiveSection('presets')
                            }}
                          >
                            <Palette className="h-3 w-3 mr-1" />
                            Presets
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={(e) => {
                              e.stopPropagation()
                              setCurrentClient(client)
                              setActiveSection('generate')
                            }}
                          >
                            <Sparkles className="h-3 w-3 mr-1" />
                            Generar
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                            onClick={(e) => {
                              e.stopPropagation()
                              setItemToDelete({ type: 'client', id: client.id })
                              setShowDeleteDialog(true)
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}
          
          {/* Presets Section */}
          {activeSection === 'presets' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold">Presets</h2>
                  <p className="text-zinc-500">
                    {currentClient ? `Presets de ${currentClient.name}` : 'Selecciona un cliente'}
                  </p>
                </div>
                <Button
                  onClick={() => setShowPresetModal(true)}
                  disabled={!currentClient}
                  className="bg-gradient-to-r from-blue-600 to-purple-600"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Nuevo Preset
                </Button>
              </div>
              
              {!currentClient ? (
                <Card className="bg-zinc-900/50 border-zinc-800">
                  <CardContent className="py-12 text-center">
                    <Users className="h-16 w-16 mx-auto mb-4 text-zinc-600" />
                    <h3 className="text-lg font-medium mb-2">Selecciona un cliente</h3>
                    <p className="text-zinc-500 mb-4">Primero debes seleccionar un cliente para gestionar sus presets</p>
                    <Button onClick={() => setActiveSection('clients')}>
                      Ir a Clientes
                    </Button>
                  </CardContent>
                </Card>
              ) : presets.length === 0 ? (
                <Card className="bg-zinc-900/50 border-zinc-800">
                  <CardContent className="py-12 text-center">
                    <Palette className="h-16 w-16 mx-auto mb-4 text-zinc-600" />
                    <h3 className="text-lg font-medium mb-2">No hay presets</h3>
                    <p className="text-zinc-500 mb-4">Crea un preset para {currentClient.name}</p>
                    <Button onClick={() => setShowPresetModal(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Crear Preset
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {presets.map((preset) => (
                    <Card
                      key={preset.id}
                      className={cn(
                        "bg-zinc-900/50 border-zinc-800 cursor-pointer transition-all",
                        currentPreset?.id === preset.id && "border-purple-500 ring-1 ring-purple-500/50"
                      )}
                      onClick={() => setCurrentPreset(preset)}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">{preset.name}</CardTitle>
                          {preset.isDefault && <Badge variant="secondary">Default</Badge>}
                        </div>
                        <p className="text-sm text-zinc-500">{preset.description || 'Sin descripción'}</p>
                      </CardHeader>
                      <CardContent className="pb-3">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="flex -space-x-1">
                            <div className="h-5 w-5 rounded-full border-2 border-zinc-900" style={{ backgroundColor: preset.primaryColor }} />
                            <div className="h-5 w-5 rounded-full border-2 border-zinc-900" style={{ backgroundColor: preset.secondaryColor }} />
                          </div>
                          <div className="h-5 w-5 rounded border border-zinc-700" style={{ backgroundColor: preset.backgroundColor }} />
                        </div>
                        <div className="flex flex-wrap gap-1">
                          <Badge variant="outline" className="text-xs">{preset.styleType}</Badge>
                          <Badge variant="outline" className="text-xs">{preset.compositionStyle}</Badge>
                          <Badge variant="outline" className="text-xs">{preset.textTone}</Badge>
                        </div>
                      </CardContent>
                      <CardFooter className="pt-0">
                        <div className="flex gap-2 w-full">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={(e) => {
                              e.stopPropagation()
                              setCurrentPreset(preset)
                              setActiveSection('generate')
                            }}
                          >
                            <Sparkles className="h-3 w-3 mr-1" />
                            Usar
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                            onClick={(e) => {
                              e.stopPropagation()
                              setItemToDelete({ type: 'preset', id: preset.id })
                              setShowDeleteDialog(true)
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}
          
          {/* Generate Section */}
          {activeSection === 'generate' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold">Generar Contenido</h2>
                  <p className="text-zinc-500">
                    {operationMode === 'automatic' ? 'Procesamiento automático' : 'Control manual'}
                  </p>
                </div>
                {operationMode === 'automatic' && currentClient && (
                  <Button
                    onClick={runAutomaticPipeline}
                    disabled={isProcessing || !productData.title}
                    className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Procesando...
                      </>
                    ) : (
                      <>
                        <Zap className="h-4 w-4 mr-2" />
                        Ejecutar Pipeline
                      </>
                    )}
                  </Button>
                )}
              </div>
              
              {/* Progress indicator for automatic mode */}
              {isProcessing && operationMode === 'automatic' && (
                <Card className="bg-zinc-900/50 border-zinc-800">
                  <CardContent className="py-4">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Progreso del Pipeline</span>
                        <span className="text-sm text-zinc-500">Paso {processingStep} de 4</span>
                      </div>
                      <Progress value={(processingStep / 4) * 100} className="h-2" />
                      <div className="grid grid-cols-4 gap-2 text-xs">
                        <div className={cn("text-center p-2 rounded", processingStep >= 1 ? "bg-blue-500/20 text-blue-400" : "bg-zinc-800 text-zinc-500")}>
                          <Bot className="h-4 w-4 mx-auto mb-1" />
                          Detectar
                        </div>
                        <div className={cn("text-center p-2 rounded", processingStep >= 2 ? "bg-purple-500/20 text-purple-400" : "bg-zinc-800 text-zinc-500")}>
                          <Type className="h-4 w-4 mx-auto mb-1" />
                          Textos
                        </div>
                        <div className={cn("text-center p-2 rounded", processingStep >= 3 ? "bg-green-500/20 text-green-400" : "bg-zinc-800 text-zinc-500")}>
                          <Image className="h-4 w-4 mx-auto mb-1" />
                          Fondo
                        </div>
                        <div className={cn("text-center p-2 rounded", processingStep >= 4 ? "bg-yellow-500/20 text-yellow-400" : "bg-zinc-800 text-zinc-500")}>
                          <Layers className="h-4 w-4 mx-auto mb-1" />
                          Componer
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left: Input */}
                <div className="space-y-4">
                  <Card className="bg-zinc-900/50 border-zinc-800">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Package className="h-5 w-5 text-blue-400" />
                        Datos del Producto
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label>Título del Producto</Label>
                        <Input
                          placeholder="Ej: Zapatillas Nike Air Max"
                          value={productData.title}
                          onChange={(e) => setProductData({ ...productData, title: e.target.value })}
                          className="bg-zinc-800 border-zinc-700"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Descripción</Label>
                        <Textarea
                          placeholder="Describe el producto..."
                          value={productData.description}
                          onChange={(e) => setProductData({ ...productData, description: e.target.value })}
                          className="bg-zinc-800 border-zinc-700 min-h-[80px]"
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Precio</Label>
                          <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                            <Input
                              placeholder="0.00"
                              type="number"
                              value={productData.price}
                              onChange={(e) => setProductData({ ...productData, price: e.target.value })}
                              className="bg-zinc-800 border-zinc-700 pl-9"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>Tipo de Producto</Label>
                          <div className="flex gap-2">
                            <Input
                              placeholder="Auto-detectar"
                              value={productData.productType}
                              onChange={(e) => setProductData({ ...productData, productType: e.target.value })}
                              className="bg-zinc-800 border-zinc-700"
                            />
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={detectProductType}
                              disabled={isProcessing}
                            >
                              {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-zinc-900/50 border-zinc-800">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Camera className="h-5 w-5 text-green-400" />
                        Imagen del Producto
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div
                        className="border-2 border-dashed border-zinc-700 rounded-lg p-6 text-center cursor-pointer hover:border-zinc-500 transition-colors"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        {uploadedImage ? (
                          <div className="space-y-3">
                            <img
                              src={uploadedImage}
                              alt="Producto"
                              className="max-h-48 mx-auto rounded-lg"
                            />
                            <p className="text-sm text-zinc-500">Click para cambiar</p>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            <Upload className="h-12 w-12 mx-auto text-zinc-500" />
                            <div>
                              <p className="font-medium">Subir imagen</p>
                              <p className="text-sm text-zinc-500">PNG, JPG hasta 10MB</p>
                            </div>
                          </div>
                        )}
                      </div>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </CardContent>
                  </Card>
                  
                  {/* Manual mode actions */}
                  {operationMode === 'manual' && (
                    <Card className="bg-zinc-900/50 border-zinc-800">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Cpu className="h-5 w-5 text-purple-400" />
                          Acciones de IA
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <Button
                          variant="outline"
                          className="w-full justify-start"
                          onClick={detectProductType}
                          disabled={isProcessing || !productData.title}
                        >
                          <Bot className="h-4 w-4 mr-2" />
                          Detectar Tipo de Producto
                        </Button>
                        <Button
                          variant="outline"
                          className="w-full justify-start"
                          onClick={generateTexts}
                          disabled={isProcessing || !productData.title}
                        >
                          <Type className="h-4 w-4 mr-2" />
                          Generar Textos
                        </Button>
                        <Button
                          variant="outline"
                          className="w-full justify-start"
                          onClick={generateBackground}
                          disabled={isProcessing}
                        >
                          <Image className="h-4 w-4 mr-2" />
                          Generar Fondo
                        </Button>
                      </CardContent>
                    </Card>
                  )}
                </div>
                
                {/* Right: Output */}
                <div className="space-y-4">
                  <Card className="bg-zinc-900/50 border-zinc-800">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-yellow-400" />
                        Textos Generados
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {generatedTexts ? (
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <Label className="text-zinc-400">Título</Label>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => copyToClipboard(generatedTexts.title)}
                              >
                                <Copy className="h-3 w-3" />
                              </Button>
                            </div>
                            <p className="text-lg font-medium">{generatedTexts.title}</p>
                          </div>
                          
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <Label className="text-zinc-400">Subtítulo</Label>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => copyToClipboard(generatedTexts.subtitle)}
                              >
                                <Copy className="h-3 w-3" />
                              </Button>
                            </div>
                            <p className="text-zinc-300">{generatedTexts.subtitle}</p>
                          </div>
                          
                          <div className="space-y-2">
                            <Label className="text-zinc-400">Beneficios</Label>
                            <ul className="list-disc list-inside space-y-1">
                              {generatedTexts.benefits.map((benefit, i) => (
                                <li key={i} className="text-zinc-300">{benefit}</li>
                              ))}
                            </ul>
                          </div>
                          
                          <div className="space-y-2">
                            <Label className="text-zinc-400">Call to Action</Label>
                            <p className="text-blue-400 font-medium">{generatedTexts.callToAction}</p>
                          </div>
                          
                          <div className="space-y-2">
                            <Label className="text-zinc-400">Texto Corto (Reels)</Label>
                            <p className="text-zinc-300 text-sm">{generatedTexts.shortText}</p>
                          </div>
                          
                          <div className="space-y-2">
                            <Label className="text-zinc-400">Texto Largo (Redes)</Label>
                            <p className="text-zinc-300 text-sm">{generatedTexts.longText}</p>
                          </div>
                          
                          <div className="space-y-2">
                            <Label className="text-zinc-400">Hashtags</Label>
                            <div className="flex flex-wrap gap-1">
                              {generatedTexts.hashtags.map((tag, i) => (
                                <Badge key={i} variant="outline" className="text-xs">
                                  #{tag}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-8 text-zinc-500">
                          <Type className="h-12 w-12 mx-auto mb-3 opacity-50" />
                          <p>Genera textos para ver los resultados</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-zinc-900/50 border-zinc-800">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Layers className="h-5 w-5 text-green-400" />
                        Imagen Procesada
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {processedImages.withBackground ? (
                        <div className="space-y-3">
                          <img
                            src={processedImages.withBackground}
                            alt="Fondo generado"
                            className="w-full rounded-lg"
                          />
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" className="flex-1">
                              <Download className="h-4 w-4 mr-1" />
                              Descargar
                            </Button>
                            <Button variant="outline" size="sm" className="flex-1">
                              <RefreshCw className="h-4 w-4 mr-1" />
                              Regenerar
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-8 text-zinc-500">
                          <Image className="h-12 w-12 mx-auto mb-3 opacity-50" />
                          <p>Genera un fondo para ver el resultado</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          )}
          
          {/* History Section */}
          {activeSection === 'history' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold">Historial de Contenido</h2>
                <p className="text-zinc-500">Todos los contenidos generados</p>
              </div>
              
              {contentHistory.length === 0 ? (
                <Card className="bg-zinc-900/50 border-zinc-800">
                  <CardContent className="py-12 text-center">
                    <FolderOpen className="h-16 w-16 mx-auto mb-4 text-zinc-600" />
                    <h3 className="text-lg font-medium mb-2">Historial vacío</h3>
                    <p className="text-zinc-500 mb-4">Los contenidos generados aparecerán aquí</p>
                    <Button onClick={() => setActiveSection('generate')}>
                      Generar Contenido
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {contentHistory.map((content, i) => (
                    <Card key={content.id || i} className="bg-zinc-900/50 border-zinc-800">
                      <CardContent className="p-4">
                        <div className="aspect-square bg-zinc-800 rounded-lg mb-3 flex items-center justify-center">
                          {content.composedImage ? (
                            <img src={content.composedImage} alt="" className="w-full h-full object-cover rounded-lg" />
                          ) : (
                            <Image className="h-12 w-12 text-zinc-600" />
                          )}
                        </div>
                        <h4 className="font-medium truncate">{content.title}</h4>
                        <p className="text-sm text-zinc-500">{formatDateTime(content.createdAt)}</p>
                        <div className="flex gap-2 mt-3">
                          <Badge variant={content.status === 'completed' ? 'default' : 'secondary'} className="text-xs">
                            {content.status}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {content.generationTime?.toFixed(1)}s
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}
          
          {/* Settings Section */}
          {activeSection === 'settings' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold">Configuración</h2>
                <p className="text-zinc-500">Ajustes del sistema</p>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="bg-zinc-900/50 border-zinc-800">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Globe className="h-5 w-5 text-blue-400" />
                      Configuración General
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Modo Oscuro</Label>
                        <p className="text-sm text-zinc-500">Interfaz en tema oscuro</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Idioma</Label>
                        <p className="text-sm text-zinc-500">Idioma de la interfaz</p>
                      </div>
                      <Select defaultValue="es">
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="es">Español</SelectItem>
                          <SelectItem value="en">English</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Notificaciones</Label>
                        <p className="text-sm text-zinc-500">Mostrar notificaciones</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-zinc-900/50 border-zinc-800">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <HardDrive className="h-5 w-5 text-green-400" />
                      Exportación
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Google Drive</Label>
                        <p className="text-sm text-zinc-500">Exportar a Drive</p>
                      </div>
                      <Button variant="outline" size="sm">
                        Conectar
                      </Button>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Formato por defecto</Label>
                        <p className="text-sm text-zinc-500">Formato de exportación</p>
                      </div>
                      <Select defaultValue="jpg">
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="jpg">JPG</SelectItem>
                          <SelectItem value="png">PNG</SelectItem>
                          <SelectItem value="webp">WebP</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Calidad</Label>
                        <p className="text-sm text-zinc-500">Calidad de imagen</p>
                      </div>
                      <Select defaultValue="high">
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="high">Alta</SelectItem>
                          <SelectItem value="medium">Media</SelectItem>
                          <SelectItem value="low">Baja</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-zinc-900/50 border-zinc-800">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Bot className="h-5 w-5 text-purple-400" />
                      Configuración de IA
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Modelo de IA</Label>
                      <Select defaultValue="gpt4">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="gpt4">GPT-4 (Premium)</SelectItem>
                          <SelectItem value="gpt35">GPT-3.5 (Rápido)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Temperatura</Label>
                      <div className="flex items-center gap-4">
                        <Slider defaultValue={[70]} max={100} step={1} className="flex-1" />
                        <span className="text-sm text-zinc-500 w-12">0.7</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Tono por defecto</Label>
                      <Select defaultValue="professional">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="professional">Profesional</SelectItem>
                          <SelectItem value="casual">Casual</SelectItem>
                          <SelectItem value="energetic">Energético</SelectItem>
                          <SelectItem value="elegant">Elegante</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-zinc-900/50 border-zinc-800">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Video className="h-5 w-5 text-yellow-400" />
                      Configuración de Reels
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Duración por defecto</Label>
                      <Select defaultValue="3">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="3">3 segundos</SelectItem>
                          <SelectItem value="5">5 segundos</SelectItem>
                          <SelectItem value="10">10 segundos</SelectItem>
                          <SelectItem value="15">15 segundos</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Transición por defecto</Label>
                      <Select defaultValue="fade">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="fade">Fade</SelectItem>
                          <SelectItem value="slide">Slide</SelectItem>
                          <SelectItem value="zoom">Zoom</SelectItem>
                          <SelectItem value="rotate">Rotate</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Añadir música</Label>
                        <p className="text-sm text-zinc-500">Incluir música en reels</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </ScrollArea>
      </main>
      
      {/* Client Modal */}
      <Dialog open={showClientModal} onOpenChange={setShowClientModal}>
        <DialogContent className="bg-zinc-900 border-zinc-800 max-w-2xl">
          <DialogHeader>
            <DialogTitle>Nuevo Cliente</DialogTitle>
            <DialogDescription>
              Crea un nuevo cliente con su branding personalizado
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <Label>Nombre *</Label>
              <Input
                placeholder="Nombre del cliente"
                value={clientForm.name}
                onChange={(e) => setClientForm({ ...clientForm, name: e.target.value })}
                className="bg-zinc-800 border-zinc-700"
              />
            </div>
            <div className="space-y-2">
              <Label>Rubro</Label>
              <Input
                placeholder="Ej: Deportes, Moda, Tecnología"
                value={clientForm.rubro}
                onChange={(e) => setClientForm({ ...clientForm, rubro: e.target.value })}
                className="bg-zinc-800 border-zinc-700"
              />
            </div>
            <div className="space-y-2">
              <Label>Color Primario</Label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={clientForm.primaryColor}
                  onChange={(e) => setClientForm({ ...clientForm, primaryColor: e.target.value })}
                  className="w-12 h-10 p-1 bg-zinc-800 border-zinc-700"
                />
                <Input
                  value={clientForm.primaryColor}
                  onChange={(e) => setClientForm({ ...clientForm, primaryColor: e.target.value })}
                  className="bg-zinc-800 border-zinc-700 flex-1"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Color Secundario</Label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={clientForm.secondaryColor}
                  onChange={(e) => setClientForm({ ...clientForm, secondaryColor: e.target.value })}
                  className="w-12 h-10 p-1 bg-zinc-800 border-zinc-700"
                />
                <Input
                  value={clientForm.secondaryColor}
                  onChange={(e) => setClientForm({ ...clientForm, secondaryColor: e.target.value })}
                  className="bg-zinc-800 border-zinc-700 flex-1"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Color de Acento</Label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={clientForm.accentColor}
                  onChange={(e) => setClientForm({ ...clientForm, accentColor: e.target.value })}
                  className="w-12 h-10 p-1 bg-zinc-800 border-zinc-700"
                />
                <Input
                  value={clientForm.accentColor}
                  onChange={(e) => setClientForm({ ...clientForm, accentColor: e.target.value })}
                  className="bg-zinc-800 border-zinc-700 flex-1"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Tono de IA</Label>
              <Select
                value={clientForm.aiTone}
                onValueChange={(value) => setClientForm({ ...clientForm, aiTone: value })}
              >
                <SelectTrigger className="bg-zinc-800 border-zinc-700">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="professional">Profesional</SelectItem>
                  <SelectItem value="casual">Casual</SelectItem>
                  <SelectItem value="energetic">Energético</SelectItem>
                  <SelectItem value="elegant">Elegante</SelectItem>
                  <SelectItem value="playful">Divertido</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowClientModal(false)}>
              Cancelar
            </Button>
            <Button
              onClick={createClient}
              disabled={!clientForm.name || isLoading}
              className="bg-gradient-to-r from-blue-600 to-purple-600"
            >
              {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
              Crear Cliente
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Preset Modal */}
      <Dialog open={showPresetModal} onOpenChange={setShowPresetModal}>
        <DialogContent className="bg-zinc-900 border-zinc-800 max-w-2xl">
          <DialogHeader>
            <DialogTitle>Nuevo Preset</DialogTitle>
            <DialogDescription>
              Crea una configuración de estilo para {currentClient?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="space-y-2 col-span-2">
              <Label>Nombre del Preset *</Label>
              <Input
                placeholder="Ej: Instagram Deportivo Explosivo"
                value={presetForm.name}
                onChange={(e) => setPresetForm({ ...presetForm, name: e.target.value })}
                className="bg-zinc-800 border-zinc-700"
              />
            </div>
            <div className="space-y-2 col-span-2">
              <Label>Descripción</Label>
              <Textarea
                placeholder="Describe el estilo de este preset..."
                value={presetForm.description}
                onChange={(e) => setPresetForm({ ...presetForm, description: e.target.value })}
                className="bg-zinc-800 border-zinc-700"
              />
            </div>
            <div className="space-y-2">
              <Label>Tipo de Estilo</Label>
              <Select
                value={presetForm.styleType}
                onValueChange={(value) => setPresetForm({ ...presetForm, styleType: value })}
              >
                <SelectTrigger className="bg-zinc-800 border-zinc-700">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="template">Plantilla Editable</SelectItem>
                  <SelectItem value="ai_generative">IA Generativa</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Estilo de Composición</Label>
              <Select
                value={presetForm.compositionStyle}
                onValueChange={(value) => setPresetForm({ ...presetForm, compositionStyle: value })}
              >
                <SelectTrigger className="bg-zinc-800 border-zinc-700">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="standard">Estándar</SelectItem>
                  <SelectItem value="minimal">Minimalista</SelectItem>
                  <SelectItem value="bold">Audaz</SelectItem>
                  <SelectItem value="elegant">Elegante</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Estilo de Fondo</Label>
              <Select
                value={presetForm.backgroundStyle}
                onValueChange={(value) => setPresetForm({ ...presetForm, backgroundStyle: value })}
              >
                <SelectTrigger className="bg-zinc-800 border-zinc-700">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="solid">Sólido</SelectItem>
                  <SelectItem value="gradient">Gradiente</SelectItem>
                  <SelectItem value="pattern">Patrón</SelectItem>
                  <SelectItem value="image">Imagen</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Tono de Textos</Label>
              <Select
                value={presetForm.textTone}
                onValueChange={(value) => setPresetForm({ ...presetForm, textTone: value })}
              >
                <SelectTrigger className="bg-zinc-800 border-zinc-700">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="professional">Profesional</SelectItem>
                  <SelectItem value="casual">Casual</SelectItem>
                  <SelectItem value="energetic">Energético</SelectItem>
                  <SelectItem value="elegant">Elegante</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Color Primario</Label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={presetForm.primaryColor}
                  onChange={(e) => setPresetForm({ ...presetForm, primaryColor: e.target.value })}
                  className="w-12 h-10 p-1 bg-zinc-800 border-zinc-700"
                />
                <Input
                  value={presetForm.primaryColor}
                  onChange={(e) => setPresetForm({ ...presetForm, primaryColor: e.target.value })}
                  className="bg-zinc-800 border-zinc-700 flex-1"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Color de Fondo</Label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={presetForm.backgroundColor}
                  onChange={(e) => setPresetForm({ ...presetForm, backgroundColor: e.target.value })}
                  className="w-12 h-10 p-1 bg-zinc-800 border-zinc-700"
                />
                <Input
                  value={presetForm.backgroundColor}
                  onChange={(e) => setPresetForm({ ...presetForm, backgroundColor: e.target.value })}
                  className="bg-zinc-800 border-zinc-700 flex-1"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Duración del Reel</Label>
              <Select
                value={presetForm.reelDuration.toString()}
                onValueChange={(value) => setPresetForm({ ...presetForm, reelDuration: parseInt(value) })}
              >
                <SelectTrigger className="bg-zinc-800 border-zinc-700">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3">3 segundos</SelectItem>
                  <SelectItem value="5">5 segundos</SelectItem>
                  <SelectItem value="10">10 segundos</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Formato de Exportación</Label>
              <Select
                value={presetForm.exportFormat}
                onValueChange={(value) => setPresetForm({ ...presetForm, exportFormat: value })}
              >
                <SelectTrigger className="bg-zinc-800 border-zinc-700">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="jpg">JPG</SelectItem>
                  <SelectItem value="png">PNG</SelectItem>
                  <SelectItem value="webp">WebP</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPresetModal(false)}>
              Cancelar
            </Button>
            <Button
              onClick={createPreset}
              disabled={!presetForm.name || isLoading}
              className="bg-gradient-to-r from-blue-600 to-purple-600"
            >
              {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
              Crear Preset
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="bg-zinc-900 border-zinc-800">
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (itemToDelete?.type === 'client') {
                  deleteClient(itemToDelete.id)
                } else if (itemToDelete?.type === 'preset') {
                  deletePreset(itemToDelete.id)
                }
              }}
              className="bg-red-600 hover:bg-red-700"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
