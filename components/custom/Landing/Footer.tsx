import React from 'react'

function Footer() {
  return (
    <footer className="relative z-10 border-t py-6 text-center">
        <p className="mt-2 text-sm text-muted-foreground">
            © {new Date().getFullYear()} Spontee · Developed by{" "}
            <a
            href="https://hanznikkolmaas.vercel.app"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline"
            >
            Hanz Nikkol Maas
            </a>
        </p>
    </footer>
  )
}

export default Footer