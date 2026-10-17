/**
 * Account API: registration, login, email verification, password reset,
 * and changes to the logged-in user's email/password/language.
 */
import { api } from 'boot/axios'

const data = (promise) => promise.then((res) => res.data)

export const register = ({ username, email, password, locale }) =>
  data(api.post('/register', { username, email, password, locale }))

/** `identifier` is a username or an email address. */
export const login = (identifier, password) =>
  data(api.post('/login', { username: identifier, password }))

export const fetchMe = () => data(api.get('/me'))

export const verifyEmail = (token) => data(api.post('/verify-email', { token }))

export const resendVerification = () => data(api.post('/resend-verification'))

export const resendVerificationPublic = (email) =>
  data(api.post('/resend-verification-public', { email }))

export const forgotPassword = (email) => data(api.post('/forgot-password', { email }))

export const resetPassword = (token, password) =>
  data(api.post('/reset-password', { token, password }))

export const changeEmail = (email, password) => data(api.put('/me/email', { email, password }))

export const changePassword = (currentPassword, newPassword) =>
  data(api.put('/me/password', { currentPassword, newPassword }))

export const saveLocale = (locale) => data(api.put('/me/locale', { locale }))

/** Public server settings, e.g. { emailEnabled, emailVerificationRequired }. */
export const fetchConfig = () => data(api.get('/config'))
