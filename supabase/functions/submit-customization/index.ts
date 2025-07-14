import { Resend } from 'npm:resend@3.2.0';

const resend = new Resend(Deno.env.get('RESEND_API_KEY'));

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Parse request body
    const { userInfo, customizationOptions } = await req.json();

    // Validate required fields
    if (!userInfo || !customizationOptions) {
      throw new Error('Missing required data');
    }

    // Helper function to format color objects
    const formatColor = (colorString: string) => {
      try {
        const color = JSON.parse(colorString);
        return `rgba(${color.r}, ${color.g}, ${color.b}, ${color.a})`;
      } catch {
        return colorString;
      }
    };

    // Create email content
    const emailContent = `
      <h2>New Website Customization Request</h2>
      
      <h3>Client Information</h3>
      <ul>
        <li><strong>Name:</strong> ${userInfo.name}</li>
        <li><strong>Company:</strong> ${userInfo.companyName}</li>
        <li><strong>Phone:</strong> ${userInfo.phone}</li>
        <li><strong>Email:</strong> ${userInfo.email}</li>
        <li><strong>Project Type:</strong> ${userInfo.projectType}</li>
        <li><strong>Budget Range:</strong> ${userInfo.budget}</li>
      </ul>

      ${userInfo.description ? `
      <h3>Project Description</h3>
      <p>${userInfo.description}</p>
      ` : ''}

      <h3>Website Content</h3>
      <ul>
        <li><strong>Company Name:</strong> ${customizationOptions.companyName || 'Not specified'}</li>
        <li><strong>Tagline:</strong> ${customizationOptions.companyTagline || 'Not specified'}</li>
        <li><strong>About/Description:</strong> ${customizationOptions.companyDescription || 'Not specified'}</li>
        ${customizationOptions.heroImage ? `
        <li><strong>Hero Image:</strong> ${
          customizationOptions.heroImage.type === 'ai' 
            ? `AI-generated (Prompt: ${customizationOptions.heroImage.prompt})`
            : 'Custom uploaded'
        }</li>
        <li><strong>Image URL:</strong> <a href="${customizationOptions.heroImage.url}" target="_blank">${customizationOptions.heroImage.url}</a></li>
        ` : ''}
      </ul>

      <h3>Design Preferences</h3>
      <ul>
        <li><strong>Body Font (Main):</strong> ${customizationOptions.font?.main || 'Not specified'}</li>
        <li><strong>Headline Font (Secondary):</strong> ${customizationOptions.font?.secondary || 'Not specified'}</li>
        <li><strong>Primary Color:</strong> ${formatColor(customizationOptions.primaryColor)}</li>
        <li><strong>Secondary Color:</strong> ${formatColor(customizationOptions.secondaryColor)}</li>
        <li><strong>Accent Color:</strong> ${formatColor(customizationOptions.accentColor)}</li>
        <li><strong>Navigation Style:</strong> ${customizationOptions.navbarStyle || 'Not specified'}</li>
      </ul>

      <h3>Selected Sections</h3>
      <ul>
        ${Object.entries(customizationOptions.sections || {}).map(([section, enabled]) => 
          `<li><strong>${section.charAt(0).toUpperCase() + section.slice(1)}:</strong> ${enabled ? 'Yes' : 'No'}</li>`
        ).join('')}
      </ul>

      ${customizationOptions.layout ? `
      <h3>Layout Preferences</h3>
      <ul>
        <li><strong>Max Width:</strong> ${customizationOptions.layout.maxWidth || 'Default'}</li>
        <li><strong>Spacing:</strong> ${customizationOptions.layout.spacing || 'Comfortable'}</li>
        <li><strong>Content Alignment:</strong> ${customizationOptions.layout.contentAlignment || 'Left'}</li>
      </ul>
      ` : ''}

      ${customizationOptions.animations ? `
      <h3>Animation Preferences</h3>
      <ul>
        <li><strong>Scroll Fade In:</strong> ${customizationOptions.animations.scroll?.fadeIn ? 'Yes' : 'No'}</li>
        <li><strong>Scroll Slide Up:</strong> ${customizationOptions.animations.scroll?.slideUp ? 'Yes' : 'No'}</li>
        <li><strong>Hover Scale:</strong> ${customizationOptions.animations.hover?.scale ? 'Yes' : 'No'}</li>
        <li><strong>Hover Glow:</strong> ${customizationOptions.animations.hover?.glow ? 'Yes' : 'No'}</li>
      </ul>
      ` : ''}

      <hr style="margin: 20px 0;">
      <p><em>This request was submitted through the StarDev website customization tool.</em></p>
    `;

    // Send email
    const { data, error: resendError } = await resend.emails.send({
      from: 'noreply@stardev.dev',
      to: 'yosef@stardev.dev',
      subject: `New Website Request from ${userInfo.name} - ${userInfo.companyName || 'Company Name Not Provided'}`,
      html: emailContent,
    });

    if (resendError) {
      console.error('Resend error:', resendError);
      throw new Error('Failed to send email');
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Request submitted successfully' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'An unknown error occurred' 
      }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});