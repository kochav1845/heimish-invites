// Helper functions for database queries

// Get template info including category
export const getTemplateInfo = `
  SELECT * FROM get_template_info($1)
`;

// Update template category
export const updateTemplateCategory = `
  SELECT * FROM update_template_category($1, $2)
`;