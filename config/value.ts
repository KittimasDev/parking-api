import * as moment from 'moment-timezone';
export const getCreateDate = () => moment().tz('Asia/Bangkok').toDate();
export const getCreateAt = () => moment().tz('Asia/Bangkok').toDate();
export const getUpdateAt = () => moment().tz('Asia/Bangkok').toDate();
export const getUploadAt = () => moment().tz('Asia/Bangkok').toDate();
// ========================
// 🕒 เวลาปัจจุบันแบบฟังก์ชัน
// ========================
export const getNowMoment = () => moment().tz('Asia/Bangkok');
export const getNowDate = () => getNowMoment().toDate();
export const getThaiMoment = () => getNowMoment().clone().add(543, 'years');

// ========================
// 📅 เวลาแบบ พ.ศ. และแปรผัน
// ========================
export const getCurrentDate = () => getThaiMoment();
export const getCurrentDateAddhours = () => getThaiMoment().clone().add(7, 'hours');
export const getCurrentDateBangkok = () => getThaiMoment(); // เหมือน getCurrentDate
export const getFutureDate = () => getThaiMoment().clone().add(2, 'days');

// ========================
// 🛠️ Default Object Generators
// ========================
export const createDefaultValue = () => {
  const now = getNowDate();
  return {
    is_active: true,
    create_date: now,
    updated_date: now,
  };
};

export const updateDefaultValue = () => {
  const now = getNowDate();
  return {
    updateAt: now,
  };
};

export const createDefaultNonActive = () => {
  const now = getNowDate();
  return {
    created_date: now,
    updated_date: now,
  };
};

// ========================
// 👤 Default Functions (User-based)
// ========================
export const createDefaultFunc = (userId: number | null) => ({
  created_by: userId ?? null,
  updated_by: userId ?? null,
});

export const updateDefaultFunc = (userId: number) => ({
  updated_by: userId,
});
