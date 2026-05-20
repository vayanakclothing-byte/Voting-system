export type HouseColor = 'Blue' | 'Red' | 'Green' | 'Yellow';

export interface Student {
  id: string;
  name: string;
  className: string;
  section?: string;
  house: HouseColor;
  rollNumber?: string;
  hasVoted: boolean;
  votedAt?: string;
}

export interface Teacher {
  id: string;
  name: string;
  subject?: string;
  department?: string;
}

export interface Candidate {
  id: string;
  name: string;
  position: string; // Allow custom positions
  house: HouseColor;
  slogan: string;
  symbol: string; // Emoji or icon name or short text
  photoUrl: string;
  votesCount: number;
}

export interface Vote {
  id: string;
  studentId: string;
  studentName: string;
  className: string;
  house: HouseColor;
  votedCandidates: { [position: string]: string }; // position -> candidateId
  timestamp: string;
}

export interface Admin {
  id: string;
  username: string;
  role: 'Super Admin' | 'Election Officer';
}

export interface House {
  id: string;
  name: HouseColor;
  colorCode: string;
  slogan: string;
}

export interface SchoolClass {
  id: string;
  name: string; // e.g., "Class 8", "Class 9", "Class 10", "Class 11", "Class 12"
  sections: string[];
}

export interface ElectionState {
  status: 'pending' | 'active' | 'paused' | 'completed';
  allowManualTyping: boolean;
  startTime?: string;
  endTime?: string; // For countdown
  announcement: string;
  voiceAnnouncements: boolean;
}

export interface ActivityLog {
  id: string;
  action: string;
  details: string;
  timestamp: string;
  type: 'info' | 'success' | 'warning' | 'danger';
}

export interface BulkUploadRow {
  [key: string]: any;
}
