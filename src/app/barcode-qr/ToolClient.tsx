'use client'
import { useState } from 'react'
import DeveloperTab from './DeveloperTab'
import EcommerceTab from './EcommerceTab'

export default function BarcodeQr() {
  const [tab, setTab] = useState<'dev' | 'ecom'>('dev')

  return (
    <div className="bq-root">
      <div className="bq-tabs">
        <button className={`bq-tab${tab === 'dev' ? ' active' : ''}`} onClick={() => setTab('dev')}>Developer Tools</button>
        <button className={`bq-tab${tab === 'ecom' ? ' active' : ''}`} onClick={() => setTab('ecom')}>E-Commerce</button>
      </div>
      <div className="bq-body">
        {tab === 'dev' ? <DeveloperTab /> : <EcommerceTab />}
      </div>
    </div>
  )
}
