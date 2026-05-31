import { User } from "@/domain/users/user.types";

export interface IUserRepository {
  getAll(): Promise<User[]>;
  getById(id: string): Promise<User | null>;
  create(user: User): Promise<void>;
  update(id: string, user: User): Promise<void>;
  delete(id: string): Promise<void>;
}

/**
 * LocalStorage implementation of User Repository
 * In a real app, this could be swapped for API calls, database, etc.
 */
export class LocalStorageUserRepository implements IUserRepository {
  private readonly key = "app-users";

  async getAll(): Promise<User[]> {
    const data = localStorage.getItem(this.key);
    return data ? JSON.parse(data) : [];
  }

  async getById(id: string): Promise<User | null> {
    const users = await this.getAll();
    return users.find((u) => u.id === id) || null;
  }

  async create(user: User): Promise<void> {
    const users = await this.getAll();
    users.unshift(user);
    localStorage.setItem(this.key, JSON.stringify(users));
  }

  async update(id: string, user: User): Promise<void> {
    const users = await this.getAll();
    const index = users.findIndex((u) => u.id === id);
    if (index !== -1) {
      users[index] = user;
      localStorage.setItem(this.key, JSON.stringify(users));
    }
  }

  async delete(id: string): Promise<void> {
    const users = await this.getAll();
    const filtered = users.filter((u) => u.id !== id);
    localStorage.setItem(this.key, JSON.stringify(filtered));
  }
}
