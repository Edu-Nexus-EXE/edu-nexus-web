import { readStorage, removeStorage, writeStorage } from './storage'

/**
 * Cache lại options text (A/B/C/D) theo questionId cho mỗi assessment session.
 * Lý do: khi xem kết quả, BE thường chỉ trả về `correctOption: "A"` chứ không kèm text.
 * Nếu user mở tab results sau khi đã tải câu hỏi, FE sẽ không biết "A" là nội dung gì.
 *
 * Cache này lưu tối đa 5 session gần nhất (LRU theo thời gian ghi) trong sessionStorage
 * để tránh phình storage. Cùng pattern `readStorage`/`writeStorage` (bỏ qua SSR + SecurityError).
 */

export type CachedOption = 'A' | 'B' | 'C' | 'D'
export type CachedOptions = Record<string, Partial<Record<CachedOption, string>>>

type CacheEntry = {
  sessionId: string
  savedAt: number
  options: CachedOptions
}

const STORAGE_KEY = 'edu-nexus:assessment-options-cache:v1'
const MAX_ENTRIES = 5

type CacheMap = Record<string, CacheEntry>

function readCacheMap(): CacheMap {
  const raw = readStorage(STORAGE_KEY)
  if (!raw) return {}
  try {
    const parsed = JSON.parse(raw) as CacheMap
    return parsed && typeof parsed === 'object' ? parsed : {}
  } catch {
    return {}
  }
}

function writeCacheMap(map: CacheMap): void {
  writeStorage(STORAGE_KEY, JSON.stringify(map))
}

export function saveOptionsForSession(sessionId: string, options: CachedOptions): void {
  if (!sessionId) return
  const map = readCacheMap()
  map[sessionId] = { sessionId, savedAt: Date.now(), options }
  // LRU: nếu vượt MAX_ENTRIES thì xoá entry cũ nhất
  const entries = Object.values(map).sort((a, b) => b.savedAt - a.savedAt)
  if (entries.length > MAX_ENTRIES) {
    for (const stale of entries.slice(MAX_ENTRIES)) {
      delete map[stale.sessionId]
    }
  }
  writeCacheMap(map)
}

export function readOptionsForSession(sessionId: string): CachedOptions | null {
  if (!sessionId) return null
  const map = readCacheMap()
  return map[sessionId]?.options ?? null
}

export function clearOptionsForSession(sessionId: string): void {
  if (!sessionId) return
  const map = readCacheMap()
  if (map[sessionId]) {
    delete map[sessionId]
    writeCacheMap(map)
  }
}

export function clearAllOptionsCache(): void {
  removeStorage(STORAGE_KEY)
}

/**
 * Format option key + text thành nhãn hiển thị.
 * �uu tiên: nếu biết text của option → "A. <text>", ngược lại chỉ "A".
 */
export function formatOptionLabel(key: string, text: string | null | undefined): string {
  const trimmed = typeof text === 'string' ? text.trim() : ''
  if (!trimmed) return key
  return `${key}. ${trimmed}`
}
