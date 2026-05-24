"use client"

import { MessageCircle } from "lucide-react"

const WHATSAPP_NUMBER = "201272097150"

export function WhatsAppButton() {
  const handleClick = () => {
    const message = encodeURIComponent("مرحباً، أريد الاستفسار عن خدمات سمارت لاند")
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${message}`, "_blank")
  }

  return (
    <button
      onClick={handleClick}
      className="fixed bottom-6 left-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-[#25D366] focus:ring-offset-2"
      aria-label="تواصل عبر واتساب"
    >
      <MessageCircle className="h-7 w-7" />
    </button>
  )
}
