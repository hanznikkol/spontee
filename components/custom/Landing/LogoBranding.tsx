import React from 'react'

function LogoBranding() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 pointer-events-none select-none">
        <div className="mx-auto flex h-16 max-w-7xl items-center px-6">
            <h1 className="pointer-events-auto text-lg font-bold tracking-tight">
                Spont
                <span className="bg-linear-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text text-transparent">
                ee
                </span>
            </h1>
        </div>
  </header>
  )
}

export default LogoBranding