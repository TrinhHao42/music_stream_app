import { AccountType } from './enums';

type Account = {
  accountId: string;
  avatarUrl: string;
  email: string;
  password: string;
  type: AccountType;
  userId: string;
};

export default Account;


