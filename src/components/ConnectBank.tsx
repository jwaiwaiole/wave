'use client'

import { useCallback, useEffect, useState } from 'react'
import { usePlaidLink, PlaidLinkOnSuccess } from 'react-plaid-link'

interface Props {
  onConnected: () => void
}

export default function ConnectBank({ onConnected }: Props) {
  const [linkToken, setLinkToken] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/plaid/create-link-token', { method: 'POST' })
      .then(r => r.json())
      .then(d => setLinkToken(d.link_token))
  }, [])

  const onSuccess = useCallback<PlaidLinkOnSuccess>(async (publicToken, metadata) => {
    await fetch('/api/plaid/exchange-token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        public_token: publicToken,
        institution_name: metadata?.institution?.name ?? 'Unknown',
      }),
    })
    onConnected()
  }, [onConnected])

  const { open, ready } = usePlaidLink({ token: linkToken ?? '', onSuccess })

  return (
    <button
      onClick={() => open()}
      disabled={!ready}
      className="w-full py-3 rounded-xl font-semibold border-2 border-dashed border-stone-200 text-stone-500 hover:border-cyan-400 hover:text-cyan-600 transition-all disabled:opacity-40"
    >
      + Connect a bank account
    </button>
  )
}
