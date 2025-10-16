/**
 * Auth Service
 * Authentification locale sans backend
 * - login: vérifie email/mot de passe dans AsyncStorage
 * - register: crée un utilisateur et démarre la session
 * - logout: efface l'utilisateur courant
 */
import { storageService } from './storageService';

export const authService = {
  async login(email, password) {
    const users = await storageService.getUsers();
    const user = users.find(u => u.email === email && u.password === password);

    if (!user) {
      throw new Error('Email ou mot de passe incorrect');
    }

    const userWithoutPassword = { ...user };
    delete userWithoutPassword.password;

    await storageService.saveCurrentUser(userWithoutPassword);
    return userWithoutPassword;
  },

  async register(name, email, password) {
    const users = await storageService.getUsers();

    // Vérifier si l'utilisateur existe déjà
    const existingUser = users.find(u => u.email === email);
    if (existingUser) {
      throw new Error('Un utilisateur avec cet email existe déjà');
    }

    // Créer le nouvel utilisateur
    const newUser = {
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

  async logout() {
    await storageService.clearCurrentUser();
  },

  async getCurrentUser() {
    return await storageService.getCurrentUser();
  },
};
