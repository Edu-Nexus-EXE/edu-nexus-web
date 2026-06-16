import { useState } from 'react'
import { Link } from 'react-router'
import { useTranslation } from 'react-i18next'

import { putUsersMe } from '~/api/operations/users/users'
import type { UpdateCurrentUserRequest } from '~/api/model'
import { useToast } from '~/shared/components'
import { setAuthSession, type AuthSession, type AuthUser } from '~/shared/lib/auth-session'

type SettingsPersonalInfoProps = {
  session: AuthSession
  user: AuthUser
  onUserUpdated: (user: AuthUser) => void
}

function getSurveyStatusTone(isCompleted: boolean) {
  return isCompleted
    ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
    : 'border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300'
}

type FormState = {
  fullName: string
  portfolioUrlSlug: string
  avatarUrl: string
}

const TIER_LABELS: Record<string, { vi: string; en: string }> = {
  free: { vi: 'Miễn phí', en: 'Free' },
  student: { vi: 'Sinh viên', en: 'Student' },
  pro: { vi: 'Pro', en: 'Pro' }
}

function getTierLabel(tierCode: string | undefined, lang: string): string {
  if (!tierCode) return '—'
  const key = tierCode.toLowerCase()
  const entry = TIER_LABELS[key]
  return entry ? (lang === 'vi' ? entry.vi : entry.en) : tierCode
}

function createInitialState(user: AuthUser): FormState {
  return {
    fullName: user.fullName,
    portfolioUrlSlug: user.portfolioUrlSlug ?? '',
    avatarUrl: user.avatarUrl ?? ''
  }
}

function normalizeSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/--+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function SettingsPersonalInfo({ session, user, onUserUpdated }: SettingsPersonalInfoProps) {
  const { t, i18n } = useTranslation('settings')
  const toast = useToast()
  const [form, setForm] = useState<FormState>(() => createInitialState(user))
  const [saving, setSaving] = useState(false)

  const lang = i18n.language ?? 'vi'
  const tierLabel = getTierLabel(user.subscription?.tierCode, lang)
  const hasChanges =
    form.fullName.trim() !== user.fullName ||
    form.portfolioUrlSlug.trim() !== (user.portfolioUrlSlug ?? '') ||
    form.avatarUrl.trim() !== (user.avatarUrl ?? '')

  async function handleSave() {
    if (!form.fullName.trim()) {
      toast.error(t('personal.errors.fullNameRequired'))
      return
    }

    const payload: UpdateCurrentUserRequest = {
      fullName: form.fullName.trim(),
      portfolioUrlSlug: normalizeSlug(form.portfolioUrlSlug) || null,
      avatarUrl: form.avatarUrl.trim() || null
    }

    try {
      setSaving(true)
      await putUsersMe(payload)
      const mapped: AuthUser = {
        ...user,
        fullName: payload.fullName ?? user.fullName,
        portfolioUrlSlug: payload.portfolioUrlSlug ?? undefined,
        avatarUrl: payload.avatarUrl ?? undefined
      }

      const nextSession: AuthSession = {
        ...session,
        user: {
          ...session.user,
          ...mapped,
          subscription: mapped.subscription ?? session.user.subscription ?? null
        }
      }

      setAuthSession(nextSession)
      onUserUpdated(nextSession.user)
      toast.success(t('personal.success'))
    } catch (error) {
      toast.error((error as Error).message || t('personal.errors.saveFailed'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className='bg-card p-8 rounded-2xl border border-border shadow-sm'>
      <div className='flex items-center justify-between mb-8 gap-4'>
        <div>
          <h3 className='text-lg font-bold text-foreground'>{t('personal.title')}</h3>
          <p className='text-sm text-muted-foreground mt-1'>{t('personal.description')}</p>
        </div>
        <button
          type='button'
          onClick={() => void handleSave()}
          disabled={saving || !hasChanges}
          className='px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-bold disabled:opacity-50 disabled:pointer-events-none'
        >
          {saving ? t('personal.saving') : t('personal.save')}
        </button>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
        <div className='space-y-2'>
          <label className='text-sm font-bold text-muted-foreground'>{t('personal.fullname')}</label>
          <input
            type='text'
            value={form.fullName}
            onChange={(e) => setForm((prev) => ({ ...prev, fullName: e.target.value }))}
            className='w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground outline-none focus:border-primary'
          />
        </div>

        <div className='space-y-2'>
          <label className='text-sm font-bold text-muted-foreground'>{t('personal.email')}</label>
          <input
            type='email'
            value={user.email}
            readOnly
            className='w-full px-4 py-3 rounded-xl border border-border bg-muted text-foreground outline-none cursor-not-allowed'
          />
        </div>

        <div className='space-y-2'>
          <label className='text-sm font-bold text-muted-foreground'>{t('personal.portfolio')}</label>
          <input
            type='text'
            value={form.portfolioUrlSlug}
            onChange={(e) => setForm((prev) => ({ ...prev, portfolioUrlSlug: normalizeSlug(e.target.value) }))}
            placeholder={t('personal.portfolioPlaceholder')}
            className='w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground outline-none focus:border-primary placeholder:text-muted-foreground'
          />
        </div>

        <div className='space-y-2'>
          <label className='text-sm font-bold text-muted-foreground'>{t('personal.avatarUrl')}</label>
          <input
            type='url'
            value={form.avatarUrl}
            onChange={(e) => setForm((prev) => ({ ...prev, avatarUrl: e.target.value }))}
            placeholder='https://example.com/avatar.jpg'
            className='w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground outline-none focus:border-primary placeholder:text-muted-foreground'
          />
        </div>

        <div className='space-y-2'>
          <label className='text-sm font-bold text-muted-foreground'>{t('personal.role')}</label>
          <input
            type='text'
            value={user.role}
            readOnly
            className='w-full px-4 py-3 rounded-xl border border-border bg-muted text-foreground outline-none cursor-not-allowed'
          />
        </div>

        <div className='space-y-2'>
          <label className='text-sm font-bold text-muted-foreground'>{t('personal.subscription')}</label>
          <div className='flex items-center gap-3 px-4 py-3 rounded-xl border border-border bg-muted/30'>
            <span className='material-icons text-primary text-xl'>workspace_premium</span>
            <span className='text-sm font-semibold text-foreground'>{tierLabel}</span>
          </div>
        </div>
        <div className='space-y-2 md:col-span-2'>
          <label className='text-sm font-bold text-muted-foreground'>{t('personal.survey.title')}</label>
          <div className='rounded-2xl border border-border bg-muted/20 p-4'>
            <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
              <div className='space-y-2'>
                <span
                  className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${getSurveyStatusTone(user.isSurveyCompleted)}`}
                >
                  {user.isSurveyCompleted ? t('personal.survey.completed') : t('personal.survey.pending')}
                </span>
                <p className='text-sm text-muted-foreground'>{t('personal.survey.description')}</p>
              </div>
              <Link
                to='/onboarding'
                className='inline-flex items-center justify-center rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground hover:opacity-90'
              >
                {user.isSurveyCompleted ? t('personal.survey.updateCta') : t('personal.survey.startCta')}
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className='mt-10 text-xs text-muted-foreground'>{t('personal.note')}</div>
    </section>
  )
}
