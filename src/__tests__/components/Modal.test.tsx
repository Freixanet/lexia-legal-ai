import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Modal from '@/components/ui/Modal'

describe('Modal', () => {
  it('renders nothing when isOpen is false', () => {
    render(
      <Modal isOpen={false} onClose={() => {}} title="Test">
        Content
      </Modal>
    )
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('renders dialog with title and content when open', () => {
    render(
      <Modal isOpen={true} onClose={() => {}} title="Test title">
        <p>Modal body</p>
      </Modal>
    )
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByLabelText(/test title/i)).toBeInTheDocument()
    expect(screen.getByText('Modal body')).toBeInTheDocument()
  })

  it('has accessible close button', () => {
    render(
      <Modal isOpen={true} onClose={() => {}} title="Test">
        Body
      </Modal>
    )
    expect(screen.getByRole('button', { name: /cerrar/i })).toBeInTheDocument()
  })

  it('calls onClose when close button is clicked', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    render(
      <Modal isOpen={true} onClose={onClose} title="Test">
        Body
      </Modal>
    )
    await user.click(screen.getByRole('button', { name: /cerrar/i }))
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('calls onClose when overlay is clicked', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    render(
      <Modal isOpen={true} onClose={onClose} title="Test">
        Body
      </Modal>
    )
    const overlay = screen.getByRole('dialog')
    await user.click(overlay)
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('renders footer when provided', () => {
    render(
      <Modal isOpen={true} onClose={() => {}} title="Test" footer={<button>OK</button>}>
        Body
      </Modal>
    )
    expect(screen.getByRole('button', { name: 'OK' })).toBeInTheDocument()
  })
})
