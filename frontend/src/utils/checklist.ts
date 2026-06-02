import type { ChecklistSection } from '@/types'

export const CHECKLIST_TEMPLATE: ChecklistSection[] = [
  {
    section: 'Electric Work',
    items: [
      'DP board fixing',
      'DP board dressing',
      'Wiring',
      'Switch plate fixing',
      'Gypsum',
      'Z. Fishing',
    ],
  },
  {
    section: 'Plumbing Work',
    items: ['W/C', 'Wash Basin', 'CP Fittings'],
  },
  {
    section: 'Tiling Work',
    items: ['Tile work'],
  },
  {
    section: 'Internal Painting Work',
    items: [
      'Putty 1st coat',
      'Putty 2nd coat',
      'Primer work',
      'Single coat',
      'Double coat',
    ],
  },
  {
    section: 'Deck / Kitchen Railing Work',
    items: ['Base / Shoe work', 'Glass work', 'Top and hand rail work'],
  },
  {
    section: 'Aluminium Window',
    items: [
      'Living',
      'Common Bedroom',
      'M. Bedroom 1',
      'M. Bedroom 2',
      'C Toilet',
      'M Toilet 1',
      'M Toilet 2',
      'Kitchen',
      'S Toilet',
    ],
  },
  {
    section: 'Modular Kitchen',
    items: ['Shutter / Shutter alignment'],
  },
  {
    section: 'Fire Fighting Work',
    items: [
      'Flat / Passage',
      'Piping',
      'Sprinkler',
      'Smoke / Heat detector',
      'Testing',
      'Colour',
    ],
  },
  {
    section: 'Cabaling Work',
    items: [
      'Cabaling work',
      'Main door with laminate',
      'Main door lock (dead lock)',
      'Main door lock (digital lock)',
      'Internal Door',
      'Internal Door Lock',
    ],
  },
  {
    section: 'Video Door Phone',
    items: ['Indoor display', 'Outdoor camera'],
  },
  {
    section: 'Wooden Polishing Work',
    items: ['Main door frame', 'Internal door Dhar polish'],
  },
]

/** Flat ordered list of all item labels */
export const FLAT_ITEMS: string[] = CHECKLIST_TEMPLATE.flatMap((s) => s.items)

export const TOTAL_ITEMS = FLAT_ITEMS.length

/** Build a fresh empty items array */
export function buildEmptyItems() {
  return FLAT_ITEMS.map((_, i) => ({ index: i, done: false, remark: '' }))
}
