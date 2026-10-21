package com.app.start_app.scratch;

import java.io.FileWriter;
import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

public class GenerateRestaurants {
    
    private static final double EARTH_RADIUS_KM = 6371.0;

    public static void main(String[] args) {
        Map<String, double[]> districts = new HashMap<>();
        districts.put("Chengalpattu", new double[]{12.6905, 79.9805});
        districts.put("Salem", new double[]{11.6643, 78.1460});
        districts.put("Chennai", new double[]{13.0827, 80.2707});
        districts.put("Coimbatore", new double[]{11.0168, 76.9658});
        districts.put("Madurai", new double[]{9.9195, 78.1193});
        districts.put("Trichy", new double[]{10.7905, 78.7047});
        districts.put("Thanjavur", new double[]{10.7870, 79.1378});
        districts.put("Kanchipuram", new double[]{12.8342, 79.7036});
        districts.put("Tiruvallur", new double[]{13.1432, 79.9079});
        districts.put("Tirunelveli", new double[]{8.7280, 77.6890});
        districts.put("Erode", new double[]{11.3410, 77.7280});
        districts.put("Vellore", new double[]{12.9250, 79.1320});
        districts.put("Tiruppur", new double[]{11.1085, 77.3410});
        districts.put("Dindigul", new double[]{10.3650, 77.9750});
        districts.put("Namakkal", new double[]{11.2189, 78.1674});
        districts.put("Karur", new double[]{10.9601, 78.0766});
        districts.put("Theni", new double[]{10.0104, 77.4768});
        districts.put("Kanyakumari", new double[]{8.1833, 77.4119});
        districts.put("Karaikudi", new double[]{10.0732, 78.7675});
        districts.put("Pollachi", new double[]{10.6609, 77.0087});
        districts.put("Ooty", new double[]{11.4102, 76.6950});
        districts.put("Ambur", new double[]{12.7900, 78.7160});
        districts.put("Tiruvannamalai", new double[]{12.2253, 79.0747});
        districts.put("Hosur", new double[]{12.7409, 77.8253});
        districts.put("Villupuram", new double[]{11.9401, 79.4861});
        districts.put("Ramanathapuram", new double[]{9.3639, 78.8395});
        districts.put("Pudukkottai", new double[]{10.3833, 78.8001});

        // Realistic Tamil Nadu restaurant names per district
        Map<String, String[]> restaurantNames = new HashMap<>();
        restaurantNames.put("Chengalpattu", new String[]{"Sri Annapoorna Mess", "Chengai Tasty Bites", "Mahalakshmi Bhavan"});
        restaurantNames.put("Salem", new String[]{"Maharaja Biriyani House", "Salem Star Mess", "Kongu Unavagam"});
        restaurantNames.put("Chennai", new String[]{"Saravana Bhavan Grand", "Adyar Ananda Bhavan", "Sangeetha Veg Restaurant"});
        restaurantNames.put("Coimbatore", new String[]{"Annapoorna Sree Gowrishankar", "Kovai Dosai Kadai", "Sri Krishna Sweets & Restaurant"});
        restaurantNames.put("Madurai", new String[]{"Meenakshi Bhavan", "Kumar Mess", "Amma Unavagam Madurai"});
        restaurantNames.put("Trichy", new String[]{"Banana Leaf Restaurant", "Sri Ganapathy Mess", "Trichy Briyani Corner"});
        restaurantNames.put("Thanjavur", new String[]{"Thillana Restaurant", "Big Temple Mess", "Neidhal Unavagam"});
        restaurantNames.put("Kanchipuram", new String[]{"Sri Kamakshi Mess", "Silk City Restaurant", "Pallava Bhavan"});
        restaurantNames.put("Tiruvallur", new String[]{"Thiruvallur Tiffin Centre", "Avadi Grand Mess", "Sri Murugan Restaurant"});
        restaurantNames.put("Tirunelveli", new String[]{"Nellai Halwa House", "Sri Balaji Mess", "Tirunelveli Annapoorani"});
        restaurantNames.put("Erode", new String[]{"Erode Thalappakatti", "Kongu Mess", "Sri Venkateswara Bhavan"});
        restaurantNames.put("Vellore", new String[]{"Fort City Restaurant", "CMC Briyani House", "Golden Mess Vellore"});
        restaurantNames.put("Tiruppur", new String[]{"Knit City Meals", "Sri Murugan Unavagam", "Tiruppur Saravana Mess"});
        restaurantNames.put("Dindigul", new String[]{"Dindigul Ponram Biriyani", "Thalapakatti Original", "Sri Murugan Mess Dindigul"});
        restaurantNames.put("Namakkal", new String[]{"Namakkal Egg Mess", "Tiruchengode Bhavan", "Sri Lakshmi Mess"});
        restaurantNames.put("Karur", new String[]{"Karur Sree Ganapathy", "Pasupathy Mess", "Theni Road Unavagam"});
        restaurantNames.put("Theni", new String[]{"Theni Chettinad Mess", "Periyakulam Bhavan", "Bodinayakanur Restaurant"});
        restaurantNames.put("Kanyakumari", new String[]{"Cape Comorin Restaurant", "Nagercoil Amma Mess", "Padmanabhapuram Bhavan"});
        restaurantNames.put("Karaikudi", new String[]{"Chettinad Palace", "Bangala Restaurant Karaikudi", "Meenakshi Chettinad Mess"});
        restaurantNames.put("Pollachi", new String[]{"Pollachi Coconut Grove", "Valparai Green Mess", "Sri Palani Andavar Restaurant"});
        restaurantNames.put("Ooty", new String[]{"Nilgiri Mountain Restaurant", "Shinkow''s Chinese Ooty", "Garden Restaurant Ooty"});
        restaurantNames.put("Ambur", new String[]{"Ambur Star Biriyani", "Vaniyambadi Mess", "Star Briyani Ambur"});
        restaurantNames.put("Tiruvannamalai", new String[]{"Arunachala Bhavan", "Ramana Mess", "Girivalam Restaurant"});
        restaurantNames.put("Hosur", new String[]{"Hosur Rasa Mess", "Krishnagiri Highway Dhaba", "Electronic City Meals"});
        restaurantNames.put("Villupuram", new String[]{"Villupuram Annapoorna", "Tindivanam Bhavan", "Ulundurpet Highway Mess"});
        restaurantNames.put("Ramanathapuram", new String[]{"Rameswaram Sea View Restaurant", "Pamban Mess", "Devipattinam Bhavan"});
        restaurantNames.put("Pudukkottai", new String[]{"Pudukkottai Palace Mess", "Thirumayam Bhavan", "Illayangudi Restaurant"});

        StringBuilder sql = new StringBuilder();
        sql.append("USE anywhere;\n");
        sql.append("SET FOREIGN_KEY_CHECKS = 0;\n");
        sql.append("TRUNCATE TABLE restaurants;\n");
        sql.append("SET FOREIGN_KEY_CHECKS = 1;\n");
        sql.append("INSERT INTO restaurants (id, name, district, rating, location, delivery_type, latitude, longitude, taluk, pincode, is_verified, is_active) VALUES\n");

        int idCounter = 1;
        boolean first = true;

        for (Map.Entry<String, double[]> entry : districts.entrySet()) {
            String dist = entry.getKey();
            double centerLat = entry.getValue()[0];
            double centerLon = entry.getValue()[1];

            int[] bearings = {0, 120, 240};
            for (int i = 0; i < bearings.length; i++) {
                double[] point = getPointAtDistance(centerLat, centerLon, 20.0, bearings[i]);
                String name = restaurantNames.get(dist)[i];
                
                if (!first) sql.append(",\n");
                first = false;
                
                sql.append(String.format("(%d, '%s', '%s', 4.5, '%s Border', 'URBAN', %.4f, %.4f, '%s Taluk', '600000', 1, 1)", 
                    idCounter, name, dist.toLowerCase(), dist, point[0], point[1], dist));
                
                idCounter++;
            }
        }
        sql.append(";\n");

        try (FileWriter writer = new FileWriter("d:/springboot/start-app/start-app/database/triangular_restaurants.sql")) {
            writer.write(sql.toString());
            System.out.println("Generated SQL");
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    private static double[] getPointAtDistance(double lat, double lon, double d, double bearing) {
        double lat1 = Math.toRadians(lat);
        double lon1 = Math.toRadians(lon);
        double brng = Math.toRadians(bearing);
        
        double lat2 = Math.asin(Math.sin(lat1) * Math.cos(d / EARTH_RADIUS_KM) + Math.cos(lat1) * Math.sin(d / EARTH_RADIUS_KM) * Math.cos(brng));
        double lon2 = lon1 + Math.atan2(Math.sin(brng) * Math.sin(d / EARTH_RADIUS_KM) * Math.cos(lat1), Math.cos(d / EARTH_RADIUS_KM) - Math.sin(lat1) * Math.sin(lat2));
        
        return new double[]{Math.toDegrees(lat2), Math.toDegrees(lon2)};
    }
}
