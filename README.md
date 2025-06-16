
# StepWise Solver

StepWise Solver is an interactive web application designed to help users understand and solve math problems. It provides step-by-step solutions, visual explanations on a digital whiteboard, and synchronized voice narration for an enhanced learning experience. Users can input problems via text or by uploading an image.

**GitHub Repository:** [lalomorales22/stepwise-solver-whiteboard-math](https://github.com/lalomorales22/stepwise-solver-whiteboard-math)

## Technologies Used

- **Frontend:** Next.js (App Router), React, TypeScript
- **UI:** ShadCN UI Components, Tailwind CSS
- **AI & Backend Logic:** Genkit (for AI flows), Google Generative AI (Gemini models)
- **Speech:** Browser's SpeechSynthesis API for voice narration
- **State Management:** React Hooks (useState, useEffect, useReducer for toasts)
- **Form Handling:** React Hook Form, Zod for validation
- **Styling:** Tailwind CSS, CSS Variables
- **Linting/Formatting:** ESLint, Prettier (implicitly, via Next.js defaults)

## Prerequisites

- Node.js (v18 or later recommended)
- npm or yarn

## Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### 1. Clone the Repository

```bash
git clone https://github.com/lalomorales22/stepwise-solver-whiteboard-math.git
cd stepwise-solver-whiteboard-math
```

### 2. Install Dependencies

Using npm:
```bash
npm install
```
Or using yarn:
```bash
yarn install
```

### 3. Set Up Environment Variables

Create a `.env` file in the root of your project and add the following environment variables. You'll need to obtain your own API keys.

```env
GOOGLE_API_KEY=YOUR_GOOGLE_API_KEY_HERE
ELEVENLABS_API_KEY=ENTER_ELEVEN_LABS_API
```

-   `GOOGLE_API_KEY`: Required for using Google's Generative AI models (e.g., Gemini) for problem analysis, solution generation, and narration script generation. You can obtain this key from your Google Cloud Console by enabling the "Generative Language API" or "Vertex AI API".
-   `ELEVENLABS_API_KEY`: The provided key is for ElevenLabs text-to-speech. While the current application uses the browser's built-in SpeechSynthesis API for voice narration, this key is included for potential future integration or if you wish to switch to ElevenLabs for higher-quality voice.

### 4. Run the Development Server

To start the Next.js development server (which includes the frontend and server actions):

```bash
npm run dev
```
Or using yarn:
```bash
yarn dev
```
The application will typically be available at `http://localhost:9002`.

### 5. (Optional) Run Genkit Development Tools

Genkit flows are defined within the Next.js application and run as part of server actions. However, if you want to use Genkit's local development UI (the "Genkit Developer UI") to inspect flows, test them independently, or view traces, you can run:

```bash
npm run genkit:dev
```
This will start the Genkit tools, typically available at `http://localhost:4000`. You might need to run this in a separate terminal.

## How to Use StepWise Solver

1.  **Input a Math Problem:**
    *   **Text Input:** Type or paste your math problem into the text area provided on the left side of the main page.
    *   **Image Input:** Click the "Upload an image" area to open your file browser and select an image of a math problem, or drag and drop an image file directly onto this area. The AI will use vision capabilities to understand the problem from the image.
    *   You can provide either text or an image, or both (though the image usually takes precedence if provided).

2.  **Solve the Problem:**
    *   Click the "Solve Problem" button.
    *   The application will send the problem to the AI for analysis and solution generation. This may take a few moments.

3.  **View the Solution:**
    *   **Problem Statement:** The AI's interpretation of your problem will be displayed above the whiteboard.
    *   **AI Whiteboard:** The digital whiteboard on the right will display the first step of the solution.
    *   **Playback Controls:** Below the whiteboard, playback controls will become active.

4.  **Interactive Playback:**
    *   **Play/Pause:** Click the play button to start the step-by-step walkthrough. The current step will be highlighted on the whiteboard, and voice narration for that step will play. Click pause to stop.
    *   **Next/Previous Step:** Use the "Skip Forward" and "Skip Back" buttons to manually navigate through the solution steps.
    *   **Seek Bar:** Drag the slider to jump to a specific step in the solution.
    *   Voice narration uses the browser's built-in text-to-speech capabilities.

5.  **Save to Gallery:**
    *   If you find a solution useful, click the "Save to Gallery" button. This will save the problem statement and its complete solution (including whiteboard steps and narration scripts) to your browser's local storage.

6.  **Problem Gallery:**
    *   Click on the "Problem Gallery" link in the header.
    *   Here, you can view a list of all your saved problems.
    *   Click "View" on a saved problem to load it back into the main solver page, allowing you to replay the solution.
    *   Click the trash icon to delete a saved problem from the gallery.

## Key Features

-   **AI-Powered Problem Solving:** Leverages generative AI to analyze and provide solutions to math problems.
-   **Flexible Input:** Accepts math problems via direct text entry or image upload (vision-enabled).
-   **Step-by-Step Visuals:** Displays solutions one step at a time on a digital whiteboard.
-   **Synchronized Voice Narration:** Each step is accompanied by clear, AI-generated voice narration using the browser's SpeechSynthesis API.
-   **Interactive Controls:** Full playback controls (play, pause, next, previous, seek) for a self-paced learning experience.
-   **Problem Gallery:** Save and revisit previously solved problems and their solutions.
-   **Responsive Design:** Adapts to different screen sizes for usability on desktop and mobile devices.

## AI Flows

The application utilizes Genkit to define and manage AI-driven tasks:

-   **`analyzeAndSolve`:**
    *   Takes either a text problem or an image (photoDataUri) of a problem.
    *   Identifies the mathematical problem (extracting from image if necessary).
    *   Generates a step-by-step solution, formatted with HTML `<sup>` tags for display.
    *   Returns the analyzed problem statement and the solution steps.
-   **`generateVoiceNarration`:**
    *   Takes a single technical math solution step (which may include notation like `x^2`).
    *   Generates a speakable version of that step, expanding mathematical symbols into words (e.g., "x squared").
-   **`generateWhiteboardPresentation`:** (Simplified)
    *   This flow (now a simple utility function) takes the formatted solution steps and prepares them for display on the whiteboard (currently, it passes them through directly as text).

These flows are orchestrated by server actions (`solverActions.ts`) to provide the complete problem-solving experience.

---

Feel free to contribute to the project or report issues on the [GitHub repository](https://github.com/lalomorales22/stepwise-solver-whiteboard-math).
