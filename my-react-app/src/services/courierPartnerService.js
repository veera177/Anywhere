const availablePartners = [
    {
        partnerId: 12,
        partnerName: "Aravind Kumar",
        mobileNumber: "+91 9876543210",
        vehicleType: "Bike",
        vehicleNumber: "TN 09 AB 1234",
        rating: 4.8,
        totalDeliveries: 1240,
        status: "Available",
        estimatedPickupTime: 4,
        distanceFromPickup: 2.4,
        photo: "https://images.unsplash.com/photo-1607346256330-dee7af15f7c5?auto=format&fit=crop&w=240&q=80"
    },
    {
        partnerId: 18,
        partnerName: "Rahul Prakash",
        mobileNumber: "+91 9842218765",
        vehicleType: "Scooter",
        vehicleNumber: "TN 22 XY 8765",
        rating: 4.9,
        totalDeliveries: 980,
        status: "Available",
        estimatedPickupTime: 7,
        distanceFromPickup: 4.1,
        photo: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=240&q=80"
    },
    {
        partnerId: 21,
        partnerName: "Suresh Balan",
        mobileNumber: "+91 9003341122",
        vehicleType: "Mini Van",
        vehicleNumber: "TN 10 PQ 1234",
        rating: 4.7,
        totalDeliveries: 1510,
        status: "Available",
        estimatedPickupTime: 10,
        distanceFromPickup: 5.8,
        photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=240&q=80"
    },
    {
        partnerId: 25,
        partnerName: "Vignesh Raja",
        mobileNumber: "+91 9790012345",
        vehicleType: "Auto",
        vehicleNumber: "TN 07 LM 4421",
        rating: 4.6,
        totalDeliveries: 760,
        status: "Available",
        estimatedPickupTime: 8,
        distanceFromPickup: 4.9,
        photo: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&w=240&q=80"
    }
];

export async function loadAvailableCourierPartners(sortBy = "nearest") {
    await new Promise((resolve) => setTimeout(resolve, 180));
    const partners = availablePartners.filter((partner) => partner.status === "Available");

    return [...partners].sort((a, b) => {
        if (sortBy === "rating") return b.rating - a.rating;
        if (sortBy === "pickup") return a.estimatedPickupTime - b.estimatedPickupTime;
        return a.distanceFromPickup - b.distanceFromPickup;
    });
}
