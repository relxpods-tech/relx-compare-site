// The only facts the site may show (spec section 6). Change data here, never in templates.
// Every spec value is { value, status }. status: confirmed | majority | not_confirmed
// Templates render not_confirmed as "Not confirmed" automatically.
// Rule (verified Oct 28, 2026 against UAE RELX sites, notes in research/): a value needs at least
// two UAE sites stating it and more sites agreeing than disagreeing. confirmed = no UAE site disagrees.

const c = (value) => ({ value, status: 'confirmed' });
const m = (value) => ({ value, status: 'majority' });
const NC = { value: null, status: 'not_confirmed' };
const NA = { value: null, status: 'not_applicable' }; // renders as an em dash

module.exports = {
  updated_at: '2026-10-28',

  // Fixed order (section 6.1). Pair slugs follow this order.
  devices: [
    {
      id: 'infinity-2',
      name: 'RELX Infinity 2',
      short: 'Infinity 2',
      generation: '6th gen',
      stocked: true,
      category: '/category/relx-infinity-2',
      specs: {
        battery: m('440 mAh'),
        port: c('USB-C'),
        chargeTime: m('About 27 min full; about 80% in 15 min'),
        modes: { value: '3: Eco, Smooth, Boost', status: 'confirmed', count: 3 },
        modeOutput: m('Eco 5.5 W, Smooth 6.5 W, Boost 8 W'),
        modeLights: c('Eco green, Smooth blue, Boost purple'),
        body: NC,
      },
    },
    {
      id: 'infinity-2-plus',
      name: 'RELX Infinity 2 Plus',
      short: 'Infinity 2 Plus',
      generation: '7th gen',
      stocked: false,
      specs: {
        battery: NC, // 440 mAh on non-UAE sites; no live UAE page states it
        port: m('USB-C'),
        chargeTime: m('About 80% in 15 min'),
        modes: { value: '3: Eco, Smooth, Boost', status: 'majority', count: 3 },
        modeOutput: m('Eco 6.5 W, Smooth 8 W, Boost 10 W'),
        modeLights: NC,
        body: NC,
      },
    },
    {
      id: 'infinity',
      name: 'RELX Infinity',
      short: 'Infinity',
      generation: '4th gen',
      stocked: false,
      specs: {
        battery: m('380 mAh'),
        port: c('USB-C'),
        chargeTime: NC,
        modes: { value: 'None, single output', status: 'majority', count: 0 },
        modeOutput: NA,
        modeLights: NA,
        body: NC,
      },
    },
    {
      id: 'infinity-plus',
      name: 'RELX Infinity Plus',
      short: 'Infinity Plus',
      generation: '5th gen',
      stocked: false,
      specs: {
        battery: c('380 mAh'),
        port: c('USB-C'),
        chargeTime: m('About 45 min'),
        modes: { value: 'None, single output', status: 'majority', count: 0 },
        modeOutput: NA,
        modeLights: NA,
        body: NC,
      },
    },
    {
      id: 'essential',
      name: 'RELX Essential',
      short: 'Essential',
      generation: '4th gen',
      stocked: false,
      specs: {
        battery: c('350 mAh'),
        port: c('USB-C'),
        chargeTime: m('About 40 min'),
        modes: { value: 'None, single output', status: 'majority', count: 0 },
        modeOutput: NA,
        modeLights: NA,
        body: NC,
      },
    },
    {
      id: 'artisan',
      name: 'RELX Artisan',
      short: 'Artisan',
      generation: 'premium shell',
      stocked: true,
      category: '/category/relx-artisan',
      specs: {
        battery: m('380 mAh'),
        port: c('USB-C'),
        chargeTime: m('About 45 min'),
        modes: { value: 'None, single output', status: 'majority', count: 0 },
        modeOutput: NA,
        modeLights: NA,
        body: c('Leather or metal finish'),
      },
    },
  ],

  // Pod lines (never devices). Section 6.3.
  pods: [
    {
      id: 'pod-pro',
      name: 'RELX Pod Pro',
      category: '/category/relx-pod-pro',
      liquid: c('1.9 mL'),
      perPack: c('2 pods'),
      nicotine: { value: '1.8%', status: 'catalog' },
      puffs: m('About 500 to 650'),
      coil: m('Ceramic'),
    },
    {
      id: 'pod-pro-2',
      name: 'RELX Pod Pro 2',
      category: '/category/relx-pod-pro-2',
      liquid: c('1.9 mL'),
      perPack: c('1 pod'),
      nicotine: { value: '1.5% (labeled 15 mg), 3%, 5%', status: 'catalog' },
      puffs: m('About 500 to 650'),
      coil: m('Ceramic'),
    },
  ],

  // fit: fits | usually | not_confirmed
  fits: {
    'infinity-2': {
      'pod-pro': { fit: 'fits', status: 'majority', note: m('Runs in Smooth mode only') },
      'pod-pro-2': { fit: 'fits', status: 'confirmed', note: m('Needed for the power modes') },
    },
    'infinity-2-plus': {
      'pod-pro': { fit: 'fits', status: 'majority', note: m('Runs in Smooth mode only') },
      'pod-pro-2': { fit: 'fits', status: 'confirmed', note: m('Needed for the power modes') },
    },
    infinity: {
      'pod-pro': { fit: 'fits', status: 'confirmed' },
      'pod-pro-2': { fit: 'fits', status: 'majority' },
    },
    'infinity-plus': {
      'pod-pro': { fit: 'fits', status: 'confirmed' },
      'pod-pro-2': { fit: 'fits', status: 'confirmed' },
    },
    essential: {
      'pod-pro': { fit: 'fits', status: 'confirmed' },
      'pod-pro-2': { fit: 'usually', status: 'majority' }, // 2 UAE sites yes, 1 says Pod Pro only
    },
    artisan: {
      'pod-pro': { fit: 'fits', status: 'confirmed' },
      'pod-pro-2': { fit: 'fits', status: 'majority' },
    },
  },

  // Section 6.4. {device} is replaced with the chosen device name (default "RELX device").
  // kind decides the CTA: pod -> pod categories, device -> device categories.
  symptoms: [
    {
      slug: 'not-charging',
      h1: 'RELX Not Charging',
      question: 'Why is my RELX not charging?',
      phrase: "isn't charging",
      problem: 'not charging',
      kind: 'device',
      causes: ['A dirty charging port', 'A faulty cable or adapter'],
      steps: [
        'Plug in your {device} and check whether the light comes on.',
        'Try a different USB-C cable and adapter.',
        'Clean the port gently with a dry cotton swab.',
      ],
      then: 'Still no light: the battery or port may be faulty; replace the device.',
    },
    {
      slug: 'blinking-red',
      h1: 'RELX Blinking Red Light',
      question: 'Why is my RELX blinking red?',
      phrase: 'is blinking red',
      problem: 'blinking red light',
      kind: 'device',
      causes: ['Low battery', 'The pod is not seated properly'],
      steps: [
        'Charge your {device} fully.',
        'Remove the pod and reinsert it until it clicks.',
        'Try a different pod.',
      ],
      then: 'Still blinking: see the "light keeps blinking" fix, or replace the device.',
      thenLink: 'blinking-continuously',
    },
    {
      slug: 'blinking-continuously',
      h1: 'RELX Light Keeps Blinking',
      question: 'Why does my RELX light keep blinking?',
      phrase: 'light keeps blinking',
      problem: 'light keeps blinking',
      kind: 'device',
      causes: ['Liquid or moisture near the contacts, which triggers short-circuit protection'],
      steps: [
        'Remove the pod from your {device}.',
        'Wipe the pod and device contacts dry.',
        'Leave the device to dry, then retry.',
      ],
      then: 'Still blinking: replace the device.',
    },
    {
      slug: 'blinking-white-red',
      h1: 'RELX Blinking White and Red',
      question: 'Why is my RELX blinking white and red?',
      phrase: 'is blinking white and red',
      problem: 'blinking white and red',
      kind: 'device',
      causes: ['A power supply problem from the charger or adapter', 'A short circuit, often from liquid near the contacts'],
      steps: [
        'Unplug your {device}.',
        'Remove the pod and wipe the pod and device contacts dry.',
        'Charge it with a different cable and a standard adapter, not a fast charger.',
      ],
      then: 'Still blinking: contact us on WhatsApp.',
    },
    {
      slug: 'no-vapor',
      h1: 'RELX Not Hitting / No Vapor',
      question: 'Why is my RELX not hitting?',
      phrase: "isn't hitting or making vapor",
      problem: 'not hitting / no vapor',
      kind: 'pod',
      causes: ['Low battery', 'Dirty contacts', 'An empty or faulty pod'],
      steps: [
        'Charge your {device} fully.',
        'Clean the contacts.',
        'Reseat the pod.',
        'Try a new pod.',
      ],
      then: "Works with a new pod: replace your pods. Doesn't: replace the device.",
    },
    {
      slug: 'pod-not-detected',
      h1: 'RELX Pod Not Detected',
      question: "Why doesn't my RELX detect the pod?",
      phrase: "doesn't detect the pod",
      problem: 'pod not detected',
      kind: 'pod',
      causes: ['Dirty contacts', 'The wrong pod line for the device', 'A damaged or counterfeit pod'],
      steps: [
        'Clean the contacts.',
        'Remove the pod, wait 10 seconds, and reinsert it into your {device}.',
        'Check the pod line fits your device.',
        'Try another genuine pod.',
      ],
      compatStep: 2, // zero-based index of the step that links to the compatibility row
      then: 'Pod feels loose: replace the pod.',
    },
    {
      slug: 'burnt-taste',
      h1: 'RELX Burnt Taste',
      question: 'Why does my RELX taste burnt?',
      phrase: 'tastes burnt',
      problem: 'burnt taste',
      kind: 'pod',
      causes: ['The pod is empty or dry', 'Chain vaping', 'Hard draws'],
      steps: [
        'Stop using that pod.',
        'Replace the pod in your {device}.',
        'Take slower puffs with breaks.',
      ],
      then: "A burnt pod can't be fixed; replace it.",
    },
    {
      slug: 'leaking',
      h1: 'RELX Pod Leaking',
      question: 'Why is my RELX pod leaking?',
      phrase: 'pod is leaking',
      problem: 'pod leaking',
      kind: 'pod',
      causes: ['Heat', 'Pressure changes', 'A damaged pod'],
      steps: [
        'Remove the pod and wipe your {device} dry.',
        'Store pods upright and out of heat.',
        'Replace the pod.',
      ],
      then: 'Keeps happening with new pods: contact us on WhatsApp.',
    },
  ],

  // Infinity 2 mode switching (Majority: rpodsdubai, elvo, rpodstore, puffmart). Spec open item 1.
  modes_guide: {
    status: 'majority',
    needs: 'Mode switching only works with a RELX Pod Pro 2 inserted. With a RELX Pod Pro, the Infinity 2 stays in Smooth mode.',
    steps: [
      'Insert a RELX Pod Pro 2 until it clicks.',
      'Click the side button once to move to the next mode.',
      'Check the light: green is Eco, blue is Smooth, purple is Boost. The device vibrates to confirm each change.',
      'Keep clicking to cycle through the three modes.',
    ],
    modes: [
      { name: 'Eco', light: 'Green', output: '5.5 W', use: 'Lighter vapor and more puffs per charge.' },
      { name: 'Smooth', light: 'Blue', output: '6.5 W', use: 'The standard, balanced setting.' },
      { name: 'Boost', light: 'Purple', output: '8 W', use: 'Denser vapor and stronger flavor.' },
    ],
    stuck: [
      'Check the pod: only RELX Pod Pro 2 unlocks the modes.',
      'Remove the pod, wipe the contacts dry, and reinsert it.',
      'Charge the device, then try the side button again.',
    ],
  },

  replace_rules: {
    pod: ["It tastes burnt", "It's empty", 'It leaks', 'It feels loose'],
    device: [
      "It won't charge with a new cable",
      'The light blinks nonstop after cleaning and drying',
      'Pods are never detected',
      'It gets unusually hot',
    ],
  },

  // Pairs featured under "Popular comparisons" (section 7.1).
  popular: [
    'infinity-2-vs-artisan',
    'infinity-2-vs-infinity-2-plus',
    'infinity-vs-essential',
    'infinity-2-vs-infinity',
    'infinity-2-plus-vs-artisan',
    'infinity-2-vs-essential',
  ],
};
