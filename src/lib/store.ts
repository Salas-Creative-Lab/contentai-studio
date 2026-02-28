import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// Tipos principales
export interface Client {
  id: string
  name: string
  slug: string
  logo: string | null
  isotipo: string | null
  primaryColor: string
  secondaryColor: string
  accentColor: string
  headingFont: string
  bodyFont: string
  rubro: string | null
  description: string | null
  website: string | null
  aiTone: string
  aiLanguage: string
  operationMode: string
  isActive: boolean
  settings: string | null
  createdAt: string
  updatedAt: string
}

export interface Preset {
  id: string
  clientId: string
  name: string
  slug: string
  description: string | null
  styleType: string
  templateId: string | null
  primaryColor: string
  secondaryColor: string
  accentColor: string
  backgroundColor: string
  headingFont: string
  bodyFont: string
  textLayout: string
  titlePosition: string
  textAlignment: string
  backgroundStyle: string
  gradientDirection: string
  backgroundPattern: string | null
  compositionStyle: string
  imageSize: string
  imagePosition: string
  padding: number
  reelStyle: string
  reelDuration: number
  reelTransition: string
  textTone: string
  textLength: string
  exportFormat: string
  exportSizes: string
  exportPath: string | null
  socialNetworks: string | null
  isDefault: boolean
  isActive: boolean
  usageCount: number
  createdAt: string
  updatedAt: string
}

export interface Product {
  id: string
  clientId: string
  title: string
  description: string | null
  price: number | null
  currency: string
  sku: string | null
  detectedType: string | null
  typeId: string | null
  detectionScore: number | null
  isCorrectlyDetected: boolean
  manualCorrection: string | null
  attributes: string | null
  variants: string | null
  originalImage: string | null
  processedImage: string | null
  noBackgroundImage: string | null
  enhancedImage: string | null
  status: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface GeneratedContent {
  id: string
  clientId: string
  productId: string | null
  presetId: string | null
  title: string | null
  subtitle: string | null
  benefits: string | null
  claims: string | null
  callToAction: string | null
  shortText: string | null
  longText: string | null
  composedImage: string | null
  ecommerceImage: string | null
  socialImage: string | null
  reelUrl: string | null
  reelDuration: number | null
  reelFormat: string | null
  generationPrompt: string | null
  aiModel: string | null
  generationTime: number | null
  status: string
  isApproved: boolean
  createdAt: string
  updatedAt: string
}

export interface Template {
  id: string
  name: string
  slug: string
  category: string
  description: string | null
  thumbnail: string | null
  config: string
  width: number
  height: number
  isPremium: boolean
  isActive: boolean
  usageCount: number
  createdAt: string
  updatedAt: string
}

// Estado de procesamiento de imagen
export interface ImageProcessing {
  original: string | null
  noBackground: string | null
  replacedBackground: string | null
  aiSuggestedBackground: string | null
  enhanced: string | null
}

// Estado de la aplicación
interface AppState {
  // Cliente actual
  currentClient: Client | null
  clients: Client[]
  
  // Presets
  presets: Preset[]
  currentPreset: Preset | null
  
  // Producto actual
  currentProduct: Product | null
  
  // Contenido generado
  generatedContent: GeneratedContent | null
  contentHistory: GeneratedContent[]
  
  // Plantillas
  templates: Template[]
  
  // Procesamiento de imagen
  imageProcessing: ImageProcessing
  
  // UI State
  isLoading: boolean
  isProcessing: boolean
  activeTab: string
  sidebarOpen: boolean
  operationMode: 'manual' | 'automatic'
  
  // Notificaciones
  notifications: Array<{
    id: string
    type: 'success' | 'error' | 'info' | 'warning'
    message: string
    timestamp: number
  }>
  
  // Acciones
  setCurrentClient: (client: Client | null) => void
  setClients: (clients: Client[]) => void
  addClient: (client: Client) => void
  updateClient: (id: string, data: Partial<Client>) => void
  deleteClient: (id: string) => void
  
  setPresets: (presets: Preset[]) => void
  setCurrentPreset: (preset: Preset | null) => void
  addPreset: (preset: Preset) => void
  updatePreset: (id: string, data: Partial<Preset>) => void
  deletePreset: (id: string) => void
  
  setCurrentProduct: (product: Product | null) => void
  updateProduct: (data: Partial<Product>) => void
  
  setGeneratedContent: (content: GeneratedContent | null) => void
  setContentHistory: (history: GeneratedContent[]) => void
  
  setTemplates: (templates: Template[]) => void
  
  setImageProcessing: (processing: Partial<ImageProcessing>) => void
  resetImageProcessing: () => void
  
  setLoading: (loading: boolean) => void
  setProcessing: (processing: boolean) => void
  setActiveTab: (tab: string) => void
  setSidebarOpen: (open: boolean) => void
  setOperationMode: (mode: 'manual' | 'automatic') => void
  
  addNotification: (type: 'success' | 'error' | 'info' | 'warning', message: string) => void
  removeNotification: (id: string) => void
  clearNotifications: () => void
}

const initialImageProcessing: ImageProcessing = {
  original: null,
  noBackground: null,
  replacedBackground: null,
  aiSuggestedBackground: null,
  enhanced: null,
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Estado inicial
      currentClient: null,
      clients: [],
      presets: [],
      currentPreset: null,
      currentProduct: null,
      generatedContent: null,
      contentHistory: [],
      templates: [],
      imageProcessing: initialImageProcessing,
      isLoading: false,
      isProcessing: false,
      activeTab: 'dashboard',
      sidebarOpen: true,
      operationMode: 'manual',
      notifications: [],
      
      // Acciones de Cliente
      setCurrentClient: (client) => set({ currentClient: client }),
      setClients: (clients) => set({ clients }),
      addClient: (client) => set((state) => ({ clients: [...state.clients, client] })),
      updateClient: (id, data) => set((state) => ({
        clients: state.clients.map((c) => (c.id === id ? { ...c, ...data } : c)),
        currentClient: state.currentClient?.id === id ? { ...state.currentClient, ...data } : state.currentClient,
      })),
      deleteClient: (id) => set((state) => ({
        clients: state.clients.filter((c) => c.id !== id),
        currentClient: state.currentClient?.id === id ? null : state.currentClient,
      })),
      
      // Acciones de Preset
      setPresets: (presets) => set({ presets }),
      setCurrentPreset: (preset) => set({ currentPreset: preset }),
      addPreset: (preset) => set((state) => ({ presets: [...state.presets, preset] })),
      updatePreset: (id, data) => set((state) => ({
        presets: state.presets.map((p) => (p.id === id ? { ...p, ...data } : p)),
        currentPreset: state.currentPreset?.id === id ? { ...state.currentPreset, ...data } : state.currentPreset,
      })),
      deletePreset: (id) => set((state) => ({
        presets: state.presets.filter((p) => p.id !== id),
        currentPreset: state.currentPreset?.id === id ? null : state.currentPreset,
      })),
      
      // Acciones de Producto
      setCurrentProduct: (product) => set({ currentProduct: product }),
      updateProduct: (data) => set((state) => ({
        currentProduct: state.currentProduct ? { ...state.currentProduct, ...data } : null,
      })),
      
      // Acciones de Contenido
      setGeneratedContent: (content) => set({ generatedContent: content }),
      setContentHistory: (history) => set({ contentHistory: history }),
      
      // Acciones de Plantillas
      setTemplates: (templates) => set({ templates }),
      
      // Acciones de Procesamiento de Imagen
      setImageProcessing: (processing) => set((state) => ({
        imageProcessing: { ...state.imageProcessing, ...processing },
      })),
      resetImageProcessing: () => set({ imageProcessing: initialImageProcessing }),
      
      // Acciones de UI
      setLoading: (loading) => set({ isLoading: loading }),
      setProcessing: (processing) => set({ isProcessing: processing }),
      setActiveTab: (tab) => set({ activeTab: tab }),
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      setOperationMode: (mode) => set({ operationMode: mode }),
      
      // Acciones de Notificaciones
      addNotification: (type, message) => {
        const id = Date.now().toString()
        set((state) => ({
          notifications: [...state.notifications, { id, type, message, timestamp: Date.now() }],
        }))
        // Auto-remove después de 5 segundos
        setTimeout(() => {
          get().removeNotification(id)
        }, 5000)
      },
      removeNotification: (id) => set((state) => ({
        notifications: state.notifications.filter((n) => n.id !== id),
      })),
      clearNotifications: () => set({ notifications: [] }),
    }),
    {
      name: 'content-ai-studio-storage',
      partialize: (state) => ({
        currentClient: state.currentClient,
        currentPreset: state.currentPreset,
        operationMode: state.operationMode,
        sidebarOpen: state.sidebarOpen,
      }),
    }
  )
)
