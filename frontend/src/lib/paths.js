const normalizeBasePath = (value) => {
  if (!value || value === '/') {
    return '';
  }
  const withLeadingSlash = value.startsWith('/') ? value : `/${value}`;
  return withLeadingSlash.replace(/\/$/, '');
};

export const APP_BASE_PATH = normalizeBasePath(import.meta.env.VITE_BASE_PATH);

export const toAppPath = (path) => {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${APP_BASE_PATH}${normalizedPath}` || normalizedPath;
};

export const isLoginPath = (pathname) => {
  const loginPath = toAppPath('/login');
  return pathname === loginPath || pathname === '/login';
};
