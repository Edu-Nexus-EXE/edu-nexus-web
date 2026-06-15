import { Fragment } from 'react'
import { useTranslation } from 'react-i18next'

import type { GapAnalysisSkill, GapAnalysisSkillStatus } from '../../lib/gap-analysis-data'

const STATUS_VARIANTS: Record<GapAnalysisSkillStatus, string> = {
  missing: 'bg-destructive/10 text-destructive border-destructive/20',
  upgrade: 'bg-warning/10 text-warning border-warning/20',
  have: 'bg-success/10 text-success border-success/20'
}

const VI_LEVELS: Record<string, string> = {
  none: 'Chưa có',
  basic: 'Cơ bản',
  intermediate: 'Trung cấp',
  advanced: 'Nâng cao',
  unknown: 'Chưa rõ',
  'not evidenced': 'Chưa có minh chứng',
  'mandatory in jd': 'Bắt buộc trong JD'
}

function hasVietnamese(value: string) {
  return /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i.test(value)
}

function translateValue(value: string, language: string) {
  if (!language.startsWith('vi')) return value
  const normalized = value.trim().toLowerCase()
  return VI_LEVELS[normalized] ?? value
}

function translateReason(value: string, language: string) {
  if (!language.startsWith('vi') || !value || hasVietnamese(value)) return value

  let translated = value
    .replace(/^candidate has no evidence of (.+?) skill\.?$/i, 'Ứng viên chưa có minh chứng về kỹ năng $1.')
    .replace(/^candidate does not have (.+?) skill\.?$/i, 'Ứng viên chưa có kỹ năng $1.')
    .replace(/^candidate lacks (.+?) skill\.?$/i, 'Ứng viên còn thiếu kỹ năng $1.')
    .replace(/^user has no experience with (.+?)\.?$/i, 'Người dùng chưa có kinh nghiệm với $1.')
    .replace(/^learn (.+?)\.$/i, 'Cần học $1.')
    .replace(/mandatory in jd/gi, 'bắt buộc trong JD')
    .replace(/required in jd/gi, 'được yêu cầu trong JD')

  for (const [source, target] of Object.entries(VI_LEVELS)) {
    translated = translated.replace(new RegExp(`\\b${source}\\b`, 'gi'), target.toLowerCase())
  }

  return translated
}

export interface SkillRowProps {
  skill: GapAnalysisSkill
  isExpanded: boolean
  onToggle: (id: string) => void
}

export function SkillRow({ skill, isExpanded, onToggle }: SkillRowProps) {
  const { t, i18n } = useTranslation('dashboard')
  const language = i18n.language ?? 'vi'
  const current = translateValue(skill.current, language)
  const required = translateValue(skill.required, language)
  const reason = translateReason(skill.reason, language)
  const tags = skill.tags.map((tag) => translateValue(tag, language))

  return (
    <Fragment>
      <tr onClick={() => onToggle(skill.id)} className='hover:bg-muted/30 transition-colors cursor-pointer'>
        <td className='px-6 py-5 font-bold text-foreground flex items-center gap-3 whitespace-nowrap'>
          <div className='w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0'>
            <span className='material-symbols-outlined text-[18px]'>{skill.icon}</span>
          </div>
          {skill.name}
        </td>
        <td className='px-6 py-5'>
          <span
            className={`${STATUS_VARIANTS[skill.status]} px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border`}
          >
            {t(`learningPath.gapAnalysis.status.${skill.status}`)}
          </span>
        </td>
        <td className='px-6 py-5 text-sm font-medium text-foreground/80'>{current}</td>
        <td className='px-6 py-5 text-sm font-bold text-foreground'>{required}</td>
        <td className='px-6 py-5'>
          {skill.hasPriority ? (
            <div className='flex items-center gap-2'>
              <span className='font-bold text-primary text-sm'>{skill.priorityScore}/10</span>
              <div className='w-16 h-1.5 bg-muted rounded-full overflow-hidden border border-border shrink-0'>
                <div className='h-full bg-primary rounded-full' style={{ width: `${skill.priorityScore * 10}%` }} />
              </div>
            </div>
          ) : (
            <span className='text-muted-foreground'>-</span>
          )}
        </td>
        <td className='px-6 py-5 text-right'>
          {skill.status === 'have' ? (
            <span className='material-symbols-outlined text-success'>check_circle</span>
          ) : (
            <span
              className={`material-symbols-outlined text-muted-foreground/60 transition-transform duration-300 ${
                isExpanded ? 'rotate-180' : 'rotate-0'
              }`}
            >
              expand_more
            </span>
          )}
        </td>
      </tr>

      {isExpanded && (
        <tr className='bg-muted/20'>
          <td className='px-12 py-5 border-l-4 border-primary' colSpan={6}>
            <div className='flex items-start gap-3'>
              <span className='material-symbols-outlined text-primary text-lg mt-0.5'>tips_and_updates</span>
              <div className='space-y-3'>
                <div>
                  <p className='text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1'>
                    {t('learningPath.gapAnalysis.reasoning')}
                  </p>
                  <p className='text-sm text-foreground/80 italic leading-relaxed'>"{reason}"</p>
                </div>
                <div className='flex flex-wrap gap-2'>
                  {tags.map((tag, index) => (
                    <span
                      key={`${tag}-${index}`}
                      className='bg-card border border-border text-muted-foreground px-3 py-1 rounded-full text-xs font-medium'
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </td>
        </tr>
      )}
    </Fragment>
  )
}
