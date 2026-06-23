import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { createPortal } from 'react-dom'
import { PlusCircle } from 'lucide-react'
import Modal, { FormRow, FieldError } from '../../ui/Modal'
import { Avatar } from '../../ui/Avatar'
import PermissionButton from '../../ui/PermissionButton'

export default function TopUpModal({ open, onClose, user, onConfirm, loading }) {
  const { t } = useTranslation()
  const [amount, setAmount] = useState('')
  const [currency, setCurrency] = useState('USD')
  const [error, setError]   = useState('')

  useEffect(() => {
    if (open) { setAmount(''); setError('') }
  }, [open])

  const QUICK_AMOUNTS = [500, 1000, 2500, 5000]

 const handleConfirm = () => {
  const parsed = Number(amount)
  if (!amount || isNaN(parsed) || parsed <= 0) {
    setError(t('topUp.errors.invalidAmount'))
    return
  }
  onConfirm(parsed, currency)  // ← زدنا currency
}

  return createPortal(
    <Modal
      open={open && !!user}
      onClose={onClose}
      title={t('topUp.title')}
      width={440}
      footer={
        <>
          <PermissionButton onClick={onClose} className="btn-outline" style={{ minWidth: '80px' }}>
            {t('common.cancel')}
          </PermissionButton>
          <PermissionButton
            onClick={handleConfirm}
            disabled={loading}
            className="btn-primary"
            style={{ minWidth: '140px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
          >
            {loading ? (
              <span style={{ width: '13px', height: '13px', border: '2px solid rgba(255,255,255,0.4)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} />
            ) : (
              <PlusCircle size={15} />
            )}
            {loading ? t('common.loading') : t('topUp.confirmBtn')}
          </PermissionButton>
        </>
      }
    >{/* بطاقة بيانات المستخدم */}
<div style={{
  display: 'flex', alignItems: 'center', gap: '14px',
  padding: '12px 14px', borderRadius: '14px',
  background: 'var(--bg-muted)', marginBottom: '20px',
}}>
  <Avatar src={user?.image} name={user?.name} initials={user?.avatar} size="md" />
  
  <div style={{ flex: 1 }}>
    <p style={{ margin: 0, fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
      {user?.name || `${user?.first_name} ${user?.last_name}`}
    </p>
    <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-muted)' }}>
      {user?.email || user?.phone}
    </p>
  </div>

  {/* الرصيد الحالي — كل عملة */}
  <div style={{ textAlign: 'end' }}>
    <p style={{ margin: 0, fontSize: '0.72rem', color: 'var(--text-muted)' }}>
      {t('topUp.currentBalance')}
    </p>
    {user?.balances && Object.entries(user.balances).map(([currency, amount]) => (
      <p key={currency} style={{ margin: 0, fontWeight: 800, fontSize: '0.95rem', color: '#094037' }}>
        {Number(amount).toLocaleString('ar-SY')} {currency}
      </p>
    ))}
  </div>
</div>

      {/* مبالغ سريعة */}
      <FormRow label={t('topUp.quickAmounts')}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {QUICK_AMOUNTS.map((q) => (
            <button
              key={q}
              onClick={() => { setAmount(String(q)); setError('') }}
              style={{
                padding: '7px 14px', borderRadius: '10px',
                border: amount === String(q) ? '1.5px solid #094037' : '1px solid var(--border-default)',
                background: amount === String(q) ? '#e8f0ef' : 'transparent',
                color: amount === String(q) ? '#094037' : 'var(--text-secondary)',
                fontWeight: amount === String(q) ? 700 : 500,
                fontSize: '0.85rem', cursor: 'pointer',
                fontFamily: 'Cairo, sans-serif', transition: '0.15s',
              }}
            >
              {q.toLocaleString('ar-SY')} USD
            </button>
          ))}
        </div>
      </FormRow>

      {/* حقل المبلغ */}
      <FormRow label={t('topUp.amountLabel')} required>
        <input
          className="input"
          type="number"
          min="1"
          placeholder={t('topUp.amountPlaceholder')}
          value={amount}
          onChange={(e) => { setAmount(e.target.value); setError('') }}
          dir="ltr"
        />
        <select
    value={currency}
    onChange={(e) => setCurrency(e.target.value)}
    className="input"
    style={{ fontFamily: 'Cairo, sans-serif' }}
  >
    {['USD', 'EUR', 'SAR', 'AED', 'EGP', 'SYP'].map(c => (
      <option key={c} value={c}>{c}</option>
    ))}
  </select>
        <FieldError msg={error} />
      </FormRow>

      {/* معاينة الرصيد بعد الشحن */}
      {amount && !isNaN(Number(amount)) && Number(amount) > 0 && (
  <div style={{
    padding: '10px 14px', borderRadius: '10px', background: '#e8f0ef',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    marginTop: '4px',
  }}>
    <span style={{ fontSize: '0.82rem', color: '#094037', fontWeight: 600 }}>
      {t('topUp.balanceAfter')}
    </span>
    <span style={{ fontSize: '1rem', fontWeight: 800, color: '#094037' }}>
      {(Number(user?.balances?.[currency] || 0) + Number(amount)).toLocaleString('en-US')} {currency}
    </span>
  </div>
)}
    </Modal>,
    document.body
  )
}