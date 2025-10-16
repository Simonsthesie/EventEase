/**
 * Auth Service
 * Authentification locale sans backend
 * - login: vérifie email/mot de passe dans AsyncStorage
 * - register: crée un utilisateur et démarre la session
 * - logout: efface l'utilisateur courant
 */
import { storageService } from './storageService';

type User = {
  id: string;
  name: string;
  email: string;
  password?: string;
  createdAt: string;
};

export const authService = {
  async login(email: string, password: string): Promise<Omit<User, 'password'>> {
    const users = await storageService.getUsers();
    const user = (users as any[]).find(u => u.email === email && u.password === password);

    if (!user) {
      throw new Error('Email ou mot de passe incorrect');
    }

    const userWithoutPassword = { ...user } as User;
    delete userWithoutPassword.password;

    await storageService.saveCurrentUser(userWithoutPassword);
    return userWithoutPassword;
  },

  async register(name: string, email: string, password: string): Promise<Omit<User, 'password'>> {
    const users = await storageService.getUsers();

    // Vérifier si l'utilisateur existe déjà
    const existingUser = (users as any[]).find(u => u.email === email);
    if (existingUser) {
      throw new Error('Un utilisateur avec cet email existe déjà');
    }

    // Créer le nouvel utilisateur
    const newUser: User = {
      id: Date.now().toString(),
      name,
      email,
      password,
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);
    await storageService.saveUsers(users);

    const userWithoutPassword = { ...newUser };
    delete userWithoutPassword.password;

    await storageService.saveCurrentUser(userWithoutPassword);
    return userWithoutPassword;
  },

  async logout(): Promise<void> {
    await storageService.clearCurrentUser();
  },

  async getCurrentUser(): Promise<Omit<User, 'password'> | null> {
    return (await storageService.getCurrentUser()) as any;
  },
};
