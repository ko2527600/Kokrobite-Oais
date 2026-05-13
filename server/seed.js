import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import pg from "pg"
import bcrypt from "bcryptjs"
import dotenv from "dotenv"
import path from "path"
import { fileURLToPath } from "url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.join(__dirname, ".env") })

const pool = new pg.Pool({ connectionString: process.env.DIRECT_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log("🌴 Seeding Kokrobite Oasis database...")

  // Clear all tables
  await prisma.orderItem.deleteMany()
  await prisma.customerOrderItem.deleteMany()
  await prisma.customerOrder.deleteMany()
  await prisma.order.deleteMany()
  await prisma.menuItem.deleteMany()
  await prisma.galleryItem.deleteMany()
  await prisma.branch.deleteMany()
  await prisma.review.deleteMany()
  await prisma.announcement.deleteMany()
  await prisma.siteConfig.deleteMany()
  await prisma.notification.deleteMany()
  await prisma.loyaltyHistory.deleteMany()
  await prisma.feedback.deleteMany()
  await prisma.customerAddress.deleteMany()
  await prisma.customerReview.deleteMany()
  await prisma.customer.deleteMany()
  await prisma.user.deleteMany()
  console.log("✅ Cleared all tables")

  // ─── ADMIN USER ───
  await prisma.user.create({ data: {
    name: "Kokrobite Oasis Admin",
    email: "admin@kokrobiteoasis.com",
    password: bcrypt.hashSync("KokrobiteAdmin2026!", 10),
    role: "admin"
  }})
  console.log("✅ Admin user created")

  // ─── DEMO CUSTOMER ───
  await prisma.customer.create({ data: {
    name: "Demo Customer",
    email: "demo@example.com",
    password: bcrypt.hashSync("Kokrobite2026!", 10),
    phone: "0240000000",
    loyaltyPoints: 150
  }})
  console.log("✅ Demo customer created")

  // ─── MENU ITEMS ───
  await prisma.menuItem.createMany({ data: [
    {
      name: "Ginger Gold Pancakes",
      price: "155",
      category: "Brunch",
      available: true,
      featured: true,
      description: "Fluffy pancakes with spiced ginger cookie crumble, warm lemon-honey syrup, choice of crispy bacon or chicken sausage",
      image: "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?auto=format&fit=crop&q=80&w=800"
    },
    {
      name: "KSO Island Toast",
      price: "155",
      category: "Brunch",
      available: true,
      featured: false,
      description: "French toast with tropical fruits, coconut cream, and maple syrup",
      image: "https://images.unsplash.com/photo-1484723091739-30990ddd72a2?auto=format&fit=crop&q=80&w=800"
    },
    {
      name: "Tropical Velvet Dream + Fried Chicken",
      price: "255",
      category: "Brunch",
      available: true,
      featured: true,
      description: "Buttermilk chicken golden fried in a cast-iron skillet, fluffy Belgian red velvet waffles, spiced-citrus honey glaze",
      image: "https://images.unsplash.com/photo-1562376552-0d160a2f238d?auto=format&fit=crop&q=80&w=800"
    },
    {
      name: "Accra Power Breakfast",
      price: "265",
      category: "Brunch",
      available: true,
      featured: true,
      description: "Flamed beef tenderloin served with eggs, crispy breakfast potatoes, and a rich tomato butter sauce",
      image: "https://images.unsplash.com/photo-1482049016688-2d3e1b311543?auto=format&fit=crop&q=80&w=800"
    },
    {
      name: "K'Bite Lasagna Bake",
      price: "195",
      category: "Brunch",
      available: true,
      featured: false,
      description: "Spicy Bolognese layered with homemade pasta sheets and a three-cheese blend, baked to golden perfection",
      image: "https://images.unsplash.com/photo-1619895092538-128341789043?auto=format&fit=crop&q=80&w=800"
    },
    {
      name: "Octo on the Beach",
      price: "320",
      category: "Brunch",
      available: true,
      featured: true,
      description: "Octopus poached in aromatics and charred to perfection, served over creamy sweet potato mash, chimichurri, and sun-dried tomato confit",
      image: "https://images.unsplash.com/photo-1559737558-2f5a35f4523b?auto=format&fit=crop&q=80&w=800"
    },
    {
      name: "Beach Tease Platter",
      price: "375",
      category: "Platters",
      available: true,
      featured: false,
      description: "Choice of 1 brunch item + the KSO Flight (Sangria, Bellini, Mimosa, French 75) — perfect for solo beach vibes",
      image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&q=80&w=800"
    },
    {
      name: "Tide & Treat Duo",
      price: "500",
      category: "Platters",
      available: true,
      featured: true,
      description: "Choice of 1 sweet & 1 savory item + a personal pitcher of select cocktail/mocktail",
      image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&q=80&w=800"
    },
    {
      name: "Ocean Feast Board",
      price: "785",
      category: "Platters",
      available: true,
      featured: false,
      description: "Choice of 4 brunch items + a grand pitcher of select cocktail/mocktail — ideal for the squad",
      image: "https://images.unsplash.com/photo-1530062845289-9109b2c9c868?auto=format&fit=crop&q=80&w=800"
    },
    {
      name: "The Oasis Royale",
      price: "1080",
      category: "Platters",
      available: true,
      featured: true,
      description: "All 6 brunch items + a bottle of select house Champagne — the ultimate Oasis experience",
      image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=800"
    },
    // KISSED BY FIRE
    { name:"Fried Calamari", price:"180", category:"KissedByFire", available:true, featured:false, description:"Crispy golden calamari rings served with garlic aioli", image:"https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?auto=format&fit=crop&q=80&w=800" },
    { name:"Chili Goats", price:"150", category:"KissedByFire", available:true, featured:true, description:"Tender goat meat tossed in spicy chili sauce", image:"https://images.unsplash.com/photo-1603360946369-dc9bb6258143?auto=format&fit=crop&q=80&w=800" },
    { name:"Turkey Bites", price:"130", category:"KissedByFire", available:true, featured:false, description:"Seasoned turkey pieces, grilled to perfection", image:"https://images.unsplash.com/photo-1518492104633-130d0cc84637?auto=format&fit=crop&q=80&w=800" },
    { name:"Seafood Bowl", price:"280", category:"KissedByFire", available:true, featured:false, description:"Mixed seafood medley with prawns, calamari, and fish", image:"https://images.unsplash.com/photo-1534080564677-6e79751c0744?auto=format&fit=crop&q=80&w=800" },
    { name:"Buffalo Wings", price:"140", category:"KissedByFire", available:true, featured:false, description:"Classic buffalo-style wings with tangy hot sauce", image:"https://images.unsplash.com/photo-1527477396000-e27163b481c2?auto=format&fit=crop&q=80&w=800" },
    { name:"BBQ Wings", price:"140", category:"KissedByFire", available:true, featured:false, description:"Smoky barbecue glazed wings", image:"https://images.unsplash.com/photo-1608039829572-78524f79c4c7?auto=format&fit=crop&q=80&w=800" },
    { name:"Spicy Wings", price:"140", category:"KissedByFire", available:true, featured:true, description:"Extra hot wings for the brave", image:"https://images.unsplash.com/photo-1567622239669-705f15926588?auto=format&fit=crop&q=80&w=800" },
    { name:"Suya Wings", price:"140", category:"KissedByFire", available:true, featured:true, description:"Wings coated in traditional suya spice blend", image:"https://images.unsplash.com/photo-1541832676-9b763b0239ab?auto=format&fit=crop&q=80&w=800" },
    { name:"K.SO Wings", price:"140", category:"KissedByFire", available:true, featured:true, description:"Our signature K.SO sauce glazed wings", image:"https://images.unsplash.com/photo-1569058242253-92a9c73f49ec?auto=format&fit=crop&q=80&w=800" },
    { name:"Grilled Pork Bites", price:"160", category:"KissedByFire", available:true, featured:false, description:"Tender pork pieces with herb seasoning", image:"https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=800" },
    { name:"Jerk Chicken", price:"180", category:"KissedByFire", available:true, featured:true, description:"Caribbean-style jerk marinated chicken", image:"https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?auto=format&fit=crop&q=80&w=800" },
    { name:"Skewers (5 pcs)", price:"150", category:"KissedByFire", available:true, featured:true, description:"Five pieces of grilled meat skewers with suya spice", image:"https://images.unsplash.com/photo-1516714435131-44d6b64dc6a2?auto=format&fit=crop&q=80&w=800" },
    { name:"Skewers (6 pcs)", price:"180", category:"KissedByFire", available:true, featured:false, description:"Six pieces of grilled meat skewers with suya spice", image:"https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=800" },
    { name:"Grilled Octopus", price:"350", category:"KissedByFire", available:true, featured:false, description:"Tender octopus grilled with herbs and olive oil", image:"https://images.unsplash.com/photo-1559737558-2f5a35f4523b?auto=format&fit=crop&q=80&w=800" },
    { name:"Grilled Tilapia", price:"200", category:"KissedByFire", available:true, featured:true, description:"Whole tilapia grilled with traditional spices", image:"https://images.unsplash.com/photo-1534080564677-6e79751c0744?auto=format&fit=crop&q=80&w=800" },
    { name:"Grilled Lobster", price:"600", category:"KissedByFire", available:true, featured:false, description:"Whole lobster grilled with garlic butter", image:"https://images.unsplash.com/photo-1559740196-99c810b46a6a?auto=format&fit=crop&q=80&w=800" },
    { name:"Grilled Prawns", price:"350", category:"KissedByFire", available:true, featured:true, description:"Jumbo prawns grilled with lemon and herbs", image:"https://images.unsplash.com/photo-1534080564677-6e79751c0744?auto=format&fit=crop&q=80&w=800" },
    { name:"Grilled Grouper", price:"280", category:"KissedByFire", available:true, featured:false, description:"Fresh grouper fillet grilled to perfection", image:"https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&q=80&w=800" },
    { name:"Stewed Oxtail", price:"250", category:"KissedByFire", available:true, featured:true, description:"Slow-cooked oxtail in rich gravy", image:"https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=800" },
    // SIDES
    { name:"Jollof Rice", price:"45", category:"Sides", available:true, featured:true, description:"Classic West African tomato rice", image:"https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?auto=format&fit=crop&q=80&w=800" },
    { name:"K.SO Fried Rice", price:"55", category:"Sides", available:true, featured:true, description:"House special vegetable fried rice", image:"https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&q=80&w=800" },
    { name:"Herb Rice", price:"45", category:"Sides", available:true, featured:false, description:"Fragrant rice cooked with fresh herbs", image:"https://images.unsplash.com/photo-1512058560566-d8f437abe11c?auto=format&fit=crop&q=80&w=800" },
    { name:"Coconut Rice", price:"50", category:"Sides", available:true, featured:false, description:"Creamy rice cooked in coconut milk", image:"https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?auto=format&fit=crop&q=80&w=800" },
    { name:"Garlic Rice", price:"45", category:"Sides", available:true, featured:false, description:"Aromatic rice with roasted garlic", image:"https://images.unsplash.com/photo-1512058560566-d8f437abe11c?auto=format&fit=crop&q=80&w=800" },
    { name:"Stir-Fried Noodles", price:"55", category:"Sides", available:true, featured:false, description:"Wok-fried noodles with vegetables", image:"https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&q=80&w=800" },
    { name:"French Fries", price:"45", category:"Sides", available:true, featured:true, description:"Golden crispy fries", image:"https://images.unsplash.com/photo-1573014167391-26d91e237307?auto=format&fit=crop&q=80&w=800" },
    { name:"Sweet Potato Fries", price:"50", category:"Sides", available:true, featured:false, description:"Crispy sweet potato fries", image:"https://images.unsplash.com/photo-1526230427044-d092040d48ac?auto=format&fit=crop&q=80&w=800" },
    { name:"Cassava Fries", price:"45", category:"Sides", available:true, featured:false, description:"Crispy fried cassava sticks", image:"https://images.unsplash.com/photo-1526230427044-d092040d48ac?auto=format&fit=crop&q=80&w=800" },
    { name:"Yam Chips", price:"45", category:"Sides", available:true, featured:false, description:"Crispy fried yam", image:"https://images.unsplash.com/photo-1526230427044-d092040d48ac?auto=format&fit=crop&q=80&w=800" },
    { name:"Kelewele", price:"40", category:"Sides", available:true, featured:false, description:"Spiced fried plantain cubes", image:"https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=800" },
    { name:"Attieke", price:"45", category:"Sides", available:true, featured:false, description:"Fermented cassava couscous", image:"https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=800" },
    { name:"Sweet Potato Mash", price:"45", category:"Sides", available:true, featured:false, description:"Creamy mashed sweet potatoes", image:"https://images.unsplash.com/photo-1518977676601-b53f02ac6d31?auto=format&fit=crop&q=80&w=800" },
    { name:"Potato Salad", price:"40", category:"Sides", available:true, featured:false, description:"Creamy potato salad with herbs", image:"https://images.unsplash.com/photo-1518310383802-640c2de311b2?auto=format&fit=crop&q=80&w=800" },
    { name:"Roasted Vegetables", price:"50", category:"Sides", available:true, featured:false, description:"Seasonal vegetables roasted with herbs", image:"https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=800" },
    // PIZZA
    { name:"Bojo Pizza", price:"180", category:"Pizza", available:true, featured:false, description:"Classic margherita with fresh tomatoes and basil", image:"https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&q=80&w=800" },
    { name:"Laboma Pizza", price:"220", category:"Pizza", available:true, featured:true, description:"Loaded with pepperoni, sausage, and bacon", image:"https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&q=80&w=800" },
    { name:"Tropichale Pizza", price:"200", category:"Pizza", available:true, featured:false, description:"Ham, pineapple, and mozzarella", image:"https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&q=80&w=800" },
    // BURGERS & WRAPS
    { name:"Suya Burger", price:"150", category:"BurgersWraps", available:true, featured:true, description:"Beef patty with suya spice, lettuce, tomato, and special sauce", image:"https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=800" },
    { name:"Fish Sandwich", price:"140", category:"BurgersWraps", available:true, featured:false, description:"Crispy fish fillet with tartar sauce and coleslaw", image:"https://images.unsplash.com/photo-1521305916504-4a1121188589?auto=format&fit=crop&q=80&w=800" },
    { name:"Crispy Chicken Burger", price:"130", category:"BurgersWraps", available:true, featured:true, description:"Crispy fried chicken with lettuce and mayo", image:"https://images.unsplash.com/photo-1625813506062-0aeb1d7a094b?auto=format&fit=crop&q=80&w=800" },
    { name:"Beef Quesadilla", price:"140", category:"BurgersWraps", available:true, featured:false, description:"Grilled tortilla with seasoned beef and melted cheese", image:"https://images.unsplash.com/photo-1599974579688-8dbdd335c77f?auto=format&fit=crop&q=80&w=800" },
    { name:"Beef Shawarma", price:"120", category:"BurgersWraps", available:true, featured:true, description:"Spiced beef wrapped in pita with vegetables and tahini", image:"https://images.unsplash.com/photo-1561651823-34fed0225304?auto=format&fit=crop&q=80&w=800" },
    // PLATTERS
    { name:"Seafood Platter Small", price:"450", category:"Platters", available:true, featured:false, description:"Prawns, calamari, and fish for 2 people", image:"https://images.unsplash.com/photo-1510627498534-cf7e9002facc?auto=format&fit=crop&q=80&w=800" },
    { name:"Seafood Platter Medium", price:"800", category:"Platters", available:true, featured:true, description:"Prawns, calamari, fish, and lobster for 4 people", image:"https://images.unsplash.com/photo-1510627498534-cf7e9002facc?auto=format&fit=crop&q=80&w=800" },
    { name:"Seafood Platter Large", price:"1200", category:"Platters", available:true, featured:false, description:"Full seafood spread with all selections for 6+ people", image:"https://images.unsplash.com/photo-1510627498534-cf7e9002facc?auto=format&fit=crop&q=80&w=800" },
    { name:"Wing Platter 700g", price:"280", category:"Platters", available:true, featured:true, description:"Mixed wing flavors for sharing", image:"https://images.unsplash.com/photo-1567622239669-705f15926588?auto=format&fit=crop&q=80&w=800" },
    { name:"Wing Platter 1000g", price:"380", category:"Platters", available:true, featured:false, description:"Large mixed wing platter for groups", image:"https://images.unsplash.com/photo-1567622239669-705f15926588?auto=format&fit=crop&q=80&w=800" },
    // COCKTAILS
    { name:"Kings Men", price:"120", category:"Cocktails", available:true, featured:false, description:"Premium whiskey-based cocktail with citrus notes", image:"https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&q=80&w=800" },
    { name:"Slow Grove", price:"110", category:"Cocktails", available:true, featured:false, description:"Refreshing gin cocktail with cucumber and mint", image:"https://images.unsplash.com/photo-1547595628-c61a29f496f0?auto=format&fit=crop&q=80&w=800" },
    { name:"Chief's Fave", price:"130", category:"Cocktails", available:true, featured:true, description:"House special with rum and tropical fruits", image:"https://images.unsplash.com/photo-1541532713592-79a0317b6b77?auto=format&fit=crop&q=80&w=800" },
    { name:"K to the So", price:"120", category:"Cocktails", available:true, featured:true, description:"Signature vodka cocktail with passion fruit", image:"https://images.unsplash.com/photo-1536935338788-846bb9981813?auto=format&fit=crop&q=80&w=800" },
    { name:"Kalahari Twist", price:"115", category:"Cocktails", available:true, featured:false, description:"Tequila-based cocktail with lime and agave", image:"https://images.unsplash.com/photo-1516750105099-4b8a83e217ee?auto=format&fit=crop&q=80&w=800" },
    { name:"No Telling", price:"125", category:"Cocktails", available:true, featured:true, description:"Mystery cocktail - let the bartender surprise you", image:"https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&q=80&w=800" },
    // MOCKTAILS
    { name:"Love Instinct", price:"70", category:"Mocktails", available:true, featured:false, description:"Passion fruit, mango, and sparkling water", image:"https://images.unsplash.com/photo-1544145945-f90425340c7e?auto=format&fit=crop&q=80&w=800" },
    { name:"Deep Strokes", price:"70", category:"Mocktails", available:true, featured:false, description:"Berry blend with mint and lime", image:"https://images.unsplash.com/photo-1560508180-03f285f67ded?auto=format&fit=crop&q=80&w=800" },
    { name:"Clinge", price:"70", category:"Mocktails", available:true, featured:false, description:"Citrus medley with ginger and honey", image:"https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&q=80&w=800" },
    { name:"Apple and Eve", price:"70", category:"Mocktails", available:true, featured:false, description:"Fresh apple juice with cinnamon and vanilla", image:"https://images.unsplash.com/photo-1587888637140-849a7b3af8c3?auto=format&fit=crop&q=80&w=800" },
    { name:"The Kokro Glow", price:"75", category:"Mocktails", available:true, featured:true, description:"Pineapple, coconut, and lime blend", image:"https://images.unsplash.com/photo-1437418747212-8d9709afab22?auto=format&fit=crop&q=80&w=800" },
    { name:"K.So Kiss", price:"75", category:"Mocktails", available:true, featured:true, description:"Strawberry and watermelon fusion", image:"https://images.unsplash.com/photo-1560508180-03f285f67ded?auto=format&fit=crop&q=80&w=800" },
    { name:"The Queens Fave", price:"80", category:"Mocktails", available:true, featured:false, description:"Hibiscus, rose, and lemon blend", image:"https://images.unsplash.com/photo-1622597467836-f3e6a3194a0f?auto=format&fit=crop&q=80&w=800" },
    // SHOTS
    { name:"Adebi", price:"60", category:"Shots", available:true, featured:false, description:"Sweet and fruity shot", image:"https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&q=80&w=800" },
    { name:"Elexir", price:"60", category:"Shots", available:true, featured:false, description:"Herbal infused shot", image:"https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&q=80&w=800" },
    { name:"Wild Essence", price:"65", category:"Shots", available:true, featured:false, description:"Bold and spicy shot", image:"https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&q=80&w=800" },
    { name:"Atayaa", price:"55", category:"Shots", available:true, featured:true, description:"Traditional-inspired tea shot", image:"https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&q=80&w=800" },
    // SLUSHYS
    { name:"J.NITA", price:"80", category:"Slushys", available:true, featured:false, description:"Frozen fruit slushy", image:"https://images.unsplash.com/photo-1437418747212-8d9709afab22?auto=format&fit=crop&q=80&w=800" },
    { name:"Kokrobite Slushy", price:"80", category:"Slushys", available:true, featured:true, description:"Our signature frozen blend", image:"https://images.unsplash.com/photo-1437418747212-8d9709afab22?auto=format&fit=crop&q=80&w=800" },
    { name:"Afroberry", price:"80", category:"Slushys", available:true, featured:false, description:"Mixed berry frozen delight", image:"https://images.unsplash.com/photo-1560508180-03f285f67ded?auto=format&fit=crop&q=80&w=800" },
    { name:"Cane Oasis", price:"80", category:"Slushys", available:true, featured:false, description:"Sugarcane and lime slushy", image:"https://images.unsplash.com/photo-1544145945-f90425340c7e?auto=format&fit=crop&q=80&w=800" },
    // BEERS & CIDERS
    { name:"Savanna", price:"70", category:"BeersAndCiders", available:true, featured:false, description:"Premium dry cider", image:"https://images.unsplash.com/photo-1608270586620-248524c67de9?auto=format&fit=crop&q=80&w=800" },
    { name:"Guinness", price:"50", category:"BeersAndCiders", available:true, featured:true, description:"Classic Irish stout", image:"https://images.unsplash.com/photo-1584225064785-c62a8b43d148?auto=format&fit=crop&q=80&w=800" },
    { name:"Club Beer", price:"35", category:"BeersAndCiders", available:true, featured:true, description:"Ghana's favorite lager", image:"https://images.unsplash.com/photo-1608270586620-248524c67de9?auto=format&fit=crop&q=80&w=800" },
    { name:"Corona", price:"80", category:"BeersAndCiders", available:true, featured:false, description:"Mexican pale lager", image:"https://images.unsplash.com/photo-1608270586620-248524c67de9?auto=format&fit=crop&q=80&w=800" },
    { name:"Hunters Gold", price:"70", category:"BeersAndCiders", available:true, featured:false, description:"Sweet cider", image:"https://images.unsplash.com/photo-1608270586620-248524c67de9?auto=format&fit=crop&q=80&w=800" },
    { name:"Stella Artois", price:"75", category:"BeersAndCiders", available:true, featured:false, description:"Belgian pilsner", image:"https://images.unsplash.com/photo-1608270586620-248524c67de9?auto=format&fit=crop&q=80&w=800" },
    { name:"Budweiser", price:"60", category:"BeersAndCiders", available:true, featured:false, description:"American lager", image:"https://images.unsplash.com/photo-1608270586620-248524c67de9?auto=format&fit=crop&q=80&w=800" },
    { name:"Club Shandy", price:"35", category:"BeersAndCiders", available:true, featured:false, description:"Light beer with lemon", image:"https://images.unsplash.com/photo-1608270586620-248524c67de9?auto=format&fit=crop&q=80&w=800" },
    { name:"Brutal Fruit", price:"65", category:"BeersAndCiders", available:true, featured:false, description:"Flavored cider", image:"https://images.unsplash.com/photo-1608270586620-248524c67de9?auto=format&fit=crop&q=80&w=800" },
    { name:"Smirnoff Ice", price:"65", category:"BeersAndCiders", available:true, featured:false, description:"Vodka-based alcopop", image:"https://images.unsplash.com/photo-1608270586620-248524c67de9?auto=format&fit=crop&q=80&w=800" },
    { name:"Smirnoff Ice Double Black", price:"70", category:"BeersAndCiders", available:true, featured:false, description:"Stronger vodka-based drink", image:"https://images.unsplash.com/photo-1608270586620-248524c67de9?auto=format&fit=crop&q=80&w=800" },
    { name:"Tale Beer Mango", price:"35", category:"BeersAndCiders", available:true, featured:false, description:"Craft beer with mango", image:"https://images.unsplash.com/photo-1608270586620-248524c67de9?auto=format&fit=crop&q=80&w=800" },
    { name:"Tale Beer Hibiscus", price:"35", category:"BeersAndCiders", available:true, featured:false, description:"Craft beer with hibiscus", image:"https://images.unsplash.com/photo-1608270586620-248524c67de9?auto=format&fit=crop&q=80&w=800" },
    { name:"Tale Beer Lemon Lime", price:"35", category:"BeersAndCiders", available:true, featured:false, description:"Craft beer with lemon and lime", image:"https://images.unsplash.com/photo-1608270586620-248524c67de9?auto=format&fit=crop&q=80&w=800" },
    { name:"Tale Beer Lemongrass", price:"35", category:"BeersAndCiders", available:true, featured:false, description:"Craft beer with lemongrass", image:"https://images.unsplash.com/photo-1608270586620-248524c67de9?auto=format&fit=crop&q=80&w=800" },
    // SOFT DRINKS
    { name:"Coca-Cola", price:"25", category:"SoftDrinks", available:true, featured:false, description:"Classic cola", image:"https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&q=80&w=800" },
    { name:"Fanta", price:"25", category:"SoftDrinks", available:true, featured:false, description:"Orange soda", image:"https://images.unsplash.com/photo-1624517452488-04869289c4ca?auto=format&fit=crop&q=80&w=800" },
    { name:"Sprite", price:"25", category:"SoftDrinks", available:true, featured:false, description:"Lemon-lime soda", image:"https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&q=80&w=800" },
    { name:"Alvaro", price:"30", category:"SoftDrinks", available:true, featured:false, description:"Malt drink", image:"https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&q=80&w=800" },
    { name:"Malta Guinness", price:"30", category:"SoftDrinks", available:true, featured:true, description:"Non-alcoholic malt beverage", image:"https://images.unsplash.com/photo-1584225064785-c62a8b43d148?auto=format&fit=crop&q=80&w=800" },
    { name:"Red Bull", price:"50", category:"SoftDrinks", available:true, featured:false, description:"Energy drink", image:"https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&q=80&w=800" },
    // JUICES
    { name:"Apple Juice", price:"95", category:"Juices", available:true, featured:false, description:"Fresh apple juice", image:"https://images.unsplash.com/photo-1587888637140-849a7b3af8c3?auto=format&fit=crop&q=80&w=800" },
    { name:"Pineapple Juice", price:"95", category:"Juices", available:true, featured:true, description:"Fresh pineapple juice", image:"https://images.unsplash.com/photo-1589733955941-5eeaf752f6dd?auto=format&fit=crop&q=80&w=800" },
    { name:"Orange Juice", price:"95", category:"Juices", available:true, featured:false, description:"Fresh squeezed orange juice", image:"https://images.unsplash.com/photo-1600271886742-f049cd451bba?auto=format&fit=crop&q=80&w=800" },
    { name:"Cranberry Juice", price:"120", category:"Juices", available:true, featured:false, description:"Tart cranberry juice", image:"https://images.unsplash.com/photo-1560508180-03f285f67ded?auto=format&fit=crop&q=80&w=800" },
  ]})
  console.log("✅ Menu items created (29 items)")

  // ─── BRANCH (single location) ───
  await prisma.branch.create({ data: {
    name: "East Legon",
    area: "East Legon, Accra",
    landmark: "Near the Police Station, East Legon",
    address: "Kokrobite Oasis, East Legon, Accra, Ghana",
    phone: "UPDATE_WITH_REAL_PHONE",
    whatsapp: "UPDATE_WITH_REAL_WHATSAPP",
    openingHours: "Tuesday–Sunday: 11:00 AM – 11:00 PM | Monday: Closed",
    isOpen: true
  }})
  console.log("✅ Branch created")

  // ─── REVIEWS ───
  await prisma.review.createMany({ data: [
    { author: "Ama Serwaa", rating: 5, approved: true, featured: true, comment: "The Tropical Velvet Dream is absolutely divine!" },
    { author: "Kweku Mensah", rating: 5, approved: true, featured: true, comment: "Came for brunch, stayed all afternoon." },
    { author: "Zara Osei", rating: 5, approved: true, featured: true, comment: "The Akwaaba Sunset cocktail is gorgeous." },
    { author: "David Asante", rating: 4, approved: true, featured: true, comment: "The Oasis Royale board was worth every pesewa." },
  ]})
  console.log("✅ Reviews created")

  // ─── GALLERY ───
  await prisma.galleryItem.createMany({ data: [
    { title: "Tropical Velvet Dream", category: "Brunch", visible: true, order: 1, url: "https://images.unsplash.com/photo-1562376552-0d160a2f238d?auto=format&fit=crop&q=85&w=800" },
    { title: "KSO Cocktail Flight", category: "Cocktails", visible: true, order: 2, url: "https://images.unsplash.com/photo-1470337458703-46ad1756a187?auto=format&fit=crop&q=85&w=800" },
    { title: "Octo on the Beach", category: "Brunch", visible: true, order: 3, url: "https://images.unsplash.com/photo-1559737558-2f5a35f4523b?auto=format&fit=crop&q=85&w=800" },
    { title: "Pool Vibes", category: "Atmosphere", visible: true, order: 4, url: "https://images.unsplash.com/photo-1530062845289-9109b2c9c868?auto=format&fit=crop&q=85&w=800" },
    { title: "Akwaaba Sunset Cocktail", category: "Cocktails", visible: true, order: 5, url: "https://images.unsplash.com/photo-1497534446932-c925b458314e?auto=format&fit=crop&q=85&w=800" },
    { title: "Ginger Gold Pancakes", category: "Brunch", visible: true, order: 6, url: "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?auto=format&fit=crop&q=85&w=800" },
    { title: "Beach Tease Platter", category: "Platters", visible: true, order: 7, url: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&q=85&w=800" },
    { title: "Beachfront Atmosphere", category: "Atmosphere", visible: true, order: 8, url: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&q=85&w=800" },
  ]})
  console.log("✅ Gallery created")

  // ─── ANNOUNCEMENT ───
  await prisma.announcement.create({ data: {
    text: "🌴 Surfside Brunch every Tuesday–Sunday from 11AM! Reserve your table now.",
    active: true,
    bgColor: "#F97316",
    textColor: "#ffffff"
  }})
  console.log("✅ Announcement created")

  // ─── SITE CONFIG ───
  await prisma.siteConfig.create({ data: {
    restaurantName: "Kokrobite Oasis",
    tagline: "beach bliss. good food. pure vibes",
    phone: "UPDATE_WITH_REAL_PHONE",
    whatsapp: "UPDATE_WITH_REAL_WHATSAPP",
    instagram: "kokrobite.oasis",
    facebook: "kokrobiteoasis",
    openingHours: "Tuesday–Sunday: 11:00 AM – 11:00 PM",
    email: "hello@kokrobiteoasis.com"
  }})
  console.log("✅ Site config created")

  // ─── TEST DRIVER ───
  await prisma.driver.create({ data: {
    name: "Test Driver",
    phone: "+233201234567",
    password: bcrypt.hashSync("Driver1234!", 10),
    vehicleType: "Motorcycle",
    vehicleNumber: "GR-1234-22",
    licenseNumber: "DL-12345678",
    type: "freelance",
    isApproved: true,
    isActive: true,
    status: "offline",
    rating: 4.8,
    totalRatings: 12,
    totalDeliveries: 45,
    totalEarnings: 900,
    todayEarnings: 60
  }})
  console.log("✅ Test driver created")

  console.log("\n🌴 Kokrobite Oasis database seeded successfully!")
  console.log("📧 Admin: admin@kokrobiteoasis.com")
  console.log("🔑 Password: KokrobiteAdmin2026!")
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
    await pool.end()
  })
