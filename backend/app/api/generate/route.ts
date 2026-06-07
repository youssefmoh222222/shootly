import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../lib/prisma'
import { verifyToken } from '../../../lib/auth'
import { generateWithReplicate, generatePromptWithAI } from '../../../lib/ai/providers/replicate'
import { generateWithRunway } from '../../../lib/ai/providers/runway'
import { cinematicScenariosService } from '../../../lib/scenarios/cinematicScenarios'
import { buildCinematicPrompt, BrandCategory, BrandTone, TargetAudience, EnvironmentType, buildProductShowcasePrompt, ProductAnimation } from '../../../lib/prompt-builder'
import { uploadToPermanentStorage } from '../../../lib/cloudinary'

// Mark as dynamic to prevent static rendering error
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  console.log('=== POST /api/generate ===');
  
  try {
    // Get token from cookie or header
    const token = request.cookies.get('auth-token')?.value || 
                  request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = verifyToken(token);
    
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Credit check
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { credits: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const body = await request.json();
    const {
      designId,
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
      useCinematic,
      // Model profile selection
      modelKey,
      // Director controls
      lighting,
      camera,
      colorGrade,
      pose,
      atmosphere,
      background,
      framing,
      cinematicIntelligence,
      // Brand profile data from frontend
      brandName: reqBrandName,
      brandCategory: reqBrandCategory,
      brandTone: reqBrandTone,
      targetAudience: reqTargetAudience,
      brandEnvironment: reqEnvironment,
      primaryColor: reqPrimaryColor,
      secondaryColor: reqSecondaryColor,
    } = body;

    console.log('Generation request:', {
      designId, type, generationMode, productAnimation,
      cinematic: { scenarioKey, seasonalAdaptation, timeOfDay, demographic, customDetails },
      director: { lighting, camera, colorGrade, pose, atmosphere, background, framing, cinematicIntelligence },
      model: { modelKey },
      brand: { reqBrandName, reqBrandCategory, reqBrandTone, reqTargetAudience, reqEnvironment, reqPrimaryColor, reqSecondaryColor },
      customPrompt,
    });

    if (!designId || !type) {
      return NextResponse.json(
        { error: 'Missing required fields: designId, type' },
        { status: 400 }
      );
    }

    const isImage = type === 'IMAGE';
    const creditCost = isImage ? 1 : 3;

    if (user.credits < creditCost) {
      return NextResponse.json(
        { error: 'Insufficient credits', credits: user.credits, required: creditCost },
        { status: 402 }
      );
    }

    const contentType: 'image' | 'video' = isImage ? 'image' : 'video';
    const maxChars = isImage ? 1200 : 512;
    console.log(`[Generate] Content type: ${contentType}, maxChars: ${maxChars}, creditCost: ${creditCost}`);

    // Get design details
    const design = await prisma.design.findUnique({
      where: { id: designId },
      include: {
        brandProfile: true
      }
    });

    if (!design) {
      return NextResponse.json({ error: 'Design not found' }, { status: 404 });
    }

    // Verify ownership
    if (design.brandProfile.userId !== payload.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Build prompt and designUrl based on generation mode
    const brand = design.brandProfile;
    let prompt = '';
    const mode = generationMode || 'cinematic';

    let designUrlForRunway: string | undefined = undefined;
    let backDesignUrl: string | undefined = undefined;
    let garmentDescription: string = '';

    console.log(`[Generate] Generation mode: ${mode}`);

    if (mode === 'product') {
      // Product Showcase mode: send the actual design image to Runway (image_to_video)
      const animation = (productAnimation || 'rotation') as ProductAnimation;
      prompt = buildProductShowcasePrompt(animation, brand.name, brand.category, !!design.backImageUrl);

      // Runway accepts data:image/ data URIs directly, or https:// URLs
      const publicUrl = process.env.PUBLIC_URL;
      if (publicUrl) {
        designUrlForRunway = `${publicUrl}/api/images/${design.id}`;
      } else {
        designUrlForRunway = design.imageUrl;
      }
      if (design.backImageUrl) {
        backDesignUrl = design.backImageUrl;
      }
      console.log(`[Generate] Product mode - design images: front=yes, back=${!!backDesignUrl}`);
    } else {
      // ── Cinematic mode: AI-generated prompt ──
      // Step 1: Send ALL data to Llama 3 on Replicate → get an optimized prompt
      // Step 2: Send AI prompt + design photo → FLUX Dev (images) / Runway (videos)

      const garmentDesc = reqDesignDescription
        || design.title
        || `${brand.name} clothing design`;
      garmentDescription = garmentDesc;

      // Gather scenario + model profile data
      let scenarioName: string | undefined;
      let scenarioDescription: string | undefined;
      let scenarioRunwayPrompt: string | undefined;
      let modelProfileShorthand: string | undefined;

      try {
        const brandKey = cinematicScenariosService.getBrandKeyFromCategory(brand.category);
        if (scenarioKey) {
          const scenario = cinematicScenariosService.getScenario(brandKey, scenarioKey);
          scenarioName = scenario.name;
          scenarioDescription = scenario.description;
          scenarioRunwayPrompt = scenario.runwayPrompt;
        }
        const profile = modelKey
          ? cinematicScenariosService.getModelProfile(modelKey)
          : cinematicScenariosService.autoSelectModel(brandKey);
        if (profile) modelProfileShorthand = profile.shorthand;
      } catch (e) {
        console.warn('[Generate] Scenario/model lookup failed, continuing without');
      }

      // Step 1: AI Vision model sees the design image + all context → generates prompt + garment description
      try {
        const aiResult = await generatePromptWithAI({
          contentType,
          designImageUrl: design.imageUrl,
          backDesignImageUrl: design.backImageUrl || undefined,
          brandName: brand.name,
          brandCategory: brand.category,
          brandTone: brand.brandTone || 'PROFESSIONAL',
          targetAudience: brand.targetAudience || 'GENERAL_PUBLIC',
          environment: brand.environment || 'STUDIO',
          primaryColor: brand.primaryColor || undefined,
          secondaryColor: brand.secondaryColor || undefined,
          designDescription: garmentDesc,
          scenarioName,
          scenarioDescription,
          scenarioRunwayPrompt,
          modelProfileShorthand,
          season: seasonalAdaptation,
          timeOfDay,
          demographic,
          customDetails: customDetails || undefined,
          customPrompt: customPrompt || undefined,
          lighting: lighting || undefined,
          camera: camera || undefined,
          colorGrade: colorGrade || undefined,
          pose: pose || undefined,
          atmosphere: atmosphere || undefined,
          background: background || undefined,
          framing: framing || undefined,
          cinematicIntelligence: cinematicIntelligence || undefined,
        });
        prompt = aiResult.scenePrompt;
        garmentDescription = aiResult.garmentDescription;
      } catch (aiError: any) {
        // Fallback to manual prompt if AI fails — don't waste the generation
        console.error('[Generate] AI prompt generation failed, using manual fallback:', aiError.message);
        if (scenarioKey) {
          const brandKey = cinematicScenariosService.getBrandKeyFromCategory(brand.category);
          prompt = cinematicScenariosService.buildPrompt(brandKey, scenarioKey, contentType, {
            designDescription: garmentDesc,
            customDetails: customDetails || customPrompt,
            season: seasonalAdaptation, timeOfDay, demographic, modelKey,
            brandName: brand.name, brandTone: brand.brandTone,
            targetAudience: brand.targetAudience, environment: brand.environment,
            primaryColor: brand.primaryColor || undefined,
            secondaryColor: brand.secondaryColor || undefined,
            lighting, camera, colorGrade, pose, atmosphere, background, framing, cinematicIntelligence,
            maxChars,
          });
        } else {
          prompt = buildCinematicPrompt({
            category: (brand.category || 'STREETWEAR') as BrandCategory,
            brandTone: (brand.brandTone || 'PROFESSIONAL') as BrandTone,
            targetAudience: (brand.targetAudience || 'GENERAL_PUBLIC') as TargetAudience,
            environment: (brand.environment || 'STUDIO') as EnvironmentType,
            designDescription: garmentDesc, customPrompt,
            primaryColor: brand.primaryColor || undefined,
            secondaryColor: brand.secondaryColor || undefined,
            brandName: brand.name, season: seasonalAdaptation,
            timeOfDay, demographic, customDetails,
            lighting, camera, colorGrade, pose, atmosphere, background, framing, cinematicIntelligence,
            type: contentType, maxChars,
          });
        }
      }

      // Step 2: Attach design photos (front + back) for BOTH image (img2img) and video (image_to_video)
      {
        const publicUrl = process.env.PUBLIC_URL;
        designUrlForRunway = publicUrl
          ? `${publicUrl}/api/images/${design.id}`
          : design.imageUrl;
        if (design.backImageUrl) {
          backDesignUrl = design.backImageUrl;
        }
        console.log(`[Generate] Design photos attached for ${isImage ? 'img2img' : 'image_to_video'}: front=yes, back=${!!backDesignUrl}`);
      }
    }

    console.log('[Generate] Full prompt length:', prompt.length);
    console.log('[Generate] Full prompt:', prompt);
    console.log('[Generate] Prompt sent to Runway (first 512 chars):', prompt.substring(0, 512));

    // Generate content based on content type
    let resultUrl: string;

    if (isImage) {
      // IMAGE: AI prompt + design photo → FLUX Dev img2img
      try {
        console.log(`[Generate] Starting image generation (mode=${mode}, hasDesign=${!!designUrlForRunway})...`);
        resultUrl = await generateWithReplicate({
          prompt,
          type: 'image',
          designUrl: designUrlForRunway,
          backDesignUrl,
          generationMode: mode,
          garmentDescription,
          brandCategory: brand.category,
        });
      } catch (replicateError: any) {
        console.error('[Generate] Replicate image generation failed:', replicateError.message);
        return NextResponse.json(
          { error: `Image generation failed: ${replicateError.message}` },
          { status: 502 }
        );
      }
    } else {
      // VIDEO generation
      if (mode === 'product') {
        // Product mode: Replicate (Kling) handles all 4 animations with proper prompts
        try {
          console.log(`[Generate] Starting product video (animation=${productAnimation || 'rotation'}, hasBack=${!!backDesignUrl})...`);
          resultUrl = await generateWithReplicate({
            prompt,
            type: 'video',
            designUrl: designUrlForRunway,
            backDesignUrl,
            generationMode: mode,
            productAnimation: productAnimation || 'rotation',
            garmentDescription,
            brandCategory: brand.category,
          });
        } catch (replicateError: any) {
          console.error('[Generate] Replicate product video failed, falling back to Runway:', replicateError.message);
          try {
            resultUrl = await generateWithRunway({
              prompt,
              type: 'video',
              designUrl: designUrlForRunway,
              backDesignUrl,
              generationMode: mode,
            });
          } catch (runwayError: any) {
            return NextResponse.json(
              { error: `Video generation failed: ${runwayError.message}` },
              { status: 502 }
            );
          }
        }
      } else {
        // Cinematic mode: Replicate pipeline (FLUX.2 → IDM-VTON → Kling)
        try {
          console.log(`[Generate] Starting cinematic video pipeline (FLUX.2 → VTON → Kling)...`);
          resultUrl = await generateWithReplicate({
            prompt,
            type: 'video',
            designUrl: designUrlForRunway,
            backDesignUrl,
            generationMode: mode,
            garmentDescription,
            brandCategory: brand.category,
          });
        } catch (replicateError: any) {
          console.error('[Generate] Video generation failed:', replicateError.message);
          return NextResponse.json(
            { error: `Video generation failed: ${replicateError.message}` },
            { status: 502 }
          );
        }
      }
    }

    console.log('[Generate] Generation complete:', type, resultUrl);

    // Parse multiple URLs if comma-separated (for front+back images)
    const rawUrls = resultUrl.includes(',') ? resultUrl.split(',') : [resultUrl];

    // Upload all result URLs to Cloudinary for permanent storage (runs in parallel)
    console.log(`[Generate] Uploading ${rawUrls.length} result(s) to permanent storage...`)
    const folder = isImage ? 'shootly/images' : 'shootly/videos'
    const resultUrls = await Promise.all(rawUrls.map(u => uploadToPermanentStorage(u, folder)))
    const primaryUrl = resultUrls[0];

    console.log(`[Generate] Result URLs: ${resultUrls.length} image(s)`);

    // Create generation record (store primary URL)
    const generation = await prisma.generation.create({
      data: {
        brandProfileId: brand.id,
        designId: design.id,
        type: isImage ? 'IMAGE' : 'VIDEO',
        promptUsed: prompt,
        resultUrl: primaryUrl
      }
    });

    // Deduct credits after successful generation
    const updatedUser = await prisma.user.update({
      where: { id: payload.userId },
      data: { credits: { decrement: creditCost } },
      select: { credits: true },
    });

    console.log(`[Generate] Deducted ${creditCost} credits, remaining: ${updatedUser.credits}`);

    return NextResponse.json({
      success: true,
      data: {
        generationId: generation.id,
        resultUrl: primaryUrl,
        resultUrls,  // Array of all URLs (front + back)
        resultType: contentType,
        promptUsed: prompt,
        brandName: brand.name,
        brandCategory: brand.category,
        credits: updatedUser.credits,
      }
    });

  } catch (error: any) {
    console.error('Generation error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  console.log('=== GET /api/generate ===');
  
  try {
    const { searchParams } = new URL(request.url);
    const generationId = searchParams.get('id');

    if (!generationId) {
      return NextResponse.json({ error: 'Generation ID required' }, { status: 400 });
    }

    const generation = await prisma.generation.findUnique({
      where: { id: generationId }
    });

    if (!generation) {
      return NextResponse.json({ error: 'Generation not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: {
        id: generation.id,
        type: generation.type,
        status: 'completed',
        resultUrl: generation.resultUrl
      }
    });

  } catch (error) {
    console.error('Get generation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

