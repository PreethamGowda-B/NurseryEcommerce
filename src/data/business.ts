export interface BusinessInfo {
  name: string;
  tagline: string;
  shortDescription: string;
  fullDescription: string;
  email: string;
  phone: string;
  phoneRaw: string;
  whatsappNumber: string;
  whatsappFormatted: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  googleMapsEmbedUrl: string;
  googleMapsDirectionsUrl: string;
  openingHours: {
    weekdays: string;
    weekends: string;
    closed: string;
  };
  instagramHandle: string;
  instagramUrl: string;
  isPlaceholder: boolean;
}

export const businessData: BusinessInfo = {
  name: "SHEENEEKA NURSERY",
  tagline: "Bringing Nature Closer to You",
  shortDescription: "A sanctuary of living art, architectural flora, organic garden design, and rare botanical specimens.",
  fullDescription: "Sheeneeka Nursery is a premier botanical garden center providing carefully cultivated indoor foliage, outdoor trees, flowering specimens, organic soils, and handcrafted pottery. Visit our living nursery to discover the ideal green addition for your home or garden.",
  
  // Official Contact details
  email: "shreeneekanursery@gmail.com",
  phone: "+91 81231 91863",
  phoneRaw: "+918123191863",
  whatsappNumber: "918123191863",
  whatsappFormatted: "+91 81231 91863",
  
  // Location details
  address: "Main Nursery Road, Green Sanctuary Zone",
  city: "Bengaluru",
  state: "Karnataka",
  pincode: "560001",
  
  // Maps URLs
  googleMapsEmbedUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3887.9547514101416!2d77.5945627!3d12.9715987!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bae1670c9b44e6d%3A0xf831d141ebd8999!2sBengaluru%2C%20Karnataka!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin",
  googleMapsDirectionsUrl: "https://maps.google.com/?q=Sheeneeka+Nursery+Bengaluru",
  
  // Opening hours
  openingHours: {
    weekdays: "8:00 AM – 7:30 PM",
    weekends: "7:30 AM – 8:00 PM",
    closed: "Open All Days",
  },
  
  // Social link
  instagramHandle: "@sheeneekanursery",
  instagramUrl: "https://instagram.com",
  
  // Flag indicating content uses sample placeholder data until owner confirms
  isPlaceholder: true,
};
