import { HttpResponse, delay, http } from 'msw'

/**
 * State for subscription mock — persists across calls in the same session.
 * Lets us simulate the order-then-webhook flow for the pricing page.
 */
type OrderStatus = 'pending' | 'completed' | 'failed' | 'cancelled'

type Order = {
  id: string
  tierCode: string
  durationMonths: number
  amount: number
  currency: string
  paymentProvider: string
  paymentUrl: string
  status: OrderStatus
  createdAt: string
}

const orders = new Map<string, Order>()

const TIER_PRICE_MONTHLY: Record<string, number> = {
  free: 0,
  student: 49000,
  pro: 149000
}

const TIER_PROVIDER_URL: Record<string, (orderId: string, amount: number) => string> = {
  // Spec: BE generates real VNPay/MoMo URL. For mock we synthesize a deterministic
  // placeholder so FE can still complete the redirect UX without a real gateway.
  vnpay: (orderId, amount) => `https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?orderId=${orderId}&amount=${amount}`,
  momo: (orderId, amount) => `https://test-payment.momo.vn/pay?orderId=${orderId}&amount=${amount}`,
  manual_transfer: (orderId) => `https://edu-nexus.example.com/checkout/${orderId}`
}

function newId(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36)}`
}

function ok<T>(data: T, init?: ResponseInit) {
  return HttpResponse.json({ data }, init)
}

export const subscriptionHandlers = [
  // ── GET /subscription/tiers — match spec Response 200
  http.get('*/subscription/tiers', async () => {
    await delay(300)
    return ok([
      {
        tierCode: 'free',
        displayName: 'Cơ bản',
        priceMonthly: 0,
        currency: 'VND',
        quotas: {
          jd: 3,
          gapAnalysis: 3,
          assessment: 3,
          roadmapActive: 3,
          careerTrack: 1,
          portfolioCertificate: 3,
          portfolioProject: 3,
          fullGapHistory: false
        },
        isActive: true
      },
      {
        tierCode: 'student',
        displayName: 'Sinh viên',
        priceMonthly: 49000,
        currency: 'VND',
        quotas: {
          jd: 50,
          gapAnalysis: 50,
          assessment: 50,
          roadmapActive: 50,
          careerTrack: 50,
          portfolioCertificate: 50,
          portfolioProject: 50,
          fullGapHistory: true
        },
        isActive: true
      },
      {
        tierCode: 'pro',
        displayName: 'Chuyên nghiệp',
        priceMonthly: 149000,
        currency: 'VND',
        quotas: {
          jd: 200,
          gapAnalysis: 200,
          assessment: 200,
          roadmapActive: 200,
          careerTrack: 200,
          portfolioCertificate: 200,
          portfolioProject: 200,
          fullGapHistory: true
        },
        isActive: true
      }
    ])
  }),

  // ── GET /subscription/me — match spec Response 200
  http.get('*/subscription/me', async () => {
    await delay(300)
    return ok({
      tier: { tierCode: 'free', displayName: 'Cơ bản' },
      status: 'active',
      expiresAt: null,
      usage: {
        jd: { used: 0, limit: 3, nearLimit: false },
        assessment: { used: 0, limit: 3, nearLimit: false }
      }
    })
  }),

  // ── GET /subscription/orders — match spec Response 200
  http.get('*/subscription/orders', async () => {
    await delay(300)
    return ok({ orders: Array.from(orders.values()) })
  }),

  // ── POST /subscription/orders — match spec Response 201
  http.post('*/subscription/orders', async ({ request }) => {
    await delay(400)
    const body = (await request.json().catch(() => ({}))) as {
      tierCode?: string
      durationMonths?: number
      paymentProvider?: string
    }

    const tierCode = (body.tierCode ?? 'student').toLowerCase()
    const durationMonths = Number.isFinite(body.durationMonths) && body.durationMonths! > 0 ? body.durationMonths! : 1
    const paymentProvider = (body.paymentProvider ?? 'vnpay').toLowerCase()

    const price = TIER_PRICE_MONTHLY[tierCode] ?? 0
    const amount = price * durationMonths
    const orderId = newId('ord')
    const urlBuilder = TIER_PROVIDER_URL[paymentProvider] ?? TIER_PROVIDER_URL.vnpay
    const paymentUrl = urlBuilder(orderId, amount)

    const order: Order = {
      id: orderId,
      tierCode,
      durationMonths,
      amount,
      currency: 'VND',
      paymentProvider,
      paymentUrl,
      status: 'pending',
      createdAt: new Date().toISOString()
    }
    orders.set(orderId, order)

    return ok(order, { status: 201 })
  }),

  // ── POST /subscription/webhook — match spec (verify signature not enforced in mock)
  http.post('*/subscription/webhook', async () => {
    await delay(200)
    return new HttpResponse(null, { status: 200 })
  })
]
