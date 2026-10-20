const districtNames = [
    "Chennai", "Madurai", "Coimbatore", "Dindigul", "Salem", "Tiruchirappalli",
    "Thanjavur", "Tirunelveli", "Erode", "Vellore", "Theni", "Kanyakumari",
    "Tiruppur", "Namakkal", "Karur", "Karaikudi", "Ramanathapuram", "Pudukkottai",
    "Villupuram", "Kanchipuram", "Chengalpattu", "Tiruvallur", "Hosur", "Pollachi", "Ooty"
];

const mainAreas = {
    Chennai: "Anna Nagar",
    Madurai: "Madurai Central",
    Coimbatore: "Gandhipuram",
    Dindigul: "Dindigul Town",
    Salem: "Five Roads",
    Tiruchirappalli: "Trichy Central",
    Thanjavur: "Thanjavur Town",
    Tirunelveli: "Palayamkottai",
    Erode: "Erode Bus Stand",
    Vellore: "Vellore Fort",
    Theni: "Theni Town",
    Kanyakumari: "Nagercoil",
    Tiruppur: "Tiruppur Central",
    Namakkal: "Namakkal Town",
    Karur: "Karur Town",
    Karaikudi: "Karaikudi Town",
    Ramanathapuram: "Ramanathapuram Town",
    Pudukkottai: "Pudukkottai Town",
    Villupuram: "Villupuram Town",
    Kanchipuram: "Kanchipuram Town",
    Chengalpattu: "Chengalpattu Town",
    Tiruvallur: "Tiruvallur Town",
    Hosur: "Hosur SIPCOT",
    Pollachi: "Pollachi Town",
    Ooty: "Ooty Town"
};

export const services = [
    { id: "restaurants", settingKey: "food", label: "Food", eta: "25-40 mins" },
    { id: "grocery", settingKey: "grocery", label: "Grocery", eta: "35-55 mins" },
    { id: "medical", settingKey: "medicine", label: "Medicine", eta: "25-45 mins" },
    { id: "courier", settingKey: "courier", label: "Courier", eta: "45-70 mins" }
];

export const districts = districtNames.map((name, index) => ({
    id: name.toLowerCase().replaceAll(" ", "-"),
    name,
    mainArea: mainAreas[name] || `${name} Main Area`,
    serviceCounts: {
        restaurants: 3,
        grocery: 3,
        medical: 3,
        courier: 1
    },
    partners: 10,
    serviceIds: services.map((service) => service.id)
}));

export function getDistrictById(id) {
    return districts.find((district) => district.id === id);
}

const districtStores = {
    salem: {
        restaurant: ["Salem RR Biryani (Junction)", "Selvi Mess Heritage (Five Roads)", "Mangalam Chettinad (Ammapet)"],
        grocery: ["Salem Fresh Mart", "Ponni Nilayam Provisions", "Green Valley Organic Bazaar"],
        medical: ["Apollo Care Pharmacy", "MedPlus 24x7 Health Store", "Salem Sanjeevi Medicals"],
        areas: ["Salem Junction, Suramangalam", "Five Roads, Meyyanur", "Ammapet Main Road"]
    },
    trichy: {
        restaurant: ["Banana Leaf Restaurant (Central)", "Sangeethas Pure Veg (Thillai Nagar)", "Ezham Suvai (Srirangam)"],
        grocery: ["Trichy Organic Plaza", "Kaveri Supermarket (Thillai Nagar)", "Rockfort Daily Needs (Srirangam)"],
        medical: ["Kauvery Health Pharmacy", "Thillai Nagar MedZone", "Srirangam Temple Medicals"],
        areas: ["Central Bus Stand Complex", "Thillai Nagar 10th Cross", "Srirangam South Chitra St"]
    },
    thanjavur: {
        restaurant: ["Kumbakonam Degree Coffee & Mess", "Sathars Biryani & Grill", "Brihadeeswarar Tiffin House"],
        grocery: ["Thanjavur Grains Store", "Brihadeeshwara Fresh Mart", "Delta Farmers Organic Hub"],
        medical: ["Thanjavur Wellness Pharmacy", "Meenakshi Hospital Pharmacy", "Siddha & Modern Medicals"],
        areas: ["South Rampart, Old Bus Stand", "Medical College Road", "Kumbakonam Main Road"]
    },
    theni: {
        restaurant: ["Hotel Gowri Krishna", "Suruli Falls Non-Veg Mess", "Cardamom Country Dhabha"],
        grocery: ["Theni Farm Fresh Veggie Market", "Suruli Spices & Provisions", "Highland Organic Store"],
        medical: ["Green Life Medicals", "Vaigai Valley Pharmacy", "Cardamom Hills MedCare"],
        areas: ["Theni Old Bus Stand", "Periyakulam Bazaar", "Cumbum Valley Road"]
    },
    kanyakumari: {
        restaurant: ["Nagercoil Arya Bhavan", "Cape Sea Treat Restaurant", "Marthandam Banana Leaf"],
        grocery: ["Nagercoil Heritage Supermarket", "Cape Coastal Grocery Hub", "Marthandam Honey & Agro Mart"],
        medical: ["Nagercoil Health Point Pharmacy", "Cape Care Meds", "Marthandam Emergency Medicals"],
        areas: ["Clock Tower Square", "Kanyakumari Main Bazaar", "Marthandam Junction"]
    },
    karaikudi: {
        restaurant: ["Chettinad Virundhu Heritage", "Friends Park Family Diner", "Kottaiyur Palace Mess"],
        grocery: ["Karaikudi Spices & Grocery", "Chettinad Traditional Provisions", "Kottaiyur Farm Direct Mart"],
        medical: ["Karaikudi Cure Pharmacy", "Alagappa Medical Stores", "Kottaiyur Community Pharmacy"],
        areas: ["New Bus Stand Commercial St", "Sekkalai Road", "Kottaiyur Village Road"]
    },
    pollachi: {
        restaurant: ["Pollachi Mess Traditional", "Annamalaiyar Tiffin Centre", "Coconut Valley Village Kitchen"],
        grocery: ["Pollachi Coconut & Pure Oils", "Kongu Fresh Harvest Supermarket", "Anaimalai Organic Farm Depot"],
        medical: ["Pollachi Family Medicals", "Mahalingapuram Health Hub", "Anaimalai Herbal Pharmacy"],
        areas: ["Market Road, Pollachi Town", "Mahalingapuram Main St", "Anaimalai Road"]
    },
    ooty: {
        restaurant: ["Ooty Lake View Cafe & Kitchen", "Nilgiris Hot Bun Bakery", "Ketti Valley Panoramic Diner"],
        grocery: ["Ooty Organic Greens & Berries", "Nilgiri Tea & Spice Superstore", "Coonoor Valley Farm Basket"],
        medical: ["Ooty Hill Pharmacy", "Nilgiris Herbal & Allopathy", "Coonoor Alpine Medicals"],
        areas: ["Ooty Lake Road", "Charing Cross, Commercial Rd", "Ketti Valley Road"]
    },
    ambur: {
        restaurant: ["Ambur Star Briyani", "Rahmaniya Biryani House", "Palikonda Golden Kitchen"],
        grocery: ["Ambur Town Provision Store", "Bismillah Daily Needs Supermarket", "Pernambut Fresh Agro Mart"],
        medical: ["Ambur Med Care Pharmacy", "LifeLine 24 Hours Medicals", "Pernambut Health Care"],
        areas: ["Ambur Bazaar Main St", "NH48 Service Road", "Pernambut Highway"]
    },
    tiruvannamalai: {
        restaurant: ["Temple Tiffin Sannadhi Center", "Annamalai Hills Organic Cafe", "Shanthi Veg Meals"],
        grocery: ["Tiruvannamalai Organic Agro Mart", "Arunachala Herbal & Grocery", "Deepam Supermarket"],
        medical: ["Arunachala Medical Store", "Ramana Maharshi Health Center", "Deepam 24/7 Pharmacy"],
        areas: ["East Sannadhi Street", "Girivalam Ring Road", "Polur Main Highway"]
    },
    thiruvallur: {
        restaurant: ["Thiruvallur Junction Mess", "Cool Breeze Biryani Point", "Amman Kovil Tiffin Center"],
        grocery: ["Thiruvallur Daily Mart", "Nemili Road Grocery", "Highway Fresh Store"],
        medical: ["Thiruvallur Central Pharmacy", "Nemili Road Medicals", "Highway Health Chemist"],
        areas: ["Thiruvallur Town", "Thiruvallur Bus Stand", "Thiruvallur Highway"]
    },
    kanchipuram: {
        restaurant: ["Kanchipuram Mess", "Silk City Biryani Corner", "Varadaraja Sweets & Tiffin"],
        grocery: ["Kanchipuram Heritage Mart", "Temple Town Provisions", "Kamakshi Super Store"],
        medical: ["Kanchipuram Med Plus", "Temple City Medicals", "Varadaraja Chemist"],
        areas: ["Kanchipuram Town", "Kanchipuram Bus Stand", "Kanchipuram Main Road"]
    },
    chengalpattu: {
        restaurant: ["Chengalpattu Dhaaba", "Kovil Street Biryani House", "Green Leaf Vegetarian Mess"],
        grocery: ["Chengalpattu Fresh Bazaar", "Anna Nagar Grocery Store", "Daily Needs Supermarket"],
        medical: ["Chengalpattu LifeCare", "Anna Pharmacy", "Wellness Care Chemist"],
        areas: ["Chengalpattu Town", "Chengalpattu Bus Stand", "Chengalpattu Market"]
    },
    chennai: {
        restaurant: ["Buhari Hotel 1951 (Anna Nagar)", "Murugan Idli Shop (T Nagar)", "Thalappakatti Biryani (OMR)"],
        grocery: ["Nilgiris 1905 Supermarket (Anna Nagar)", "Pazhamudir Nilayam (T Nagar)", "Fresh2Home Gourmet (Velachery)"],
        medical: ["Apollo 24x7 Pharmacy (Anna Nagar)", "MedPlus Health Hub (T Nagar)", "Fortis Health Clinic (Velachery)"],
        areas: ["Anna Nagar 2nd Avenue", "T. Nagar Pondy Bazaar", "Velachery 100 Feet Road"]
    },
    coimbatore: {
        restaurant: ["Annapoorna Gowrishankar (Gandhipuram)", "Hari Bhavanam (RS Puram)", "Kongu Naadu Mess (Peelamedu)"],
        grocery: ["Kannan Jubilee Department Store", "Pazhamudir R.S. Puram Express", "Kongu Naturals & Organic Mart"],
        medical: ["KMCH City Pharmacy (Gandhipuram)", "PSG Health Care (RS Puram)", "Ganga Hospital Medicals (Peelamedu)"],
        areas: ["Gandhipuram Cross Cut Road", "RS Puram, DB Road", "Peelamedu, Avinashi Road"]
    },
    madurai: {
        restaurant: ["Murugan Idli Shop Heritage", "Amma Mess Special Non-Veg", "Kumar Mess Virundhu"],
        grocery: ["Madurai Meenakshi Super Store", "Pandian Farmers Harvest Mart", "Jasmine Valley Provisions"],
        medical: ["Meenakshi Mission Pharmacy", "Apollo Pharmacy (KK Nagar)", "Subramaniaswamy Medicals"],
        areas: ["West Masi Street, Meenakshi Temple", "KK Nagar 80 Feet Road", "Thiruparankundram Bazaar"]
    }
};

export function buildLocalPartners(district) {
    const districtName = typeof district === "string" ? district : district.name;
    const key = districtName.toLowerCase().replaceAll(" ", "").replaceAll("-", "");
    const mainArea = typeof district === "string" ? `${district} Main Area` : district.mainArea;

    return {
        restaurants: buildShopPartners(districtName, mainArea, "restaurant", key),
        grocery: buildShopPartners(districtName, mainArea, "grocery", key),
        medical: buildShopPartners(districtName, mainArea, "medical", key),
        courier: []
    };
}

function buildShopPartners(district, mainArea, type, key) {
    const custom = districtStores[key] || districtStores[district.toLowerCase()];
    if (custom && custom[type]) {
        return custom[type].map((shopName, index) => ({
            name: shopName,
            district,
            location: custom.areas?.[index] || `${mainArea} Sector ${index + 1}`,
            phone: phoneFor(`${district}-${type}-${index}`),
            rating: (4.6 + (index * 0.1) % 0.4).toFixed(1),
            status: "Open",
            distance: `${(1.8 + index * 1.4).toFixed(1)} km`,
            deliveryType: "Verified Partner"
        }));
    }

    const prefixes = {
        restaurant: [`${mainArea} Tiffin House`, `${district} Royal Kitchen`, `Annapurna Mess & Diner`],
        grocery: [`${mainArea} Fresh Mart`, `${district} Supermarket & Staples`, `Organic Green Basket`],
        medical: [`Apollo Care Pharmacy (${mainArea})`, `${district} MedPlus 24/7`, `Sanjeevi Health Medicals`]
    };

    const areaList = [`${mainArea} North Hub`, `${mainArea} Central Bazaar`, `${mainArea} South Extension`];

    return prefixes[type].map((shopName, index) => ({
        name: shopName,
        district,
        location: `${areaList[index]}, ${district}`,
        phone: phoneFor(`${district}-${type}-${index}`),
        rating: (4.5 + index * 0.1).toFixed(1),
        status: "Open",
        distance: `${(2.1 + index * 1.5).toFixed(1)} km`,
        deliveryType: "Verified Partner"
    }));
}

function phoneFor(value) {
    const seed = value.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0);
    return `+91 9${String(700000000 + seed * 137).slice(0, 9)}`;
}
