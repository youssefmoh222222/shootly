import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../lib/prisma'
import { verifyToken } from '../../../lib/auth'
import { generateWithRunway } from '../../../lib/ai/providers/runway'
import { cinematicScenariosService } from '../../../lib/scenarios/cinematicScenarios'
import { buildCinematicPrompt, BrandCategory, BrandTone, TargetAudience, EnvironmentType, buildProductShowcasePrompt, ProductAnimation } from '../../../lib/prompt-builder'

export const dynamic = 'force-dynamic';

interface ProfileResult {
  profileId: string;
  profileName: string;
  category: string;
  status: 'success' | 'error';
  resultUrl?: string;
  generationId?: string;
  promptUsed?: string;
  error?: string;
}

/**
 * POST /api/generate-all
 * Generates content for ALL user profiles using a single design.
 * Each profile gets its own tailored prompt based on its brand settings.
 */
export async function POST(request: NextRequest) {
  console.log('=== POST /api/generate-all ===');

  try {
    // Authenticate
    const token = request.cookies.get('auth-token')?.value ||
                  request.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const body = await request.json();
    const {
      imageUrl,
      backImageUrl,
      title,
      type,
      customPrompt,
      // Generation mode
      generationMode,
      productAnimation,
      designDescription: reqDesignDescription,
      // Cinematic mood selections
      scenarioKey,
      seasonalAdaptation,
      timeOfDay,
      demographic,
      customDetails,
      // Model profile selection
      modelKey,
      // Brand profile data from frontend
      brandName: reqBrandName,
      brandCategory: reqBrandCategory,
      brandTone: reqBrandTone,
      targetAudience: reqTargetAudience,
      brandEnvironment: reqEnvironment,
      primaryColor: reqPrimaryColor,
      secondaryColor: reqSecondaryColor,
    } = body;

    const mode = generationMode || 'cinematic';

    console.log('[GenerateAll] Request payload:', {
      type, generationMode: mode, productAnimation,
      cinematic: { scenarioKey, seasonalAdaptation, timeOfDay, demographic, customDetails },
      model: { modelKey },
      brand: { reqBrandName, reqBrandCategory, reqBrandTone, reqTargetAudience, reqEnvironment, reqPrimaryColor, reqSecondaryColor },
    });

    if (!imageUrl || !type) {
      return NextResponse.json(
        { error: 'Missing required fields: imageUrl, type' },
        { status: 400 }
      );
    }

    // Get ALL profiles for this user
    const profiles = await prisma.brandProfile.findMany({
      where: { userId: payload.userId },
    });

    if (profiles.length === 0) {
      return NextResponse.json(
        { error: 'No brand profiles found. Create at least one brand first.' },
        { status: 404 }
      );
    }

    console.log(`[GenerateAll] Found ${profiles.length} profiles for user ${payload.userId}`);

    // Credit check: generate-all produces videos (3 credits each)
    const creditCostPerProfile = 3;
    const totalCost = profiles.length * creditCostPerProfile;

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { credits: true },
    });

    if (!user || user.credits < totalCost) {
      return NextResponse.json(
        { error: 'Insufficient credits', credits: user?.credits ?? 0, required: totalCost },
        { status: 402 }
      );
    }

    const results: ProfileResult[] = [];

    // Generate for each profile
    for (const profile of profiles) {
      console.log(`[GenerateAll] Processing profile: ${profile.name} (${profile.category})`);

      try {
        // 1. Create a design record for this profile
        const design = await prisma.design.create({
          data: {
            brandProfileId: profile.id,
            title: title || `${profile.name} Design`,
            imageUrl,
            backImageUrl: backImageUrl || null,
            customPrompt: customPrompt || null,
          },
        });

        // 2. Build the prompt and designUrl based on generation mode
        let prompt = '';

        let designUrlForRunway: string | undefined = undefined;

        if (mode === 'product') {
          // Product mode: send the actual image to Runway
          const publicUrl = process.env.PUBLIC_URL;
          if (publicUrl) {
            designUrlForRunway = `${publicUrl}/api/images/${design.id}`;
          } else {
            designUrlForRunway = design.imageUrl;
          }
          const animation = (productAnimation || 'rotation') as ProductAnimation;
          prompt = buildProductShowcasePrompt(animation, profile.name, profile.category, !!design.backImageUrl);
          console.log(`[GenerateAll] Product mode for ${profile.name} - sending design image`);
        } else {
          // Cinematic mode: text_to_video, garment described in prompt
          designUrlForRunway = undefined;

          const garmentDesc = reqDesignDescription
            || design.title
            || `${profile.name} clothing design`;

          try {
            if (scenarioKey) {
              const brandKey = cinematicScenariosService.getBrandKeyFromCategory(profile.category);

              prompt = cinematicScenariosService.buildPrompt(
                brandKey,
                scenarioKey,
                'video',
                {
                  designDescription: garmentDesc,
                  customDetails: customDetails || customPrompt,
                  season: seasonalAdaptation,
                  timeOfDay,
                  demographic,
                  modelKey,
                  brandName: profile.name,
                  brandTone: profile.brandTone,
                  targetAudience: profile.targetAudience,
                  environment: profile.environment,
                  primaryColor: profile.primaryColor || undefined,
                  secondaryColor: profile.secondaryColor || undefined,
                }
              );
            } else {
              const category = (profile.category || 'STREETWEAR') as BrandCategory;
              const brandTone = (profile.brandTone || 'PROFESSIONAL') as BrandTone;
              const targetAudience = (profile.targetAudience || 'GENERAL_PUBLIC') as TargetAudience;
              const environment = (profile.environment || 'STUDIO') as EnvironmentType;

              prompt = buildCinematicPrompt({
                category,
                brandTone,
                targetAudience,
                environment,
                designDescription: garmentDesc,
                customPrompt,
                primaryColor: profile.primaryColor || undefined,
                secondaryColor: profile.secondaryColor || undefined,
                brandName: profile.name,
                season: seasonalAdaptation,
                timeOfDay,
                demographic,
                customDetails,
                type: 'video',
              });
            }
          } catch (promptError: any) {
            console.error(`[GenerateAll] Prompt build error for ${profile.name}:`, promptError);
            throw new Error(`Prompt building failed for ${profile.name}: ${promptError.message}`);
          }
        }

        console.log(`[GenerateAll] Prompt for ${profile.name} (mode=${mode}):`, prompt.substring(0, 100) + '...');

        // 3. Generate content
        let resultUrl: string;

        resultUrl = await generateWithRunway({
          prompt,
          type: 'video',
          designUrl: designUrlForRunway,
          generationMode: mode,
        });

        // 4. Save generation record
        const generation = await prisma.generation.create({
          data: {
            brandProfileId: profile.id,
            designId: design.id,
            type,
            promptUsed: prompt,
            resultUrl,
          },
        });

        // Deduct credits for this successful generation
        await prisma.user.update({
          where: { id: payload.userId },
          data: { credits: { decrement: creditCostPerProfile } },
        });

        console.log(`[GenerateAll] Success for ${profile.name}: ${resultUrl}`);

        results.push({
          profileId: profile.id,
          profileName: profile.name,
          category: profile.category,
          status: 'success',
          resultUrl,
          generationId: generation.id,
          promptUsed: prompt,
        });
      } catch (error: any) {
        console.error(`[GenerateAll] Failed for profile ${profile.name}:`, error.message);
        results.push({
          profileId: profile.id,
          profileName: profile.name,
          category: profile.category,
          status: 'error',
          error: error.message,
        });
      }
    }

    const successCount = results.filter(r => r.status === 'success').length;
    const errorCount = results.filter(r => r.status === 'error').length;

    console.log(`[GenerateAll] Complete: ${successCount} success, ${errorCount} errors`);

    // Fetch updated credit balance
    const updatedUser = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { credits: true },
    });

    return NextResponse.json({
      success: true,
      data: {
        totalProfiles: profiles.length,
        successCount,
        errorCount,
        results,
        credits: updatedUser?.credits ?? 0,
      },
    });
  } catch (error: any) {
    console.error('[GenerateAll] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
