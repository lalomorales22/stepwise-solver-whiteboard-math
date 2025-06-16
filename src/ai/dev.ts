import { config } from 'dotenv';
config();

import '@/ai/flows/generate-whiteboard-presentation.ts';
import '@/ai/flows/generate-voice-narration.ts';
import '@/ai/flows/analyze-and-solve.ts';