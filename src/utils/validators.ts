import { z } from 'zod';

// Students Validation Schema
export const StudentSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  className: z.string().min(1, 'Class name is required'),
  section: z.string().optional(),
  house: z.enum(['Blue', 'Red', 'Green', 'Yellow'], {
    message: 'House must be Blue, Red, Green, or Yellow'
  }),
  rollNumber: z.string().optional()
});

export const BulkStudentSchema = z.array(StudentSchema);

// Candidates Validation Schema
export const CandidateSchema = z.object({
  name: z.string().min(1, 'Candidate name is required'),
  position: z.enum(['Head Boy', 'Head Girl', 'Sports Captain', 'Discipline Captain'], {
    message: 'Invalid position'
  }).or(z.string().min(1)), // To allow custom positions
  house: z.enum(['Blue', 'Red', 'Green', 'Yellow']),
  slogan: z.string().optional().default('Excellence in Action!'),
  symbol: z.string().optional().default('⭐'),
  photoUrl: z.string().url().optional().default('https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400')
});

export const BulkCandidateSchema = z.array(CandidateSchema);

// Teachers Validation Schema
export const TeacherSchema = z.object({
  name: z.string().min(1, 'Teacher name is required'),
  subject: z.string().optional().default(''),
  department: z.string().optional().default('')
});

export const BulkTeacherSchema = z.array(TeacherSchema);
