export interface IraqLocationData {
  governorate: string;
  districts: {
    name: string;
    subDistricts: {
      name: string;
      cities?: string[];
      neighborhoods: string[];
      villages?: string[];
      streets?: string[];
    }[];
  }[];
}

export const IRAQ_LOCATIONS: IraqLocationData[] = [
  {
    governorate: "بغداد",
    districts: [
      {
        name: "الرصافة",
        subDistricts: [
          {
            name: "الكرادة",
            cities: ["بغداد"],
            neighborhoods: ["الكرادة داخل", "الكرادة خارج", "الزيونة", "الجادرية"],
            villages: [],
            streets: ["شارع الربيعي", "شارع المسبح", "شارع أبو نؤاس"]
          }
        ]
      },
      {
        name: "الكرخ",
        subDistricts: [
          {
            name: "المنصور",
            cities: ["بغداد"],
            neighborhoods: ["المنصور", "اليرموك", "حي الجامعة", "الدورة"],
            villages: [],
            streets: ["شارع الرواد", "شارع الأميرات", "شارع 14 رمضان"]
          }
        ]
      }
    ]
  },
  {
    governorate: "البصرة",
    districts: [
      {
        name: "البصرة المركز",
        subDistricts: [
          {
            name: "العشار",
            cities: ["البصرة"],
            neighborhoods: ["العشار", "البراضعية", "الجزائر", "الطويسة", "الجبيلة"],
            villages: [],
            streets: ["شارع الاستقلال", "شارع الوفود"]
          }
        ]
      }
    ]
  },
  {
    governorate: "أربيل",
    districts: [
      {
        name: "أربيل المركز",
        subDistricts: [
          {
            name: "عنكاوا",
            cities: ["أربيل"],
            neighborhoods: ["عنكاوا", "بختياري", "وزيران", "دروازة"],
            villages: [],
            streets: ["شارع 100", "شارع 60", "شارع 40"]
          }
        ]
      }
    ]
  },
  {
    governorate: "نينوى",
    districts: [
      {
        name: "الموصل المركز",
        subDistricts: [
          {
            name: "الزهور",
            cities: ["الموصل"],
            neighborhoods: ["الزهور", "النور", "الجامعة", "الحدباء", "المهندسين"],
            villages: [],
            streets: ["شارع المجموعة", "شارع الغابات"]
          }
        ]
      }
    ]
  }
];

export const IRAQ_BOUNDS = {
  north: 37.3780,
  south: 29.0653,
  east: 48.5667,
  west: 38.7923
};

export function isLocationInIraq(lat: number, lng: number) {
  return lat >= IRAQ_BOUNDS.south && lat <= IRAQ_BOUNDS.north &&
         lng >= IRAQ_BOUNDS.west && lng <= IRAQ_BOUNDS.east;
}
