import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getPublicUrl } from '@/lib/storage'

type GenerateRequest = {
  recentImagePath: string
  youngerImagePath: string
  templateId?: string
}

const DEFAULT_TEMPLATE_SLUG = 'hug-younger-self'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse request body
    const body: GenerateRequest = await request.json()
    const { recentImagePath, youngerImagePath, templateId } = body

    if (!recentImagePath || !youngerImagePath) {
      return NextResponse.json(
        { error: 'Both recent and younger image paths are required' },
        { status: 400 }
      )
    }

    // Get template for credit cost
    let template
    if (templateId) {
      const { data } = await supabase
        .from('templates')
        .select('*')
        .eq('id', templateId)
        .eq('is_active', true)
        .single()
      template = data
    } else {
      const { data } = await supabase
        .from('templates')
        .select('*')
        .eq('slug', DEFAULT_TEMPLATE_SLUG)
        .eq('is_active', true)
        .single()
      template = data
    }

    if (!template) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 })
    }

    // Get user's current credit balance
    const { data: profile } = await supabase
      .from('profiles')
      .select('credit_balance')
      .eq('id', user.id)
      .single()

    const currentCredits = profile?.credit_balance ?? 0

    if (currentCredits < template.credit_cost) {
      return NextResponse.json(
        { error: 'Insufficient credits', required: template.credit_cost, available: currentCredits },
        { status: 402 }
      )
    }

    // Create generation record
    const { data: generation, error: insertError } = await supabase
      .from('generations')
      .insert({
        user_id: user.id,
        template_id: template.id,
        status: 'processing',
        input_images: [recentImagePath, youngerImagePath],
        credits_charged: template.credit_cost,
        prompt_used: template.prompt,
      })
      .select()
      .single()

    if (insertError || !generation) {
      console.error('Failed to create generation record:', insertError)
      return NextResponse.json({ error: 'Failed to create generation' }, { status: 500 })
    }

    // Deduct credits from user
    const { error: creditError } = await supabase
      .from('profiles')
      .update({ credit_balance: currentCredits - template.credit_cost })
      .eq('id', user.id)

    if (creditError) {
      console.error('Failed to deduct credits:', creditError)
      // Revert generation status
      await supabase
        .from('generations')
        .update({ status: 'failed', error_message: 'Failed to process credits' })
        .eq('id', generation.id)
      return NextResponse.json({ error: 'Failed to process credits' }, { status: 500 })
    }

    // Create credit transaction record
    await supabase.from('credit_transactions').insert({
      user_id: user.id,
      amount: -template.credit_cost,
      type: 'generation',
      generation_id: generation.id,
      description: `Generation: ${template.name}`,
    })

    // TODO: Integrate with actual AI generation service
    // For now, we'll simulate the generation process
    // In production, this would call your AI service (e.g., Replicate, RunPod, etc.)
    // and update the generation record with the output image path

    // Placeholder: Mark as completed with a placeholder message
    // In production, this would be handled by a webhook or polling mechanism
    const placeholderOutputPath = `${user.id}/output_${Date.now()}.png`
    
    await supabase
      .from('generations')
      .update({
        status: 'completed',
        output_image: placeholderOutputPath,
        processing_time_ms: 0,
      })
      .eq('id', generation.id)

    return NextResponse.json({
      success: true,
      generationId: generation.id,
      status: 'processing',
      outputUrl: getPublicUrl(placeholderOutputPath),
      message: 'Generation started. This is a placeholder - AI integration pending.',
    })
  } catch (error) {
    console.error('Generation API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get generation ID from query params
    const { searchParams } = new URL(request.url)
    const generationId = searchParams.get('id')

    if (!generationId) {
      return NextResponse.json({ error: 'Generation ID required' }, { status: 400 })
    }

    // Fetch generation
    const { data: generation, error } = await supabase
      .from('generations')
      .select('*')
      .eq('id', generationId)
      .eq('user_id', user.id)
      .single()

    if (error || !generation) {
      return NextResponse.json({ error: 'Generation not found' }, { status: 404 })
    }

    return NextResponse.json({
      generation: {
        ...generation,
        outputUrl: generation.output_image ? getPublicUrl(generation.output_image) : null,
      },
    })
  } catch (error) {
    console.error('Get generation error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

