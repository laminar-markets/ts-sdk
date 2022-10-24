export interface Option<T> {
  vec: Array<T>;
}

export interface ID {
  addr: string;
  creation_num: string;
}

export interface Order {
  id: ID;
  side: number;
  price: string;
  size: string;
  remaining_size: string;
  post_only: boolean;
}
