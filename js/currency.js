import { round } from './helpers'

export const roundBitcoin = amount => round(amount, 9);
export const roundCryptoKred = amount => round(amount, 2);
export const roundDogecoin = amount => round(amount, 8);
export const roundEthereum = amount => round(amount, 18);
export const roundUSD = amount => round(amount, 2);
