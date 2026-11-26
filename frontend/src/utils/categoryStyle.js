// One color per category, shared by the shop awning stripe and the "no photo" placeholder.
// color: stripe and icon color. soft: pale placeholder background. icon: placeholder drawing.
// Keep the keys in sync with CATEGORIES in utils/constants.js.
export const CATEGORY_STYLE = {
  Food: { color: '#b86f57', soft: '#f6e4dc', icon: 'bowl' }, // terracotta
  Snacks: { color: '#b8862a', soft: '#f6ebd2', icon: 'cookie' }, // mustard
  Drinks: { color: '#7a5236', soft: '#eee3d9', icon: 'cup' }, // coffee
  Produce: { color: '#6b7a3a', soft: '#e9ecd8', icon: 'leaf' }, // olive
  'Baked Goods': { color: '#b0656f', soft: '#f5e3e6', icon: 'cake' }, // dusty rose
  Crafts: { color: '#a07d4f', soft: '#f1e8da', icon: 'basket' }, // sand
  Accessories: { color: '#6e4b5e', soft: '#ede4ea', icon: 'bag' }, // plum
  Clothing: { color: '#4f6383', soft: '#e5e9f0', icon: 'shirt' }, // slate blue
  Home: { color: '#3f6b6b', soft: '#e0ecec', icon: 'home' }, // teal
  Plants: { color: '#4b7b4f', soft: '#e2ecdc', icon: 'leaf' }, // leaf green
  Other: { color: '#76786f', soft: '#ecece7', icon: 'tag' }, // gray
}

export const categoryStyle = (category) => CATEGORY_STYLE[category] || CATEGORY_STYLE.Other
