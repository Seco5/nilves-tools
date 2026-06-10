'use client'
import { useState } from 'react'
import DeveloperTab from './DeveloperTab'
import EcommerceTab from './EcommerceTab'
import { useTT } from '@/lib/toolText'

export default function BarcodeQr() {
  const { en } = useTT()
  const [tab, setTab] = useState<'dev' | 'ecom'>('dev')

  return (
    <div className="bq-root">
      <div className="bq-tabs">
        <button className={`bq-tab${tab === 'dev' ? ' active' : ''}`} onClick={() => setTab('dev')}>{en ? 'Developer Tools' : 'Geliştirici Araçları'}</button>
        <button className={`bq-tab${tab === 'ecom' ? ' active' : ''}`} onClick={() => setTab('ecom')}>{en ? 'E-Commerce' : 'E-Ticaret'}</button>
      </div>
      <div className="bq-body">
        {tab === 'dev' ? <DeveloperTab /> : <EcommerceTab />}
      </div>
    </div>
  )
}
