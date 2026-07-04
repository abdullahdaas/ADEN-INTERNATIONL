export interface IraqLocationData {
  governorate: string;
  districts: {
    name: string;
    subDistricts: string[];
    cities: string[];
    neighborhoods: string[];
    villages: string[];
    streets: string[];
  }[];
}

export const IRAQ_LOCATIONS: IraqLocationData[] = [
  {
    governorate: "بغداد",
    districts: [
      {
        name: "الرصافة",
        subDistricts: ["الكرادة", "الأعظمية", "بغداد الجديدة", "الصدر"],
        cities: ["بغداد"],
        neighborhoods: ["الكرادة داخل", "الكرادة خارج", "الزيونة", "شارع فلسطين", "الجادرية"],
        villages: [],
        streets: ["شارع الربيعي", "شارع فلسطين", "شارع المسبح"]
      },
      {
        name: "الكرخ",
        subDistricts: ["المنصور", "الكاظمية", "المحمودية", "أبو غريب"],
        cities: ["بغداد"],
        neighborhoods: ["المنصور", "اليرموك", "حي الجامعة", "الكاظمية", "السيدية", "الدورة", "حي العدل"],
        villages: [],
        streets: ["شارع الرواد", "شارع الأميرات", "شارع 14 رمضان"]
      }
    ]
  },
  {
    governorate: "البصرة",
    districts: [
      {
        name: "البصرة",
        subDistricts: ["الزبير", "أبي الخصيب", "شط العرب"],
        cities: ["البصرة"],
        neighborhoods: ["العشار", "البراضعية", "الجزائر", "الطويسة", "الجبيلة"],
        villages: [],
        streets: ["شارع الاستقلال", "شارع الوفود"]
      }
    ]
  },
  {
    governorate: "أربيل",
    districts: [
      {
        name: "أربيل",
        subDistricts: ["عنكاوا", "شورش", "دشتي هولير"],
        cities: ["أربيل"],
        neighborhoods: ["عنكاوا", "بختياري", "وزيران", "دروازة", "هه ولير نوي"],
        villages: [],
        streets: ["شارع 100", "شارع 60", "شارع 40"]
      }
    ]
  },
  {
    governorate: "نينوى",
    districts: [
      {
        name: "الموصل",
        subDistricts: ["القيارة", "الشورة", "حمام العليل"],
        cities: ["الموصل"],
        neighborhoods: ["الزهور", "النور", "الجامعة", "الحدباء", "المهندسين"],
        villages: [],
        streets: ["شارع المجموعة", "شارع الغابات"]
      }
    ]
  },
  {
    governorate: "النجف",
    districts: [
      {
        name: "النجف",
        subDistricts: ["الكوفة", "المناذرة"],
        cities: ["النجف"],
        neighborhoods: ["حي الأمير", "حي الغدير", "حي الحنانة", "المدينة القديمة"],
        villages: [],
        streets: ["شارع الروان", "شارع الإسكان"]
      }
    ]
  },
  {
    governorate: "كربلاء",
    districts: [
      {
        name: "كربلاء",
        subDistricts: ["الهندية", "عين التمر"],
        cities: ["كربلاء"],
        neighborhoods: ["حي الموظفين", "حي الحسين", "حي الإسكان", "حي التعليب"],
        villages: [],
        streets: ["شارع السناتر", "شارع العباس"]
      }
    ]
  },
  {
    governorate: "السليمانية",
    districts: [
      {
        name: "السليمانية",
        subDistricts: ["بكرة جو", "بازيان"],
        cities: ["السليمانية"],
        neighborhoods: ["بختياري", "سيروان", "سرجنار"],
        villages: [],
        streets: ["شارع سالم"]
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
