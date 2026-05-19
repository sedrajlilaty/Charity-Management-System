import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { PageHeader } from '../../ui/PageHeader'
import { Card } from '../../ui/Card'
import { useTheme } from '../../context/ThemeContext'

import {
  Globe,
  Bell,
  Shield,
  Save,
  DollarSign,
  Users,
  Check,
} from 'lucide-react'

function Toggle({ on, onChange }) {
  return (
    <button
      onClick={() => onChange(!on)}
      style={{
        width: '48px',
        height: '26px',
        borderRadius: '999px',
        border: 'none',
        cursor: 'pointer',
        background: on
          ? 'var(--color-primary-500)'
          : 'var(--bg-muted)',
        position: 'relative',
        transition: '0.25s',
      }}
    >
      <span
        style={{
          position: 'absolute',
          top: '3px',
          insetInlineStart: on ? '25px' : '3px',
          width: '20px',
          height: '20px',
          borderRadius: '50%',
          background: '#fff',
          transition: '0.25s',
          boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
        }}
      />
    </button>
  )
}


function SettingRow({
  title,
  description,
  children,
  noBorder = false,
}) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '20px',
        padding: '22px 0',
        borderBottom: noBorder
          ? 'none'
          : '1px solid var(--border-subtle)',
          
      }}
    >
      <div style={{ flex: 1 }}>
        <h4
          style={{
            margin: 0,
            fontSize: '0.96rem',
            fontWeight: 700,
            color: 'var(--text-primary)',
          }}
        >
          {title}
        </h4>

        <p
          style={{
            marginTop: '6px',
            fontSize: '0.84rem',
            color: 'var(--text-muted)',
            lineHeight: 1.7,
          }}
        >
          {description}
        </p>
      </div>

      <div>{children}</div>
    </div>
  )
}

export default function Settings() {
  const { t, i18n } = useTranslation()
  const { isDark, toggleTheme } = useTheme()

  const [saved, setSaved] = useState(false)

  const [activeSection, setActiveSection] =
    useState('appearance')

  const [currency, setCurrency] = useState('SAR')
  const [orphanAmount, setOrphanAmount] =
    useState(500)

  const [maxMembers, setMaxMembers] =
    useState(10)

  const [reviewCycle, setReviewCycle] =
    useState(3)

  const [notifDonation, setNotifDonation] =
    useState(true)

  const [notifCase, setNotifCase] =
    useState(true)

  const [notifCampaign, setNotifCampaign] =
    useState(false)

  const isAr = i18n.language?.startsWith('ar')

  const toggleLang = () => {
    const next = isAr ? 'en' : 'ar'

    i18n.changeLanguage(next)

    localStorage.setItem('charity-lang', next)
  }

  const handleSave = () => {
    setSaved(true)

    setTimeout(() => setSaved(false), 2500)
  }

  const inputStyle = {
    width: '120px',
    height: '42px',
    borderRadius: '12px',
    border: '1px solid var(--border-default)',
    background: 'var(--bg-muted)',
    color: 'var(--text-primary)',
    textAlign: 'center',
    fontWeight: 700,
    fontSize: '0.92rem',
    outline: 'none',
    transition: '0.2s',
  }

  const selectStyle = {
    width: '180px',
    height: '42px',
    borderRadius: '12px',
    border: '1px solid var(--border-default)',
    background: 'var(--bg-muted)',
    color: 'var(--text-primary)',
    paddingInline: '12px',
    fontWeight: 600,
    outline: 'none',
  }

  const sections = useMemo(
    () => [
      {
        key: 'appearance',
        label: t('settings.appearance.title'),
        icon: Globe,
      },

      {
        key: 'notifications',
        label: t('settings.notifications.title'),
        icon: Bell,
      },

      {
        key: 'security',
        label: t('settings.security.title'),
        icon: Shield,
      },

      {
        key: 'financial',
        label: t('settings.financial.title'),
        icon: DollarSign,
      },

      {
        key: 'beneficiary',
        label: t('settings.beneficiary.title'),
        icon: Users,
      },
    ],
    [t]
  )

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
        background: 'var(--bg-page)',
        minHeight: '100%',
      }}
    >
      {/* Header */}
      <PageHeader
        title={t('settings.title')}
        subtitle={t('settings.subtitle')}
      />

      {/* Navigation */}
      <Card
        style={{
          padding: '16px',
          borderRadius: '24px',
          background: 'var(--bg-surface)',
          border:
            '1px solid var(--border-subtle)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            flexWrap: 'wrap',
          }}
        >
          {sections.map((section) => {
            const Icon = section.icon

            return (
              <button
                key={section.key}
                onClick={() =>
                  setActiveSection(section.key)
                }
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '12px 18px',
                  borderRadius: '14px',
                  border:
                    activeSection === section.key
                      ? '1px solid var(--border-default)'
                      : '1px solid var(--border-subtle)',
                  background:
                    activeSection === section.key
                      ? 'var(--bg-muted)'
                      : 'transparent',
                  color:
                    activeSection === section.key
                      ? 'var(--text-primary)'
                      : 'var(--text-secondary)',
                  fontWeight:
                    activeSection === section.key
                      ? 700
                      : 500,
                  cursor: 'pointer',
                  transition: '0.2s',
                }}
              >
                <Icon size={17} />
                <span>{section.label}</span>
              </button>
            )
          })}
        </div>
      </Card>

      {/* Content */}
      <Card
        style={{
          padding: '30px',
          borderRadius: '24px',
          background: 'var(--bg-surface)',
          border:
            '1px solid var(--border-subtle)',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '28px',
            gap: '16px',
            flexWrap: 'wrap',
          }}
        >
          <div>
            <h2
              style={{
                margin: 0,
                fontSize: '1.25rem',
                fontWeight: 800,
                color: 'var(--text-primary)',
              }}
            >
              {
                sections.find(
                  (s) =>
                    s.key === activeSection
                )?.label
              }
            </h2>

            <p
              style={{
                marginTop: '8px',
                color: 'var(--text-muted)',
                fontSize: '0.9rem',
              }}
            >
              Manage and customize your dashboard
              settings.
            </p>
          </div>

          <button
            onClick={handleSave}
            className="btn-primary"
            style={{
              padding: '11px 22px',
              borderRadius: '14px',
              background:
                'var(--color-primary-500)',
            }}
          >
            <Save size={16} />
            {t('settings.save')}
          </button>
        </div>

        {/* APPEARANCE */}
        {activeSection === 'appearance' && (
          <>
            <SettingRow
              title={t(
                'settings.appearance.darkMode'
              )}
              description={t(
                'settings.appearance.darkDesc'
              )}
            >
              <Toggle
                on={isDark}
                onChange={toggleTheme}
              />
            </SettingRow>

            <SettingRow
              title={t(
                'settings.appearance.language'
              )}
              description={t(
                'settings.appearance.langDesc',
                {
                  lang: isAr
                    ? 'العربية'
                    : 'English',
                }
              )}
              noBorder
            >
              <button
                onClick={toggleLang}
                style={{
                  height: '42px',
                  paddingInline: '18px',
                  borderRadius: '12px',
                  border:
                    '1px solid var(--border-default)',
                  background:
                    'var(--bg-muted)',
                  color:
                    'var(--text-primary)',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                {isAr
                  ? 'Switch to English'
                  : 'التبديل للعربية'}
              </button>
            </SettingRow>
          </>
        )}

        {/* NOTIFICATIONS */}
        {activeSection === 'notifications' && (
          <>
            <SettingRow
              title={t(
                'settings.notifications.donation'
              )}
              description={t(
                'settings.notifications.donationDesc'
              )}
            >
              <Toggle
                on={notifDonation}
                onChange={setNotifDonation}
              />
            </SettingRow>

            <SettingRow
              title={t(
                'settings.notifications.case'
              )}
              description={t(
                'settings.notifications.caseDesc'
              )}
            >
              <Toggle
                on={notifCase}
                onChange={setNotifCase}
              />
            </SettingRow>

            <SettingRow
              title={t(
                'settings.notifications.campaign'
              )}
              description={t(
                'settings.notifications.campaignDesc'
              )}
              noBorder
            >
              <Toggle
                on={notifCampaign}
                onChange={setNotifCampaign}
              />
            </SettingRow>
          </>
        )}

        {/* SECURITY */}
        {activeSection === 'security' && (
          <>
            <SettingRow
              title={t(
                'settings.security.autoSignOut'
              )}
              description={t(
                'settings.security.autoSignOutDesc'
              )}
            >
              <Toggle
                on={true}
                onChange={() => {}}
              />
            </SettingRow>

            <SettingRow
              title={t(
                'settings.security.timeout'
              )}
              description={t(
                'settings.security.timeoutDesc'
              )}
              noBorder
            >
              <input
                type="number"
                defaultValue={60}
                style={inputStyle}
              />
            </SettingRow>
          </>
        )}

        {/* FINANCIAL */}
        {activeSection === 'financial' && (
          <>
            <SettingRow
              title={t(
                'settings.financial.currency'
              )}
              description={t(
                'settings.financial.currencyDesc'
              )}
            >
              <select
                value={currency}
                onChange={(e) =>
                  setCurrency(e.target.value)
                }
                style={selectStyle}
              >
                <option value="SAR">SAR</option>
                <option value="USD">USD</option>
                <option value="AED">AED</option>
                <option value="KWD">KWD</option>
              </select>
            </SettingRow>

            <SettingRow
              title={t(
                'settings.financial.orphanAmount'
              )}
              description={t(
                'settings.financial.orphanDesc'
              )}
              noBorder
            >
              <input
                type="number"
                value={orphanAmount}
                onChange={(e) =>
                  setOrphanAmount(
                    Number(e.target.value)
                  )
                }
                style={inputStyle}
              />
            </SettingRow>
          </>
        )}

        {/* BENEFICIARY */}
        {activeSection === 'beneficiary' && (
          <>
            <SettingRow
              title={t(
                'settings.beneficiary.maxMembers'
              )}
              description={t(
                'settings.beneficiary.maxMembersDesc'
              )}
            >
              <input
                type="number"
                value={maxMembers}
                onChange={(e) =>
                  setMaxMembers(
                    Number(e.target.value)
                  )
                }
                style={inputStyle}
              />
            </SettingRow>

            <SettingRow
              title={t(
                'settings.beneficiary.reviewCycle'
              )}
              description={t(
                'settings.beneficiary.reviewDesc'
              )}
              noBorder
            >
              <input
                type="number"
                value={reviewCycle}
                onChange={(e) =>
                  setReviewCycle(
                    Number(e.target.value)
                  )
                }
                style={inputStyle}
              />
            </SettingRow>
          </>
        )}

        {/* Success Message */}
        {saved && (
          <div
            style={{
              marginTop: '24px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              background:
                'var(--bg-subtle)',
              color:
                'var(--text-primary)',
              border:
                '1px solid var(--border-default)',
              padding: '14px 18px',
              borderRadius: '16px',
              fontWeight: 700,
            }}
          >
            <Check size={18} />
            {t('settings.saved')}
          </div>
        )}
      </Card>
    </div>
  )
}