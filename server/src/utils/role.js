// ADMIN_EMAIL is the permanent owner admin. Other admins can be appointed by an admin,
// but the owner's rights cannot be removed.
const adminEmail = () => (process.env.ADMIN_EMAIL || '').trim().toLowerCase();
const isAdminEmail = (e) => !!adminEmail() && String(e || '').trim().toLowerCase() === adminEmail();
const effectiveRole = (u) => (isAdminEmail(u.email) ? 'admin' : u.role);
module.exports = { adminEmail, isAdminEmail, effectiveRole };
