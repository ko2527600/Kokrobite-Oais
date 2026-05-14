import { useState, useEffect } from "react"

export function useInstallPrompt() {
  const [installPrompt, setInstallPrompt] = 
    useState(null)
  const [isInstalled, setIsInstalled] = 
    useState(false)
  const [isInstallable, setIsInstallable] = 
    useState(false)

  useEffect(() => {
    // Check if already running as PWA
    const isStandalone = 
      window.matchMedia(
        "(display-mode: standalone)"
      ).matches ||
      window.navigator.standalone === true

    if (isStandalone) {
      setIsInstalled(true)
      return
    }

    // Listen for install prompt
    const handlePrompt = (e) => {
      e.preventDefault()
      console.log("✅ Install prompt captured!")
      setInstallPrompt(e)
      setIsInstallable(true)
    }

    window.addEventListener(
      "beforeinstallprompt", 
      handlePrompt
    )

    // Listen for successful install
    window.addEventListener(
      "appinstalled", 
      () => {
        console.log("✅ App installed!")
        setIsInstalled(true)
        setIsInstallable(false)
        setInstallPrompt(null)
      }
    )

    return () => {
      window.removeEventListener(
        "beforeinstallprompt", 
        handlePrompt
      )
    }
  }, [])

  const triggerInstall = async () => {
    if (!installPrompt) {
      console.log("No install prompt available")
      return false
    }
    
    console.log("Triggering install prompt...")
    const result = await installPrompt.prompt()
    console.log("Install result:", result.outcome)
    
    if (result.outcome === "accepted") {
      setIsInstalled(true)
      setIsInstallable(false)
      setInstallPrompt(null)
      return true
    }
    return false
  }

  return { 
    isInstallable, 
    isInstalled, 
    triggerInstall 
  }
}
