const badgeTextSize = { sm: 'text-xl', md: 'text-3xl', lg: 'text-3xl', xl: 'text-5xl' };
const size = 'xl';
const fullName = 'María Fernanda González';
const name = undefined;
const src = undefined;
const displayName = fullName || name;
const initials = displayName ? displayName.split(' ').filter(Boolean).slice(0, 2).map((n) => n[0]).join('').toUpperCase() : '?';

console.log({ initials, "initials !== '?'": initials !== '?' });
