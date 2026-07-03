import { test } from 'node:test';
import assert from 'node:assert/strict';
import { openSvg, closeSvg, stem, blob, bar, label } from '../games/svg.js';

test('openSvg has viewBox and closeSvg closes', () => {
  assert.match(openSvg(100,50), /viewBox="0 0 100 50"/);
  assert.equal(closeSvg(), '</svg>');
});
test('stem/blob/bar/label carry id and color', () => {
  assert.match(stem(10,0,40,{color:'#00979D',id:'s1'}), /id="s1"/);
  assert.match(blob(5,5,3,{color:'#E86A1C',id:'b1'}), /<circle[^>]*id="b1"/);
  assert.match(bar(1,2,3,4,{color:'#0A3D52',id:'r1'}), /<rect[^>]*id="r1"/);
  assert.match(label(1,2,'hi',{}), />hi</);
});
