"use client"

import { useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"
import {
  PRODUCT_IMAGE_PLACEHOLDER,
  resolveProductImageUrl,
} from "@/lib/product-image"

type ProductImageProps = {
  src: string | null | undefined
  alt: string
  className?: string
  loading?: "lazy" | "eager"
  onLoad?: () => void
  showSkeleton?: boolean
}

export function ProductImage({
  src,
  alt,
  className,
  loading = "lazy",
  onLoad,
  showSkeleton = true,
}: ProductImageProps) {
  const imgRef = useRef<HTMLImageElement>(null)
  const [currentSrc, setCurrentSrc] = useState(() =>
    resolveProductImageUrl(src)
  )
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const url = resolveProductImageUrl(src)
    setCurrentSrc(url)
    setLoaded(false)
  }, [src])

  useEffect(() => {
    const img = imgRef.current
    if (img?.complete && img.naturalWidth > 0) {
      setLoaded(true)
    }
  }, [currentSrc])

  const markLoaded = () => {
    setLoaded(true)
    onLoad?.()
  }

  const handleError = () => {
    if (currentSrc !== PRODUCT_IMAGE_PLACEHOLDER) {
      setCurrentSrc(PRODUCT_IMAGE_PLACEHOLDER)
      setLoaded(false)
      return
    }
    setLoaded(true)
  }

  return (
    <>
      {showSkeleton && !loaded ? (
        <div className="absolute inset-0 z-[1] animate-pulse bg-white/5" aria-hidden />
      ) : null}
      <img
        ref={imgRef}
        src={currentSrc}
        alt={alt}
        className={cn(className)}
        loading={loading}
        referrerPolicy="no-referrer"
        decoding="async"
        onLoad={markLoaded}
        onError={handleError}
      />
    </>
  )
}
