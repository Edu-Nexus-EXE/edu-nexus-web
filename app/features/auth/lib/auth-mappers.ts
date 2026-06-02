// Re-export everything from be-auth-types.ts for backward compatibility.
// The canonical types, guards, and mappers now live in be-auth-types.ts.
export {
  type AuthResponseData,
  type TokenRefreshResponseData,
  type SubscriptionDto,
  type UserProfileResponseData,
  isAuthResponseData,
  isUserProfileResponseData,
  mapAuthResponseToUser,
  mapUserProfileToUser,
} from './be-auth-types'
