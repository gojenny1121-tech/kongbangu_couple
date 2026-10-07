export interface DDaySetting {
  startDate: string; // YYYY-MM-DD
  partnerA: string;
  partnerB: string;
  bgImage?: string; // base64 또는 로컬 이미지 주소
}

export interface CustomAnniversary {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
}

export interface Letter {
  id: string;
  date: string;
  sender: string;
  receiver: string;
  content: string;
  image?: string; // base64 이미지
  isSealed: boolean;
  isOpened: boolean;
  emotion: string; // 감정 태그
}

export interface PhotoEntry {
  id: string;
  image: string; // 4:3 base64 이미지
  memo: string;
  emotion: string; // 감정 태그 (행복, 설렘, 따뜻함, 평화 등)
  date: string;
}

export interface BucketItem {
  id: string;
  content: string;
  category: string; // 여행, 맛집, 취미, 도전, 일상 등
  memo: string;
  isCompleted: boolean;
  completedAt?: string;
}

export interface LoveAppData {
  dday: DDaySetting | null;
  customAnniversaries: CustomAnniversary[];
  letters: Letter[];
  photos: PhotoEntry[];
  buckets: BucketItem[];
}
