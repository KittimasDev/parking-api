// src/utils/helpers/user.helper.ts

export function withUser<T extends object>(
  dto: T,
  userId: number,
): T & { createBy: number; updateBy: number } {
  return {
    ...dto,
    createBy: userId,
    updateBy: userId,
  };
}
