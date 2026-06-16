import { useEffect } from 'react'
import { Navigate } from 'react-router'

export function RegisterRedirect() {
  useEffect(() => {
    /* component never renders — redirect only */
  }, [])
  return <Navigate to='/signup' replace />
}
