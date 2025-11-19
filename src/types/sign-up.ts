export interface ExistingUserResult {
  count: number;
}

// Represents a user record fetched from the database
export interface User {
  id: number;
  name: string;
  last_name: string;
  email: string;
  contact: string;
  company: string;
  address: string;
  role: string;
}
