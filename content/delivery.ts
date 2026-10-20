/**
 * Delivery area.
 *
 * Coordinates are from postcodes.io (ONS Postcode Directory), fetched
 * 20 Oct 2026. Distances are straight-line ("as the crow flies") from the
 * store's postcode to the centre of each postcode district. Town names are the
 * main town in each district.
 *
 * Decided 20 Oct 2026: 30 miles straight line, to be reviewed once on screen
 * (register #10). Slots, charges and minimum order are still with the client
 * (register #7–9), so nothing here promises a time or a price.
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
