import { apiClient } from '../../../services/apiClient'

export const accountService = {
  async changeEmail(currentPassword: string, newEmail: string): Promise<void> {
    await apiClient.patch('/me/email', { current_password: currentPassword, new_email: newEmail })
  },

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await apiClient.patch('/me/password', { current_password: currentPassword, new_password: newPassword })
  },

  async deleteAccount(currentPassword: string): Promise<void> {
    await apiClient.delete('/me', { data: { current_password: currentPassword } })
  },
}
