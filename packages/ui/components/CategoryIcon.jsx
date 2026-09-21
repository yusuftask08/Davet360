import {
  Landmark,
  Flower2,
  Gem,
  Flame,
  PartyPopper,
  Cake,
  Baby,
  GraduationCap,
  Building2,
  Music2,
  Camera,
  UtensilsCrossed,
  CakeSlice,
  Sparkles,
  Mail,
  Shirt,
  Wand2,
  Drama,
  Sparkle,
} from 'lucide-react';

// CATEGORIES slug'larıyla bire bir eşlenir (packages/constants/categories.js) — yeni bir
// kategori eklenirse buraya da bir ikon eklenmeli, aksi halde fallback (Sparkle) gösterilir.
const CATEGORY_ICON_MAP = {
  'dugun-mekani': Landmark,
  'dugun-organizasyonu': Flower2,
  'nisan-organizasyonu': Gem,
  'kina-gecesi': Flame,
  'sunnet-organizasyonu': PartyPopper,
  'dogum-gunu-organizasyonu': Cake,
  'baby-shower': Baby,
  'mezuniyet-organizasyonu': GraduationCap,
  'kurumsal-etkinlik': Building2,
  'orkestra-muzik': Music2,
  'fotograf-video': Camera,
  'catering-ikram': UtensilsCrossed,
  'pasta-tatli': CakeSlice,
  'dekorasyon-balon': Sparkles,
  davetiye: Mail,
  'gelinlik-damatlik': Shirt,
  'kuafor-makyaj': Wand2,
  'animasyon-cocuk': Drama,
};

export function CategoryIcon({ slug, size = 28, strokeWidth = 1.75, ...rest }) {
  const Icon = CATEGORY_ICON_MAP[slug] ?? Sparkle;
  return <Icon size={size} strokeWidth={strokeWidth} aria-hidden="true" {...rest} />;
}
