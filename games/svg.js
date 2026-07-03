export const openSvg = (w, h) =>
  `<svg viewBox="0 0 ${w} ${h}" width="100%" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg">`;
export const closeSvg = () => `</svg>`;

export const stem = (x, y0, y1, { color = '#00979D', w = 6, id = '' } = {}) =>
  `<line ${id ? `id="${id}"` : ''} x1="${x}" y1="${y0}" x2="${x}" y2="${y1}" stroke="${color}" stroke-width="${w}" stroke-linecap="round"/>`;

export const blob = (cx, cy, r, { color = '#00979D', id = '', opacity = 1 } = {}) =>
  `<circle ${id ? `id="${id}"` : ''} cx="${cx}" cy="${cy}" r="${r}" fill="${color}" fill-opacity="${opacity}"/>`;

export const bar = (x, y, w, h, { color = '#00979D', id = '' } = {}) =>
  `<rect ${id ? `id="${id}"` : ''} x="${x}" y="${y}" width="${w}" height="${h}" rx="3" fill="${color}"/>`;

export const label = (x, y, text, { color = '#404A4F', size = 13, anchor = 'middle' } = {}) =>
  `<text x="${x}" y="${y}" fill="${color}" font-size="${size}" text-anchor="${anchor}" font-family="system-ui,Arial">${text}</text>`;
