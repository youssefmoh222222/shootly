import { NextRequest, NextResponse } from 'next/server'
import { cinematicScenariosService } from '../../../lib/scenarios/cinematicScenarios'

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const brandCategory = searchParams.get('category');
    const includeModels = searchParams.get('models') === 'true';

    if (brandCategory) {
      // Get scenarios for specific brand category
      const brandKey = cinematicScenariosService.getBrandKeyFromCategory(brandCategory);
      const scenarios = cinematicScenariosService.getAllScenariosForBrand(brandKey);

      // Get recommended models for this brand
      const recommendedModelKeys = cinematicScenariosService.getRecommendedModels(brandKey);
      const allProfiles = cinematicScenariosService.getModelProfiles();
      const recommendedModels = recommendedModelKeys.map(key => ({
        key,
        ...allProfiles[key]
      })).filter(m => m.shorthand); // filter out any missing

      const response: any = {
        success: true,
        data: {
          brandKey,
          brandCategory,
          scenarios: scenarios.map(({ key, scenario }) => ({
            key,
            name: scenario.name,
            description: scenario.description,
            bestFor: scenario.bestFor
          })),
          recommendedModels,
        }
      };

      // Include all model profiles if requested
      if (includeModels) {
        response.data.allModels = Object.entries(allProfiles).map(([key, profile]) => ({
          key,
          ...profile
        }));
      }

      return NextResponse.json(response);
    } else {
      // Get all brand profiles
      const brandProfiles = cinematicScenariosService.getBrandProfiles();

      return NextResponse.json({
        success: true,
        data: {
          brandProfiles
        }
      });
    }
  } catch (error) {
    console.error('Scenarios API error:', error);
    return NextResponse.json(
      { error: 'Failed to load scenarios' },
      { status: 500 }
    );
  }
}
