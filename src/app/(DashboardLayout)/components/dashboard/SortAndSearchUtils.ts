export const sortData = <T>(data: T[], field: string, order: 'asc' | 'desc'): T[] => {
  return data.sort((a, b) => {
    // Resolve nested fields
    const fieldParts = field.split('.');
    const aValue = fieldParts.reduce((obj, key) => obj?.[key], a as any);
    const bValue = fieldParts.reduce((obj, key) => obj?.[key], b as any);

    if (aValue === undefined || bValue === undefined) return 0; // Handle undefined values

    if (order === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });
};


  
export const searchData = (data: any[], searchTerm: string, fields: string[]) => {
  return data.filter(item =>
    fields.some(field => {
      // Resolve nested fields
      const fieldParts = field.split('.');
      const value = fieldParts.reduce((obj, key) => obj?.[key], item);

      // Perform the search only if the value is not null/undefined
      return value?.toString().toLowerCase().includes(searchTerm.toLowerCase());
    })
  );
};

  