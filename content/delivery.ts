/**
 * Delivery area.
 *
 * Coordinates are from postcodes.io (ONS Postcode Directory), fetched
 * 20 Oct 2026. Distances are straight-line ("as the crow flies") from the
 * store's postcode to the centre of each postcode district. Town names are the
 * main town in each district.
 *
 * Decided 20 Oct 2026: 30 miles straight line, to be reviewed once on screen
 * (register #10). Slots are still with the client (register #7–8); the
 * delivery charge and minimum are set at the bottom of this file (#9).
 */

export const store = {
  postcode: 'BT78 5EJ',
  lat: 54.606155,
  lng: -7.324825,
};

export const radiusMiles = 30;

export type District = {
  outcode: string;
  town: string;
  lat: number;
  lng: number;
  miles: number;
};

export const districts: District[] = [
  { outcode: 'BT82', town: 'Strabane', lat: 54.8264, lng: -7.43033, miles: 15.8 },
  { outcode: 'BT81', town: 'Castlederg', lat: 54.69596, lng: -7.6108, miles: 13.0 },
  { outcode: 'BT74', town: 'Enniskillen', lat: 54.34497, lng: -7.6651, miles: 22.6 },
  { outcode: 'BT80', town: 'Cookstown', lat: 54.64639, lng: -6.74519, miles: 23.4 },
  { outcode: 'BT70', town: 'Dungannon', lat: 54.51417, lng: -6.88644, miles: 18.7 },
  { outcode: 'BT69', town: 'Aughnacloy', lat: 54.41997, lng: -6.95109, miles: 19.8 },
  { outcode: 'BT94', town: 'Irvinestown', lat: 54.37635, lng: -7.53399, miles: 18.0 },
  { outcode: 'BT93', town: 'Kesh', lat: 54.46829, lng: -7.82553, miles: 22.2 },
  { outcode: 'BT92', town: 'Lisnaskea', lat: 54.2245, lng: -7.4678, miles: 27.0 },
  { outcode: 'BT75', town: 'Fivemiletown', lat: 54.37353, lng: -7.31748, miles: 16.1 },
  { outcode: 'BT48', town: 'Derry~Londonderry', lat: 55.0104, lng: -7.3278, miles: 27.9 },
  { outcode: 'BT45', town: 'Magherafelt', lat: 54.7599, lng: -6.6389, miles: 29.4 },
  { outcode: 'BT68', town: 'Caledon', lat: 54.3651, lng: -6.8485, miles: 25.4 },
  { outcode: 'BT49', town: 'Limavady', lat: 55.0471, lng: -6.951, miles: 33.9 },
  { outcode: 'BT61', town: 'Armagh', lat: 54.3689, lng: -6.6224, miles: 32.6 },
];

export type MapTown = { name: string; kind: 'city' | 'town' | 'village'; lat: number; lng: number };

/**
 * Towns and villages labelled on the delivery map, so customers can find
 * their own place at the zoom that shows the whole 30-mile area (the base map
 * only labels larger towns at that zoom). Coordinates from OpenStreetMap
 * (Nominatim), fetched 27 Oct 2026. Lifford and Ballybofey are across the
 * border in Co. Donegal.
 */
export const mapTowns: MapTown[] = [
  { name: 'Omagh', kind: 'town', lat: 54.59925, lng: -7.30299 },
  { name: 'Fintona', kind: 'village', lat: 54.49697, lng: -7.31925 },
  { name: 'Dromore', kind: 'village', lat: 54.51286, lng: -7.45762 },
  { name: 'Drumquin', kind: 'village', lat: 54.61568, lng: -7.48852 },
  { name: 'Sixmilecross', kind: 'village', lat: 54.55721, lng: -7.11905 },
  { name: 'Carrickmore', kind: 'village', lat: 54.59749, lng: -7.05304 },
  { name: 'Beragh', kind: 'village', lat: 54.55083, lng: -7.15897 },
  { name: 'Newtownstewart', kind: 'village', lat: 54.71731, lng: -7.37902 },
  { name: 'Gortin', kind: 'village', lat: 54.71753, lng: -7.23271 },
  { name: 'Plumbridge', kind: 'village', lat: 54.76806, lng: -7.24893 },
  { name: 'Sion Mills', kind: 'village', lat: 54.78788, lng: -7.47286 },
  { name: 'Castlederg', kind: 'town', lat: 54.7088, lng: -7.59312 },
  { name: 'Strabane', kind: 'town', lat: 54.82612, lng: -7.4628 },
  { name: 'Ballygawley', kind: 'village', lat: 54.46234, lng: -7.02887 },
  { name: 'Augher', kind: 'village', lat: 54.42831, lng: -7.13204 },
  { name: 'Clogher', kind: 'village', lat: 54.41299, lng: -7.16895 },
  { name: 'Fivemiletown', kind: 'village', lat: 54.37848, lng: -7.31536 },
  { name: 'Aughnacloy', kind: 'village', lat: 54.41479, lng: -6.97629 },
  { name: 'Dungannon', kind: 'town', lat: 54.50391, lng: -6.77036 },
  { name: 'Coalisland', kind: 'town', lat: 54.53947, lng: -6.70049 },
  { name: 'Cookstown', kind: 'town', lat: 54.64367, lng: -6.7416 },
  { name: 'Pomeroy', kind: 'village', lat: 54.59405, lng: -6.92595 },
  { name: 'Donaghmore', kind: 'village', lat: 54.53117, lng: -6.81288 },
  { name: 'Moy', kind: 'village', lat: 54.44674, lng: -6.69112 },
  { name: 'Caledon', kind: 'village', lat: 54.35097, lng: -6.83775 },
  { name: 'Irvinestown', kind: 'town', lat: 54.47201, lng: -7.63348 },
  { name: 'Ederney', kind: 'village', lat: 54.5326, lng: -7.65871 },
  { name: 'Kesh', kind: 'village', lat: 54.52336, lng: -7.72251 },
  { name: 'Lisnaskea', kind: 'town', lat: 54.25194, lng: -7.44246 },
  { name: 'Enniskillen', kind: 'town', lat: 54.34482, lng: -7.63891 },
  { name: 'Ballinamallard', kind: 'village', lat: 54.42287, lng: -7.59504 },
  { name: 'Tempo', kind: 'village', lat: 54.37933, lng: -7.45949 },
  { name: 'Brookeborough', kind: 'village', lat: 54.31518, lng: -7.40668 },
  { name: 'Maguiresbridge', kind: 'village', lat: 54.29493, lng: -7.4645 },
  { name: 'Lisbellaw', kind: 'village', lat: 54.31712, lng: -7.53734 },
  { name: 'Belleek', kind: 'village', lat: 54.48019, lng: -8.09226 },
  { name: 'Derrylin', kind: 'village', lat: 54.19506, lng: -7.57008 },
  { name: 'Derry~Londonderry', kind: 'city', lat: 54.99787, lng: -7.32131 },
  { name: 'Claudy', kind: 'village', lat: 54.91163, lng: -7.15457 },
  { name: 'Dungiven', kind: 'town', lat: 54.92664, lng: -6.92365 },
  { name: 'Feeny', kind: 'village', lat: 54.89207, lng: -7.02132 },
  { name: 'Draperstown', kind: 'village', lat: 54.79358, lng: -6.7842 },
  { name: 'Maghera', kind: 'town', lat: 54.8448, lng: -6.67186 },
  { name: 'Magherafelt', kind: 'town', lat: 54.75448, lng: -6.60781 },
  { name: 'Moneymore', kind: 'village', lat: 54.69155, lng: -6.6703 },
  { name: 'Limavady', kind: 'town', lat: 55.05049, lng: -6.95051 },
  { name: 'Armagh', kind: 'city', lat: 54.3482, lng: -6.65404 },
  { name: 'Stewartstown', kind: 'village', lat: 54.57684, lng: -6.67656 },
  { name: 'Trillick', kind: 'village', lat: 54.45211, lng: -7.4868 },
  { name: 'Greencastle', kind: 'village', lat: 54.68962, lng: -7.0778 },
  { name: 'Killeter', kind: 'village', lat: 54.66825, lng: -7.6835 },
  { name: 'Victoria Bridge', kind: 'village', lat: 54.76092, lng: -7.45595 },
  { name: 'Castledawson', kind: 'village', lat: 54.77692, lng: -6.55768 },
  { name: 'Benburb', kind: 'village', lat: 54.4124, lng: -6.74364 },
  { name: 'Lifford', kind: 'town', lat: 54.8327, lng: -7.48347 },
  { name: 'Ballybofey', kind: 'town', lat: 54.79906, lng: -7.78195 },
];

/**
 * Delivery charge and minimum spend (decided by Alex, 27 Oct 2026; register #9).
 * Delivery is £5 with a £50 minimum basket; click & collect is free with no
 * minimum. The minimum is checked against the items total before delivery.
 * Checkout enforces both on the server (app/checkout/actions.ts).
 */
export const deliveryChargePence = 500;
export const deliveryMinimumPence = 5000;
