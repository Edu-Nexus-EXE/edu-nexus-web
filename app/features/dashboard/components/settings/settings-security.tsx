import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

const PASSWORD_MIN_LENGTH = 8

type PasswordForm = {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

function hasUppercase(value: string) {
  return /[A-Z]/.test(value)
}

function hasNumber(value: string) {
  return /\d/.test(value)
}

export function SettingsSecurity() {
  const { t } = useTranslation('settings')
  const [form, setForm] = useState<PasswordForm>({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitState, setSubmitState] = useState<'idle' | 'ready'>('idle')

  const validationError = useMemo(() => {
    if (!form.currentPassword && !form.newPassword && !form.confirmPassword) {
      return null
    }
    if (!form.currentPassword || !form.newPassword || !form.confirmPassword) {
      return t('security.errors.allFieldsRequired')
    }
    if (form.newPassword.length < PASSWORD_MIN_LENGTH) {
      return t('security.errors.passwordLength')
    }
    if (!hasUppercase(form.newPassword)) {
      return t('security.errors.passwordUppercase')
    }
    if (!hasNumber(form.newPassword)) {
      return t('security.errors.passwordNumber')
    }
    if (form.newPassword !== form.confirmPassword) {
      return t('security.errors.passwordConfirm')
    }
    return null
  }, [form.confirmPassword, form.currentPassword, form.newPassword, t])

  const isComplete = Boolean(form.currentPassword && form.newPassword && form.confirmPassword)
  const canReview = isComplete && !validationError

  async function handleReview() {
    if (!canReview) return

    setIsSubmitting(true)
    setSubmitState('idle')
    await new Promise((resolve) => window.setTimeout(resolve, 500))

    // DONE: FE UI/UX Completed - API integration in the future
    setIsSubmitting(false)
    setSubmitState('ready')
  }

  return (
    <section className='bg-card p-8 rounded-2xl border border-border shadow-sm'>
      <div className='flex flex-col gap-3 md:flex-row md:items-start md:justify-between'>
        <div>
          <h3 className='text-lg font-bold text-foreground mb-2'>{t('security.title')}</h3>
          <p className='text-sm text-muted-foreground'>{t('security.passwordDesc')}</p>
        </div>
        <span className='inline-flex items-center rounded-full border border-border bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground'>
          {t('security.statusLabel')}
        </span>
      </div>

      <div className='mt-6 rounded-2xl border border-warning/30 bg-warning/5 p-4 text-sm text-muted-foreground'>
        <p className='font-semibold text-foreground'>{t('security.unavailableTitle')}</p>
        <p className='mt-1'>{t('security.apiUnavailable')}</p>
      </div>

      <div className='mt-6 grid grid-cols-1 md:grid-cols-3 gap-4'>
        <label className='space-y-2 text-sm'>
          <span className='font-semibold text-foreground'>{t('security.currentPassword')}</span>
          <input
            type='password'
            value={form.currentPassword}
            onChange={(e) => setForm((prev) => ({ ...prev, currentPassword: e.target.value }))}
            className='w-full rounded-xl border border-border bg-background px-4 py-3 outline-none focus:border-primary'
          />
        </label>
        <label className='space-y-2 text-sm'>
          <span className='font-semibold text-foreground'>{t('security.newPassword')}</span>
          <input
            type='password'
            value={form.newPassword}
            onChange={(e) => setForm((prev) => ({ ...prev, newPassword: e.target.value }))}
            className='w-full rounded-xl border border-border bg-background px-4 py-3 outline-none focus:border-primary'
          />
        </label>
        <label className='space-y-2 text-sm'>
          <span className='font-semibold text-foreground'>{t('security.confirmPassword')}</span>
          <input
            type='password'
            value={form.confirmPassword}
            onChange={(e) => setForm((prev) => ({ ...prev, confirmPassword: e.target.value }))}
            className='w-full rounded-xl border border-border bg-background px-4 py-3 outline-none focus:border-primary'
          />
        </label>
      </div>

      <div className='mt-4 rounded-xl border border-border bg-muted/20 p-4 text-sm text-muted-foreground'>
        {t('security.validationHint')}
      </div>

      {validationError ? (
        <div className='mt-4 rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive'>
          {validationError}
        </div>
      ) : null}

      {submitState === 'ready' ? (
        <div className='mt-4 rounded-xl border border-primary/30 bg-primary/5 p-4 text-sm text-primary'>
          <p className='font-semibold'>{t('security.readyTitle')}</p>
          <p className='mt-1'>{t('security.readyDescription')}</p>
        </div>
      ) : null}

      <div className='mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
        <span className='text-sm text-muted-foreground'>
          {isSubmitting ? t('security.reviewingMock') : t('security.futureApiNote')}
        </span>
        <button
          type='button'
          disabled={!canReview || isSubmitting}
          aria-disabled={!canReview || isSubmitting}
          title={canReview ? t('security.disabledCta') : t('security.validationHint')}
          onClick={() => void handleReview()}
          className='px-5 py-2.5 bg-foreground text-background text-sm font-bold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed'
        >
          {isSubmitting
            ? t('security.reviewing')
            : canReview
              ? t('security.pendingBackend')
              : t('security.changePassword')}
        </button>
      </div>
    </section>
  )
}
