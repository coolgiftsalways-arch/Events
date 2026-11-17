// ==========================================
// STALLORA - EVENTS DATA
// TOTAL: 63 EVENTS
// ==========================================

const baseEvents = [
  {
    id: "mumbai-flea",
    title: "Mumbai Flea & Lifestyle Fest",
    date: "14–16 Dec 2026",
    startDate: "2026-12-14",
    venue: "Jio World Drive, BKC, Mumbai",
    time: "11:00 AM – 10:00 PM",
    organiser: "Urban Events",
    logo: "URBAN\nEVENTS",
    category: ["Lifestyle", "Fashion", "Food"],
    status: "Stalls Open",
    city: "Mumbai",
    image:
      "https://images.unsplash.com/photo-1517457373958-b7ad069c4b9e?w=1000&q=85",
  },
  {
    id: "mumbai-food-carnival",
    title: "Mumbai Food & Street Carnival",
    date: "19–20 Dec 2026",
    startDate: "2026-12-19",
    venue: "Bandra Kurla Complex, Mumbai",
    time: "12:00 PM – 11:00 PM",
    organiser: "Foodie Events",
    logo: "FOODIE\nEVENTS",
    category: ["Food", "Lifestyle"],
    status: "Few Stalls Left",
    city: "Mumbai",
    image:
      "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=1000&q=85",
  },
  {
    id: "christmas-market",
    title: "Christmas Wonderland Market",
    date: "21–25 Dec 2026",
    startDate: "2026-12-21",
    venue: "Phoenix Marketcity, Kurla, Mumbai",
    time: "11:00 AM – 10:00 PM",
    organiser: "Festive Creations",
    logo: "FESTIVE\nCREATIONS",
    category: ["Lifestyle", "Fashion", "Food"],
    status: "Stalls Open",
    city: "Mumbai",
    image:
      "https://images.unsplash.com/photo-1512389142860-9c449e58a543?w=1000&q=85",
  },
  {
    id: "handmade-art-fair",
    title: "Handmade & Artisans Fair",
    date: "26–27 Dec 2026",
    startDate: "2026-12-26",
    venue: "Juhu Tara Road, Mumbai",
    time: "10:00 AM – 9:00 PM",
    organiser: "Creative Mumbai",
    logo: "CREATIVE\nMUMBAI",
    category: ["Art", "Handmade", "Lifestyle"],
    status: "Stalls Open",
    city: "Mumbai",
    image:
      "https://images.unsplash.com/photo-1452860606245-08befc0ff44b?w=1000&q=85",
  },
  {
    id: "new-year-bazaar",
    title: "New Year Shopping Bazaar",
    date: "29–31 Dec 2026",
    startDate: "2026-12-29",
    venue: "Oberoi Mall, Goregaon, Mumbai",
    time: "11:00 AM – 10:00 PM",
    organiser: "Urban Market",
    logo: "URBAN\nMARKET",
    category: ["Fashion", "Lifestyle", "Accessories"],
    status: "Few Stalls Left",
    city: "Mumbai",
    image:
      "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1000&q=85",
  },
  {
    id: "mumbai-wedding-expo",
    title: "Mumbai Wedding & Lifestyle Expo",
    date: "3–4 Jan 2027",
    startDate: "2027-01-03",
    venue: "NESCO Exhibition Centre, Goregaon, Mumbai",
    time: "10:00 AM – 8:00 PM",
    organiser: "Elite Exhibitions",
    logo: "ELITE\nEXHIBITIONS",
    category: ["Fashion", "Lifestyle", "Jewellery"],
    status: "Stalls Open",
    city: "Mumbai",
    image:
      "https://images.unsplash.com/photo-1519741497674-611481863552?w=1000&q=85",
  },
  {
    id: "fitness-wellness",
    title: "Fitness & Wellness Festival",
    date: "9–10 Jan 2027",
    startDate: "2027-01-09",
    venue: "Bandra Reclamation, Mumbai",
    time: "7:00 AM – 9:00 PM",
    organiser: "FitLife Events",
    logo: "FITLIFE\nEVENTS",
    category: ["Fitness", "Health", "Lifestyle"],
    status: "Stalls Open",
    city: "Mumbai",
    image:
      "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=1000&q=85",
  },
  {
    id: "fashion-pop-up",
    title: "The Fashion Pop-Up Show",
    date: "15–17 Jan 2027",
    startDate: "2027-01-15",
    venue: "Jio World Convention Centre, Mumbai",
    time: "11:00 AM – 9:00 PM",
    organiser: "Style Collective",
    logo: "STYLE\nCOLLECTIVE",
    category: ["Fashion", "Beauty", "Accessories"],
    status: "Few Stalls Left",
    city: "Mumbai",
    image:
      "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1000&q=85",
  },
  {
    id: "pet-lovers-festival",
    title: "Mumbai Pet Lovers Festival",
    date: "23–24 Jan 2027",
    startDate: "2027-01-23",
    venue: "MMRDA Grounds, BKC, Mumbai",
    time: "10:00 AM – 8:00 PM",
    organiser: "Paws & People",
    logo: "PAWS &\nPEOPLE",
    category: ["Pets", "Lifestyle", "Food"],
    status: "Stalls Open",
    city: "Mumbai",
    image:
      "https://images.unsplash.com/photo-1450778869180-41d0601e046e?w=1000&q=85",
  },
  {
    id: "organic-living-expo",
    title: "Organic & Sustainable Living Expo",
    date: "30–31 Jan 2027",
    startDate: "2027-01-30",
    venue: "Nehru Centre, Worli, Mumbai",
    time: "10:00 AM – 8:00 PM",
    organiser: "Green Earth Events",
    logo: "GREEN EARTH",
    category: ["Organic", "Food", "Lifestyle"],
    status: "Stalls Open",
    city: "Mumbai",
    image:
      "https://images.unsplash.com/photo-1542838132-92c53300491e?w=1000&q=85",
  },
];

// ==========================================
// 53 ADDITIONAL DEMO EVENTS
// ==========================================

const demoEventNames = [
  "Mumbai Shopping Carnival",
  "Fashion & Lifestyle Expo",
  "The Grand Food Festival",
  "Mumbai Art & Craft Exhibition",
  "Winter Flea Market",
  "Beauty & Wellness Expo",
  "Street Food Fiesta",
  "Handmade Products Fair",
  "The Wedding Shopping Expo",
  "Luxury Lifestyle Exhibition",
  "Mumbai Music & Culture Fest",
  "Organic Food Festival",
  "Kids Fun Carnival",
  "Pet Products Exhibition",
  "Home Decor Expo",
  "Jewellery & Accessories Fair",
  "Startup & Business Expo",
  "Travel & Tourism Exhibition",
  "Fitness Lifestyle Festival",
  "The Christmas Shopping Fest",
  "New Year Lifestyle Market",
  "Designer Fashion Exhibition",
  "Mumbai Book & Art Fair",
  "Chocolate & Dessert Festival",
  "Indian Handloom Exhibition",
  "Home Business Expo",
  "The Vegan Food Festival",
  "Digital Creators Meet",
  "Sustainable Living Expo",
  "Luxury Shopping Festival",
  "Mumbai Cultural Carnival",
  "Photography Exhibition",
  "The Gourmet Food Show",
  "Wedding Decor Exhibition",
  "Fashion Accessories Fair",
  "Local Brands Exhibition",
  "The Craft Village",
  "International Food Fest",
  "Beauty Brands Showcase",
  "Mumbai Summer Bazaar",
  "The Lifestyle Weekend",
  "Eco Friendly Products Fair",
  "Artisan Market Mumbai",
  "Fashion Designers Meet",
  "The Shopping Experience",
  "Mumbai Flea Market",
  "Food Truck Festival",
  "Handmade Jewellery Fair",
  "Premium Brands Expo",
  "The Creative Market",
  "Mumbai Business Carnival",
  "Lifestyle & Fashion Show",
  "Grand Exhibition Mumbai",
];

const demoImages = [
  "photo-1517457373958-b7ad069c4b9e",
  "photo-1555939594-58d7cb561ad1",
  "photo-1512389142860-9c449e58a543",
  "photo-1452860606245-08befc0ff44b",
  "photo-1441986300917-64674bd600d8",
  "photo-1483985988355-763728e1935b",
];

const demoEvents = demoEventNames.map((title, index) => {
  const eventNumber = index + 11;
  const day = (index % 27) + 1;
  const month = index < 20 ? "02" : "03";
  const monthName = month === "02" ? "Feb" : "Mar";

  return {
    id: `stallora-demo-${eventNumber}`,
    title,
    date: `${day}–${day + 1} ${monthName} 2027`,
    startDate: `2027-${month}-${String(day).padStart(2, "0")}`,
    venue: `Exhibition Ground ${eventNumber}, Mumbai`,
    time: "11:00 AM – 10:00 PM",
    organiser: "STALLORA Events",
    logo: "STALLORA",
    category: ["Lifestyle", "Fashion", "Food"],
    status: "Stalls Open",
    city: "Mumbai",
    image: `https://images.unsplash.com/${demoImages[index % demoImages.length]}?w=1000&q=85`,
  };
});

// ==========================================
// FINAL EVENTS ARRAY
// TOTAL: 10 + 53 = 63
// ==========================================

export const events = [...baseEvents, ...demoEvents];

console.log("STALLORA Total Events:", events.length);

// ==========================================
// EVENT DETAILS
// ORIGINAL 10 EVENTS
// ==========================================

export const eventDetails = {
  "mumbai-flea": {
    about:
      "A lively weekend market featuring fashion, lifestyle brands, independent creators and exciting food experiences. Discover unique products and connect with thousands of shoppers.",
    footfall: "5,000+ expected visitors",
    audience: "Families, shoppers and lifestyle enthusiasts",
    organiserPhone: "+91 98765 43210",
    organiserEmail: "urban.events@example.com",
    gallery: [],
    stalls: [
      {
        id: "A01",
        type: "Standard Stall",
        size: "6 × 6 ft",
        price: 12000,
        available: true,
      },
      {
        id: "A02",
        type: "Corner Stall",
        size: "8 × 6 ft",
        price: 16000,
        available: true,
      },
      {
        id: "A03",
        type: "Premium Stall",
        size: "10 × 10 ft",
        price: 22000,
        available: false,
      },
      {
        id: "A04",
        type: "Standard Stall",
        size: "6 × 6 ft",
        price: 12000,
        available: true,
      },
    ],
  },

  "mumbai-food-carnival": {
    about:
      "Experience Mumbai's incredible food culture with street food vendors, home chefs, dessert brands and speciality food businesses.",
    footfall: "7,000+ expected visitors",
    audience: "Food lovers, families and young professionals",
    organiserPhone: "+91 98765 43210",
    organiserEmail: "foodie.events@example.com",
    gallery: [],
    stalls: [
      {
        id: "F01",
        type: "Food Stall",
        size: "6 × 6 ft",
        price: 15000,
        available: true,
      },
      {
        id: "F02",
        type: "Premium Food Stall",
        size: "8 × 8 ft",
        price: 20000,
        available: true,
      },
      {
        id: "F03",
        type: "Beverage Stall",
        size: "6 × 6 ft",
        price: 13000,
        available: false,
      },
    ],
  },

  "christmas-market": {
    about:
      "Celebrate the festive season at a beautiful Christmas market featuring handmade gifts, festive decorations, fashion, food and seasonal shopping experiences.",
    footfall: "8,000+ expected visitors",
    audience: "Families, couples, tourists and festive shoppers",
    organiserPhone: "+91 98765 43210",
    organiserEmail: "festive.events@example.com",
    gallery: [],
    stalls: [
      {
        id: "C01",
        type: "Standard Stall",
        size: "6 × 6 ft",
        price: 14000,
        available: true,
      },
      {
        id: "C02",
        type: "Gift Stall",
        size: "8 × 6 ft",
        price: 18000,
        available: true,
      },
      {
        id: "C03",
        type: "Food Stall",
        size: "8 × 8 ft",
        price: 22000,
        available: false,
      },
    ],
  },

  "handmade-art-fair": {
    about:
      "A creative marketplace celebrating handmade products, local artists, independent designers, paintings, crafts and unique creations.",
    footfall: "3,500+ expected visitors",
    audience: "Art lovers, collectors, families and creative entrepreneurs",
    organiserPhone: "+91 98765 43210",
    organiserEmail: "creative.events@example.com",
    gallery: [],
    stalls: [
      {
        id: "H01",
        type: "Artist Stall",
        size: "6 × 6 ft",
        price: 9000,
        available: true,
      },
      {
        id: "H02",
        type: "Craft Stall",
        size: "8 × 6 ft",
        price: 13000,
        available: true,
      },
      {
        id: "H03",
        type: "Premium Display Stall",
        size: "10 × 8 ft",
        price: 18000,
        available: false,
      },
    ],
  },

  "new-year-bazaar": {
    about:
      "Welcome the new year with a vibrant shopping bazaar featuring fashion, accessories, lifestyle products, gifts and food brands.",
    footfall: "6,000+ expected visitors",
    audience: "Shoppers, families and young professionals",
    organiserPhone: "+91 98765 43210",
    organiserEmail: "market.events@example.com",
    gallery: [],
    stalls: [
      {
        id: "N01",
        type: "Standard Stall",
        size: "6 × 6 ft",
        price: 11000,
        available: true,
      },
      {
        id: "N02",
        type: "Corner Stall",
        size: "8 × 6 ft",
        price: 16000,
        available: false,
      },
      {
        id: "N03",
        type: "Premium Stall",
        size: "10 × 10 ft",
        price: 21000,
        available: true,
      },
    ],
  },

  "mumbai-wedding-expo": {
    about:
      "A wedding and lifestyle exhibition bringing together bridal fashion, jewellery, wedding planners, decorators, photographers and premium lifestyle brands.",
    footfall: "5,500+ expected visitors",
    audience: "Couples, families, wedding planners and premium shoppers",
    organiserPhone: "+91 98765 43210",
    organiserEmail: "elite.events@example.com",
    gallery: [],
    stalls: [
      {
        id: "W01",
        type: "Standard Stall",
        size: "8 × 6 ft",
        price: 18000,
        available: true,
      },
      {
        id: "W02",
        type: "Premium Stall",
        size: "10 × 10 ft",
        price: 28000,
        available: true,
      },
      {
        id: "W03",
        type: "Corner Stall",
        size: "8 × 8 ft",
        price: 22000,
        available: false,
      },
    ],
  },

  "fitness-wellness": {
    about:
      "A festival dedicated to fitness, wellness and healthy living, bringing together fitness brands, nutrition companies, sports businesses and wellness creators.",
    footfall: "4,000+ expected visitors",
    audience: "Fitness enthusiasts, athletes and health-conscious visitors",
    organiserPhone: "+91 98765 43210",
    organiserEmail: "fitlife.events@example.com",
    gallery: [],
    stalls: [
      {
        id: "FIT01",
        type: "Standard Stall",
        size: "6 × 6 ft",
        price: 10000,
        available: true,
      },
      {
        id: "FIT02",
        type: "Premium Stall",
        size: "8 × 8 ft",
        price: 17000,
        available: true,
      },
      {
        id: "FIT03",
        type: "Brand Showcase Stall",
        size: "10 × 10 ft",
        price: 23000,
        available: false,
      },
    ],
  },

  "fashion-pop-up": {
    about:
      "A curated fashion event showcasing independent clothing labels, accessories, beauty brands, designers and emerging fashion entrepreneurs.",
    footfall: "6,500+ expected visitors",
    audience: "Fashion enthusiasts, influencers and premium shoppers",
    organiserPhone: "+91 98765 43210",
    organiserEmail: "style.events@example.com",
    gallery: [],
    stalls: [
      {
        id: "P01",
        type: "Fashion Stall",
        size: "6 × 6 ft",
        price: 15000,
        available: true,
      },
      {
        id: "P02",
        type: "Premium Fashion Stall",
        size: "8 × 8 ft",
        price: 22000,
        available: false,
      },
      {
        id: "P03",
        type: "Designer Showcase",
        size: "10 × 10 ft",
        price: 30000,
        available: true,
      },
    ],
  },

  "pet-lovers-festival": {
    about:
      "A fun-filled celebration for pets and their owners featuring pet products, accessories, food brands, grooming services and pet-friendly activities.",
    footfall: "4,500+ expected visitors",
    audience: "Pet owners, animal lovers and families",
    organiserPhone: "+91 98765 43210",
    organiserEmail: "paws.events@example.com",
    gallery: [],
    stalls: [
      {
        id: "PET01",
        type: "Standard Stall",
        size: "6 × 6 ft",
        price: 10000,
        available: true,
      },
      {
        id: "PET02",
        type: "Pet Food Stall",
        size: "8 × 6 ft",
        price: 14000,
        available: true,
      },
      {
        id: "PET03",
        type: "Premium Brand Stall",
        size: "10 × 8 ft",
        price: 19000,
        available: false,
      },
    ],
  },

  "organic-living-expo": {
    about:
      "An exhibition promoting sustainable living, organic food, eco-friendly products, natural skincare, sustainable fashion and responsible businesses.",
    footfall: "3,000+ expected visitors",
    audience: "Eco-conscious shoppers, families and sustainable brands",
    organiserPhone: "+91 98765 43210",
    organiserEmail: "green.events@example.com",
    gallery: [],
    stalls: [
      {
        id: "G01",
        type: "Standard Stall",
        size: "6 × 6 ft",
        price: 9000,
        available: true,
      },
      {
        id: "G02",
        type: "Organic Food Stall",
        size: "8 × 6 ft",
        price: 13000,
        available: true,
      },
      {
        id: "G03",
        type: "Premium Eco Brand Stall",
        size: "10 × 8 ft",
        price: 18000,
        available: false,
      },
    ],
  },
};
