import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from '../connection.js';
import User from '../models/userModel.js';
import Product from '../models/productModel.js';
import Order from '../models/orderModel.js';
import bcrypt from 'bcryptjs';

dotenv.config();

connectDB();

const users = [
  {
    name: process.env.ADMIN_NAME || 'Admin User',
    email: process.env.ADMIN_EMAIL || 'admin@example.com',
    password: bcrypt.hashSync(process.env.ADMIN_PASSWORD || '123456', 10),
    isAdmin: true,
  },
  {
    name: 'John Doe',
    email: 'john@example.com',
    password: bcrypt.hashSync('123456', 10),
  },
  {
    name: 'Jane Doe',
    email: 'jane@example.com',
    password: bcrypt.hashSync('123456', 10),
  },
];

const products = [
  {
    name: 'Blank T-Shirt',
    image: '/img/products/t1.jpeg',
    description: 'High quality blank t-shirt for casual wear',
    brand: 'adidas',
    category: 'T-Shirts',
    price: 100,
    countInStock: 10,
    rating: 4.5,
    numReviews: 12,
  },
  {
    name: 'Stylish Black Polyester Tshirt',
    image: '/img/products/t2.jpg',
    description: 'Premium black polyester t-shirt for a stylish look',
    brand: 'meesho',
    category: 'T-Shirts',
    price: 97,
    countInStock: 7,
    rating: 4.0,
    numReviews: 8,
  },
  {
    name: "Men's Plain Casual Half Sleeve T-Shirt",
    image: '/img/products/t3.webp',
    description: 'Comfortable half sleeve t-shirt for casual occasions',
    brand: 'leriya',
    category: 'T-Shirts',
    price: 120,
    countInStock: 5,
    rating: 3,
    numReviews: 12,
  },
  {
    name: 'Cartoon AstroNuts T-Shirts',
    image: '/img/products/f4.jpg',
    description: 'Fun cartoon design t-shirt for a unique style',
    brand: 'adidas',
    category: 'T-Shirts',
    price: 78,
    countInStock: 11,
    rating: 5,
    numReviews: 12,
  },
  {
    name: "Men's Patterned Relaxed Fit Shirt",
    image: '/img/products/t4.webp',
    description: 'Stylish patterned shirt with a relaxed fit',
    brand: 'DNMX',
    category: 'Shirts',
    price: 134,
    countInStock: 7,
    rating: 3.5,
    numReviews: 10,
  },
  {
    name: 'Man Casual Shirt',
    image: '/img/products/t5.jpg',
    description: 'Classic casual shirt for everyday wear',
    brand: 'classy',
    category: 'Shirts',
    price: 76,
    countInStock: 0,
    rating: 4,
    numReviews: 12,
  },
  {
    name: 'linen pants with floral embroidery',
    image: '/img/products/f7.jpg',
    description: 'Elegant linen pants featuring beautiful floral embroidery',
    brand: 'Zara',
    category: 'Pants',
    price: 174,
    countInStock: 15,
    rating: 4,
    numReviews: 12,
  },
  {
    name: 'V-neck blouse with a cat print',
    image: '/img/products/f8.jpg',
    description: 'Cute v-neck blouse featuring an adorable cat print design',
    brand: 'Shein',
    category: 'Blouses',
    price: 150,
    countInStock: 5,
    rating: 3.5,
    numReviews: 8,
  },
];

const importData = async () => {
  try {
    // Clear existing data
    await Order.deleteMany();
    await Product.deleteMany();
    await User.deleteMany();

    // Insert users
    const createdUsers = await User.insertMany(users);
    const adminUser = createdUsers[0]._id;

    // Add admin user to all products
    const sampleProducts = products.map((product) => {
      return { ...product, user: adminUser };
    });

    // Insert products
    await Product.insertMany(sampleProducts);

    console.log('Data Imported!');
    process.exit();
  } catch (error) {
    console.error(`${error}`);
    process.exit(1);
  }
};

const destroyData = async () => {
  try {
    // Clear existing data
    await Order.deleteMany();
    await Product.deleteMany();
    await User.deleteMany();

    console.log('Data Destroyed!');
    process.exit();
  } catch (error) {
    console.error(`${error}`);
    process.exit(1);
  }
};

// Check command line arguments to determine action
if (process.argv[2] === '-d') {
  destroyData();
} else {
  importData();
} 