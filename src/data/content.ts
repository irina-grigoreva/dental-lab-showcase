// Site content. Ported from the renderVals() and labNotes data of the original Main.dc.html.
// Confirmed facts only; items marked DEMO are placeholders to replace with real content.

// Public site address, used for canonical and Open Graph URLs. Change it when the domain is known.
export const SITE = {
  url: 'https://elident.example',
  ogImage: '/_blob/7b861a333e03b66bca0250a36625dbef',
};

export const CONTACT = {
  email: 'info@elident.com',
  phone: '+1 (800) 793-0924',
  phoneHref: 'tel:+18007930924',
  fax: '+1 (800) 793-2802',
  mapHref:
    'https://www.google.com/maps/search/?api=1&query=144-13%2075th%20Avenue%2C%20Flushing%2C%20NY%2011367',
};

export const LOGO_DARK = '/_blob/7b9499f75caf7e24b7adea84dcadee24';
export const LOGO_LIGHT = '/_blob/147cdcbb4beaa3ef7663aaf91ee64437';

export const MEDIA = {
  hero: {
    src: '/_blob/7b861a333e03b66bca0250a36625dbef',
    alt: 'Two Elident articulators on black: one empty with its metal guide pin, one with upper and lower models mounted',
  },
  kit: {
    src: '/_blob/4e01bd9f0a9f480df17c2c36e927e6f9',
    alt: 'Elident sample kit with an open articulator and metal accessories',
  },
  aronov: {
    src: '/_blob/81958838ee21d7ccb713270cd747387b',
    alt: "A technician's gloved hands holding a mounted case in the Elident tray with blue fixator on a lab bench",
  },
};

export const STMT_WORDS =
  'Ilya Aronov, a dental technician, set out to build a model articulator that is fast, stable, accurate and economical — one technicians can rely on, case after case.'.split(
    ' ',
  );

export interface Step {
  num: string;
  t1: string;
  t2: string;
  caption: string;
  copy: string;
  src: string;
  alt: string;
  origin: string;
  callout: boolean;
  cx?: string;
  cy?: string;
  calloutLabel?: string;
  labSrc: string;
  labCap: string;
  labAlt: string;
}

export const STEPS: Step[] = [
  {
    num: '01',
    t1: 'The full',
    t2: 'system',
    caption: 'Articulator with models mounted',
    copy: 'Clear upper and lower trays, a hinge frame and two blue side locks hold the models in position.',
    src: '/_blob/e97c3145b6378fab7dfb72159dacc062',
    alt: 'Elident articulator with upper and lower models mounted, front view, blue side locks on both trays',
    origin: '48% 77.5%',
    callout: false,
    labSrc: '/_blob/660eb977770376119476517733646cb7',
    labCap: 'A mounted case and a removable die',
    labAlt: 'Mounted case in an Elident tray on a lab bench',
  },
  {
    num: '02',
    t1: 'The blue',
    t2: 'side lock',
    caption: 'Blue side lock, macro',
    copy: 'Two blue halves meet at the front and clip around the tray, holding the setting in place.',
    src: '/_blob/7987d45b27483a8850f248cc87bfc607',
    alt: 'Macro of the blue side lock where its two halves meet at the front of the clear tray',
    origin: '48% 77.5%',
    callout: true,
    cx: '48%',
    cy: '77.5%',
    calloutLabel: 'Blue side lock',
    labSrc: '/_blob/93fc5849f1ad793de37eced2a09b8683',
    labCap: 'Dies seated on the lower model, blue lock in place',
    labAlt: 'Stone dies on a lower model in an Elident tray with a blue side lock',
  },
  {
    num: '03',
    t1: 'Models in',
    t2: 'occlusion',
    caption: 'Models closed, front view',
    copy: 'Upper and lower models closed in the articulator, ready for a bite check.',
    src: '/_blob/913b4f194904420ea6eb8724847fdd25',
    alt: 'Upper and lower stone models closed in the Elident articulator, front view',
    origin: '50% 50%',
    callout: true,
    cx: '59%',
    cy: '49%',
    calloutLabel: 'Occlusion line',
    labSrc: '/_blob/4157d460353c897f344a130394f4860c',
    labCap: 'A case checked against its prescription',
    labAlt: 'Model in an Elident tray beside a lab prescription and a caliper',
  },
];

export const SEGMENTS = [
  { num: '01', title: 'Small labs, 1–3 technicians', text: 'Keep a few reusable articulators on the bench and reuse them case after case.', pick: 'Reusable' },
  { num: '02', title: 'High-volume labs', text: 'Send each case out with its own articulator. No cleaning, no returns to track.', pick: 'Disposable' },
  { num: '03', title: 'Dental schools & training', text: 'Give every student their own set and start with the sample kit to compare.', pick: 'Sample Kit first' },
];

// DEMO — replace with real, approved quotes
export const TESTIMONIALS = [
  { quote: 'A short quote from a lab that uses Elident — how it fits their bench work.', name: 'Technician name', role: 'Lab name · City, State', initials: '01' },
  { quote: 'A second customer quote — for example, about mounting time or the blue side locks.', name: 'Technician name', role: 'Lab name · City, State', initials: '02' },
  { quote: 'A third customer quote — for example, about switching to the disposable format.', name: 'Lab owner name', role: 'Lab name · City, State', initials: '03' },
];

// DEMO
export const LABS = ['Lab logo', 'Lab logo', 'Lab logo', 'Lab logo', 'Lab logo'];

export const BENCH = [
  { src: '/_blob/93fc5849f1ad793de37eced2a09b8683', cap: 'Dies seated on the lower model', alt: 'Stone dies seated on a lower model in the Elident tray with a blue fixator' },
  { src: '/_blob/660eb977770376119476517733646cb7', cap: 'Mounted case and a removable die', alt: 'Mounted case in an Elident tray on a lab bench, with a removable die in front' },
  { src: '/_blob/4157d460353c897f344a130394f4860c', cap: 'Case with prescription and caliper', alt: 'Model in an Elident tray beside a lab prescription and a caliper' },
  { src: '/_blob/480030f8037793bf7fc11760c3df09f5', cap: 'Elident tray beside a classic metal articulator', alt: 'Elident tray with pin holes next to a metal articulator on the bench' },
].map((b, i) => ({ ...b, num: '0' + (i + 1) }));

export type ProductId = 'reusable' | 'disposable' | 'kit';

export interface Product {
  id: ProductId;
  cat: ProductId;
  catLabel: string;
  name: string;
  short: string;
  blurb: string;
  lead: string;
  price: string | null;
  priceNote?: string;
  packValue: string;
  packLabel: string;
  use: string;
  cta: string;
  detailTitle: string;
  formTitle: string;
  formCta: string;
  doneTitle: string;
  cmpUse?: string;
  cmpPack?: string;
  cmpPrice?: string;
  cmpPriceNote?: string;
  shown?: string;
  media: { src: string; alt: string };
  gallery: { label: string; src: string }[];
}

export const PRODUCTS: Product[] = [
  {
    id: 'reusable',
    cat: 'reusable',
    catLabel: 'Reusable System',
    name: 'Elident Reusable System',
    short: 'Reusable System',
    blurb: 'A durable articulator that stays on the bench and goes back to work case after case.',
    lead: 'The reusable Elident articulator with blue side fixators. Mount your models, check the bite, then reuse the articulator on the next case.',
    price: null,
    packValue: 'Ask Elident',
    packLabel: 'In the box',
    use: 'Repeated use',
    cta: 'View Reusable System',
    detailTitle: 'Details',
    formTitle: 'Request a quote',
    formCta: 'Send quote request',
    doneTitle: 'Quote request received.',
    cmpUse: 'Tested for up to 20 uses',
    cmpPack: 'Ask Elident',
    cmpPrice: 'On request',
    cmpPriceNote: '',
    shown: 'Shown: the reusable Elident articulator, three-quarter view.',
    media: { src: '/_blob/fc86e8aa8a60cca3563b69abc4d976d3', alt: 'Elident reusable articulator with clear trays, blue fixators and metal guide pin' },
    gallery: [
      { label: 'Parts, fixators off', src: '/_blob/24267ad1202288f89c807538ce3b6ffb' },
      { label: 'Fixators on', src: '/_blob/d33297ddd336c9a5205d67e6ca794cd2' },
      { label: 'Empty and mounted, side by side', src: '/_blob/4ae5a7792c02b7bf428f7af246da280a' },
      { label: 'Models mounted, front', src: '/_blob/5676624b103b94284492124f3c9f742f' },
    ],
  },
  {
    id: 'disposable',
    cat: 'disposable',
    catLabel: 'Disposable Articulators',
    name: 'Elident Disposable Articulators',
    short: 'Disposable Articulators',
    blurb: 'Single-use articulators — one per case, so each case keeps its own articulator.',
    lead: 'Single-use Elident articulators. Use one per case and send it out with the work.',
    price: '$100.00',
    priceNote: 'per bag of 50 sets',
    packValue: 'Bag of 50 sets',
    packLabel: 'Pack size',
    use: 'One per case',
    cta: 'View Disposable Articulators',
    detailTitle: 'Details',
    formTitle: 'Request a quote',
    formCta: 'Send quote request',
    doneTitle: 'Quote request received.',
    cmpUse: 'One set per case',
    cmpPack: 'Bag of 50 sets',
    cmpPrice: '$2.00 per set',
    cmpPriceNote: '$100.00 per bag of 50',
    shown: 'Shown: disposable articulators as packed by Elident.',
    media: { src: '/_blob/5dc29e9e09f3a9b8f556bf82466cfac6', alt: 'Clear disposable articulators stacked in their shipping box' },
    gallery: [
      { label: 'Pack, in the box', src: '/_blob/2cce11ad870c13d46efa67b99531cad2' },
      { label: 'Stacked in the shipping box', src: '/_blob/5dc29e9e09f3a9b8f556bf82466cfac6' },
    ],
  },
  {
    id: 'kit',
    cat: 'kit',
    catLabel: 'Sample Kit',
    name: 'Elident Sample Kit',
    short: 'Sample Kit',
    blurb: 'A trial set to test Elident on your own cases before you choose a system.',
    lead: 'Try Elident on your own cases before choosing between the reusable system and disposable articulators.',
    price: '$8.00',
    packValue: 'Articulator, guide pin, thumb screw, nut (per photo)',
    packLabel: 'Kit contents',
    use: 'Trial set',
    cta: 'View Sample Kit',
    detailTitle: 'What’s in the kit',
    formTitle: 'Request the sample kit — $8.00',
    formCta: 'Send kit request',
    doneTitle: 'Kit request received.',
    media: { src: '/_blob/4e01bd9f0a9f480df17c2c36e927e6f9', alt: 'Elident sample kit with an open articulator and metal accessories' },
    gallery: [{ label: 'Articulator and accessories', src: '/_blob/4e01bd9f0a9f480df17c2c36e927e6f9' }],
  },
];

export function productById(id: string): Product {
  return PRODUCTS.find((p) => p.id === id) ?? PRODUCTS[0];
}

export function priceText(p: Product): string {
  return p.price || 'On request';
}

export function priceSub(p: Product): string {
  return p.id === 'disposable' ? 'per bag of 50 sets · $2.00 per set' : p.id === 'kit' ? 'per kit' : 'Ask Elident for a quote';
}

export function productHref(id: string): string {
  return `/product/${id}`;
}

export const FILTERS: { id: 'all' | ProductId; label: string }[] = [
  { id: 'all', label: 'All products' },
  { id: 'reusable', label: 'Reusable' },
  { id: 'disposable', label: 'Disposable' },
  { id: 'kit', label: 'Sample Kit' },
];

export const ABOUT_CHAPTERS = [
  {
    k: 'At the bench',
    title: 'A working technician',
    text: 'Ilya Aronov is a dental technician who specializes in ceramic restoration, implants, and gold work.',
    src: '/_blob/660eb977770376119476517733646cb7',
    alt: 'Mounted case in an Elident tray on a lab bench, with a removable die in front',
  },
  {
    k: 'The problem',
    title: 'Less time, fewer materials',
    text: 'He set out to build a model articulator without the time and multiple materials other model systems required.',
    src: '/_blob/93fc5849f1ad793de37eced2a09b8683',
    alt: 'Stone dies seated on a lower model in the Elident tray with a blue side lock',
  },
  {
    k: 'The result',
    title: 'Elident, in two formats',
    text: 'A reusable articulator tested for up to 20 uses, single-use articulators in bags of 50 sets, and a sample kit to try first.',
    src: '/_blob/4157d460353c897f344a130394f4860c',
    alt: 'Model in an Elident tray beside a lab prescription and a caliper',
  },
].map((c, i) => ({ ...c, num: '0' + (i + 1), cls: 'is-' + i }));

// ---------- Lab Notes ----------
export type NoteBlock =
  | { t: 'p'; text: string }
  | { t: 'h'; text: string }
  | { t: 'ul'; items: string[] };

export interface Note {
  slug: string;
  topic: string;
  featured?: boolean;
  title: string;
  dek: string;
  cover: string;
  pos: string;
  alt: string;
  caption: string;
  blocks: NoteBlock[];
  cta: { text: string; label: string; href: string };
}

export const NOTES: Note[] = [
  {
    slug: 'closer-look-elident-articulator',
    topic: 'The system',
    featured: true,
    title: 'A closer look at the Elident articulator',
    dek: 'What an articulator does at the bench, and the parts you can see in Elident’s own photos.',
    cover: '/_blob/d33297ddd336c9a5205d67e6ca794cd2',
    pos: '50% 55%',
    alt: 'The Elident articulator with both blue side locks clipped onto its clear trays',
    caption: 'The Elident articulator with both blue side locks clipped on.',
    blocks: [
      { t: 'p', text: 'An articulator holds a case’s upper and lower models in a fixed relationship, so a technician can check the bite and work on a restoration at the bench. Elident was designed by dental technician Ilya Aronov, who specializes in ceramic restoration, implants, and gold work.' },
      { t: 'h', text: 'What you can see in the photos' },
      { t: 'ul', items: ['Clear upper and lower trays that hold the models.', 'A hinge frame that connects the two trays.', 'A metal guide pin with a knurled thumb screw.', 'Two blue side locks that clip around the trays.'] },
      { t: 'p', text: 'In Elident’s photos, the two halves of each blue lock meet at the front of the tray. The tray is embossed with “U.S. Pat.” and “Made in U.S.A.”' },
      { t: 'h', text: 'Why it was made' },
      { t: 'p', text: 'According to Elident, Ilya Aronov set out to build a model articulator that is fast, stable, accurate, and economical — without the time and multiple materials other model systems required.' },
    ],
    cta: { text: 'See the system in three frames, from the whole articulator to models in occlusion.', label: 'See How It Works', href: '/#how-it-works' },
  },
  {
    slug: 'reusable-vs-disposable',
    topic: 'Choosing a system',
    title: 'Reusable vs. disposable articulators',
    dek: 'Elident’s two formats, compared using only what Elident has published.',
    cover: '/_blob/7b861a333e03b66bca0250a36625dbef',
    pos: '50% 50%',
    alt: 'An empty Elident articulator next to one with models mounted',
    caption: 'An empty articulator next to one with models mounted.',
    blocks: [
      { t: 'p', text: 'Elident comes in two formats. Both hold models for bite checks at the bench; the difference is how long each articulator stays in use.' },
      { t: 'h', text: 'Reusable' },
      { t: 'ul', items: ['Elident tested the reusable articulator for up to 20 uses.', 'Light, durable construction.', 'Keeps the die stable with a minimum thickness of 2 mm.'] },
      { t: 'h', text: 'Disposable' },
      { t: 'ul', items: ['Single-use: one set per case, so each case keeps its own articulator.', 'Sold in a bag of 50 sets.'] },
      { t: 'h', text: 'Also in the catalog' },
      { t: 'p', text: 'Elident also lists side lockers as a separate item, sold as a set of 20 (40 in total), for $34.00. The disposable bag of 50 sets is $100.00.' },
    ],
    cta: { text: 'Compare both formats and the sample kit in one place.', label: 'Visit the Shop', href: '/shop' },
  },
  {
    slug: 'getting-started-sample-kit',
    topic: 'Getting started',
    title: 'Getting started with the Elident Sample Kit',
    dek: 'Why to start with a sample, and what you can see in Elident’s kit photo.',
    cover: '/_blob/4e01bd9f0a9f480df17c2c36e927e6f9',
    pos: '50% 50%',
    alt: 'Elident sample kit: an open articulator with blue side locks and a bag of metal accessories',
    caption: 'The Elident sample kit, as photographed by Elident.',
    blocks: [
      { t: 'p', text: 'The sample kit lets you try Elident on your own cases before you choose between the reusable system and disposable articulators.' },
      { t: 'h', text: 'What the photo shows' },
      { t: 'p', text: 'Elident’s kit photo shows an open articulator with blue side locks, plus a small bag with a metal guide pin, a thumb screw, and a nut. Elident confirms the exact kit contents with your order.' },
      { t: 'h', text: 'Ordering' },
      { t: 'p', text: 'The sample set is listed at $8.00 in Elident’s catalog. Send a request from the kit page and Elident replies with delivery details.' },
    ],
    cta: { text: 'Try Elident on your own models first.', label: 'View Sample Kit', href: '/product/kit' },
  },
];

export function readTime(n: Note): string {
  const words =
    n.blocks.map((b) => ('text' in b ? b.text : b.items.join(' '))).join(' ').split(/\s+/).filter(Boolean).length +
    n.dek.split(' ').length;
  return Math.max(1, Math.round(words / 200)) + ' min read';
}

export const FAQ = [
  { q: 'What is the Elident articulator used for?', a: 'It holds the upper and lower models in position so you can mount a case, check the bite, and work on restorations at the bench.' },
  { q: 'What’s the difference between the reusable and disposable options?', a: 'The reusable articulator goes back to work case after case. Disposable articulators are single-use: one set per case, so each case keeps its own articulator.' },
  { q: 'How many times can the reusable articulator be used?', a: 'Elident tested the reusable articulator for up to 20 uses. It has a light, durable construction and keeps the die stable with a minimum thickness of 2 mm.' },
  { q: 'How many sets come in a pack of disposable articulators?', a: 'Disposable articulators come in a bag of 50 sets for $100.00 — $2.00 per set.' },
  { q: 'How can I try the system in my lab?', a: 'Order the Elident Sample Kit and mount your own models before you choose a system.', link: true },
];
