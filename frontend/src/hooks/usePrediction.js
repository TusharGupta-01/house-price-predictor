/**
 * usePrediction Hook
 * ==================
 * Manages prediction form state, API call, and result lifecycle.
 */

import { useState, useCallback } from 'react'
import { predictPrice, getLocations } from '../services/api'

const DEFAULT_FORM = {
  city: 'bengaluru',
  total_sqft: 1200,
  bhk: 2,
  bath: 2,
  balcony: 1,
  location: '',
  area_type: 'Super built-up  Area',
}

export function usePrediction() {
  const [form, setForm] = useState(DEFAULT_FORM)
  const [locations, setLocations] = useState([])
  const [loadingLocations, setLoadingLocations] = useState(false)
  const [predicting, setPredicting] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

  const fetchLocations = useCallback(async (city) => {
    setLoadingLocations(true)
    try {
      const res = await getLocations(city)
      setLocations(res.data.locations || [])
    } catch (e) {
      setLocations([])
    } finally {
      setLoadingLocations(false)
    }
  }, [])

  const updateForm = useCallback((field, value) => {
    setForm((prev) => {
      const next = { ...prev, [field]: value }
      // Auto-reset location when city changes
      if (field === 'city') {
        next.location = ''
        next.area_type = value === 'mumbai' ? 'Built-up Area' : 'Super built-up  Area'
        fetchLocations(value)
      }
      return next
    })
    setResult(null)
    setError(null)
  }, [fetchLocations])

  const predict = useCallback(async () => {
    if (!form.location) {
      setError('Please select a location.')
      return
    }
    setPredicting(true)
    setError(null)
    try {
      const res = await predictPrice(form)
      setResult(res.data)
    } catch (e) {
      setError(e.response?.data?.error || 'Prediction failed. Is the backend running?')
    } finally {
      setPredicting(false)
    }
  }, [form])

  const reset = useCallback(() => {
    setForm(DEFAULT_FORM)
    setResult(null)
    setError(null)
    setLocations([])
  }, [])

  return {
    form, locations, loadingLocations, predicting,
    result, error,
    updateForm, predict, fetchLocations, reset,
  }
}
