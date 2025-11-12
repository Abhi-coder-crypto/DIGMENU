// import { MongoClient, Db, Collection, ObjectId } from "mongodb";
// import { type User, type InsertUser, type MenuItem, type InsertMenuItem, type CartItem, type InsertCartItem } from "@shared/schema";

// export interface IStorage {
//   getUser(id: string): Promise<User | undefined>;
//   getUserByUsername(username: string): Promise<User | undefined>;
//   createUser(user: InsertUser): Promise<User>;

//   getMenuItems(): Promise<MenuItem[]>;
//   getMenuItemsByCategory(category: string): Promise<MenuItem[]>;
//   getMenuItem(id: string): Promise<MenuItem | undefined>;
//   getCategories(): string[];
//   addMenuItem(item: InsertMenuItem): Promise<MenuItem>;

//   getCartItems(): Promise<CartItem[]>;
//   addToCart(item: InsertCartItem): Promise<CartItem>;
//   removeFromCart(id: string): Promise<void>;
//   clearCart(): Promise<void>;
// }

// export class MongoStorage implements IStorage {
//   private client: MongoClient;
//   private db: Db;
//   private categoryCollections: Map<string, Collection<MenuItem>>;
//   private cartItemsCollection: Collection<CartItem>;
//   private usersCollection: Collection<User>;
//   private restaurantId: ObjectId;

//   // Define available categories - these match menu.tsx categories
//   private readonly categories = [
//     "soups",
//     "vegstarter",
//     "chickenstarter",
//     "prawnsstarter",
//     "seafood",
//     "springrolls",
//     "momos",
//     "gravies",
//     "potrice",
//     "rice",
//     "ricewithgravy",
//     "noodle",
//     "noodlewithgravy",
//     "thai",
//     "chopsuey",
//     "desserts",
//     "beverages",
//     "extra"
//   ];



//   constructor(connectionString: string) {
//     this.client = new MongoClient(connectionString);
//     this.db = this.client.db("mingsdb");
//     this.categoryCollections = new Map();

//     // Initialize collections for each category with correct collection names
//     const categoryCollectionMapping = {
//       "soups": "soups",
//       "vegstarter": "vegstarter",
//       "chickenstarter": "chickenstarter",
//       "prawnsstarter": "prawnsstarter",
//       "seafood": "seafood",
//       "springrolls": "springrolls",
//       "momos": "momos",
//       "gravies": "gravies",
//       "potrice": "potrice",
//       "rice": "rice",
//       "ricewithgravy": "ricewithgravy",
//       "noodle": "noodle",
//       "noodlewithgravy": "noodlewithgravy",
//       "thai": "thai",
//       "chopsuey": "chopsuey",
//       "desserts": "desserts",
//       "beverages": "beverages",
//       "extra": "extra"
//     };


//     this.categories.forEach(category => {
//       const collectionName = categoryCollectionMapping[category as keyof typeof categoryCollectionMapping];
//       this.categoryCollections.set(category, this.db.collection(collectionName));
//     });

//     this.cartItemsCollection = this.db.collection("cartitems");
//     this.usersCollection = this.db.collection("users");
//     this.restaurantId = new ObjectId("6874cff2a880250859286de6");
//   }

//   async connect() {
//     await this.client.connect();
//     await this.ensureCollectionsExist();
//   }

//   private async ensureCollectionsExist() {
//     try {
//       // Get list of existing collections
//       const existingCollections = await this.db.listCollections().toArray();
//       const existingNames = existingCollections.map(c => c.name);

//       // Create collections for categories that don't exist
//       for (const [category, collection] of this.categoryCollections) {
//         const collectionName = collection.collectionName;
//         if (!existingNames.includes(collectionName)) {
//           await this.db.createCollection(collectionName);
//           console.log(`Created collection: ${collectionName} for category: ${category}`);
//         }
//       }
//     } catch (error) {
//       console.error("Error ensuring collections exist:", error);
//     }
//   }

//   async getUser(id: string): Promise<User | undefined> {
//     try {
//       const user = await this.usersCollection.findOne({ _id: new ObjectId(id) });
//       return user || undefined;
//     } catch (error) {
//       console.error("Error getting user:", error);
//       return undefined;
//     }
//   }

//   async getUserByUsername(username: string): Promise<User | undefined> {
//     try {
//       const user = await this.usersCollection.findOne({ username });
//       return user || undefined;
//     } catch (error) {
//       console.error("Error getting user by username:", error);
//       return undefined;
//     }
//   }

//   async createUser(insertUser: InsertUser): Promise<User> {
//     try {
//       const now = new Date();
//       const user: Omit<User, '_id'> = {
//         ...insertUser,
//         createdAt: now,
//         updatedAt: now,
//       };

//       const result = await this.usersCollection.insertOne(user as User);
//       return {
//         _id: result.insertedId,
//         ...user,
//       } as User;
//     } catch (error) {
//       console.error("Error creating user:", error);
//       throw error;
//     }
//   }

//   async getMenuItems(): Promise<MenuItem[]> {
//     try {
//       const allMenuItems: MenuItem[] = [];

//       // Get items from all category collections
//       for (const [category, collection] of this.categoryCollections) {
//         const items = await collection.find({}).toArray();
//         allMenuItems.push(...items);
//       }

//       // Apply custom sorting: Veg items first, then Chicken, then Prawns, then others
//       return this.sortMenuItems(allMenuItems);
//     } catch (error) {
//       console.error("Error getting menu items:", error);
//       return [];
//     }
//   }

//   async getMenuItemsByCategory(category: string): Promise<MenuItem[]> {
//     try {
//       const collection = this.categoryCollections.get(category);
//       if (!collection) {
//         console.error(`Category "${category}" not found`);
//         return [];
//       }

//       const menuItems = await collection.find({}).toArray();
//       // Apply custom sorting: Veg items first, then Chicken, then Prawns, then others
//       return this.sortMenuItems(menuItems);
//     } catch (error) {
//       console.error("Error getting menu items by category:", error);
//       return [];
//     }
//   }

//   async getMenuItem(id: string): Promise<MenuItem | undefined> {
//     try {
//       // Search across all category collections
//       for (const [category, collection] of this.categoryCollections) {
//         const menuItem = await collection.findOne({ _id: new ObjectId(id) });
//         if (menuItem) {
//           return menuItem;
//         }
//       }
//       return undefined;
//     } catch (error) {
//       console.error("Error getting menu item:", error);
//       return undefined;
//     }
//   }

//   getCategories(): string[] {
//     return [...this.categories];
//   }

//   async addMenuItem(item: InsertMenuItem): Promise<MenuItem> {
//     try {
//       const collection = this.categoryCollections.get(item.category);
//       if (!collection) {
//         throw new Error(`Category "${item.category}" not found`);
//       }

//       const now = new Date();
//       const menuItem: Omit<MenuItem, '_id'> = {
//         ...item,
//         restaurantId: this.restaurantId,
//         createdAt: now,
//         updatedAt: now,
//         __v: 0
//       };

//       const result = await collection.insertOne(menuItem as MenuItem);
//       return {
//         _id: result.insertedId,
//         ...menuItem,
//       } as MenuItem;
//     } catch (error) {
//       console.error("Error adding menu item:", error);
//       throw error;
//     }
//   }

//   async getCartItems(): Promise<CartItem[]> {
//     try {
//       const cartItems = await this.cartItemsCollection.find({}).toArray();
//       return cartItems;
//     } catch (error) {
//       console.error("Error getting cart items:", error);
//       return [];
//     }
//   }

//   async addToCart(item: InsertCartItem): Promise<CartItem> {
//     try {
//       const menuItemObjectId = new ObjectId(item.menuItemId);
//       const existing = await this.cartItemsCollection.findOne({ menuItemId: menuItemObjectId });

//       if (existing) {
//         const updatedCart = await this.cartItemsCollection.findOneAndUpdate(
//           { _id: existing._id },
//           {
//             $inc: { quantity: item.quantity || 1 },
//             $set: { updatedAt: new Date() }
//           },
//           { returnDocument: 'after' }
//         );
//         return updatedCart!;
//       }

//       const now = new Date();
//       const cartItem: Omit<CartItem, '_id'> = {
//         menuItemId: menuItemObjectId,
//         quantity: item.quantity || 1,
//         createdAt: now,
//         updatedAt: now,
//       };

//       const result = await this.cartItemsCollection.insertOne(cartItem as CartItem);
//       return {
//         _id: result.insertedId,
//         ...cartItem,
//       } as CartItem;
//     } catch (error) {
//       console.error("Error adding to cart:", error);
//       throw error;
//     }
//   }

//   async removeFromCart(id: string): Promise<void> {
//     try {
//       await this.cartItemsCollection.deleteOne({ _id: new ObjectId(id) });
//     } catch (error) {
//       console.error("Error removing from cart:", error);
//       throw error;
//     }
//   }

//   async clearCart(): Promise<void> {
//     try {
//       await this.cartItemsCollection.deleteMany({});
//     } catch (error) {
//       console.error("Error clearing cart:", error);
//       throw error;
//     }
//   }

//   private sortMenuItems(items: MenuItem[]): MenuItem[] {
//     return items.sort((a, b) => {
//       const aName = a.name.toLowerCase();
//       const bName = b.name.toLowerCase();
      
//       // First priority: Veg items before non-veg items
//       if (a.isVeg !== b.isVeg) {
//         return a.isVeg ? -1 : 1; // Veg items first
//       }
      
//       // Second priority: Within same veg/non-veg category, sort by name type
//       const getSortOrder = (name: string): number => {
//         if (name.startsWith('veg')) return 1;
//         if (name.startsWith('chicken')) return 2;
//         if (name.startsWith('prawns') || name.startsWith('prawn')) return 3;
//         return 4;
//       };
      
//       const aOrder = getSortOrder(aName);
//       const bOrder = getSortOrder(bName);
      
//       // If same sort order, sort alphabetically
//       if (aOrder === bOrder) {
//         return aName.localeCompare(bName);
//       }
      
//       return aOrder - bOrder;
//     });
//   }
// }

// const connectionString = "mongodb+srv://airavatatechnologiesprojects:8tJ6v8oTyQE1AwLV@mingsdb.mmjpnwc.mongodb.net/?retryWrites=true&w=majority&appName=MINGSDB";
// export const storage = new MongoStorage(connectionString);
import { MongoClient, Db, Collection, ObjectId } from "mongodb";
import { type User, type InsertUser, type MenuItem, type InsertMenuItem, type CartItem, type InsertCartItem, type Customer, type InsertCustomer } from "@shared/schema";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  getMenuItems(): Promise<MenuItem[]>;
  getMenuItemsByCategory(category: string): Promise<MenuItem[]>;
  getMenuItem(id: string): Promise<MenuItem | undefined>;
  getCategories(): string[];
  addMenuItem(item: InsertMenuItem): Promise<MenuItem>;

  getCartItems(): Promise<CartItem[]>;
  addToCart(item: InsertCartItem): Promise<CartItem>;
  removeFromCart(id: string): Promise<void>;
  clearCart(): Promise<void>;

  getCustomerByPhone(phoneNumber: string): Promise<Customer | undefined>;
  createCustomer(customer: InsertCustomer): Promise<Customer>;
  incrementCustomerVisits(phoneNumber: string): Promise<Customer | undefined>;
  getAllCustomers(): Promise<Customer[]>;
}

export class MongoStorage implements IStorage {
  private client: MongoClient;
  private db: Db;
  private categoryCollections: Map<string, Collection<MenuItem>>;
  private cartItemsCollection: Collection<CartItem>;
  private usersCollection: Collection<User>;
  private customersCollection: Collection<Customer>;
  private restaurantId: ObjectId;

  // Define available categories - these match menu.tsx categories
  private readonly categories = [
    "new",
    "soups",
    "vegstarter",
    "chickenstarter",
    "prawnsstarter",
    "seafood",
    "springrolls",
    "momos",
    "gravies",
    "potrice",
    "rice",
    "ricewithgravy",
    "noodle",
    "noodlewithgravy",
    "thai",
    "chopsuey",
    "desserts",
    "beverages",
    "extra"
  ];



  constructor(connectionString: string) {
    this.client = new MongoClient(connectionString);
    this.db = this.client.db("mingsdb");
    this.categoryCollections = new Map();

    // Initialize collections for each category with correct collection names
    const categoryCollectionMapping = {
      "new": "new",
      "soups": "soups",
      "vegstarter": "vegstarter",
      "chickenstarter": "chickenstarter",
      "prawnsstarter": "prawnsstarter",
      "seafood": "seafood",
      "springrolls": "springrolls",
      "momos": "momos",
      "gravies": "gravies",
      "potrice": "potrice",
      "rice": "rice",
      "ricewithgravy": "ricewithgravy",
      "noodle": "noodle",
      "noodlewithgravy": "noodlewithgravy",
      "thai": "thai",
      "chopsuey": "chopsuey",
      "desserts": "desserts",
      "beverages": "beverages",
      "extra": "extra"
    };


    this.categories.forEach(category => {
      const collectionName = categoryCollectionMapping[category as keyof typeof categoryCollectionMapping];
      this.categoryCollections.set(category, this.db.collection(collectionName));
    });

    this.cartItemsCollection = this.db.collection("cartitems");
    this.usersCollection = this.db.collection("users");
    this.customersCollection = this.db.collection("customers");
    this.restaurantId = new ObjectId("6874cff2a880250859286de6");
  }

  async connect() {
    await this.client.connect();
    await this.ensureCollectionsExist();
  }

  private async ensureCollectionsExist() {
    try {
      // Get list of existing collections
      const existingCollections = await this.db.listCollections().toArray();
      const existingNames = existingCollections.map(c => c.name);

      // Create collections for categories that don't exist
      for (const [category, collection] of this.categoryCollections) {
        const collectionName = collection.collectionName;
        if (!existingNames.includes(collectionName)) {
          await this.db.createCollection(collectionName);
          console.log(`Created collection: ${collectionName} for category: ${category}`);
        }
      }
    } catch (error) {
      console.error("Error ensuring collections exist:", error);
    }
  }

  async getUser(id: string): Promise<User | undefined> {
    try {
      const user = await this.usersCollection.findOne({ _id: new ObjectId(id) });
      return user || undefined;
    } catch (error) {
      console.error("Error getting user:", error);
      return undefined;
    }
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    try {
      const user = await this.usersCollection.findOne({ username });
      return user || undefined;
    } catch (error) {
      console.error("Error getting user by username:", error);
      return undefined;
    }
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    try {
      const now = new Date();
      const user: Omit<User, '_id'> = {
        ...insertUser,
        createdAt: now,
        updatedAt: now,
      };

      const result = await this.usersCollection.insertOne(user as User);
      return {
        _id: result.insertedId,
        ...user,
      } as User;
    } catch (error) {
      console.error("Error creating user:", error);
      throw error;
    }
  }

  async getMenuItems(): Promise<MenuItem[]> {
    try {
      const allMenuItems: MenuItem[] = [];

      // Get items from all category collections
      for (const [category, collection] of this.categoryCollections) {
        const items = await collection.find({}).toArray();
        allMenuItems.push(...items);
      }

      // Apply custom sorting: Veg items first, then Chicken, then Prawns, then others
      return this.sortMenuItems(allMenuItems);
    } catch (error) {
      console.error("Error getting menu items:", error);
      return [];
    }
  }

  async getMenuItemsByCategory(category: string): Promise<MenuItem[]> {
    try {
      const collection = this.categoryCollections.get(category);
      if (!collection) {
        console.error(`Category "${category}" not found`);
        return [];
      }

      const menuItems = await collection.find({}).toArray();
      // Apply custom sorting: Veg items first, then Chicken, then Prawns, then others
      return this.sortMenuItems(menuItems);
    } catch (error) {
      console.error("Error getting menu items by category:", error);
      return [];
    }
  }

  async getMenuItem(id: string): Promise<MenuItem | undefined> {
    try {
      // Search across all category collections
      for (const [category, collection] of this.categoryCollections) {
        const menuItem = await collection.findOne({ _id: new ObjectId(id) });
        if (menuItem) {
          return menuItem;
        }
      }
      return undefined;
    } catch (error) {
      console.error("Error getting menu item:", error);
      return undefined;
    }
  }

  getCategories(): string[] {
    return [...this.categories];
  }

  async addMenuItem(item: InsertMenuItem): Promise<MenuItem> {
    try {
      const collection = this.categoryCollections.get(item.category);
      if (!collection) {
        throw new Error(`Category "${item.category}" not found`);
      }

      const now = new Date();
      const menuItem: Omit<MenuItem, '_id'> = {
        ...item,
        restaurantId: this.restaurantId,
        createdAt: now,
        updatedAt: now,
        __v: 0
      };

      const result = await collection.insertOne(menuItem as MenuItem);
      return {
        _id: result.insertedId,
        ...menuItem,
      } as MenuItem;
    } catch (error) {
      console.error("Error adding menu item:", error);
      throw error;
    }
  }

  async getCartItems(): Promise<CartItem[]> {
    try {
      const cartItems = await this.cartItemsCollection.find({}).toArray();
      return cartItems;
    } catch (error) {
      console.error("Error getting cart items:", error);
      return [];
    }
  }

  async addToCart(item: InsertCartItem): Promise<CartItem> {
    try {
      const menuItemObjectId = new ObjectId(item.menuItemId);
      const existing = await this.cartItemsCollection.findOne({ menuItemId: menuItemObjectId });

      if (existing) {
        const updatedCart = await this.cartItemsCollection.findOneAndUpdate(
          { _id: existing._id },
          {
            $inc: { quantity: item.quantity || 1 },
            $set: { updatedAt: new Date() }
          },
          { returnDocument: 'after' }
        );
        return updatedCart!;
      }

      const now = new Date();
      const cartItem: Omit<CartItem, '_id'> = {
        menuItemId: menuItemObjectId,
        quantity: item.quantity || 1,
        createdAt: now,
        updatedAt: now,
      };

      const result = await this.cartItemsCollection.insertOne(cartItem as CartItem);
      return {
        _id: result.insertedId,
        ...cartItem,
      } as CartItem;
    } catch (error) {
      console.error("Error adding to cart:", error);
      throw error;
    }
  }

  async removeFromCart(id: string): Promise<void> {
    try {
      await this.cartItemsCollection.deleteOne({ _id: new ObjectId(id) });
    } catch (error) {
      console.error("Error removing from cart:", error);
      throw error;
    }
  }

  async clearCart(): Promise<void> {
    try {
      await this.cartItemsCollection.deleteMany({});
    } catch (error) {
      console.error("Error clearing cart:", error);
      throw error;
    }
  }

  async getCustomerByPhone(phoneNumber: string): Promise<Customer | undefined> {
    try {
      const customer = await this.customersCollection.findOne({ phoneNumber });
      return customer || undefined;
    } catch (error) {
      console.error("Error getting customer by phone:", error);
      return undefined;
    }
  }

  async createCustomer(insertCustomer: InsertCustomer): Promise<Customer> {
    try {
      const now = new Date();
      const customer: Omit<Customer, '_id'> = {
        ...insertCustomer,
        visits: 0,
        createdAt: now,
        updatedAt: now,
      };

      const result = await this.customersCollection.insertOne(customer as Customer);
      return {
        _id: result.insertedId,
        ...customer,
      } as Customer;
    } catch (error) {
      console.error("Error creating customer:", error);
      throw error;
    }
  }

  async incrementCustomerVisits(phoneNumber: string): Promise<Customer | undefined> {
    try {
      const result = await this.customersCollection.findOneAndUpdate(
        { phoneNumber },
        {
          $inc: { visits: 1 },
          $set: { updatedAt: new Date() }
        },
        { returnDocument: 'after' }
      );
      return result || undefined;
    } catch (error) {
      console.error("Error incrementing customer visits:", error);
      return undefined;
    }
  }

  async getAllCustomers(): Promise<Customer[]> {
    try {
      const customers = await this.customersCollection.find({}).sort({ visits: -1 }).toArray();
      return customers;
    } catch (error) {
      console.error("Error getting all customers:", error);
      return [];
    }
  }

  private sortMenuItems(items: MenuItem[]): MenuItem[] {
    return items.sort((a, b) => {
      const aName = a.name.toLowerCase();
      const bName = b.name.toLowerCase();
      
      // First priority: Veg items before non-veg items
      if (a.isVeg !== b.isVeg) {
        return a.isVeg ? -1 : 1; // Veg items first
      }
      
      // Second priority: Within same veg/non-veg category, sort by name type
      const getSortOrder = (name: string): number => {
        if (name.startsWith('veg')) return 1;
        if (name.startsWith('chicken')) return 2;
        if (name.startsWith('prawns') || name.startsWith('prawn')) return 3;
        return 4;
      };
      
      const aOrder = getSortOrder(aName);
      const bOrder = getSortOrder(bName);
      
      // If same sort order, sort alphabetically
      if (aOrder === bOrder) {
        return aName.localeCompare(bName);
      }
      
      return aOrder - bOrder;
    });
  }
}

const connectionString = process.env.MONGODB_URI || "mongodb+srv://airavatatechnologiesprojects:8tJ6v8oTyQE1AwLV@mingsdb.mmjpnwc.mongodb.net/?retryWrites=true&w=majority&appName=MINGSDB";
export const storage = new MongoStorage(connectionString);
