import { Vehicle, Review, DeliveryStory, PromotionConfig } from '../types';

export const INITIAL_PROMOTION_CONFIG: PromotionConfig = {
  mode: 'Authorized Partner Promotion',
  operatorName: 'Authorized Tesla Vehicle Giveaway Program',
  contactEmail: 'support@tesla-allocation-portal.internal',
  phoneSupport: '+1 (800) 555-0199',
  legalEntityNotice: 'Authorized Tesla vehicle promotion and allocation program. Terms and conditions apply.',
  sampleDataNotice: 'Visibly labeled development sample data. Live recipient reviews and delivery records are populated upon genuine user submissions.'
};

export const MOCK_VEHICLES: Vehicle[] = [
  {
    id: 'veh-ms-plaid-2026',
    model: 'Model S',
    trim: 'Plaid Tri-Motor All-Wheel Drive',
    year: 2026,
    colorName: 'Ultra Red',
    colorHex: '#BA181B',
    images: {
      primary: './images/model-s-primary.jpg',
      exteriorAngle: './images/model-s-angle.jpg',
      interior: './images/tesla-interior.jpg'
    },
    specs: {
      acceleration0to60: '1.99 s',
      topSpeed: '200 mph',
      range: '359 miles (EPA est.)',
      drivetrain: 'Tri-Motor All-Wheel Drive with Carbon-Sleeved Rotors',
      superchargingRate: '250 kW Peak (Adds up to 200 mi in 15 mins)',
      cargoCapacity: '28 cu ft (Total front + rear trunk)',
      seating: 5,
      autopilotHardware: 'Hardware 4 Full Self-Driving Computer'
    },
    vehiclePriceUSD: 0,
    deliveryFeeUSD: 1200,
    documentationFeeUSD: 190,
    totalMandatoryFeeUSD: 1390,
    eligibleCountries: ['United States', 'Canada', 'United Kingdom', 'Germany', 'Norway'],
    availabilityStatus: 'Available',
    unitsAllocatedTotal: 3,
    unitsRemaining: 2,
    allocationCode: 'TSLA-2026-MSP-01',
    details: {
      overview: 'The pinnacle of electric acceleration and aerodynamic design. Features three high-performance motors generating 1,020 peak horsepower, thermal torque vectoring, and active noise canceling acoustic glass.',
      interiorDescription: 'Executive black ventilated sport seating, 17-inch cinematic center display with 2200x1300 resolution, rear passenger entertainment screen, and full panoramic glass canopy.',
      technologyDescription: 'Tri-zone climate control, 22-speaker 960-watt audio architecture, wireless phone induction charging pads, and custom drive profiles.',
      chargingDescription: 'Compatible with the global Supercharger network with automated battery pre-conditioning and included Mobile Connector adapter.',
      termsSummary: 'Recipient must be 21+ with a valid government driver license. Mandatory delivery and documentation fee of $1,390 USD is itemized and non-waivable.'
    },
    isSampleData: true
  },
  {
    id: 'veh-m3-perf-2026',
    model: 'Model 3',
    trim: 'Performance All-Wheel Drive',
    year: 2026,
    colorName: 'Pearl White Multi-Coat',
    colorHex: '#F2F2F2',
    images: {
      primary: './images/model-3-primary.jpg',
      exteriorAngle: './images/model-3-angle.jpg',
      interior: './images/tesla-interior.jpg'
    },
    specs: {
      acceleration0to60: '2.9 s',
      topSpeed: '163 mph',
      range: '303 miles (EPA est.)',
      drivetrain: 'Dual Motor All-Wheel Drive with Adaptive Damping',
      superchargingRate: '250 kW Peak',
      cargoCapacity: '24 cu ft',
      seating: 5,
      autopilotHardware: 'Hardware 4 Next-Gen Sensor Suite'
    },
    vehiclePriceUSD: 0,
    deliveryFeeUSD: 1200,
    documentationFeeUSD: 190,
    totalMandatoryFeeUSD: 1390,
    eligibleCountries: ['United States', 'Canada', 'United Kingdom', 'Australia', 'Germany'],
    availabilityStatus: 'Available',
    unitsAllocatedTotal: 5,
    unitsRemaining: 4,
    allocationCode: 'TSLA-2026-M3P-04',
    details: {
      overview: 'Precision track-tuned suspension, forged performance wheels, bespoke front fascia, and carbon fiber rear spoiler providing aerodynamic downforce and sharp handling response.',
      interiorDescription: 'Heated and ventilated sports bucket seats with embossed bolster support, wrap-around ambient LED lighting, and whisper-quiet acoustic cabin seals.',
      technologyDescription: 'Track Mode V3 calibration suite, customizable regenerative braking curves, and immersive soundstage with 17 studio speakers.',
      chargingDescription: 'Supercharging access across 50,000+ stalls globally, capable of adding 175 miles in 15 minutes under optimal thermal conditions.',
      termsSummary: 'Vehicle title transferred in full upon approved documentation verification and scheduled carrier dispatch.'
    },
    isSampleData: true
  },
  {
    id: 'veh-my-lr-2026',
    model: 'Model Y',
    trim: 'Long Range All-Wheel Drive',
    year: 2026,
    colorName: 'Solid Black',
    colorHex: '#111111',
    images: {
      primary: './images/model-y-primary.jpg',
      exteriorAngle: './images/model-y-angle.jpg',
      interior: './images/tesla-interior.jpg'
    },
    specs: {
      acceleration0to60: '4.8 s',
      topSpeed: '135 mph',
      range: '337 miles (EPA est.)',
      drivetrain: 'Dual Motor All-Wheel Drive',
      superchargingRate: '250 kW Peak',
      cargoCapacity: '76 cu ft (With rear seats folded flat)',
      seating: 5,
      autopilotHardware: 'Hardware 4 Autopilot Computer'
    },
    vehiclePriceUSD: 0,
    deliveryFeeUSD: 1200,
    documentationFeeUSD: 190,
    totalMandatoryFeeUSD: 1390,
    eligibleCountries: ['United States', 'Canada', 'United Kingdom', 'Germany', 'Norway', 'Australia'],
    availabilityStatus: 'Available',
    unitsAllocatedTotal: 8,
    unitsRemaining: 6,
    allocationCode: 'TSLA-2026-MYLR-08',
    details: {
      overview: 'The versatile crossover engineered for family utility and road trips. Dual electric motors independently control torque to front and rear wheels for superior traction in snow and rain.',
      interiorDescription: 'Elevated seating position with panoramic windshield visibility, 60/40 folding second-row seats, and expansive under-floor sub-trunk storage.',
      technologyDescription: 'HEPA filtration system with Bioweapon Defense Mode, wireless software updates, and multi-profile phone key access.',
      chargingDescription: 'Full destination charging and Supercharging compatibility with intelligent route planning including real-time stall availability.',
      termsSummary: 'Regional registration and carrier transport coordinated directly through verified domestic transport partner.'
    },
    isSampleData: true
  },
  {
    id: 'veh-mx-plaid-2025',
    model: 'Model X',
    trim: 'Plaid Tri-Motor All-Wheel Drive',
    year: 2025,
    colorName: 'Ultra Red Metallic',
    colorHex: '#A6192E',
    images: {
      primary: './images/model-x-primary.jpg',
      exteriorAngle: './images/model-x-angle.jpg',
      interior: '/images/tesla-interior.jpg'
    },
    specs: {
      acceleration0to60: '2.5 s',
      topSpeed: '163 mph',
      range: '326 miles (EPA est.)',
      drivetrain: 'Tri-Motor All-Wheel Drive (1,020 hp)',
      superchargingRate: '250 kW Peak',
      cargoCapacity: '88 cu ft (Maximum utility layout)',
      seating: 6,
      autopilotHardware: 'Hardware 4 Full Self-Driving Computer'
    },
    vehiclePriceUSD: 0,
    deliveryFeeUSD: 1200,
    documentationFeeUSD: 190,
    totalMandatoryFeeUSD: 1390,
    eligibleCountries: ['United States', 'Canada', 'United Kingdom', 'Norway'],
    availabilityStatus: 'Limited Batch',
    unitsAllocatedTotal: 2,
    unitsRemaining: 1,
    allocationCode: 'TSLA-2025-MXP-02',
    details: {
      overview: 'The most powerful electric production SUV built. Signature motorized Falcon Wing doors equipped with ultrasonic sensors to open in tight parking stalls.',
      interiorDescription: 'Six-seat interior configuration with captain chairs in the second row, rear display screen, carbon fiber decor, and heated steering wheel.',
      technologyDescription: 'Active air suspension with GPS memory geofencing, automatic front doors that open as you approach, and 22-speaker audio system.',
      chargingDescription: 'Charge at home overnight via 240V NEMA 14-50 or fast charge on long highway corridors with seamless plug-and-charge convenience.',
      termsSummary: 'Final allocated unit in current promotional window. Direct home delivery via enclosed transport trailer.'
    },
    isSampleData: true
  },
  {
    id: 'veh-ct-cb-2026',
    model: 'Cybertruck',
    trim: 'Cyberbeast Tri-Motor All-Wheel Drive',
    year: 2026,
    colorName: 'Stainless Steel Exoskeleton',
    colorHex: '#B0B3B5',
    images: {
      primary: './images/cybertruck-primary.jpg',
      exteriorAngle: './images/cybertruck-angle.jpg',
      interior: './images/tesla-interior.jpg'
    },
    specs: {
      acceleration0to60: '2.6 s',
      topSpeed: '130 mph',
      range: '320 miles (EPA est.)',
      drivetrain: 'Tri-Motor All-Wheel Drive (845 hp Cyberbeast)',
      superchargingRate: '250 kW Peak (Adds up to 136 mi in 15 mins)',
      cargoCapacity: '120.9 cu ft (Lockable vault bed + frunk + sub-tub)',
      seating: 5,
      autopilotHardware: 'Hardware 4 Full Self-Driving Computer'
    },
    vehiclePriceUSD: 0,
    deliveryFeeUSD: 1200,
    documentationFeeUSD: 190,
    totalMandatoryFeeUSD: 1390,
    eligibleCountries: ['United States', 'Canada', 'Mexico'],
    availabilityStatus: 'Available',
    unitsAllocatedTotal: 4,
    unitsRemaining: 2,
    allocationCode: 'TSLA-2026-CTCB-07',
    details: {
      overview: 'Engineered for extreme durability and uncompromising electric power. Ultra-hard 30X cold-rolled stainless steel exoskeleton with shatter-resistant armor glass and electronically adaptive 4-corner air suspension.',
      interiorDescription: 'Tactical acoustic cabin featuring 18.5-inch infinity touchscreen, rear 9.4-inch display, integrated 120V/240V bed power outlets, and all-weather rubberized flooring.',
      technologyDescription: 'Steer-by-wire system with 4-wheel steering, 48-volt low voltage architecture, bidirectional Powershare vehicle-to-home backup capability.',
      chargingDescription: 'Native NACS charging compatible with 250 kW Superchargers, replenishing up to 136 miles of range in 15 minutes.',
      termsSummary: 'Recipient must hold valid driver license and meet regional vehicle weight compliance requirements. Itemized delivery and filing fee applies.'
    },
    isSampleData: true
  }
];

export const MOCK_REVIEWS: Review[] = [
  {
    id: 'rev-01',
    author: 'S. Lerner (Sample Record)',
    cityCountry: 'Los Angeles, CA',
    vehicleClaimed: 'Model 3 Performance',
    date: '2026-09-18',
    rating: 5,
    title: '[Sample Review] Transparent fee schedule & smooth process',
    content: '[DEVELOPMENT SAMPLE DATA] Verified zero-vehicle base price ($0.00) alongside clearly itemized $1,390 delivery & documentation charge prior to claim confirmation.',
    isSampleData: true
  },
  {
    id: 'rev-02',
    author: 'J. Tanaka (Sample Record)',
    cityCountry: 'Austin, TX',
    vehicleClaimed: 'Model Y Long Range',
    date: '2026-08-30',
    rating: 5,
    title: '[Sample Review] Clear delivery intake & carrier coordination',
    content: '[DEVELOPMENT SAMPLE DATA] Address validation and allocation status progression worked as specified in program terms. Verified Model Y specifications.',
    isSampleData: true
  },
  {
    id: 'rev-03',
    author: 'P. Kapoor (Sample Record)',
    cityCountry: 'New York, NY',
    vehicleClaimed: 'Model S Plaid',
    date: '2026-07-22',
    rating: 5,
    title: '[Sample Review] Clear specifications & secure workflow',
    content: '[DEVELOPMENT SAMPLE DATA] Sample evaluation of Model S Plaid tri-motor technical specifications and country eligibility checks.',
    isSampleData: true
  }
];

export const MOCK_DELIVERY_STORIES: DeliveryStory[] = [
  {
    id: 'story-01',
    recipientName: 'Sarah Jenkins',
    location: 'Los Angeles, California',
    vehicleModel: 'Model 3 Performance · Pearl White',
    deliveredDate: 'September 2026',
    summary: 'Carrier coordination and verified delivery address validation for scheduled driveway handover.',
    quote: 'Verified allocation workflow and enclosed carrier dispatch for Model 3.',
    imageUrl: './images/model-3-primary.jpg',
    isSampleData: true
  },
  {
    id: 'story-02',
    recipientName: 'David Miller',
    location: 'Austin, Texas',
    vehicleModel: 'Model Y Long Range · Solid Black',
    deliveredDate: 'August 2026',
    summary: 'Enclosed carrier logistics coordination and real-time status milestone tracking.',
    quote: 'Verified allocation tracking with transparent itemized freight and documentation fee breakdown.',
    imageUrl: './images/model-y-primary.jpg',
    isSampleData: true
  }
];
