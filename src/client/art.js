/* Art credits and original public-preview URLs: static/art/sources.json.
   Each scene is a single offline snapshot; no image fetch or animation timer. */

const PUPPY_HEAD_SVG = `<svg class="lp-art lp-art--pair" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 34" role="img" aria-label="线条小狗" focusable="false">
 <image x="0" y="0" width="50" height="34" href="${COUPLE_ARTWORK['couple-brand']}"/>
</svg>`

const HEART_PATH = 'M12 21C8 17 2 13 2 7.7C2 1.5 9 .8 12 6C15 .8 22 1.5 22 7.7C22 13 16 17 12 21Z'

const PUPPY_CREST_SVG = `<svg class="lp-art lp-art--couple" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 222" role="img" aria-label="线条小狗" focusable="false">
 <ellipse cx="160" cy="117" rx="156" ry="102" fill="#FAE9E4" opacity=".55"/>
 <ellipse cx="160" cy="202" rx="115" ry="7" fill="#D5BEA0" opacity=".13"/>
 <image class="lp-couple" x="30" y="27" width="260" height="173" href="${COUPLE_ARTWORK['couple-home']}"/>
 <g class="lp-hearts" fill="var(--dsh-line-puppy-accent, #E8C887)">
  <path class="lp-heart" transform="translate(153 6) rotate(-12)" d="${HEART_PATH}" fill="#DEA5A0"/>
  <path transform="translate(302 81) rotate(16) scale(.5)" d="${HEART_PATH}"/>
  <path transform="translate(12 135) rotate(-18) scale(.42)" d="${HEART_PATH}" fill="#E8C6BE"/>
 </g>
</svg>`

const PUPPY_HUG_SVG = `<svg class="lp-art lp-art--hug" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 180 150" role="img" aria-label="线条小狗" focusable="false">
 <image class="lp-couple" x="5" y="8" width="170" height="134" href="${COUPLE_ARTWORK['couple-hug']}"/>
</svg>`

const PUPPY_REST_SVG = `<svg class="lp-art lp-art--rest" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 150 84" role="img" aria-label="线条小狗" focusable="false">
 <image x="8" y="5" width="134" height="74" href="${COUPLE_ARTWORK['couple-rest']}"/>
</svg>`
