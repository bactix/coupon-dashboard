// LocalStorage implementations (deprecated)
export { LocalStorageUserRepository } from "./storage/user.repository";
export { LocalStorageBusinessRepository } from "./storage/business.repository";
export { LocalStorageCouponRepository } from "./storage/coupon.repository";

// API implementations
export { ApiUserRepository } from "./api/user.repository";
export { ApiBusinessRepository } from "./api/business.repository";
export { ApiCouponRepository } from "./api/coupon.repository";

export type { IUserRepository } from "./storage/user.repository";
export type { IBusinessRepository } from "./storage/business.repository";
export type { ICouponRepository } from "./storage/coupon.repository";
