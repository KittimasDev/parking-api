// เก็บพาธ public ให้เป็นจุดเดียว ใช้ร่วมกันได้ทุกโมดูล
export const CONFIG_PATH = {
  PATH_COMPLAINT: '/uploads/complaint',
  PATH_EMERGENCY: '/uploads/emergency',
  PATH_ICONS: '/uploads/icons',
} as const;

export type ConfigPathKey = keyof typeof CONFIG_PATH;
