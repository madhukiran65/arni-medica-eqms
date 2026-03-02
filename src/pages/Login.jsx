import React, { useState, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { loginSchema } from '../validation/schemas'
import { AuthContext } from '../contexts/AuthContext'
import { Shield, Eye, EyeOff } from 'lucide-react'
import FormField from '../components/common/FormField'

export default function Login() {
  const { login } = useContext(AuthContext)
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [serverError, setServerError] = useState('')
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(loginSchema),
    mode: 'onBlur',
  })

  const onSubmit = async (data) => {
    setServerError('')
    setLoading(true)
    try {
      await login(data.username, data.password)
      navigate('/')
    } catch (err) {
      setServerError(err.message || err.response?.data?.detail || 'Invalid credentials. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg shadow-blue-500/20 mb-4">
            <Shield size={28} color="#fff" />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight">ARNI MEDICA</h1>
          <p className="text-blue-400 text-xs tracking-[0.2em] font-semibold mt-1">AI-POWERED eQMS PLATFORM</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="card p-6 space-y-4" noValidate>
          <h2 className="text-lg font-bold text-center mb-2">Sign In</h2>

          {serverError && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-sm text-red-400">
              {serverError}
            </div>
          )}

          <FormField label="Username" error={errors.username?.message} required>
            <input
              type="text"
              {...register('username')}
              className={`input-field ${errors.username ? 'border-red-500/50' : ''}`}
              placeholder="Enter your username"
              autoFocus
            />
          </FormField>

          <FormField label="Password" error={errors.password?.message} required>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                {...register('password')}
                className={`input-field pr-10 ${errors.password ? 'border-red-500/50' : ''}`}
                placeholder="Enter your password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </FormField>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : 'Sign In'}
          </button>

          <p className="text-xs text-center text-slate-500 mt-4">
            21 CFR Part 11 Compliant · ISO 13485 · IVDR
          </p>
        </form>
      </div>
    </div>
  )
}
