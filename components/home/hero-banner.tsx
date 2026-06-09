"use client"

export function HeroBanner() {

  return (
    <section className="mb-8">
      {/* Hero Banner */}
      <div className="relative mb-6 overflow-hidden rounded-2xl h-48 sm:h-64 lg:h-72">
        <img 
            src="https://placehold.jp/1320x320.png?text=1320+x+320" 
            alt="Hero Banner" 
            className="w-full h-full object-cover"
        />
      </div>
    </section>
  )
}
