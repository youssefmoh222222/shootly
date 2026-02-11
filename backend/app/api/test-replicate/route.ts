import { NextResponse } from 'next/server';
import Replicate from 'replicate';

export async function GET() {
  const replicateToken = process.env.REPLICATE_API_TOKEN;
  const runwayApiKey = process.env.RUNWAY_API_KEY;
  
  return NextResponse.json({
    replicateToken: replicateToken ? `SET (${replicateToken.substring(0, 10)}...)` : 'NOT SET',
    runwayApiKey: runwayApiKey ? `SET (${runwayApiKey.substring(0, 10)}...)` : 'NOT SET',
    nodeVersion: process.version,
  });
}

export async function POST() {
  const replicateToken = process.env.REPLICATE_API_TOKEN;
  
  if (!replicateToken) {
    return NextResponse.json({ error: 'REPLICATE_API_TOKEN not set' }, { status: 500 });
  }
  
  console.log('[Test] Token:', replicateToken.substring(0, 10) + '...');
  
  try {
    const replicate = new Replicate({ auth: replicateToken });
    
    console.log('[Test] Running Stable Diffusion...');
    
    const output = await replicate.run(
      "stability-ai/stable-diffusion:db21e45d3f7023abc2a46ee38a23973f6dce16bb082a930b0c49861f96d1e5bf",
      {
        input: {
          prompt: "A professional fashion photoshoot of a clothing design, studio lighting",
          width: 512,
          height: 512,
          num_outputs: 1,
          num_inference_steps: 30,
        }
      }
    );
    
    console.log('[Test] Success:', output);
    
    return NextResponse.json({ 
      success: true, 
      output: Array.isArray(output) ? output[0] : output 
    });
    
  } catch (error: any) {
    console.error('[Test] Replicate Error:', error.message);
    console.error('[Test] Error name:', error.name);
    
    if (error.message?.includes('Unauthorized') || error.message?.includes('401')) {
      return NextResponse.json({ 
        error: 'Invalid API token - Generate a new one at https://replicate.com/account/api-tokens'
      }, { status: 500 });
    }
    
    if (error.message?.includes('insufficient credits') || error.message?.includes('quota')) {
      return NextResponse.json({ 
        error: 'Insufficient credits - Add credits at https://replicate.com/account'
      }, { status: 500 });
    }
    
    return NextResponse.json({ 
      error: error.message || 'Unknown error',
      name: error.name
    }, { status: 500 });
  }
}
