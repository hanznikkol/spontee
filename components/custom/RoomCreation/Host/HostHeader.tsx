import { UserRound } from 'lucide-react'
import React from 'react'

function HostHeader() {
  return (
    <div className="text-center space-y-3">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
            <UserRound className="h-6 w-6" aria-hidden="true"/>
        </div>

        <div className='space-y-2'>
            <h1 className="text-2xl font-bold">
                Your Display Name
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
                Choose the name everyone will see while you&apos;re hosting.
            </p>
        </div>
    </div>
  )
}

export default HostHeader