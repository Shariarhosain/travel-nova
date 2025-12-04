// Domain Entity - represents the User business object
export class User {
  id: string;
  email: string;
  name: string;
  age?: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;

  constructor(partial: Partial<User>) {
    Object.assign(this, partial);
  }
}
