import { useCallback, useMemo, useRef, useState } from 'react'
import { ConfirmContext, ToastContext } from './AdminContext'

let toastId = 0

// Toast notifications + a promise-based confirm dialog for destructive actions.
export default function FeedbackProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const [dialog, setDialog] = useState(null)
  const resolver = useRef(null)

  const dismiss = useCallback((id) => setToasts((t) => t.filter((x) => x.id !== id)), [])

  const notify = useCallback(
    (message, type = 'success') => {
      const id = ++toastId
      setToasts((t) => [...t.slice(-3), { id, message, type }])
      setTimeout(() => dismiss(id), type === 'error' ? 6000 : 3500)
    },
    [dismiss]
  )

  const toast = useMemo(
    () => ({
      success: (m) => notify(m, 'success'),
      error: (m) => notify(m?.message || m || 'Something went wrong', 'error'),
      info: (m) => notify(m, 'info'),
    }),
    [notify]
  )

  const confirm = useCallback((options) => {
    setDialog({ confirmLabel: 'Delete', danger: true, ...options })
    return new Promise((resolve) => {
      resolver.current = resolve
    })
  }, [])

  const close = (result) => {
    resolver.current?.(result)
    resolver.current = null
    setDialog(null)
  }

  return (
    <ToastContext.Provider value={toast}>
      <ConfirmContext.Provider value={confirm}>
        {children}

        <div className="adm-toasts" role="status" aria-live="polite">
          {toasts.map((t) => (
            <div key={t.id} className={`adm-toast adm-toast--${t.type}`}>
              <span>{t.message}</span>
              <button onClick={() => dismiss(t.id)} aria-label="Dismiss">
                ×
              </button>
            </div>
          ))}
        </div>

        {dialog && (
          <div className="adm-modal-backdrop" onMouseDown={() => close(false)}>
            <div
              className="adm-modal adm-modal--sm"
              role="alertdialog"
              aria-modal="true"
              aria-labelledby="adm-confirm-title"
              onMouseDown={(e) => e.stopPropagation()}
            >
              <h2 id="adm-confirm-title">{dialog.title}</h2>
              {dialog.message && <p className="adm-muted">{dialog.message}</p>}
              <div className="adm-modal__actions">
                <button className="adm-btn" onClick={() => close(false)}>
                  Cancel
                </button>
                <button
                  className={`adm-btn ${dialog.danger ? 'adm-btn--danger' : 'adm-btn--primary'}`}
                  onClick={() => close(true)}
                  autoFocus
                >
                  {dialog.confirmLabel}
                </button>
              </div>
            </div>
          </div>
        )}
      </ConfirmContext.Provider>
    </ToastContext.Provider>
  )
}
