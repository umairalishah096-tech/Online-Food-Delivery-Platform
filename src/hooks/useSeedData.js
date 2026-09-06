// One-time Firestore seeder — call seedAll() from admin settings
import { db } from "../firebase/config";
import {
  collection, doc, setDoc, getDocs, query, limit,
} from "firebase/firestore";

const restaurants = [
  {
    id: "rest_001",
    name: "Burger Palace",
    cuisine: "American • Burgers",
    description: "Home of the juiciest smash burgers in town, stacked high with fresh toppings.",
    imageUrl: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&q=80",
    rating: 4.7,
    reviewCount: 324,
    deliveryTime: "20-30",
    deliveryFee: 1.99,
    minOrder: 8,
    isOpen: true,
    tags: ["Top Rated", "Popular"],
    address: "45 Main Street, Downtown",
    phone: "+1 555-0101",
  },
  {
    id: "rest_002",
    name: "Pizza Maestro",
    cuisine: "Italian • Pizza",
    description: "Authentic Neapolitan pizzas baked in a wood-fired oven. Thin crust, rich flavour.",
    imageUrl: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&q=80",
    rating: 4.5,
    reviewCount: 218,
    deliveryTime: "25-40",
    deliveryFee: 0,
    minOrder: 12,
    isOpen: true,
    tags: ["Free Delivery", "Italian"],
    address: "12 Olive Lane, Midtown",
    phone: "+1 555-0102",
  },
  {
    id: "rest_003",
    name: "Sushi Zen",
    cuisine: "Japanese • Sushi",
    description: "Premium fresh sushi and sashimi crafted by master chefs. Delivered in 30 minutes.",
    imageUrl: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=800&q=80",
    rating: 4.8,
    reviewCount: 189,
    deliveryTime: "30-45",
    deliveryFee: 2.99,
    minOrder: 15,
    isOpen: true,
    tags: ["Premium", "Fresh"],
    address: "78 Zen Boulevard, Eastside",
    phone: "+1 555-0103",
  },
  {
    id: "rest_004",
    name: "Spice Garden",
    cuisine: "Indian • Curry",
    description: "Traditional Indian recipes with aromatic spices. Rich curries, biryanis and more.",
    imageUrl: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800&q=80",
    rating: 4.6,
    reviewCount: 401,
    deliveryTime: "30-45",
    deliveryFee: 1.49,
    minOrder: 10,
    isOpen: true,
    tags: ["Authentic", "Spicy"],
    address: "22 Curry Row, Northpark",
    phone: "+1 555-0104",
  },
  {
    id: "rest_005",
    name: "Taco Fiesta",
    cuisine: "Mexican • Street Food",
    description: "Bold Mexican flavours — street tacos, burritos, nachos and fresh guacamole.",
    imageUrl: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=800&q=80",
    rating: 4.4,
    reviewCount: 276,
    deliveryTime: "20-35",
    deliveryFee: 0,
    minOrder: 8,
    isOpen: false,
    tags: ["Free Delivery", "Mexican"],
    address: "56 Fiesta Ave, Westend",
    phone: "+1 555-0105",
  },
  {
    id: "rest_006",
    name: "The Noodle House",
    cuisine: "Chinese • Noodles",
    description: "Hand-pulled noodles in rich broths. Dim sum, dumplings and wok-fried classics.",
    imageUrl: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800&q=80",
    rating: 4.3,
    reviewCount: 154,
    deliveryTime: "25-40",
    deliveryFee: 1.99,
    minOrder: 10,
    isOpen: true,
    tags: ["Noodles", "Asian"],
    address: "99 Dragon Street, Chinatown",
    phone: "+1 555-0106",
  },
];

const menuItemsByRestaurant = {
  rest_001: [
    { name: "Classic Smash Burger", description: "Double smash patty, cheddar, pickles, special sauce", price: 12.99, category: "burger", imageUrl: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&q=80", isPopular: true, rating: 4.8, prepTime: 12, isVeg: false },
    { name: "BBQ Bacon Burger", description: "Crispy bacon, BBQ sauce, caramelised onions, Swiss cheese", price: 14.99, category: "burger", imageUrl: "https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=400&q=80", isPopular: false, rating: 4.6, prepTime: 15, isVeg: false },
    { name: "Veggie Delight Burger", description: "Plant-based patty, avocado, fresh greens, tomato relish", price: 11.99, category: "burger", imageUrl: "https://images.unsplash.com/photo-1520072959219-c595dc870360?w=400&q=80", isPopular: false, rating: 4.4, prepTime: 10, isVeg: true },
    { name: "Loaded Fries", description: "Crispy fries topped with cheese sauce, jalapeños and bacon bits", price: 6.99, category: "sides", imageUrl: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400&q=80", isPopular: true, rating: 4.7, prepTime: 8, isVeg: false },
    { name: "Chocolate Milkshake", description: "Thick and creamy, made with premium Belgian chocolate ice cream", price: 5.49, category: "drinks", imageUrl: "https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=400&q=80", isPopular: false, rating: 4.5, prepTime: 5, isVeg: true },
  ],
  rest_002: [
    { name: "Margherita Pizza", description: "San Marzano tomatoes, fresh mozzarella, basil, extra-virgin olive oil", price: 13.99, category: "pizza", imageUrl: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400&q=80", isPopular: true, rating: 4.9, prepTime: 20, isVeg: true },
    { name: "Pepperoni Feast", description: "Double pepperoni, mozzarella, fresh chilli, tomato base", price: 15.99, category: "pizza", imageUrl: "https://images.unsplash.com/photo-1628840042765-356cda07504e?w=400&q=80", isPopular: true, rating: 4.7, prepTime: 22, isVeg: false },
    { name: "Four Cheese Pizza", description: "Mozzarella, gorgonzola, parmesan and ricotta on a white base", price: 16.99, category: "pizza", imageUrl: "https://images.unsplash.com/photo-1548369937-47519962c11a?w=400&q=80", isPopular: false, rating: 4.6, prepTime: 20, isVeg: true },
    { name: "Garlic Bread", description: "Toasted ciabatta with herb butter and roasted garlic", price: 4.99, category: "sides", imageUrl: "https://images.unsplash.com/photo-1619985632461-f33748ef5fba?w=400&q=80", isPopular: false, rating: 4.5, prepTime: 8, isVeg: true },
    { name: "Tiramisu", description: "Classic Italian dessert with mascarpone and espresso-soaked ladyfingers", price: 6.99, category: "desserts", imageUrl: "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400&q=80", isPopular: false, rating: 4.8, prepTime: 5, isVeg: true },
  ],
  rest_003: [
    { name: "Salmon Nigiri (6 pcs)", description: "Premium Atlantic salmon over seasoned sushi rice", price: 14.99, category: "sushi", imageUrl: "https://images.unsplash.com/photo-1617196034183-421b4040ed20?w=400&q=80", isPopular: true, rating: 4.9, prepTime: 15, isVeg: false },
    { name: "Dragon Roll", description: "Shrimp tempura inside, avocado on top, spicy mayo drizzle", price: 16.99, category: "sushi", imageUrl: "https://images.unsplash.com/photo-1562802378-063ec186a863?w=400&q=80", isPopular: true, rating: 4.8, prepTime: 18, isVeg: false },
    { name: "Vegetable Maki (8 pcs)", description: "Cucumber, avocado, pickled radish in seasoned rice and nori", price: 10.99, category: "sushi", imageUrl: "https://images.unsplash.com/photo-1611143669185-af224c5e3252?w=400&q=80", isPopular: false, rating: 4.5, prepTime: 12, isVeg: true },
    { name: "Miso Soup", description: "Traditional dashi broth with tofu, wakame and spring onion", price: 3.99, category: "sides", imageUrl: "https://images.unsplash.com/photo-1547592180-85f173990554?w=400&q=80", isPopular: false, rating: 4.6, prepTime: 5, isVeg: true },
  ],
  rest_004: [
    { name: "Chicken Tikka Masala", description: "Tender chicken in a rich, creamy tomato-spiced sauce. Served with rice.", price: 13.99, category: "indian", imageUrl: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400&q=80", isPopular: true, rating: 4.8, prepTime: 20, isVeg: false },
    { name: "Lamb Biryani", description: "Slow-cooked basmati rice layered with spiced lamb and saffron", price: 15.99, category: "indian", imageUrl: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400&q=80", isPopular: true, rating: 4.7, prepTime: 25, isVeg: false },
    { name: "Paneer Butter Masala", description: "Cottage cheese cubes in a velvety tomato-butter gravy", price: 12.99, category: "indian", imageUrl: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=400&q=80", isPopular: false, rating: 4.6, prepTime: 18, isVeg: true },
    { name: "Garlic Naan (2 pcs)", description: "Freshly baked leavened bread with garlic and butter", price: 3.99, category: "sides", imageUrl: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&q=80", isPopular: false, rating: 4.7, prepTime: 10, isVeg: true },
    { name: "Mango Lassi", description: "Chilled yogurt drink blended with sweet Alphonso mangoes", price: 4.49, category: "drinks", imageUrl: "https://images.unsplash.com/photo-1623165088069-9ccfbf793ac8?w=400&q=80", isPopular: true, rating: 4.9, prepTime: 5, isVeg: true },
  ],
  rest_005: [
    { name: "Street Tacos (3 pcs)", description: "Seasoned beef, fresh salsa, guacamole, and cilantro on corn tortillas", price: 9.99, category: "mexican", imageUrl: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=400&q=80", isPopular: true, rating: 4.6, prepTime: 12, isVeg: false },
    { name: "Chicken Burrito", description: "Grilled chicken, black beans, rice, cheese and chipotle sauce, wrapped tight", price: 11.99, category: "mexican", imageUrl: "https://images.unsplash.com/photo-1552332386-f8dd00dc2f85?w=400&q=80", isPopular: true, rating: 4.5, prepTime: 15, isVeg: false },
    { name: "Loaded Nachos", description: "Crispy tortilla chips with cheese, jalapeños, sour cream and fresh pico", price: 8.99, category: "sides", imageUrl: "https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?w=400&q=80", isPopular: false, rating: 4.4, prepTime: 10, isVeg: true },
  ],
  rest_006: [
    { name: "Beef Ramen", description: "Rich pork-bone broth, handmade noodles, braised beef, soft egg and nori", price: 12.99, category: "chinese", imageUrl: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400&q=80", isPopular: true, rating: 4.7, prepTime: 20, isVeg: false },
    { name: "Dim Sum Basket (6 pcs)", description: "Assorted har gow, siu mai and char siu bao, steamed to perfection", price: 10.99, category: "chinese", imageUrl: "https://images.unsplash.com/photo-1563245372-f21724e3856d?w=400&q=80", isPopular: true, rating: 4.6, prepTime: 18, isVeg: false },
    { name: "Vegetable Fried Rice", description: "Wok-tossed jasmine rice with seasonal vegetables, egg and soy sauce", price: 9.99, category: "chinese", imageUrl: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400&q=80", isPopular: false, rating: 4.3, prepTime: 15, isVeg: true },
    { name: "Spring Rolls (4 pcs)", description: "Crispy golden rolls filled with glass noodles, vegetables and prawns", price: 6.99, category: "sides", imageUrl: "https://images.unsplash.com/photo-1555126634-323283e090fa?w=400&q=80", isPopular: false, rating: 4.5, prepTime: 10, isVeg: false },
  ],
};

export const seedAll = async () => {
  let count = 0;
  // Check if already seeded
  const check = await getDocs(query(collection(db, "restaurants"), limit(1)));
  if (!check.empty) return { skipped: true };

  for (const rest of restaurants) {
    const { id, ...data } = rest;
    await setDoc(doc(db, "restaurants", id), {
      ...data,
      createdAt: new Date().toISOString(),
    });

    const items = menuItemsByRestaurant[id] || [];
    for (const item of items) {
      const itemRef = doc(collection(db, "menuItems"));
      await setDoc(itemRef, {
        ...item,
        restaurantId: id,
        restaurantName: rest.name,
        available: true,
        createdAt: new Date().toISOString(),
      });
      count++;
    }
  }
  return { seeded: restaurants.length, menuItems: count };
};
