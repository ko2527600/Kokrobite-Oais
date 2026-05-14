import { useState, useEffect } from "react"
import { useInstallPrompt } from "../hooks/useInstallPrompt"

export default function InstallBanner() {
  const { isInstallable, isInstalled, 
          triggerInstall } = useInstallPrompt()
  const [dismissed, setDismissed] = useState(
    localStorage.getItem(
      "ko_install_dismissed"
    ) === "true"
  )
  const [showManual, setShowManual] = 
    useState(false)

  // Detect iOS
  const isIOS = /iPad|iPhone|iPod/.test(
    navigator.userAgent
  )

  // Detect if running in browser (not PWA)
  const isInBrowser = !window.matchMedia(
    "(display-mode: standalone)"
  ).matches

  useEffect(() => {
    // Show manual instructions for iOS
    // after 3 seconds on page
    if (isIOS && isInBrowser && !dismissed) {
      const timer = setTimeout(() => {
        setShowManual(true)
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [isIOS, isInBrowser, dismissed])

  const handleDismiss = () => {
    setDismissed(true)
    setShowManual(false)
    localStorage.setItem(
      "ko_install_dismissed", "true"
    )
  }

  // Don't show if already installed
  if (isInstalled || dismissed) return null

  // Android/Desktop — automatic prompt
  if (isInstallable) {
    return (
      <div className="fixed bottom-20 
        left-4 right-4 z-50 rounded-2xl p-4"
        style={{
          background: "rgba(28,10,0,0.97)",
          border: "1px solid rgba(249,115,22,0.30)",
          backdropFilter: "blur(20px)",
          boxShadow: "0 20px 60px rgba(0,0,0,0.50)"
        }}>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl 
            flex items-center justify-center 
            flex-shrink-0 text-2xl"
            style={{ 
              background: "linear-gradient(135deg, #F97316, #FB923C)" 
            }}>
            🌴
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white font-bold 
              text-sm">
              Install KO Eats
            </p>
            <p className="text-white/50 text-xs mt-0.5">
              Add to home screen for 
              the best experience
            </p>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <button
              onClick={handleDismiss}
              className="text-white/30 text-xs 
                px-3 py-1.5 rounded-lg
                hover:text-white/60">
              Later
            </button>
            <button
              onClick={async () => {
                const ok = await triggerInstall()
                if (!ok) setShowManual(true)
              }}
              className="text-white font-bold 
                text-xs px-4 py-1.5 rounded-lg"
              style={{ 
                background: "linear-gradient(135deg, #F97316, #FB923C)" 
              }}>
              Install
            </button>
          </div>
        </div>
      </div>
    )
  }

  // iOS — manual instructions
  if (isIOS && showManual) {
    return (
      <div className="fixed bottom-0 left-0 
        right-0 z-50 rounded-t-3xl p-6"
        style={{
          background: "rgba(28,10,0,0.98)",
          border: "1px solid rgba(249,115,22,0.20)",
          backdropFilter: "blur(20px)"
        }}>
        <div className="flex justify-between 
          items-center mb-4">
          <p className="text-white font-bold 
            text-base">
            Install KO Eats on iPhone
          </p>
          <button onClick={handleDismiss}
            className="text-white/30 text-2xl 
              leading-none">
            ×
          </button>
        </div>

        <div className="space-y-3">
          {[
            { 
              step: "1", 
              icon: "⬆️", 
              text: "Tap the Share button at the bottom of Safari" 
            },
            { 
              step: "2", 
              icon: "➕", 
              text: "Scroll down and tap \"Add to Home Screen\"" 
            },
            { 
              step: "3", 
              icon: "✅", 
              text: "Tap \"Add\" to install KO Eats on your home screen" 
            },
          ].map((item) => (
            <div key={item.step}
              className="flex items-center gap-4 
                p-3 rounded-xl"
              style={{ 
                background: "rgba(249,115,22,0.08)" 
              }}>
              <div className="w-8 h-8 rounded-full 
                flex items-center justify-center 
                text-sm font-bold flex-shrink-0"
                style={{ 
                  background: "#F97316",
                  color: "white"
                }}>
                {item.step}
              </div>
              <span className="text-sm">
                {item.icon}
              </span>
              <p className="text-white/70 text-sm">
                {item.text}
              </p>
            </div>
          ))}
        </div>

        <p className="text-white/30 text-xs 
          text-center mt-4">
          Works on Safari browser only on iPhone
        </p>
      </div>
    )
  }

  return null
}
