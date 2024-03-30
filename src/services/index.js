import { Product, Cart, User, Chat, Ticket } from '../DAO/factory.js';

import ProductRepository from './product.repository.js';
import CartRepository from './cart.repository.js';
import UserRepository from './user.repository.js';
import ChatRepository from './chat.repository.js';
import TicketRepository from './ticket.repository.js';

// Crea las instancias de daos y repositorios para usar los services
export const ProductService = new ProductRepository(new Product());
export const CartService = new CartRepository(new Cart());
export const UserService = new UserRepository(new User());
export const ChatService = new ChatRepository(new Chat());
export const TicketService = new TicketRepository(new Ticket());
