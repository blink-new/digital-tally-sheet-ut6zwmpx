import { useState, useEffect } from 'react'
import { Button } from './components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card'
import { Input } from './components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './components/ui/dialog'
import { Label } from './components/ui/label'
import { Trash2, Plus, Minus, RotateCcw, Palette, Download, Share2 } from 'lucide-react'
import { Badge } from './components/ui/badge'

// Component to render tally marks
const TallyMarks = ({ count, color }: { count: number; color: string }) => {
  const groups = Math.floor(count / 5)
  const remainder = count % 5
  
  const renderGroup = (groupIndex: number) => (
    <div key={groupIndex} className="relative inline-block mr-3">
      {/* First 4 vertical lines */}
      {[0, 1, 2, 3].map((lineIndex) => (
        <div
          key={lineIndex}
          className="inline-block w-0.5 h-8 mr-1"
          style={{ backgroundColor: color }}
        />
      ))}
      {/* 5th diagonal line crossing through */}
      <div
        className="absolute top-2 left-0 w-6 h-0.5 transform rotate-12"
        style={{ backgroundColor: color }}
      />
    </div>
  )
  
  const renderRemainder = () => (
    <div className="relative inline-block">
      {Array.from({ length: remainder }, (_, index) => (
        <div
          key={index}
          className="inline-block w-0.5 h-8 mr-1"
          style={{ backgroundColor: color }}
        />
      ))}
    </div>
  )
  
  return (
    <div className="flex items-center justify-center min-h-[3rem] flex-wrap">
      {count === 0 ? (
        <div className="text-slate-400 text-lg font-medium">No marks</div>
      ) : (
        <>
          {Array.from({ length: groups }, (_, index) => renderGroup(index))}
          {remainder > 0 && renderRemainder()}
        </>
      )}
    </div>
  )
}

interface Counter {
  id: string
  name: string
  count1: number
  count2: number
  color: string
}

const colorOptions = [
  { name: 'Blue', value: '#2563eb', bg: 'bg-blue-500', text: 'text-blue-500', border: 'border-blue-500' },
  { name: 'Green', value: '#10b981', bg: 'bg-emerald-500', text: 'text-emerald-500', border: 'border-emerald-500' },
  { name: 'Purple', value: '#8b5cf6', bg: 'bg-violet-500', text: 'text-violet-500', border: 'border-violet-500' },
  { name: 'Red', value: '#ef4444', bg: 'bg-red-500', text: 'text-red-500', border: 'border-red-500' },
  { name: 'Orange', value: '#f97316', bg: 'bg-orange-500', text: 'text-orange-500', border: 'border-orange-500' },
  { name: 'Pink', value: '#ec4899', bg: 'bg-pink-500', text: 'text-pink-500', border: 'border-pink-500' },
  { name: 'Indigo', value: '#6366f1', bg: 'bg-indigo-500', text: 'text-indigo-500', border: 'border-indigo-500' },
  { name: 'Teal', value: '#14b8a6', bg: 'bg-teal-500', text: 'text-teal-500', border: 'border-teal-500' },
]

function App() {
  const [counters, setCounters] = useState<Counter[]>([])
  const [newCounterName, setNewCounterName] = useState('')
  const [selectedColor, setSelectedColor] = useState(colorOptions[0].value)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingCounter, setEditingCounter] = useState<Counter | null>(null)
  const [isInstallPromptVisible, setIsInstallPromptVisible] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)

  // Load counters from localStorage on mount
  useEffect(() => {
    const savedCounters = localStorage.getItem('tallyCounters')
    if (savedCounters) {
      const parsedCounters = JSON.parse(savedCounters)
      // Migrate old single-counter format to dual-counter format
      const migratedCounters = parsedCounters.map((counter: any) => {
        if (typeof counter.count === 'number') {
          // Old format - migrate to new format
          return {
            ...counter,
            count1: counter.count,
            count2: 0,
            count: undefined // Remove old property
          }
        }
        // Already in new format
        return counter
      })
      setCounters(migratedCounters)
    }
  }, [])

  // Save counters to localStorage whenever counters change
  useEffect(() => {
    localStorage.setItem('tallyCounters', JSON.stringify(counters))
  }, [counters])

  // PWA Install prompt handling
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setIsInstallPromptVisible(true)
    }

    const handleAppInstalled = () => {
      setIsInstallPromptVisible(false)
      setDeferredPrompt(null)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  // Handle PWA install
  const handleInstallApp = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      if (outcome === 'accepted') {
        setIsInstallPromptVisible(false)
      }
      setDeferredPrompt(null)
    }
  }

  // Handle sharing
  const handleShare = async () => {
    // Force a page reload to ensure we get the latest URL
    const currentUrl = `${window.location.origin}${window.location.pathname}${window.location.search}`
    
    const shareData = {
      title: 'Digital Tally Sheet App',
      text: 'Check out this digital tally counter app!',
      url: currentUrl,
    }

    if (navigator.share) {
      try {
        await navigator.share(shareData)
      } catch (err) {
        console.log('Error sharing:', err)
      }
    } else {
      // Fallback for browsers that don't support Web Share API
      navigator.clipboard.writeText(currentUrl)
      alert('Link copied to clipboard!')
    }
  }

  const addCounter = () => {
    if (newCounterName.trim()) {
      const newCounter: Counter = {
        id: Date.now().toString(),
        name: newCounterName.trim(),
        count1: 0,
        count2: 0,
        color: selectedColor
      }
      setCounters([...counters, newCounter])
      setNewCounterName('')
      setSelectedColor(colorOptions[0].value)
      setIsDialogOpen(false)
    }
  }

  const updateCounter = (id: string, counterType: 'count1' | 'count2', change: number) => {
    // Haptic feedback for mobile devices
    if ('vibrate' in navigator && change !== 0) {
      navigator.vibrate(50) // Short vibration for feedback
    }
    
    setCounters(counters.map(counter => 
      counter.id === id 
        ? { ...counter, [counterType]: Math.max(0, counter[counterType] + change) }
        : counter
    ))
  }

  const resetCounter = (id: string, counterType?: 'count1' | 'count2') => {
    setCounters(counters.map(counter => 
      counter.id === id 
        ? counterType 
          ? { ...counter, [counterType]: 0 }
          : { ...counter, count1: 0, count2: 0 }
        : counter
    ))
  }

  const deleteCounter = (id: string) => {
    setCounters(counters.filter(counter => counter.id !== id))
  }

  const updateCounterColor = (id: string, color: string) => {
    setCounters(counters.map(counter => 
      counter.id === id ? { ...counter, color } : counter
    ))
    setEditingCounter(null)
  }

  const getColorClasses = (color: string) => {
    const colorOption = colorOptions.find(opt => opt.value === color)
    return colorOption || colorOptions[0]
  }

  const totalCount = counters.reduce((sum, counter) => sum + counter.count1 + counter.count2, 0)

  return (
    <div className="min-h-screen bg-slate-50 p-3 pb-6 safe-area-inset">
      <div className="max-w-4xl mx-auto">
        {/* PWA Install Banner */}
        {isInstallPromptVisible && (
          <div className="bg-blue-600 text-white p-4 rounded-lg mb-4 flex items-center justify-between">
            <div className="flex-1">
              <p className="font-medium">Install Tally Sheet App</p>
              <p className="text-sm opacity-90">Add to your home screen for quick access</p>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="secondary"
                onClick={() => setIsInstallPromptVisible(false)}
                className="text-slate-900"
              >
                Later
              </Button>
              <Button
                size="sm"
                variant="secondary"
                onClick={handleInstallApp}
                className="text-slate-900"
              >
                <Download className="w-4 h-4 mr-1" />
                Install
              </Button>
            </div>
          </div>
        )}

        {/* Header - Mobile Optimized */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-3 mb-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Digital Tally Sheet</h1>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleShare}
              className="h-8 w-8 p-0 hover:bg-slate-200 touch-manipulation"
              title="Share app"
            >
              <Share2 className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-sm sm:text-base text-slate-600">Track multiple counters with traditional tally marks</p>
          {counters.length > 0 && (
            <Badge variant="secondary" className="mt-3 text-base sm:text-lg px-3 py-1.5">
              Total Count: {totalCount}
            </Badge>
          )}
        </div>

        {/* Add Counter Button - Mobile Optimized */}
        <div className="flex justify-center mb-6">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 h-12 px-6 text-base font-medium">
                <Plus className="w-5 h-5 mr-2" />
                Add New Counter
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="text-lg">Create New Counter</DialogTitle>
              </DialogHeader>
              <div className="space-y-5">
                <div>
                  <Label htmlFor="counterName" className="text-sm font-medium">Counter Name</Label>
                  <Input
                    id="counterName"
                    value={newCounterName}
                    onChange={(e) => setNewCounterName(e.target.value)}
                    placeholder="Enter counter name..."
                    onKeyPress={(e) => e.key === 'Enter' && addCounter()}
                    className="mt-1.5 h-11"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium">Choose Color</Label>
                  <div className="grid grid-cols-4 gap-3 mt-3">
                    {colorOptions.map((color) => (
                      <button
                        key={color.value}
                        onClick={() => setSelectedColor(color.value)}
                        className={`w-14 h-14 rounded-lg ${color.bg} border-2 transition-all touch-manipulation ${
                          selectedColor === color.value ? 'border-slate-900 scale-110' : 'border-slate-300'
                        }`}
                        title={color.name}
                      />
                    ))}
                  </div>
                </div>
                <Button onClick={addCounter} className="w-full h-11 text-base font-medium">
                  Create Counter
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Counters Grid - Mobile Optimized */}
        {counters.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-5xl mb-4">📊</div>
            <h3 className="text-lg font-semibold text-slate-700 mb-2">No counters yet</h3>
            <p className="text-sm text-slate-500">Create your first counter to get started</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {counters.map((counter) => {
              const colorClasses = getColorClasses(counter.color)
              return (
                <Card key={counter.id} className={`border-2 ${colorClasses.border} shadow-lg hover:shadow-xl transition-all duration-200`}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base sm:text-lg font-semibold text-slate-900 truncate">
                        {counter.name}
                      </CardTitle>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingCounter(counter)}
                          className="h-9 w-9 p-0 hover:bg-slate-100 touch-manipulation"
                        >
                          <Palette className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteCounter(counter.id)}
                          className="h-9 w-9 p-0 hover:bg-red-100 hover:text-red-600 touch-manipulation"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Always side-by-side layout for mobile and desktop */}
                    <div className="grid grid-cols-2 gap-3">
                      {/* Counter 1 - Getrunken */}
                      <div className="border-r border-slate-200 pr-2">
                        <div className="text-center mb-3">
                          <div className="text-xs font-medium text-slate-600 mb-2">Getrunken</div>
                          <TallyMarks count={counter.count1} color={counter.color} />
                          <div className={`text-xs font-medium ${colorClasses.text} mt-2`}>
                            Count: {counter.count1}
                          </div>
                        </div>
                        
                        {/* Counter 1 Control Buttons */}
                        <div className="space-y-2">
                          <div className="flex gap-1">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateCounter(counter.id, 'count1', -1)}
                              disabled={counter.count1 === 0}
                              className="flex-1 h-8 hover:bg-red-50 hover:border-red-300 touch-manipulation active:scale-95 transition-transform text-xs px-1"
                            >
                              <Minus className="w-3 h-3" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateCounter(counter.id, 'count1', 1)}
                              className={`flex-1 h-8 hover:bg-green-50 hover:border-green-300 touch-manipulation active:scale-95 transition-transform text-xs px-1`}
                            >
                              <Plus className="w-3 h-3" />
                            </Button>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => resetCounter(counter.id, 'count1')}
                            className="w-full h-7 hover:bg-slate-100 touch-manipulation active:scale-95 transition-transform text-xs px-1"
                            title="Reset Counter 1 to 0"
                          >
                            <RotateCcw className="w-3 h-3 mr-1" />
                            Reset
                          </Button>
                        </div>
                      </div>

                      {/* Counter 2 - Bezahlt */}
                      <div className="pl-2">
                        <div className="text-center mb-3">
                          <div className="text-xs font-medium text-slate-600 mb-2">Bezahlt</div>
                          <TallyMarks count={counter.count2} color="#ef4444" />
                          <div className="text-xs font-medium text-red-500 mt-2">
                            Count: {counter.count2}
                          </div>
                        </div>
                        
                        {/* Counter 2 Control Buttons */}
                        <div className="space-y-2">
                          <div className="flex gap-1">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateCounter(counter.id, 'count2', -1)}
                              disabled={counter.count2 === 0}
                              className="flex-1 h-8 hover:bg-red-50 hover:border-red-300 touch-manipulation active:scale-95 transition-transform text-xs px-1"
                            >
                              <Minus className="w-3 h-3" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateCounter(counter.id, 'count2', 1)}
                              className={`flex-1 h-8 hover:bg-green-50 hover:border-green-300 touch-manipulation active:scale-95 transition-transform text-xs px-1`}
                            >
                              <Plus className="w-3 h-3" />
                            </Button>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => resetCounter(counter.id, 'count2')}
                            className="w-full h-7 hover:bg-slate-100 touch-manipulation active:scale-95 transition-transform text-xs px-1"
                            title="Reset Counter 2 to 0"
                          >
                            <RotateCcw className="w-3 h-3 mr-1" />
                            Reset
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Difference display */}
                    <div className="text-center pt-2 border-t border-slate-200">
                      <div className="text-xs font-medium text-slate-500">
                        Difference: {counter.count2 - counter.count1}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}

        {/* Color Picker Dialog - Mobile Optimized */}
        {editingCounter && (
          <Dialog open={!!editingCounter} onOpenChange={() => setEditingCounter(null)}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="text-lg">Change Color for "{editingCounter.name}"</DialogTitle>
              </DialogHeader>
              <div className="space-y-5">
                <div>
                  <Label className="text-sm font-medium">Choose New Color</Label>
                  <div className="grid grid-cols-4 gap-4 mt-4">
                    {colorOptions.map((color) => (
                      <button
                        key={color.value}
                        onClick={() => updateCounterColor(editingCounter.id, color.value)}
                        className={`w-16 h-16 rounded-lg ${color.bg} border-2 transition-all hover:scale-105 touch-manipulation ${
                          editingCounter.color === color.value ? 'border-slate-900 scale-110' : 'border-slate-300'
                        }`}
                        title={color.name}
                      >
                        <span className="sr-only">{color.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  )
}

export default App