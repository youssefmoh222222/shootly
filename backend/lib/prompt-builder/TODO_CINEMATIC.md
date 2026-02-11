# Cinematic Prompt Builder Implementation Plan

## Task: Create comprehensive cinematic prompt generator with all brand category enhancements

### Files to Create/Modify:
1. `backend/lib/prompt-builder/cinematic-master.ts` - NEW FILE
2. `backend/lib/prompt-builder/index.ts` - UPDATE (export new generator)

### Implementation Steps:

## Step 1: Create cinematic-master.ts with complete implementation
- [x] Define CinematicPromptConfig interface with all settings
- [x] Create CinematicPromptGenerator class
- [x] Implement getBrandIntroduction() method
- [x] Implement getCinematicDirecting() method
- [x] Implement getEnvironmentScene() method
- [x] Implement getHumanElements() method (FIX: was using undefined `humanModels`)
- [x] Implement getProductDetails() method
- [x] Implement getTechnicalSpecs() method
- [x] Implement getStyleGuidelines() method
- [x] Implement getCategoryEnhancements() for all 13 categories
- [x] Implement getNegativePrompts() for all 13 categories
- [x] Implement getQualityRequirements() method
- [x] Implement all helper methods with full category support
- [x] Implement optimizePrompt() method

### Brand Categories to Support:
1. MEDICAL_WEAR
2. FOOTBALL
3. GYMWEAR
4. STREETWEAR
5. OLD_MONEY
6. LUXURY
7. MINIMAL
8. VINTAGE
9. Y2K
10. TECHWEAR
11. OVERSIZED
12. RETRO_SPORTS
13. PREPPY

## Step 2: Update index.ts to integrate cinematic generator
- [x] Export CinematicPromptGenerator
- [x] Export CinematicPromptConfig interface
- [x] Add buildCinematicPrompt() function
- [x] Update switch case to use cinematic generator for new build type

## Step 3: Testing
- [x] Verify TypeScript compilation
- [x] Test prompt generation for each category
- [x] Validate all category enhancements work correctly

## Step 4: Integration with generate route
- [x] Import cinematic prompt builder in generate route
- [x] Use CinematicPromptGenerator as default prompt builder (replaces simple string fallbacks)
- [x] Pass full brand context (category, tone, audience, environment, colors) to generator
