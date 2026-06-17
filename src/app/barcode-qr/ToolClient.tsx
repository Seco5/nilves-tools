'use client'
import { useState } from 'react'
import { Printer } from 'lucide-react'
import DeveloperTab from './DeveloperTab'
import EcommerceTab from './EcommerceTab'
import ZplTab from './ZplTab'
import { useTT } from '@/lib/toolText'

export default function BarcodeQr() {
  const { en } = useTT()
  const [tab, setTab] = useState<'dev' | 'ecom' | 'zpl'>('dev')

  return (
    <div className="bq-root">
      <div className="bq-tabs">
        <button className={`bq-tab${tab === 'dev' ? ' active' : ''}`} onClick={() => setTab('dev')}>{en ? 'Developer Tools' : 'Geliştirici Araçları'}</button>
        <button className={`bq-tab${tab === 'ecom' ? ' active' : ''}`} onClick={() => setTab('ecom')}>{en ? 'E-Commerce' : 'E-Ticaret'}</button>
        <button className={`bq-tab${tab === 'zpl' ? ' active' : ''}`} onClick={() => setTab('zpl')} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <Printer size={15} />ZPL Viewer
        </button>
      </div>
      <div className="bq-body">
        {tab === 'dev' ? <DeveloperTab /> : tab === 'ecom' ? <EcommerceTab /> : <ZplTab />}
      </div>
    </div>
  )
}
